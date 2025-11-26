/**
 * Pro Availability Blocked Dates API Route
 * GET: Fetch blocked dates for a date range
 * PATCH: Block or unblock selected dates
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

// Schema for GET query params
const getQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Schema for PATCH body
const updateBlockedDatesSchema = z.object({
  dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .min(1)
    .max(365),
  action: z.enum(["block", "unblock"]),
});

// GET: Fetch blocked dates for date range
const getHandler = withAuth(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const params = getQuerySchema.parse({ startDate, endDate });

  // Fetch blocked dates from professional_profiles.blocked_dates
  const { data: profile, error: profileError } = await supabase
    .from("professional_profiles")
    .select("blocked_dates")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new ValidationError("Failed to fetch blocked dates");
  }

  // Filter blocked dates to the requested range
  const allBlockedDates: string[] = profile?.blocked_dates || [];
  const blockedDatesInRange = allBlockedDates.filter(
    (date) => date >= params.startDate && date <= params.endDate
  );

  return ok({
    blockedDates: blockedDatesInRange,
  });
});

// PATCH: Block or unblock selected dates
const patchHandler = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { dates, action } = updateBlockedDatesSchema.parse(body);

  // Validate dates are in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    if (date < today) {
      throw new ValidationError(`Cannot ${action} past date: ${dateStr}`);
    }
  }

  // Fetch current blocked dates
  const { data: profile, error: fetchError } = await supabase
    .from("professional_profiles")
    .select("blocked_dates")
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    throw new ValidationError("Failed to fetch current blocked dates");
  }

  const currentBlockedDates: string[] = profile?.blocked_dates || [];
  let newBlockedDates: string[];

  if (action === "block") {
    // Add dates to blocked list (avoid duplicates)
    const blockedSet = new Set(currentBlockedDates);
    for (const date of dates) {
      blockedSet.add(date);
    }
    newBlockedDates = Array.from(blockedSet).sort();
  } else {
    // Remove dates from blocked list
    const datesToUnblock = new Set(dates);
    newBlockedDates = currentBlockedDates.filter((d) => !datesToUnblock.has(d));
  }

  // Update professional_profiles
  const { error: updateError } = await supabase
    .from("professional_profiles")
    .update({
      blocked_dates: newBlockedDates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Blocked dates update error:", updateError);
    throw new ValidationError(updateError.message || "Failed to update blocked dates");
  }

  return ok({
    success: true,
    blockedDates: action === "block" ? newBlockedDates.filter((d) => dates.includes(d)) : [],
  });
});

export const GET = withRateLimit(getHandler, "api");
export const PATCH = withRateLimit(patchHandler, "api");
