import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

// Cache headers for CDN
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
};

type ChangelogResponse = {
  changelogs: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    categories: string[];
    visibility: string;
    published_at: string;
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Cached function to fetch changelogs
 * Revalidates every 10 minutes to keep content fresh
 */
const getChangelogs = unstable_cache(
  async (page: number, limit: number, category: string | null): Promise<ChangelogResponse> => {
    const supabase = createSupabaseAnonClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

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
      throw new Error("Failed to fetch changelogs");
    }

    return {
      changelogs: changelogs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },
  ["changelogs-list"],
  {
    revalidate: 600, // 10 minutes
    tags: ["changelogs"],
  }
);

/**
 * Get paginated list of published changelogs
 * GET /api/changelog/list?page=1&limit=10&category=features
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10", 10), 50);
  const category = searchParams.get("category");

  try {
    const response = await getChangelogs(page, limit, category);
    return NextResponse.json(response, { headers: cacheHeaders });
  } catch (error) {
    console.error("Unexpected error fetching changelogs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
