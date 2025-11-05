/**
 * Cancel Recurring Plan API Route
 * POST /api/recurring-plans/[id]/cancel
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Update the plan to cancelled status
    const { data: plan, error } = await supabase
      // @ts-ignore - Sprint 2 feature: recurring_plans table will be created in migration
      .from("recurring_plans")
      .update({
        status: "cancelled",
      })
      .eq("id", id)
      .eq("customer_id", user.id)
      .select()
      .single();

    if (error || !plan) {
      return NextResponse.json(
        { error: error?.message || "Failed to cancel plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Plan cancelled successfully",
      data: {
        status: (plan as any).status,
      },
    });
  } catch (error) {
    console.error("Cancel plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
