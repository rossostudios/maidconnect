import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get all feedback submissions for admin
 * GET /api/feedback/admin/list?page=1&limit=20&status=new&type=bug
 */
export async function GET(request: NextRequest) {
  try {
    // Access request data first to ensure dynamic rendering
    const searchParams = request.nextUrl.searchParams;

    // Verify admin access
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20", 10), 100);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("feedback_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (type && type !== "all") {
      query = query.eq("feedback_type", type);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }

    const { data: feedback, error, count } = await query;

    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }

    // Get stats
    const { data: stats } = await supabase.rpc("get_feedback_stats");

    return NextResponse.json({
      feedback: feedback || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: stats?.[0] || null,
    });
  } catch (error: any) {
    console.error("Error in admin feedback list:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
