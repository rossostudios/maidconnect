/**
 * Generate receipt for a completed booking
 * GET /api/bookings/receipt?bookingId=<id>
 *
 * Returns receipt data for display or PDF generation
 */

import { z } from "zod";
import { ok, requireCustomerOwnership, withCustomer } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const receiptQuerySchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID format"),
});

export type ReceiptData = {
  receipt_number: string;
  booking_id: string;
  date_issued: string;
  service_date: string;
  customer: {
    name: string;
    email: string;
  };
  professional: {
    name: string;
    profile_id: string;
  };
  service: {
    name: string;
    duration_minutes: number;
    hourly_rate: number;
    address: string | null;
  };
  payment: {
    subtotal: number;
    platform_fee: number;
    tip_amount: number;
    total: number;
    currency: string;
    payment_method: string;
    payment_date: string;
  };
  company: {
    name: string;
    address: string;
    support_email: string;
  };
};

export const GET = withCustomer(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get("bookingId");

  // Validate query params
  const { bookingId: validatedBookingId } = receiptQuerySchema.parse({ bookingId });

  // Verify customer owns this booking
  const booking = await requireCustomerOwnership(supabase, user.id, validatedBookingId);

  // Ensure booking is completed
  if (booking.status !== "completed") {
    throw new ValidationError("Receipt is only available for completed bookings");
  }

  // Get professional details
  const { data: professionalProfile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", booking.professional_id)
    .single();

  // Calculate amounts
  const subtotal =
    booking.amount_final || booking.amount_captured || booking.amount_authorized || 0;
  const tipAmount = booking.tip_amount || 0;
  const platformFee = booking.platform_fee_cents || 0;
  const total = subtotal + tipAmount;

  // Generate receipt number (booking ID + timestamp hash)
  const receiptNumber = `REC-${booking.id.slice(0, 8).toUpperCase()}-${new Date(booking.completed_at || booking.created_at).getFullYear()}`;

  const receiptData: ReceiptData = {
    receipt_number: receiptNumber,
    booking_id: booking.id,
    date_issued: new Date().toISOString(),
    service_date: booking.scheduled_start || booking.created_at,
    customer: {
      name: user.user_metadata?.full_name || "Customer",
      email: user.email || "",
    },
    professional: {
      name: professionalProfile?.full_name || "Professional",
      profile_id: booking.professional_id,
    },
    service: {
      name: booking.service_name || "Home Service",
      duration_minutes: booking.duration_minutes || 0,
      hourly_rate: booking.service_hourly_rate || 0,
      address: booking.address || null,
    },
    payment: {
      subtotal,
      platform_fee: platformFee,
      tip_amount: tipAmount,
      total,
      currency: booking.currency || "COP",
      payment_method: booking.payment_method || "card",
      payment_date: booking.completed_at || booking.created_at,
    },
    company: {
      name: "Casaora",
      address: "Bogotá, Colombia",
      support_email: "support@casaora.com",
    },
  };

  return ok(receiptData, "Receipt generated successfully");
});
