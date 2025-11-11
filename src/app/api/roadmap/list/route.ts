/**
 * Public Roadmap API - List Endpoint
 *
 * GET /api/roadmap/list
 * Returns published roadmap items with optional filtering
 * Hybrid architecture: Content from Sanity, votes from Supabase
 */

import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import { serverClient } from "@/lib/sanity/client";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";
import type { RoadmapListParams } from "@/types/roadmap";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Use anon client for public roadmap
    const supabase = createSupabaseAnonClient();

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10);
    const statusParam = searchParams.get("status");
    const categoryParam = searchParams.get("category");
    const targetAudience = searchParams.get(
      "target_audience"
    ) as RoadmapListParams["target_audience"];
    const search = searchParams.get("search");
    const sortBy = (searchParams.get("sort_by") as RoadmapListParams["sort_by"]) || "vote_count";
    const sortOrder = (searchParams.get("sort_order") as RoadmapListParams["sort_order"]) || "desc";

    // Get locale from header or default to 'en'
    const locale = searchParams.get("locale") || "en";

    // Get current user to check votes (use getUser instead of auth.user() for proper session refresh)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build GROQ query for Sanity
    const groqFilters = [`_type == "roadmapItem"`, "language == $language", "isPublished == true"];

    // Apply status filter
    if (statusParam) {
      const statuses = statusParam
        .split(",")
        .map((s) => `"${s}"`)
        .join(",");
      groqFilters.push(`status in [${statuses}]`);
    }

    // Apply category filter
    if (categoryParam) {
      const categories = categoryParam
        .split(",")
        .map((c) => `"${c}"`)
        .join(",");
      groqFilters.push(`category in [${categories}]`);
    }

    // Apply target audience filter
    if (targetAudience && targetAudience !== "all") {
      groqFilters.push(`"${targetAudience}" in targetAudience`);
    }

    // Apply search filter
    if (search) {
      groqFilters.push(`(title match "*${search}*" || description match "*${search}*")`);
    }

    // Build final GROQ query
    const groqQuery = `*[${groqFilters.join(" && ")}] | order(publishedAt desc) {
      _id,
      title,
      description,
      category,
      status,
      targetAudience,
      estimatedQuarter,
      estimatedYear,
      slug,
      publishedAt
    }`;

    // Fetch from Sanity
    const sanityItems = await serverClient.fetch(groqQuery, { language: locale });

    if (!sanityItems) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
      });
    }

    // Get vote counts from Supabase for all items
    const { data: voteCounts } = await supabase
      .from("roadmap_votes_summary")
      .select("roadmap_item_id, vote_count");

    // Create vote count map (slug -> count)
    const voteCountMap = new Map(
      voteCounts?.map((vc) => [vc.roadmap_item_id, vc.vote_count]) || []
    );

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

    // Merge Sanity content with Supabase vote data
    const itemsWithVotes = sanityItems.map((item: any) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      target_audience: item.targetAudience || [],
      estimated_quarter: item.estimatedQuarter || null,
      estimated_year: item.estimatedYear || null,
      slug: item.slug?.current || item._id,
      vote_count: voteCountMap.get(item._id) || 0,
      hasVoted: user ? userVotes.has(item._id) : false,
      canVote: !!user,
      published_at: item.publishedAt,
    }));

    // Apply sorting
    if (sortBy === "vote_count") {
      itemsWithVotes.sort((a: (typeof itemsWithVotes)[0], b: (typeof itemsWithVotes)[0]) =>
        sortOrder === "asc" ? a.vote_count - b.vote_count : b.vote_count - a.vote_count
      );
    } else if (sortBy === "created_at") {
      itemsWithVotes.sort((a: (typeof itemsWithVotes)[0], b: (typeof itemsWithVotes)[0]) => {
        const dateA = new Date(a.published_at).getTime();
        const dateB = new Date(b.published_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    // Apply pagination
    const total = itemsWithVotes.length;
    const offset = (page - 1) * limit;
    const paginatedItems = itemsWithVotes.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
