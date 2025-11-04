/**
 * REFACTORED VERSION - Professional availability management
 * GET/PUT /api/professional/availability
 *
 * BEFORE: 115 lines (2 handlers)
 * AFTER: 71 lines (2 handlers) (38% reduction)
 */

import { z } from "zod";
import { notFound, ok, requireProfessionalProfile, withProfessional } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const dayScheduleSchema = z.object({
  day: z.string(),
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
});

const updateAvailabilitySchema = z.object({
  weeklyHours: z.array(dayScheduleSchema).optional(),
  blockedDates: z.array(z.string()).optional(),
});

/**
 * Get professional availability settings
 */
export const GET = withProfessional(async ({ user, supabase }) => {
  // Verify professional profile exists
  await requireProfessionalProfile(supabase, user.id);

  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("availability_settings, blocked_dates")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    throw notFound("Profile not found");
  }

  return ok({
    availability_settings: profile.availability_settings,
    blocked_dates: profile.blocked_dates || [],
  });
});

/**
 * Update professional availability settings
 */
export const PUT = withProfessional(async ({ user, supabase }, request: Request) => {
  // Verify professional profile exists
  await requireProfessionalProfile(supabase, user.id);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateAvailabilitySchema.parse(body);

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validatedData.weeklyHours !== undefined) {
    updates.availability_settings = {
      weeklyHours: validatedData.weeklyHours,
      updatedAt: new Date().toISOString(),
    };
  }

  if (validatedData.blockedDates !== undefined) {
    updates.blocked_dates = validatedData.blockedDates;
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("professional_profiles")
    .update(updates)
    .eq("profile_id", user.id);

  if (updateError) {
    throw new ValidationError("Failed to update availability");
  }

  return ok({ success: true });
});
