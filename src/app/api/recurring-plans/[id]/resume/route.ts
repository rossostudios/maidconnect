/**
 * Resume Recurring Plan API Route
 * POST /api/recurring-plans/[id]/resume
 */

import { NextRequest } from "next/server";
import { ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async ({ user, supabase }) => {
    const { id } = await params;

    // Update the plan
    const { data: plan, error } = await supabase
      .from("recurring_plans")
      .update({
        status: "active",
        pause_start_date: null,
        pause_end_date: null,
      })
      .eq("id", id)
      .eq("customer_id", user.id)
      .select()
      .single();

    if (error || !plan) {
      throw new ValidationError(error?.message || "Failed to resume plan");
    }

    return ok({
      message: "Plan resumed successfully",
      data: {
        status: plan.status,
        pause_start_date: plan.pause_start_date,
        pause_end_date: plan.pause_end_date,
        next_booking_date: plan.next_booking_date,
      },
    });
  }, request)();
}
