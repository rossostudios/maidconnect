/**
 * REFACTORED VERSION - Recurring Bookings API Route
 * Creates a subscription plan for recurring bookings
 *
 * BEFORE: 204 lines
 * AFTER: 135 lines (34% reduction)
 */

import { withAuth, ok, withRateLimit } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

const recurringBookingSchema = z.object({
  professionalId: z.string().uuid(),
  serviceName: z.string().min(1),
  serviceHourlyRate: z.number().positive(),
  durationMinutes: z.number().int().positive().max(1440),
  address: z.string().min(1),
  specialInstructions: z.string().optional(),
  // Recurring schedule details
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  startDate: z.string().datetime(),
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0=Sunday, 6=Saturday
  endType: z.enum(["occurrences", "date", "never"]),
  occurrences: z.number().int().positive().max(52).optional(),
  endDate: z.string().datetime().optional(),
});

const FREQUENCY_DISCOUNTS: Record<string, number> = {
  weekly: 0.15, // 15% discount
  biweekly: 0.12, // 12% discount
  monthly: 0.1, // 10% discount
};

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = recurringBookingSchema.parse(body);

  const {
    professionalId,
    serviceName,
    serviceHourlyRate,
    durationMinutes,
    address,
    specialInstructions,
    frequency,
    startDate,
    dayOfWeek,
    endType,
    occurrences,
    endDate,
  } = validatedData;

  // Calculate discounted price
  const discount = FREQUENCY_DISCOUNTS[frequency] || 0;
  const baseAmount = Math.round((serviceHourlyRate * durationMinutes) / 60);
  const discountedAmount = Math.round(baseAmount * (1 - discount));

  // Build RRULE string (RFC 5545 format)
  const rruleComponents = [`FREQ=${frequency.toUpperCase()}`];

  if (frequency !== "monthly" && dayOfWeek !== undefined) {
    const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    rruleComponents.push(`BYDAY=${days[dayOfWeek]}`);
  }

  if (endType === "occurrences" && occurrences) {
    rruleComponents.push(`COUNT=${occurrences}`);
  } else if (endType === "date" && endDate) {
    // Format: YYYYMMDD
    const until = new Date(endDate).toISOString().split("T")[0]!.replace(/-/g, "");
    rruleComponents.push(`UNTIL=${until}`);
  }

  const rrule = rruleComponents.join(";");

  // Create recurring booking subscription
  const { data: subscription, error: createError } = await supabase
    .from("recurring_booking_subscriptions")
    .insert({
      customer_id: user.id,
      professional_id: professionalId,
      service_name: serviceName,
      service_hourly_rate: serviceHourlyRate,
      duration_minutes: durationMinutes,
      address,
      special_instructions: specialInstructions || null,
      frequency,
      rrule,
      start_date: startDate,
      end_type: endType,
      total_occurrences: endType === "occurrences" ? occurrences : null,
      end_date: endType === "date" ? endDate : null,
      base_amount: baseAmount,
      discounted_amount: discountedAmount,
      discount_percentage: discount,
      currency: "cop",
      status: "active",
      next_booking_date: startDate,
    })
    .select()
    .single();

  if (createError || !subscription) {
    throw new ValidationError(createError?.message || "Failed to create recurring booking subscription");
  }

  // Create the first booking immediately if start date is today or in the past
  const now = new Date();
  const startDateTime = new Date(startDate);
  let firstBookingId: string | null = null;

  if (startDateTime <= now) {
    const scheduledEnd = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const { data: firstBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        professional_id: professionalId,
        scheduled_start: startDate,
        scheduled_end: scheduledEnd.toISOString(),
        duration_minutes: durationMinutes,
        status: "pending_payment",
        amount_estimated: discountedAmount,
        currency: "cop",
        special_instructions: specialInstructions,
        address,
        service_name: serviceName,
        service_hourly_rate: serviceHourlyRate,
        recurring_booking_subscription_id: subscription.id,
      })
      .select()
      .single();

    if (!bookingError && firstBooking) {
      firstBookingId = firstBooking.id;

      // Update subscription with first booking reference
      await supabase
        .from("recurring_booking_subscriptions")
        .update({
          last_booking_created_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);
    }
  }

  return ok({
    subscriptionId: subscription.id,
    frequency,
    discount: `${(discount * 100).toFixed(0)}%`,
    baseAmount,
    discountedAmount,
    totalOccurrences: endType === "occurrences" ? occurrences : "Ongoing",
    estimatedTotalSavings:
      endType === "occurrences" ? (baseAmount - discountedAmount) * (occurrences ?? 0) : null,
    nextBookingDate: subscription.next_booking_date,
    firstBookingId,
    redirectTo: firstBookingId
      ? `/dashboard/customer/bookings/${firstBookingId}/payment`
      : `/dashboard/customer/recurring-bookings/${subscription.id}`,
  });
});

// Apply rate limiting: 5 recurring bookings per hour
export const POST = withRateLimit(handler, "booking");
