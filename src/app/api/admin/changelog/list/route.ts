import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get all changelogs (including drafts) for admin
 * GET /api/admin/changelog/list?page=1&limit=20&visibility=all
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20", 10), 100);
    const visibility = searchParams.get("visibility"); // 'draft', 'published', 'archived', or 'all'

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("changelogs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Filter by visibility if not 'all'
    if (visibility && visibility !== "all") {
      query = query.eq("visibility", visibility);
    }

    const { data: changelogs, error, count } = await query;

    if (error) {
      console.error("Error fetching changelogs:", error);
      return NextResponse.json({ error: "Failed to fetch changelogs" }, { status: 500 });
    }

    return NextResponse.json({
      changelogs: changelogs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error in admin changelog list:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
