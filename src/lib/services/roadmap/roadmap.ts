/**
 * Roadmap List Service
 * Handles fetching, filtering, and sorting roadmap items
 * Combines Sanity CMS content with Supabase voting data
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { serverClient } from "@/lib/integrations/sanity/client";
import type { RoadmapListParams } from "@/types/roadmap";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  target_audience: string[];
  estimated_quarter: string | null;
  estimated_year: number | null;
  slug: string;
  vote_count: number;
  hasVoted: boolean;
  canVote: boolean;
  published_at: string;
};

/**
 * Build GROQ filter array from parameters
 */
function buildGroqFilters(params: {
  statusParam: string | null;
  categoryParam: string | null;
  targetAudience: string | null;
  search: string | null;
}): string[] {
  const filters = [`_type == "roadmapItem"`, "language == $language", "isPublished == true"];

  // Apply status filter
  if (params.statusParam) {
    const statuses = params.statusParam
      .split(",")
      .map((s) => `"${s}"`)
      .join(",");
    filters.push(`status in [${statuses}]`);
  }

  // Apply category filter
  if (params.categoryParam) {
    const categories = params.categoryParam
      .split(",")
      .map((c) => `"${c}"`)
      .join(",");
    filters.push(`category in [${categories}]`);
  }

  // Apply target audience filter
  if (params.targetAudience && params.targetAudience !== "all") {
    filters.push(`"${params.targetAudience}" in targetAudience`);
  }

  // Apply search filter
  if (params.search) {
    filters.push(`(title match "*${params.search}*" || description match "*${params.search}*")`);
  }

  return filters;
}

/**
 * Fetch roadmap items from Sanity CMS
 */
async function fetchSanityRoadmapItems(filters: string[], locale: string) {
  const groqQuery = `*[${filters.join(" && ")}] | order(publishedAt desc) {
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

  return serverClient.fetch(groqQuery, { language: locale });
}

/**
 * Fetch vote counts from Supabase
 */
async function fetchVoteCounts(supabase: SupabaseClient): Promise<Map<string, number>> {
  const { data: voteCounts } = await supabase
    .from("roadmap_votes_summary")
    .select("roadmap_item_id, vote_count");

  return new Map(voteCounts?.map((vc) => [vc.roadmap_item_id, vc.vote_count]) || []);
}

/**
 * Fetch user's votes from Supabase
 */
async function fetchUserVotes(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<Set<string>> {
  if (!userId) {
    return new Set();
  }

  const { data: votes } = await supabase
    .from("roadmap_votes")
    .select("roadmap_item_id")
    .eq("user_id", userId);

  return new Set(votes?.map((v) => v.roadmap_item_id) || []);
}

/**
 * Merge Sanity content with Supabase vote data
 */
function mergeContentWithVotes(
  sanityItems: any[],
  voteCountMap: Map<string, number>,
  userVotes: Set<string>,
  canVote: boolean
): RoadmapItem[] {
  return sanityItems.map((item) => ({
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
    hasVoted: userVotes.has(item._id),
    canVote,
    published_at: item.publishedAt,
  }));
}

/**
 * Sort roadmap items by specified criteria
 */
function sortItems(
  items: RoadmapItem[],
  sortBy: RoadmapListParams["sort_by"],
  sortOrder: RoadmapListParams["sort_order"]
): RoadmapItem[] {
  const sorted = [...items];

  if (sortBy === "vote_count") {
    sorted.sort((a, b) =>
      sortOrder === "asc" ? a.vote_count - b.vote_count : b.vote_count - a.vote_count
    );
  } else if (sortBy === "created_at") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  return sorted;
}

/**
 * Apply pagination to items
 */
function paginateItems(items: RoadmapItem[], page: number, limit: number) {
  const total = items.length;
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Complete roadmap list orchestrator
 * Fetches roadmap items from Sanity, enriches with Supabase voting data
 */
export async function fetchRoadmapList({
  supabase,
  userId,
  filters,
  locale,
  page,
  limit,
  sortBy,
  sortOrder,
}: {
  supabase: SupabaseClient;
  userId: string | undefined;
  filters: {
    statusParam: string | null;
    categoryParam: string | null;
    targetAudience: string | null;
    search: string | null;
  };
  locale: string;
  page: number;
  limit: number;
  sortBy: RoadmapListParams["sort_by"];
  sortOrder: RoadmapListParams["sort_order"];
}) {
  // Build GROQ filters
  const groqFilters = buildGroqFilters(filters);

  // Fetch from Sanity
  const sanityItems = await fetchSanityRoadmapItems(groqFilters, locale);

  if (!sanityItems || sanityItems.length === 0) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        total_pages: 0,
      },
    };
  }

  // Fetch vote data from Supabase in parallel
  const [voteCountMap, userVotes] = await Promise.all([
    fetchVoteCounts(supabase),
    fetchUserVotes(supabase, userId),
  ]);

  // Merge content with votes
  const itemsWithVotes = mergeContentWithVotes(sanityItems, voteCountMap, userVotes, !!userId);

  // Sort items
  const sortedItems = sortItems(itemsWithVotes, sortBy, sortOrder);

  // Apply pagination
  return paginateItems(sortedItems, page, limit);
}
