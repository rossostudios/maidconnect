/**
 * Resume Recurring Plan API Route
 * Resumes a paused recurring plan
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

    if (plan.status !== "paused") {
      throw new ValidationError("Only paused plans can be resumed");
    }

    // Calculate next booking date (today or tomorrow if late in day)
    const now = new Date();
    const nextBookingDate =
      now.getHours() >= 18
        ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : now.toISOString().split("T")[0];

    // Update plan status
    const { data: updatedPlan, error: updateError } = await supabase
      .from("recurring_plans")
      .update({
        status: "active",
        pause_start_date: null,
        pause_end_date: null,
        next_booking_date: nextBookingDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId)
      .select()
      .single();

    if (updateError) {
      throw new ValidationError(updateError.message || "Failed to resume plan");
    }

    return ok({
      id: updatedPlan.id,
      status: updatedPlan.status,
      next_booking_date: updatedPlan.next_booking_date,
    });
  }
);

export const POST = withRateLimit(handler, "api");
