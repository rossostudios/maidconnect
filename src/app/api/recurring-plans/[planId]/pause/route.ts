/**
 * Pause Recurring Plan API Route
 * Temporarily pauses a recurring plan
 */

import { z } from "zod";
import { ok, withAuth, withRateLimit } from "@/lib/api";
import { NotFoundError, ValidationError } from "@/lib/errors";

const pauseSchema = z.object({
  startDate: z.string(), // ISO date (YYYY-MM-DD)
  endDate: z.string(), // ISO date (YYYY-MM-DD)
});

const handler = withAuth(
  async (
    { user, supabase },
    request: Request,
    { params }: { params: Promise<{ planId: string }> }
  ) => {
    const { planId } = await params;

    // Verify plan exists and belongs to user
    const { data: plan, error: fetchError } = await supabase
      .from("recurring_plans")
      .select("id, customer_id, status")
      .eq("id", planId)
      .single();

    if (fetchError || !plan) {
      throw new NotFoundError("Recurring plan not found");
    }

    if (plan.customer_id !== user.id) {
      throw new ValidationError("You don't have permission to modify this plan");
    }

    if (plan.status !== "active") {
      throw new ValidationError("Only active plans can be paused");
    }

    // Parse request body
    const body = await request.json();
    const { startDate, endDate } = pauseSchema.parse(body);

    // Update plan status
    const { data: updatedPlan, error: updateError } = await supabase
      .from("recurring_plans")
      .update({
        status: "paused",
        pause_start_date: startDate,
        pause_end_date: endDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (updateError) {
      throw new ValidationError(updateError.message || "Failed to pause plan");
    }

    return ok({
      id: updatedPlan.id,
      status: updatedPlan.status,
      pause_start_date: updatedPlan.pause_start_date,
      pause_end_date: updatedPlan.pause_end_date,
    });
  }
);

export const POST = withRateLimit(handler, "api");
