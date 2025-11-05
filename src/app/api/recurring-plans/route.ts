/**
 * Recurring Plans API Route
 * POST /api/recurring-plans
 *
 * Creates a recurring service plan with automated billing
 * Sprint 2: Supply & Ops - Recurring Plans
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const recurringPlanSchema = z.object({
  professionalId: z.string().uuid(),
  serviceName: z.string().min(1),
  durationMinutes: z.number().int().positive().max(480), // Max 8 hours
  address: z.string().min(1),
  specialInstructions: z.string().optional(),

  // Recurrence settings
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0=Sunday, 6=Saturday (required for weekly/biweekly)
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format

  // Pricing
  baseAmount: z.number().int().positive(), // Price before discount (in COP)
});

// Discount rates by frequency
const FREQUENCY_DISCOUNTS: Record<string, number> = {
  weekly: 15, // 15% discount
  biweekly: 10, // 10% discount
  monthly: 5, // 5% discount
};

const handler = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const data = recurringPlanSchema.parse(body);

  // Validate day_of_week is provided for weekly/biweekly
  if (
    (data.frequency === "weekly" || data.frequency === "biweekly") &&
    data.dayOfWeek === undefined
  ) {
    throw new ValidationError("day_of_week is required for weekly and biweekly plans");
  }

  // Validate start date is in the future
  const startDate = new Date(data.startDate);
  if (startDate < new Date()) {
    throw new ValidationError("start_date must be in the future");
  }

  // Calculate discounted price
  const discountPercentage = FREQUENCY_DISCOUNTS[data.frequency] || 0;
  const discountAmount = Math.round((data.baseAmount * discountPercentage) / 100);
  const finalAmount = data.baseAmount - discountAmount;

  // Create recurring plan
  const { data: plan, error: createError } = await supabase
    // @ts-ignore - Sprint 2 feature: recurring_plans table will be created in migration
    .from("recurring_plans")
    .insert({
      customer_id: user.id,
      professional_id: data.professionalId,
      service_name: data.serviceName,
      duration_minutes: data.durationMinutes,
      address: data.address,
      special_instructions: data.specialInstructions || null,
      frequency: data.frequency,
      day_of_week: data.dayOfWeek ?? null,
      preferred_time: data.preferredTime,
      base_amount: data.baseAmount,
      discount_percentage: discountPercentage,
      final_amount: finalAmount,
      currency: "COP",
      status: "active",
      next_booking_date: data.startDate,
      total_bookings_completed: 0,
    })
    .select()
    .single();

  if (createError || !plan) {
    throw new ValidationError(createError?.message || "Failed to create recurring plan");
  }

  // Log the creation for analytics
  console.log(`Recurring plan created: ${(plan as any).id} for user ${user.id} (${data.frequency})`);

  return ok({
    id: (plan as any).id,
    frequency: (plan as any).frequency,
    discountPercentage: `${discountPercentage}%`,
    baseAmount: (plan as any).base_amount,
    finalAmount: (plan as any).final_amount,
    savings: discountAmount,
    nextBookingDate: (plan as any).next_booking_date,
    status: (plan as any).status,
  });
});

// Apply rate limiting: 10 recurring plans per hour per user
export const POST = withRateLimit(handler, "booking");
