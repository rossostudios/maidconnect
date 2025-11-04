/**
 * REFACTORED VERSION - Professional profile management
 * GET/PUT /api/professional/profile
 *
 * BEFORE: 114 lines (2 handlers)
 * AFTER: 53 lines (2 handlers) (54% reduction)
 */

import { z } from "zod";
import { notFound, ok, requireProfessionalProfile, withProfessional } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional(),
  primary_services: z.array(z.string()).optional(),
});

/**
 * Get professional profile
 */
export const GET = withProfessional(async ({ user, supabase }) => {
  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("full_name, bio, languages, phone_number, avatar_url, primary_services")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    throw notFound("Profile not found");
  }

  return ok({ profile });
});

/**
 * Update professional profile
 */
export const PUT = withProfessional(async ({ user, supabase }, request: Request) => {
  // Verify professional profile exists
  await requireProfessionalProfile(supabase, user.id);

  // Parse and validate request body
  const body = await request.json();
  const validatedData = updateProfileSchema.parse(body);

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {
    ...validatedData,
    updated_at: new Date().toISOString(),
  };

  // Update profile
  const { error: updateError } = await supabase
    .from("professional_profiles")
    .update(updates)
    .eq("profile_id", user.id);

  if (updateError) {
    throw new ValidationError("Failed to update profile");
  }

  return ok(null, "Profile updated successfully");
});
