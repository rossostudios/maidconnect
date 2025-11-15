/**
 * Cron Job: Send Rebook Nudges (Sprint 2)
 *
 * Scheduled to run every hour (recommended)
 * Sends email + push notifications to customers 24h or 72h after booking completion
 * A/B test: 50% get 24h nudge, 50% get 72h nudge
 *
 * Rate Limit: 1 request per 5 minutes (cron tier - prevents concurrent execution)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { rebookNudgeEmail } from "@/lib/email/templates";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { notifyCustomerRebookNudge } from "@/lib/notifications";
import { withRateLimit } from "@/lib/rate-limit";

type RebookVariant = "24h" | "72h";

type VariantResults = {
  total_processed: number;
  emails_sent: number;
  push_sent: number;
  errors: number;
};

type BookingData = {
  id: string;
  customer_id: string;
  professional_id: string;
  service_name: string;
  scheduled_date: string;
  actual_end_time: string;
  customer:
    | Array<{ id: string; email: string; full_name: string }>
    | { id: string; email: string; full_name: string };
  professional: Array<{ id: string; full_name: string }> | { id: string; full_name: string };
};

type NormalizedBooking = {
  id: string;
  customer_id: string;
  professional_id: string;
  service_name: string;
  scheduled_date: string;
  customer: { id: string; email: string; full_name: string };
  professional: { id: string; full_name: string };
};

/**
 * Verify cron authentication
 */
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error("[rebook-nudges] CRON_SECRET not configured");
    return false;
  }

  return authHeader === expectedAuth;
}

/**
 * Create service role Supabase client
 */
function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Calculate time window for variant
 */
function calculateTimeWindow(hours: number): { windowStart: Date; windowEnd: Date } {
  const targetTime = new Date();
  targetTime.setHours(targetTime.getHours() - hours);
  const windowStart = new Date(targetTime.getTime() - 3_600_000); // 1 hour before
  const windowEnd = new Date(targetTime.getTime() + 3_600_000); // 1 hour after

  return { windowStart, windowEnd };
}

/**
 * Fetch eligible bookings for variant
 */
async function fetchEligibleBookings(
  supabase: SupabaseClient,
  variant: RebookVariant,
  hours: number
): Promise<BookingData[] | null> {
  const { windowStart, windowEnd } = calculateTimeWindow(hours);

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      customer_id,
      professional_id,
      service_name,
      scheduled_date,
      actual_end_time,
      rebook_nudge_variant,
      rebook_nudge_sent,
      customer:profiles!bookings_customer_id_fkey(
        id,
        email,
        full_name
      ),
      professional:profiles!bookings_professional_id_fkey(
        id,
        full_name
      )
    `
    )
    .eq("status", "completed")
    .eq("rebook_nudge_sent", false)
    .eq("rebook_nudge_variant", variant)
    .gte("actual_end_time", windowStart.toISOString())
    .lte("actual_end_time", windowEnd.toISOString())
    .not("actual_end_time", "is", null);

  if (error) {
    console.error(`[rebook-nudges] Error fetching ${variant} bookings:`, error);
    return null;
  }

  return data as BookingData[];
}

/**
 * Normalize booking data (handle arrays from Supabase joins)
 */
function normalizeBookingData(booking: BookingData): NormalizedBooking | null {
  const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
  const professional = Array.isArray(booking.professional)
    ? booking.professional[0]
    : booking.professional;

  if (!(customer?.email && customer?.full_name && professional?.full_name)) {
    console.warn(`[rebook-nudges] Missing data for booking ${booking.id}`);
    return null;
  }

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    professional_id: booking.professional_id,
    service_name: booking.service_name,
    scheduled_date: booking.scheduled_date,
    customer,
    professional,
  };
}

/**
 * Send rebook notifications (email + push)
 */
async function sendRebookNotifications(
  booking: NormalizedBooking,
  variant: RebookVariant
): Promise<{ emailSent: boolean; pushSent: boolean }> {
  let emailSent = false;
  let pushSent = false;

  // Send email
  try {
    await sendEmail(
      booking.customer.email,
      `Ready for Your Next Service? - ${booking.service_name}`,
      rebookNudgeEmail(
        {
          customerName: booking.customer.full_name,
          professionalName: booking.professional.full_name,
          professionalId: booking.professional_id,
          serviceName: booking.service_name,
          scheduledDate: new Date(booking.scheduled_date).toLocaleDateString(),
          scheduledTime: "",
          duration: "",
          address: "",
          bookingId: booking.id,
        },
        variant,
        process.env.NEXT_PUBLIC_BASE_URL || "https://casaora.co"
      )
    );
    emailSent = true;
  } catch (emailError) {
    console.error(`[rebook-nudges] Email error for booking ${booking.id}:`, emailError);
  }

  // Send push notification
  try {
    await notifyCustomerRebookNudge(booking.customer_id, {
      id: booking.id,
      serviceName: booking.service_name,
      professionalName: booking.professional.full_name,
      professionalId: booking.professional_id,
    });
    pushSent = true;
  } catch (pushError) {
    console.error(`[rebook-nudges] Push error for booking ${booking.id}:`, pushError);
  }

  return { emailSent, pushSent };
}

/**
 * Update experiment tracking table
 */
async function updateExperimentTracking(
  supabase: SupabaseClient,
  bookingId: string,
  customerId: string,
  variant: RebookVariant
): Promise<void> {
  const now = new Date().toISOString();

  await supabase.from("rebook_nudge_experiments").upsert(
    {
      booking_id: bookingId,
      customer_id: customerId,
      variant,
      email_sent_at: now,
      push_sent_at: now,
      updated_at: now,
    },
    { onConflict: "booking_id" }
  );
}

/**
 * Mark booking as nudge sent
 */
async function markNudgeSent(supabase: SupabaseClient, bookingId: string): Promise<void> {
  const now = new Date().toISOString();

  await supabase
    .from("bookings")
    .update({
      rebook_nudge_sent: true,
      rebook_nudge_sent_at: now,
    })
    .eq("id", bookingId);
}

/**
 * Process a single booking
 */
async function processSingleBooking(
  supabase: SupabaseClient,
  booking: BookingData,
  variant: RebookVariant,
  results: VariantResults
): Promise<void> {
  try {
    results.total_processed++;

    // Normalize booking data
    const normalized = normalizeBookingData(booking);
    if (!normalized) {
      results.errors++;
      return;
    }

    // Send notifications
    const { emailSent, pushSent } = await sendRebookNotifications(normalized, variant);
    if (emailSent) {
      results.emails_sent++;
    }
    if (pushSent) {
      results.push_sent++;
    }
    if (!(emailSent && pushSent)) {
      results.errors++;
    }

    // Update tracking and mark as sent
    await updateExperimentTracking(supabase, normalized.id, normalized.customer_id, variant);
    await markNudgeSent(supabase, normalized.id);
  } catch (error) {
    console.error(`[rebook-nudges] Error processing booking ${booking.id}:`, error);
    results.errors++;
  }
}

/**
 * Process all bookings for a variant
 */
async function processVariant(
  supabase: SupabaseClient,
  variant: RebookVariant,
  hours: number,
  results: VariantResults
): Promise<void> {
  const bookings = await fetchEligibleBookings(supabase, variant, hours);

  if (!bookings) {
    results.errors++;
    return;
  }

  if (bookings.length === 0) {
    console.log(`[rebook-nudges] No bookings ready for ${variant} nudge`);
    return;
  }

  console.log(`[rebook-nudges] Processing ${bookings.length} bookings for ${variant} nudge`);

  for (const booking of bookings) {
    await processSingleBooking(supabase, booking, variant, results);
  }
}

async function handleRebookNudges(request: NextRequest) {
  try {
    // 1. Verify authentication
    if (!verifyCronAuth(request)) {
      console.warn("[rebook-nudges] Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check if feature is enabled
    if (!isFeatureEnabled("rebook_nudge_system")) {
      return NextResponse.json({
        success: true,
        message: "Rebook nudge system is disabled via feature flag",
        sent: 0,
      });
    }

    // 3. Create Supabase client
    const supabase = createServiceClient();

    // 4. Initialize results
    const results: VariantResults = {
      total_processed: 0,
      emails_sent: 0,
      push_sent: 0,
      errors: 0,
    };

    // 5. Process both variants
    const variants: Array<{ hours: number; variant: RebookVariant }> = [
      { hours: 24, variant: "24h" },
      { hours: 72, variant: "72h" },
    ];

    for (const { hours, variant } of variants) {
      await processVariant(supabase, variant, hours, results);
    }

    // 6. Return summary
    console.log("[rebook-nudges] Cron job completed:", results);
    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[rebook-nudges] Cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 1 request per 5 minutes (prevents concurrent cron execution)
export const GET = withRateLimit(handleRebookNudges, "cron");
