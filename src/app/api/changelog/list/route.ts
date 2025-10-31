import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get paginated list of published changelogs
 * GET /api/changelog/list?page=1&limit=10&category=features
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const searchParams = request.nextUrl.searchParams;

  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10", 10), 50);
  const category = searchParams.get("category");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from("changelogs")
      .select("*", { count: "exact" })
      .eq("visibility", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .range(from, to);

    // Filter by category if provided
    if (category) {
      query = query.contains("categories", [category]);
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
  } catch (error) {
    console.error("Unexpected error fetching changelogs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
