/**
 * Resume Recurring Plan API Route
 * POST /api/recurring-plans/[id]/resume
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

    const { data: plan, error } = await supabase
      // @ts-ignore - Sprint 2 feature: recurring_plans table will be created in migration
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
      return NextResponse.json(
        { error: error?.message || "Failed to resume plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Plan resumed successfully",
      data: {
        status: (plan as any).status,
        pause_start_date: (plan as any).pause_start_date,
        pause_end_date: (plan as any).pause_end_date,
        next_booking_date: (plan as any).next_booking_date,
      },
    });
  } catch (error) {
    console.error("Resume plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
