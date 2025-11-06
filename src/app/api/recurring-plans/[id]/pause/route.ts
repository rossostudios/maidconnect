/**
 * Pause Recurring Plan API Route
 * POST /api/recurring-plans/[id]/pause
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const pauseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate } = pauseSchema.parse(body);

    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ error: "end_date must be after start_date" }, { status: 400 });
    }

    // Sprint 2 feature: recurring_plans table will be created in migration
    const { data: plan, error } = await (supabase as any)
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
      return NextResponse.json(
        { error: error?.message || "Failed to pause plan" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Plan paused successfully",
      data: {
        status: (plan as any).status,
        pause_start_date: (plan as any).pause_start_date,
        pause_end_date: (plan as any).pause_end_date,
      },
    });
  } catch (error) {
    console.error("Pause plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
