/**
 * Pro Availability Pricing API Route
 * GET: Fetch pricing for a date range
 * PATCH: Update pricing for selected dates
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
const updatePricingSchema = z.object({
  dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .min(1)
    .max(365),
  hourlyRateCents: z.number().int().min(0),
});

// GET: Fetch pricing for date range
const getHandler = withAuth(async ({ user, supabase }, request: Request) => {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const params = getQuerySchema.parse({ startDate, endDate });

  // Fetch custom pricing for the date range
  const { data: customPricing, error: pricingError } = await supabase
    .from("professional_date_pricing")
    .select("date, hourly_rate_cents")
    .eq("professional_id", user.id)
    .gte("date", params.startDate)
    .lte("date", params.endDate);

  if (pricingError) {
    throw new ValidationError("Failed to fetch pricing data");
  }

  // Fetch default hourly rate from professional's primary service
  const { data: service, error: serviceError } = await supabase
    .from("professional_services")
    .select("hourly_rate")
    .eq("professional_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (serviceError && serviceError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new ValidationError("Failed to fetch service data");
  }

  const defaultRateCents = service?.hourly_rate || 0;

  // Convert to map format for client
  const pricingByDate: Record<string, number> = {};
  for (const row of customPricing || []) {
    pricingByDate[row.date] = row.hourly_rate_cents;
  }

  return ok({
    pricingByDate,
    defaultRateCents,
  });
});

// PATCH: Update pricing for selected dates
const patchHandler = withAuth(async ({ user, supabase }, request: Request) => {
  const body = await request.json();
  const { dates, hourlyRateCents } = updatePricingSchema.parse(body);

  // Validate dates are in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const date = new Date(dateStr);
    if (date < today) {
      throw new ValidationError(`Cannot update pricing for past date: ${dateStr}`);
    }
  }

  // Use upsert to insert or update pricing
  const { error: upsertError } = await supabase.from("professional_date_pricing").upsert(
    dates.map((date) => ({
      professional_id: user.id,
      date,
      hourly_rate_cents: hourlyRateCents,
    })),
    {
      onConflict: "professional_id,date",
      ignoreDuplicates: false,
    }
  );

  if (upsertError) {
    console.error("Pricing upsert error:", upsertError);
    throw new ValidationError(upsertError.message || "Failed to update pricing");
  }

  return ok({
    success: true,
    updatedDates: dates.length,
  });
});

export const GET = withRateLimit(getHandler, "api");
export const PATCH = withRateLimit(patchHandler, "api");
