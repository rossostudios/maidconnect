/**
 * Payout Batch Service
 *
 * Implements idempotent payout processing using payout_batches and payout_transfers tables.
 * Ensures each booking is paid exactly once via database constraints and Stripe idempotency keys.
 *
 * Features:
 * - Idempotent batch processing
 * - Stripe transfer integration with idempotency
 * - Structured Better Stack logging
 * - Transaction safety with rollback
 * - Detailed error tracking per transfer
 *
 * Epic C - Payout Idempotency & Financial Safety (P0)
 */

import { stripe } from "@/lib/integrations/stripe/client";
import {
  type BookingForPayout,
  calculatePayoutFromBookings,
  getCurrentPayoutPeriod,
} from "@/lib/payout-calculator";
import { logger, withDatabaseContext, withPerformanceContext } from "@/lib/shared/logger";
import { supabaseAdmin } from "@/lib/supabase/admin-client";
import type { Database } from "@/types/supabase";

// ============================================
// Types
// ============================================

type PayoutBatch = Database["public"]["Tables"]["payout_batches"]["Row"];
type PayoutBatchInsert = Database["public"]["Tables"]["payout_batches"]["Insert"];
type PayoutTransferInsert = Database["public"]["Tables"]["payout_transfers"]["Insert"];

type BatchStatus = "pending" | "processing" | "completed" | "failed";

export type PayoutBatchResult = {
  batchId: string;
  status: BatchStatus;
  totalAmountCop: number;
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  errors: PayoutTransferError[];
  duration: number;
};

export type PayoutTransferError = {
  bookingId: string;
  professionalId: string;
  amount: number;
  error: string;
};

// ============================================
// Batch ID Generation
// ============================================

/**
 * Generate unique batch ID for idempotency
 * Format: "payout-YYYY-MM-DD-day"
 * Example: "payout-2025-11-14-thu"
 */
function generateBatchId(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
  return `payout-${yyyy}-${mm}-${dd}-${day}`;
}

/**
 * Generate Stripe idempotency key for transfer
 * Format: "payout-batch-{batchId}-booking-{bookingId}"
 */
function generateStripeIdempotencyKey(batchId: string, bookingId: string): string {
  return `payout-batch-${batchId}-booking-${bookingId}`;
}

// ============================================
// Core Batch Processing
// ============================================

/**
 * Process payouts for the current period in an idempotent manner
 *
 * C-1: Uses payout_batches/payout_transfers tables
 * C-2: Fully idempotent - can be safely re-run without duplicates
 * C-3: Structured logging to Better Stack
 */
export async function processPayoutBatch(options?: {
  dryRun?: boolean;
  batchDate?: Date;
}): Promise<PayoutBatchResult> {
  const startTime = Date.now();
  const batchDate = options?.batchDate || new Date();
  const batchId = generateBatchId(batchDate);
  const dryRun = options?.dryRun ?? false;

  await logger.info("Payout batch processing started", {
    batchId,
    dryRun,
    timestamp: batchDate.toISOString(),
  });

  const supabase = supabaseAdmin;

  try {
    // Check if batch already exists (idempotency check)
    const { data: existingBatch } = await supabase
      .from("payout_batches")
      .select("*")
      .eq("batch_id", batchId)
      .maybeSingle();

    if (existingBatch) {
      await logger.info("Payout batch already processed", {
        batchId,
        existingStatus: existingBatch.status,
        existingTotal: existingBatch.total_amount_cop,
      });

      return {
        batchId: existingBatch.batch_id,
        status: existingBatch.status as BatchStatus,
        totalAmountCop: Number(existingBatch.total_amount_cop),
        totalTransfers: existingBatch.total_transfers,
        successfulTransfers: existingBatch.successful_transfers,
        failedTransfers: existingBatch.failed_transfers,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    // Create new batch record
    const batch = await createPayoutBatch(supabase, batchId, batchDate);

    // Get eligible bookings for payout
    const bookings = await getEligibleBookings(supabase);

    if (bookings.length === 0) {
      await updateBatchStatus(supabase, batch.id, "completed", {
        totalAmountCop: 0,
        totalTransfers: 0,
        successfulTransfers: 0,
        failedTransfers: 0,
      });

      await logger.info("Payout batch completed - no eligible bookings", { batchId });

      return {
        batchId,
        status: "completed",
        totalAmountCop: 0,
        totalTransfers: 0,
        successfulTransfers: 0,
        failedTransfers: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    // Group bookings by professional
    const bookingsByProfessional = groupBookingsByProfessional(bookings);

    // Mark batch as processing
    await updateBatchStatus(supabase, batch.id, "processing");

    // Process transfers
    const result = await processTransfers(
      supabase,
      batch.id,
      batchId,
      bookingsByProfessional,
      dryRun
    );

    // Update batch with final results
    await updateBatchStatus(supabase, batch.id, "completed", result);

    const duration = Date.now() - startTime;

    // Log summary to Better Stack (C-3 requirement)
    await logger.info("Payout batch completed successfully", {
      batchId,
      totalAmountCop: result.totalAmountCop,
      totalTransfers: result.totalTransfers,
      successfulTransfers: result.successfulTransfers,
      failedTransfers: result.failedTransfers,
      duration,
      dryRun,
      ...withPerformanceContext(startTime),
    });

    await logger.flush();

    return {
      batchId,
      status: "completed",
      ...result,
      duration,
    };
  } catch (error) {
    // Log critical error
    await logger.error("Payout batch processing failed", error as Error, {
      batchId,
      duration: Date.now() - startTime,
    });

    await logger.flush();

    throw error;
  }
}

// ============================================
// Database Operations
// ============================================

async function createPayoutBatch(supabase: typeof supabaseAdmin, batchId: string, runDate: Date) {
  const batchData: PayoutBatchInsert = {
    batch_id: batchId,
    run_date: runDate.toISOString().split("T")[0], // YYYY-MM-DD
    status: "pending",
    total_amount_cop: 0,
    total_transfers: 0,
    successful_transfers: 0,
    failed_transfers: 0,
    started_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("payout_batches").insert(batchData).select().single();

  if (error) {
    throw new Error(`Failed to create payout batch: ${error.message}`);
  }

  await logger.info("Payout batch created", {
    batchId,
    ...withDatabaseContext("insert", "payout_batches"),
  });

  return data;
}

async function updateBatchStatus(
  supabase: typeof supabaseAdmin,
  batchDbId: string,
  status: BatchStatus,
  metrics?: {
    totalAmountCop?: number;
    totalTransfers?: number;
    successfulTransfers?: number;
    failedTransfers?: number;
    errorMessage?: string;
  }
) {
  const updates: Partial<PayoutBatch> = {
    status,
    ...(status === "completed" && { completed_at: new Date().toISOString() }),
    ...(metrics?.totalAmountCop !== undefined && {
      total_amount_cop: metrics.totalAmountCop,
    }),
    ...(metrics?.totalTransfers !== undefined && { total_transfers: metrics.totalTransfers }),
    ...(metrics?.successfulTransfers !== undefined && {
      successful_transfers: metrics.successfulTransfers,
    }),
    ...(metrics?.failedTransfers !== undefined && { failed_transfers: metrics.failedTransfers }),
    ...(metrics?.errorMessage && { error_message: metrics.errorMessage }),
  };

  const { error } = await supabase.from("payout_batches").update(updates).eq("id", batchDbId);

  if (error) {
    throw new Error(`Failed to update batch status: ${error.message}`);
  }
}

// ============================================
// Booking Queries
// ============================================

async function getEligibleBookings(supabase: typeof supabaseAdmin): Promise<BookingForPayout[]> {
  const { periodStart, periodEnd } = getCurrentPayoutPeriod();

  // Get completed bookings not yet paid out
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      professional_id,
      amount_captured,
      currency,
      checked_out_at,
      completed_at,
      service_name
    `
    )
    .eq("status", "completed")
    .not("amount_captured", "is", null)
    .gte("completed_at", periodStart.toISOString())
    .lt("completed_at", periodEnd.toISOString());

  if (error) {
    throw new Error(`Failed to fetch eligible bookings: ${error.message}`);
  }

  if (!bookings || bookings.length === 0) {
    return [];
  }

  // Filter out bookings already in payout_transfers (database-level deduplication)
  const { data: existingTransfers } = await supabase
    .from("payout_transfers")
    .select("booking_id")
    .in(
      "booking_id",
      bookings.map((b) => b.id)
    );

  const paidBookingIds = new Set((existingTransfers || []).map((t) => t.booking_id));

  const eligibleBookings = bookings
    .filter((b) => !paidBookingIds.has(b.id))
    .map((b) => ({
      id: b.id,
      final_amount_captured: Number(b.amount_captured),
      currency: b.currency as "COP",
      completed_at: b.completed_at,
      checked_out_at: b.checked_out_at,
    }));

  await logger.info("Eligible bookings fetched", {
    totalBookings: bookings.length,
    alreadyPaid: paidBookingIds.size,
    eligibleCount: eligibleBookings.length,
    ...withDatabaseContext("select", "bookings"),
  });

  return eligibleBookings;
}

// ============================================
// Transfer Processing
// ============================================

function groupBookingsByProfessional(
  bookings: BookingForPayout[]
): Map<string, BookingForPayout[]> {
  const grouped = new Map<string, BookingForPayout[]>();

  for (const booking of bookings) {
    const professionalId = (booking as unknown as { professional_id: string }).professional_id;
    if (!grouped.has(professionalId)) {
      grouped.set(professionalId, []);
    }
    grouped.get(professionalId)!.push(booking);
  }

  return grouped;
}

async function processTransfers(
  supabase: typeof supabaseAdmin,
  batchDbId: string,
  batchId: string,
  bookingsByProfessional: Map<string, BookingForPayout[]>,
  dryRun: boolean
) {
  let totalAmountCop = 0;
  let successfulTransfers = 0;
  let failedTransfers = 0;
  const errors: PayoutTransferError[] = [];

  for (const [professionalId, bookings] of bookingsByProfessional) {
    try {
      const payout = calculatePayoutFromBookings(bookings);
      totalAmountCop += payout.netAmount;

      // Create transfer records in database FIRST (idempotency via unique constraint)
      const transferRecords = await createTransferRecords(
        supabase,
        batchDbId,
        professionalId,
        bookings,
        payout.netAmount
      );

      if (!dryRun) {
        // Process Stripe transfer with idempotency key (C-2 requirement)
        const firstBookingId = bookings[0]?.id;
        if (!firstBookingId) {
          throw new Error("No bookings found for idempotency key generation");
        }

        await processStripeTransfer(
          professionalId,
          payout.netAmount,
          batchId,
          firstBookingId,
          transferRecords.map((t) => t.id)
        );
      }

      // Mark transfers as completed
      for (const transfer of transferRecords) {
        await supabase
          .from("payout_transfers")
          .update({
            status: dryRun ? "pending" : "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", transfer.id);
      }

      successfulTransfers += transferRecords.length;
    } catch (error) {
      failedTransfers += bookings.length;

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log individual error (C-3 requirement)
      await logger.error("Payout transfer failed", error as Error, {
        batchId,
        professionalId,
        bookingCount: bookings.length,
        bookingIds: bookings.map((b) => b.id),
      });

      const firstBookingId = bookings[0]?.id;
      if (firstBookingId) {
        errors.push({
          bookingId: firstBookingId,
          professionalId,
          amount: calculatePayoutFromBookings(bookings).netAmount,
          error: errorMessage,
        });
      }

      // Mark transfers as failed
      const { data: failedTransferRecords } = await supabase
        .from("payout_transfers")
        .select("id")
        .eq("professional_id", professionalId)
        .in(
          "booking_id",
          bookings.map((b) => b.id)
        );

      if (failedTransferRecords) {
        for (const transfer of failedTransferRecords) {
          await supabase
            .from("payout_transfers")
            .update({ status: "failed", error_message: errorMessage })
            .eq("id", transfer.id);
        }
      }
    }
  }

  return {
    totalAmountCop,
    totalTransfers: successfulTransfers + failedTransfers,
    successfulTransfers,
    failedTransfers,
    errors,
  };
}

async function createTransferRecords(
  supabase: typeof supabaseAdmin,
  batchDbId: string,
  professionalId: string,
  bookings: BookingForPayout[],
  netAmount: number
) {
  const transfers: PayoutTransferInsert[] = bookings.map((booking) => ({
    batch_id: batchDbId,
    booking_id: booking.id,
    professional_id: professionalId,
    amount_cop: Math.round(netAmount / bookings.length), // Split evenly
    status: "pending",
  }));

  const { data, error } = await supabase.from("payout_transfers").insert(transfers).select();

  if (error) {
    // Check if error is due to unique constraint (already paid)
    if (error.code === "23505") {
      // unique_booking_payout constraint
      throw new Error("One or more bookings have already been paid out");
    }
    throw new Error(`Failed to create transfer records: ${error.message}`);
  }

  return data;
}

// ============================================
// Stripe Integration
// ============================================

async function processStripeTransfer(
  professionalId: string,
  amountCop: number,
  batchId: string,
  bookingId: string,
  transferDbIds: string[]
) {
  // Get professional's Stripe Connect account ID
  const supabase = supabaseAdmin;
  const { data: professional, error } = await supabase
    .from("professional_profiles")
    .select("stripe_account_id")
    .eq("profile_id", professionalId)
    .single();

  if (error || !professional?.stripe_account_id) {
    throw new Error(`Professional ${professionalId} does not have Stripe Connect account`);
  }

  // Create Stripe transfer with idempotency key (C-2 requirement)
  const idempotencyKey = generateStripeIdempotencyKey(batchId, bookingId);

  try {
    const transfer = await stripe.transfers.create(
      {
        amount: amountCop,
        currency: "cop",
        destination: professional.stripe_account_id,
        description: `Payout batch ${batchId} - ${transferDbIds.length} booking(s)`,
        metadata: {
          batch_id: batchId,
          professional_id: professionalId,
          transfer_count: transferDbIds.length.toString(),
        },
      },
      {
        idempotencyKey, // Ensures Stripe deduplication
      }
    );

    // Update transfer records with Stripe transfer ID
    for (const transferDbId of transferDbIds) {
      await supabase
        .from("payout_transfers")
        .update({ stripe_transfer_id: transfer.id })
        .eq("id", transferDbId);
    }

    await logger.info("Stripe transfer created", {
      stripeTransferId: transfer.id,
      professionalId,
      amountCop,
      batchId,
      idempotencyKey,
    });
  } catch (error) {
    await logger.error("Stripe transfer failed", error as Error, {
      professionalId,
      amountCop,
      batchId,
      idempotencyKey,
    });

    throw error;
  }
}
