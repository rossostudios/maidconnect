/**
 * Recurring Plans API Route
 * GET: Fetch user's recurring plans
 * POST: Create a new recurring plan
 */

import { addDays, format, setDay } from "date-fns";
import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

// Discount rates for recurring plans
const RECURRING_DISCOUNTS: Record<string, number> = {
  weekly: 15, // 15% discount
  biweekly: 10, // 10% discount
  monthly: 5, // 5% discount
};

const createRecurringPlanSchema = z.object({
  professional_id: z.string().uuid(),
  service_name: z.string().min(1).max(255),
  duration_minutes: z.number().int().min(30).max(480),
  address: z.string().min(1).max(500),
  special_instructions: z.string().max(1000).nullable().optional(),
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  day_of_week: z.number().int().min(0).max(6), // 0=Sunday, 6=Saturday
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/), // HH:mm format
  base_amount: z.number().int().min(1), // Amount in currency minor units
  currency: z.string().length(3).default("COP"),
});

const getHandler = withAuth(async ({ user, supabase }) => {
  // Fetch all recurring plans for the user with professional details
  const { data: plans, error } = await supabase
    .from("recurring_plans")
    .select(
      `
      id,
      service_name,
      duration_minutes,
      address,
      special_instructions,
      frequency,
      day_of_week,
      preferred_time,
      base_amount,
      discount_percentage,
      final_amount,
      currency,
      status,
      pause_start_date,
      pause_end_date,
      created_at,
      next_booking_date,
      total_bookings_completed,
      professional:professional_profiles!professional_id (
        user_id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recurring plans:", error);
    return ok({ plans: [] });
  }

  return ok({ plans: plans || [] });
});

const postHandler = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();

  // Validate request body
  const parsed = createRecurringPlanSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0]?.message || "Invalid request data");
  }

  const data = parsed.data;

  // Verify the professional exists
  const { data: professional, error: proError } = await supabase
    .from("professional_profiles")
    .select("user_id, full_name")
    .eq("user_id", data.professional_id)
    .single();

  if (proError || !professional) {
    throw new ValidationError("Professional not found");
  }

  // Calculate discount and final amount
  const discountPercentage = RECURRING_DISCOUNTS[data.frequency] || 0;
  const discountAmount = Math.round(data.base_amount * (discountPercentage / 100));
  const finalAmount = data.base_amount - discountAmount;

  // Calculate next booking date (next occurrence of the specified day)
  const today = new Date();
  let nextBookingDate = setDay(today, data.day_of_week, { weekStartsOn: 0 });

  // If the calculated date is today or in the past, move to next week
  if (nextBookingDate <= today) {
    nextBookingDate = addDays(nextBookingDate, 7);
  }

  // Create the recurring plan
  const { data: plan, error: createError } = await supabase
    .from("recurring_plans")
    .insert({
      customer_id: user.id,
      professional_id: data.professional_id,
      service_name: data.service_name,
      duration_minutes: data.duration_minutes,
      address: data.address,
      special_instructions: data.special_instructions || null,
      frequency: data.frequency,
      day_of_week: data.day_of_week,
      preferred_time: data.preferred_time,
      base_amount: data.base_amount,
      discount_percentage: discountPercentage,
      final_amount: finalAmount,
      currency: data.currency,
      status: "active",
      next_booking_date: format(nextBookingDate, "yyyy-MM-dd"),
      total_bookings_completed: 0,
    })
    .select()
    .single();

  if (createError || !plan) {
    console.error("Failed to create recurring plan:", createError);
    throw new ValidationError(createError?.message || "Failed to create recurring plan");
  }

  // Create the first booking from this plan
  const scheduledStart = new Date(nextBookingDate);
  const [hours, minutes] = data.preferred_time.split(":").map(Number);
  scheduledStart.setHours(hours, minutes, 0, 0);

  const scheduledEnd = new Date(scheduledStart.getTime() + data.duration_minutes * 60 * 1000);

  const { data: firstBooking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      professional_id: data.professional_id,
      service_name: data.service_name,
      duration_minutes: data.duration_minutes,
      address: data.address,
      special_instructions: data.special_instructions || null,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      amount_estimated: finalAmount,
      currency: data.currency,
      status: "pending",
      recurring_plan_id: plan.id,
      is_recurring: true,
    })
    .select("id")
    .single();

  if (bookingError) {
    console.error("Failed to create first booking:", bookingError);
    // Don't fail the plan creation - the plan is saved, booking can be created later
  }

  return ok({
    plan: {
      ...plan,
      professional: {
        user_id: professional.user_id,
        full_name: professional.full_name,
      },
    },
    firstBooking: firstBooking || null,
    discountApplied: discountPercentage,
  });
});

export const GET = withRateLimit(getHandler, "api");
export const POST = withRateLimit(postHandler, "booking");
