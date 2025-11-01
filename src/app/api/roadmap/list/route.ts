/**
 * Public Roadmap API - List Endpoint
 *
 * GET /api/roadmap/list
 * Returns published roadmap items with optional filtering
 */

import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RoadmapListParams } from "@/types/roadmap";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const supabase = await createSupabaseServerClient();

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const statusParam = searchParams.get("status");
    const categoryParam = searchParams.get("category");
    const targetAudience = searchParams.get(
      "target_audience"
    ) as RoadmapListParams["target_audience"];
    const search = searchParams.get("search");
    const sortBy = (searchParams.get("sort_by") as RoadmapListParams["sort_by"]) || "vote_count";
    const sortOrder = (searchParams.get("sort_order") as RoadmapListParams["sort_order"]) || "desc";

    const offset = (page - 1) * limit;

    // Get current user to check votes
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build base query - only published items
    let query = supabase
      .from("roadmap_items")
      .select("*", { count: "exact" })
      .eq("visibility", "published");

    // Apply status filter
    if (statusParam) {
      const statuses = statusParam.split(",");
      if (statuses.length === 1) {
        query = query.eq("status", statuses[0]);
      } else {
        query = query.in("status", statuses);
      }
    }

    // Apply category filter
    if (categoryParam) {
      const categories = categoryParam.split(",");
      if (categories.length === 1) {
        query = query.eq("category", categories[0]);
      } else {
        query = query.in("category", categories);
      }
    }

    // Apply target audience filter
    if (targetAudience && targetAudience !== "all") {
      query = query.contains("target_audience", [targetAudience]);
    }

    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === "asc";
    query = query.order(sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: items, error, count } = await query;

    if (error) {
      console.error("Error fetching roadmap items:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to fetch roadmap items",
          },
        },
        { status: 500 }
      );
    }

    // If user is authenticated, check which items they've voted on
    let userVotes: Set<string> = new Set();
    if (user) {
      const { data: votes } = await supabase
        .from("roadmap_votes")
        .select("roadmap_item_id")
        .eq("user_id", user.id);

      if (votes) {
        userVotes = new Set(votes.map((v) => v.roadmap_item_id));
      }
    }

    // Enhance items with vote status
    const itemsWithVoteStatus = (items || []).map((item) => ({
      ...item,
      hasVoted: user ? userVotes.has(item.id) : false,
      canVote: !!user,
    }));

    return NextResponse.json({
      success: true,
      data: itemsWithVoteStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
