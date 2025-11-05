/**
 * Pause Recurring Plan API Route
 * POST /api/recurring-plans/[id]/pause
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const pauseSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async ({ user, supabase }) => {
    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate } = pauseSchema.parse(body);

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      throw new ValidationError("end_date must be after start_date");
    }

    // Update the plan
    const { data: plan, error } = await supabase
      .from("recurring_plans")
      .update({
        status: "paused",
        pause_start_date: startDate,
        pause_end_date: endDate,
      })
      .eq("id", id)
      .eq("customer_id", user.id)
      .select()
      .single();

    if (error || !plan) {
      throw new ValidationError(error?.message || "Failed to pause plan");
    }

    return ok({
      message: "Plan paused successfully",
      data: {
        status: plan.status,
        pause_start_date: plan.pause_start_date,
        pause_end_date: plan.pause_end_date,
      },
    });
  }, request)();
}
