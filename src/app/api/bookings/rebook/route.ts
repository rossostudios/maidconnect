/**
 * REFACTORED VERSION - Rebook API Route
 * Creates a new booking based on a previous completed booking
 *
 * BEFORE: 137 lines
 * AFTER: 81 lines (41% reduction)
 */

import { withCustomer, ok, withRateLimit, requireCustomerOwnership } from "@/lib/api";
import { InvalidBookingStatusError, ValidationError } from "@/lib/errors";
import { z } from "zod";

const rebookSchema = z.object({
  originalBookingId: z.string().uuid(),
  scheduledStart: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().max(1440).optional(),
});

const handler = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { originalBookingId, scheduledStart, durationMinutes } = rebookSchema.parse(body);

  // Fetch original booking details
  const originalBooking = await requireCustomerOwnership(supabase, user.id, originalBookingId, `
    *,
    professional:profiles!professional_id (
      id,
      full_name,
      avatar_url
    )
  `);

  // Only allow rebooking of completed bookings
  if (originalBooking.status !== "completed") {
    throw new InvalidBookingStatusError(
      originalBooking.status,
      "rebook"
    );
  }

  // Calculate new scheduling details
  const newScheduledStart = scheduledStart;
  let newScheduledEnd: string | null = null;
  const newDuration = durationMinutes || originalBooking.duration_minutes;

  if (newScheduledStart && newDuration) {
    const startDate = new Date(newScheduledStart);
    const endDate = new Date(startDate.getTime() + newDuration * 60 * 1000);
    newScheduledEnd = endDate.toISOString();
  }

  // Create new booking with pre-filled data
  const { data: newBooking, error: createError } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      professional_id: originalBooking.professional_id,
      scheduled_start: newScheduledStart || null,
      scheduled_end: newScheduledEnd,
      duration_minutes: newDuration,
      status: "pending_payment",
      amount_estimated: originalBooking.amount_estimated || originalBooking.amount_final,
      currency: originalBooking.currency || "cop",
      special_instructions: originalBooking.special_instructions,
      address: originalBooking.address,
      service_name: originalBooking.service_name,
      service_hourly_rate: originalBooking.service_hourly_rate,
    })
    .select()
    .single();

  if (createError || !newBooking) {
    throw new ValidationError(createError?.message || "Failed to create rebook");
  }

  return ok({
    bookingId: newBooking.id,
    professional: {
      id: originalBooking.professional_id,
      name: originalBooking.professional?.full_name,
      photo: originalBooking.professional?.avatar_url,
    },
    serviceName: originalBooking.service_name,
    amount: newBooking.amount_estimated,
    durationMinutes: newDuration,
    address: originalBooking.address,
    specialInstructions: originalBooking.special_instructions,
    // Return whether the user still needs to select a date
    needsScheduling: !newScheduledStart,
    redirectTo: newScheduledStart
      ? `/dashboard/customer/bookings/${newBooking.id}/payment`
      : `/dashboard/customer/bookings/${newBooking.id}/schedule`,
  });
});

// Apply rate limiting: 10 rebooks per minute
export const POST = withRateLimit(handler, "booking");
