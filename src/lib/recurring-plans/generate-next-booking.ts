/**
 * On-Demand Recurring Booking Generation
 *
 * Generates the next booking from a recurring plan when the current booking is completed.
 * This is triggered from the Stripe webhook handler after payment success.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { addMonths, addWeeks, format, setDay } from "date-fns";
import { logger } from "@/lib/logger";

type RecurringPlan = {
  id: string;
  customer_id: string;
  professional_id: string;
  service_name: string;
  duration_minutes: number;
  address: string;
  special_instructions: string | null;
  frequency: "weekly" | "biweekly" | "monthly";
  day_of_week: number | null;
  preferred_time: string;
  base_amount: number;
  discount_percentage: number;
  final_amount: number;
  currency: string;
  status: "active" | "paused" | "cancelled";
  next_booking_date: string;
  total_bookings_completed: number;
};

type GenerationResult = {
  success: boolean;
  bookingId?: string;
  nextBookingDate?: string;
  error?: string;
};

/**
 * Calculate the next booking date based on frequency and day of week
 */
function calculateNextBookingDate(
  currentDate: Date,
  frequency: "weekly" | "biweekly" | "monthly",
  dayOfWeek: number | null
): Date {
  let nextDate: Date;

  switch (frequency) {
    case "weekly":
      nextDate = addWeeks(currentDate, 1);
      break;
    case "biweekly":
      nextDate = addWeeks(currentDate, 2);
      break;
    case "monthly":
      nextDate = addMonths(currentDate, 1);
      break;
    default:
      nextDate = addWeeks(currentDate, 1);
  }

  // Adjust to the correct day of week if specified
  if (dayOfWeek !== null && dayOfWeek >= 0 && dayOfWeek <= 6) {
    nextDate = setDay(nextDate, dayOfWeek, { weekStartsOn: 0 });
    // If the adjusted date is before or equal to current, add another period
    if (nextDate <= currentDate) {
      nextDate = addWeeks(nextDate, frequency === "biweekly" ? 2 : 1);
    }
  }

  return nextDate;
}

/**
 * Combine date and time into ISO string
 */
function combineDateTime(date: Date, timeString: string): string {
  // Parse time string (HH:mm format)
  const [hours, minutes] = timeString.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

/**
 * Generate the next booking from a completed recurring plan booking
 *
 * Called after a booking is completed (payment success) to automatically
 * create the next scheduled booking based on the recurring plan settings.
 */
export async function generateNextRecurringBooking(
  supabase: SupabaseClient,
  bookingId: string
): Promise<GenerationResult> {
  try {
    // 1. Get the completed booking details
    const { data: completedBooking, error: bookingError } = await supabase
      .from("bookings")
      .select("recurring_plan_id, customer_id, professional_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !completedBooking) {
      logger.debug("[Recurring] Booking not found or no recurring plan", { bookingId });
      return { success: true }; // Not an error, just no recurring plan
    }

    if (!completedBooking.recurring_plan_id) {
      logger.debug("[Recurring] Booking has no recurring plan", { bookingId });
      return { success: true }; // Not a recurring booking
    }

    // 2. Get the recurring plan
    const { data: plan, error: planError } = await supabase
      .from("recurring_plans")
      .select("*")
      .eq("id", completedBooking.recurring_plan_id)
      .single();

    if (planError || !plan) {
      logger.warn("[Recurring] Recurring plan not found", {
        planId: completedBooking.recurring_plan_id,
        bookingId,
      });
      return { success: false, error: "Recurring plan not found" };
    }

    const recurringPlan = plan as RecurringPlan;

    // 3. Check if plan is still active
    if (recurringPlan.status !== "active") {
      logger.info("[Recurring] Plan is not active, skipping next booking generation", {
        planId: recurringPlan.id,
        status: recurringPlan.status,
      });
      return { success: true }; // Not an error, plan is paused/cancelled
    }

    // 4. Calculate next booking date
    const currentDate = new Date(recurringPlan.next_booking_date);
    const nextBookingDate = calculateNextBookingDate(
      currentDate,
      recurringPlan.frequency,
      recurringPlan.day_of_week
    );

    // 5. Calculate scheduled start and end times
    const scheduledStart = combineDateTime(nextBookingDate, recurringPlan.preferred_time);
    const scheduledEnd = new Date(
      new Date(scheduledStart).getTime() + recurringPlan.duration_minutes * 60 * 1000
    ).toISOString();

    // 6. Create the next booking
    const { data: newBooking, error: createError } = await supabase
      .from("bookings")
      .insert({
        customer_id: recurringPlan.customer_id,
        professional_id: recurringPlan.professional_id,
        service_name: recurringPlan.service_name,
        duration_minutes: recurringPlan.duration_minutes,
        address: recurringPlan.address,
        special_instructions: recurringPlan.special_instructions,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        amount_estimated: recurringPlan.final_amount,
        currency: recurringPlan.currency,
        status: "pending", // Needs professional confirmation
        recurring_plan_id: recurringPlan.id,
        is_recurring: true,
      })
      .select("id")
      .single();

    if (createError || !newBooking) {
      logger.error("[Recurring] Failed to create next booking", {
        planId: recurringPlan.id,
        error: createError?.message,
      });
      return { success: false, error: createError?.message || "Failed to create booking" };
    }

    // 7. Update recurring plan with new next_booking_date and increment counter
    const { error: updateError } = await supabase
      .from("recurring_plans")
      .update({
        next_booking_date: format(nextBookingDate, "yyyy-MM-dd"),
        total_bookings_completed: recurringPlan.total_bookings_completed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recurringPlan.id);

    if (updateError) {
      logger.warn("[Recurring] Failed to update plan next_booking_date", {
        planId: recurringPlan.id,
        error: updateError.message,
      });
      // Don't fail - booking was created successfully
    }

    logger.info("[Recurring] Generated next recurring booking", {
      planId: recurringPlan.id,
      previousBookingId: bookingId,
      newBookingId: newBooking.id,
      nextBookingDate: format(nextBookingDate, "yyyy-MM-dd"),
    });

    return {
      success: true,
      bookingId: newBooking.id,
      nextBookingDate: format(nextBookingDate, "yyyy-MM-dd"),
    };
  } catch (error) {
    logger.error("[Recurring] Error generating next booking", {
      bookingId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
