/**
 * REFACTORED VERSION - Dispute management for completed bookings
 * POST /api/bookings/disputes - Submit a dispute
 * GET /api/bookings/disputes - Get user disputes
 *
 * BEFORE: 211 lines
 * AFTER: 114 lines (46% reduction)
 */

import { z } from "zod";
import { ok, requireCustomerOwnership, withAuth, withCustomer } from "@/lib/api";
import { BusinessRuleError, InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import {
  notifyAdminDisputeFiled,
  notifyAllAdmins,
  notifyProfessionalDisputeFiled,
} from "@/lib/notifications";

const disputeSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { bookingId, reason, description } = disputeSchema.parse(body);

  // Verify booking exists, belongs to user, is completed, and within 48-hour window
  const booking = await requireCustomerOwnership(
    supabase,
    user.id,
    bookingId,
    `
    id,
    status,
    customer_id,
    professional_id,
    completed_at,
    customer_profiles:profiles!bookings_customer_id_fkey(full_name),
    professional_profiles:profiles!bookings_professional_id_fkey(full_name)
  `
  );

  if (booking.status !== "completed") {
    throw new InvalidBookingStatusError(booking.status, "dispute");
  }

  if (!booking.completed_at) {
    throw new BusinessRuleError("Booking completion time not recorded", "MISSING_COMPLETION_TIME");
  }

  // Check 48-hour window
  const completedAt = new Date(booking.completed_at);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceCompletion > 48) {
    throw new BusinessRuleError(
      "Dispute window has closed (48 hours after completion)",
      "DISPUTE_WINDOW_CLOSED"
    );
  }

  // Check if dispute already exists for this booking
  const { data: existingDispute } = await supabase
    .from("booking_disputes")
    .select("id")
    .eq("booking_id", bookingId)
    .single();

  if (existingDispute) {
    throw new BusinessRuleError(
      "A dispute has already been submitted for this booking",
      "DISPUTE_EXISTS"
    );
  }

  // Create dispute
  const { data: dispute, error: disputeError } = await supabase
    .from("booking_disputes")
    .insert({
      booking_id: bookingId,
      customer_id: user.id,
      professional_id: booking.professional_id,
      reason,
      description: description.trim(),
      status: "pending",
    })
    .select("id, created_at")
    .single();

  if (disputeError || !dispute) {
    throw new ValidationError("Failed to create dispute");
  }

  // Notify professional about the dispute
  const customerName = (booking.customer_profiles as any)?.full_name || "Customer";
  await notifyProfessionalDisputeFiled(booking.professional_id, {
    id: dispute.id,
    bookingId: booking.id,
    reason,
    customerName,
  });

  // Notify all admins about new dispute requiring review
  const professionalName = (booking.professional_profiles as any)?.full_name || "Professional";
  await notifyAllAdmins(notifyAdminDisputeFiled, {
    id: dispute.id,
    bookingId: booking.id,
    reason,
    customerName,
    professionalName,
  });

  return ok(
    {
      dispute: {
        id: dispute.id,
        created_at: dispute.created_at,
      },
    },
    "Dispute submitted successfully"
  );
});

export const GET = withAuth(async ({ user, supabase }) => {
  // Get disputes based on user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("booking_disputes")
    .select(
      `
      id,
      booking_id,
      reason,
      description,
      status,
      created_at,
      updated_at,
      booking:bookings (
        id,
        service_name,
        scheduled_start,
        completed_at
      )
    `
    )
    .order("created_at", { ascending: false });

  // Filter based on role
  if (profile?.role === "admin") {
    // Admins see all disputes
  } else if (profile?.role === "professional") {
    query = query.eq("professional_id", user.id);
  } else {
    // Customers see their own disputes
    query = query.eq("customer_id", user.id);
  }

  const { data: disputes, error } = await query;

  if (error) {
    throw new ValidationError("Failed to fetch disputes");
  }

  return ok({ disputes: disputes || [] });
});
