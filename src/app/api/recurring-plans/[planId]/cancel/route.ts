/**
 * Cancel Recurring Plan API Route
 * Permanently cancels a recurring plan
 */

import { ok, withAuth, withRateLimit } from "@/lib/api";
import { NotFoundError, ValidationError } from "@/lib/errors";

const handler = withAuth(
  async (
    { user, supabase },
    _request: Request,
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

    if (plan.status === "cancelled") {
      throw new ValidationError("Plan is already cancelled");
    }

    // Update plan status
    const { data: updatedPlan, error: updateError } = await supabase
      .from("recurring_plans")
      .update({
        status: "cancelled",
        pause_start_date: null,
        pause_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (updateError) {
      throw new ValidationError(updateError.message || "Failed to cancel plan");
    }

    return ok({
      id: updatedPlan.id,
      status: updatedPlan.status,
      message: "Recurring plan has been cancelled",
    });
  }
);

export const POST = withRateLimit(handler, "api");
