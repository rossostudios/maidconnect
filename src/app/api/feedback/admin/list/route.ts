/**
 * Get all feedback submissions for admin
 * GET /api/feedback/admin/list?page=1&limit=20&status=new&type=bug
 *
 * REFACTORED: Complexity 33 → <15
 * - Extracted query building to feedback-admin-service.ts
 * - Route now focuses on orchestration
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import {
  buildFeedbackPagination,
  buildFeedbackQuery,
  calculateFeedbackPaginationRange,
  fetchFeedbackStats,
  parseFeedbackQueryParams,
} from "@/lib/feedback/feedback-admin-service";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: NextRequest) {
  try {
    // Access request data first to ensure dynamic rendering
    const searchParams = request.nextUrl.searchParams;

    // Verify admin access
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    // Parse query parameters using service
    const params = parseFeedbackQueryParams(searchParams);

    // Calculate pagination range using service
    const { from, to } = calculateFeedbackPaginationRange(params.page, params.limit);

    // Build and execute feedback query using service
    const query = buildFeedbackQuery(supabase, params, from, to);
    const { data: feedback, error, count } = await query;

    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }

    // Fetch stats using service
    const stats = await fetchFeedbackStats(supabase);

    return NextResponse.json({
      feedback: feedback || [],
      pagination: buildFeedbackPagination(params.page, params.limit, count || 0),
      stats,
    });
  } catch (error: unknown) {
    console.error("Error in admin feedback list:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
