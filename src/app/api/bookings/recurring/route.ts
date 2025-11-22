/**
 * Recurring Bookings API Route
 * Creates a recurring plan for scheduled bookings
 *
 * Uses the `recurring_plans` table with frequency-based discounts:
 * - Weekly: 15% discount
 * - Biweekly: 12% discount
 * - Monthly: 10% discount
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const recurringBookingSchema = z.object({
  professionalId: z.string().uuid(),
  serviceName: z.string().min(1),
  baseAmount: z.number().positive(), // Base price per booking
  durationMinutes: z.number().int().positive().max(1440),
  address: z.string().min(1),
  specialInstructions: z.string().optional(),
  // Recurring schedule details
  frequency: z.enum(["weekly", "biweekly", "monthly"]),
  startDate: z.string(), // ISO date string (YYYY-MM-DD)
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  dayOfWeek: z.number().int().min(0).max(6).optional(), // 0=Sunday, 6=Saturday
  currency: z.enum(["COP", "USD"]).optional().default("COP"),
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
    baseAmount,
    durationMinutes,
    address,
    specialInstructions,
    frequency,
    startDate,
    preferredTime,
    dayOfWeek,
    currency,
  } = validatedData;

  // Calculate discounted price
  const discountPercentage = FREQUENCY_DISCOUNTS[frequency] || 0;
  const finalAmount = Math.round(baseAmount * (1 - discountPercentage));

  // Verify professional exists
  const { data: professional, error: proError } = await supabase
    .from("professional_profiles")
    .select("user_id, full_name")
    .eq("user_id", professionalId)
    .single();

  if (proError || !professional) {
    throw new ValidationError("Professional not found");
  }

  // Create recurring plan
  const { data: plan, error: createError } = await supabase
    .from("recurring_plans")
    .insert({
      customer_id: user.id,
      professional_id: professionalId,
      service_name: serviceName,
      duration_minutes: durationMinutes,
      address,
      special_instructions: specialInstructions || null,
      frequency,
      day_of_week: frequency !== "monthly" ? dayOfWeek : null,
      preferred_time: preferredTime,
      base_amount: baseAmount,
      discount_percentage: Math.round(discountPercentage * 100), // Store as integer (15 not 0.15)
      final_amount: finalAmount,
      currency: currency.toUpperCase(),
      status: "active",
      next_booking_date: startDate,
      total_bookings_completed: 0,
    })
    .select()
    .single();

  if (createError || !plan) {
    throw new ValidationError(createError?.message || "Failed to create recurring plan");
  }

  const savingsPerBooking = baseAmount - finalAmount;

  return ok({
    planId: plan.id,
    frequency,
    discountPercentage: Math.round(discountPercentage * 100),
    baseAmount,
    finalAmount,
    savingsPerBooking,
    nextBookingDate: plan.next_booking_date,
    professional: {
      id: professional.user_id,
      name: professional.full_name,
    },
    redirectTo: "/dashboard/customer/recurring-plans",
  });
});

// Apply rate limiting: 5 recurring plans per hour
export const POST = withRateLimit(handler, "booking");
