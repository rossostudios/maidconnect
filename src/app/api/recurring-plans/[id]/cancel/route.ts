/**
 * Cancel Recurring Plan API Route
 * POST /api/recurring-plans/[id]/cancel
 */

import { NextRequest } from "next/server";
import { ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async ({ user, supabase }) => {
    const { id } = await params;

    // Update the plan to cancelled status
    const { data: plan, error } = await supabase
      .from("recurring_plans")
      .update({
        status: "cancelled",
      })
      .eq("id", id)
      .eq("customer_id", user.id)
      .select()
      .single();

    if (error || !plan) {
      throw new ValidationError(error?.message || "Failed to cancel plan");
    }

    return ok({
      message: "Plan cancelled successfully",
      data: {
        status: plan.status,
      },
    });
  }, request)();
}
