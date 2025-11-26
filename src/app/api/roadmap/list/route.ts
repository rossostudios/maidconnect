/**
 * Public Roadmap API - List Endpoint
 *
 * GET /api/roadmap/list
 * Returns published roadmap items with optional filtering
 * Hybrid architecture: Content from Sanity, votes from Supabase
 * Cached for 10 minutes (STANDARD duration)
 */

import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_HEADERS, CACHE_TAGS } from "@/lib/cache";
import { handleApiError } from "@/lib/error-handler";
import { serverClient } from "@/lib/integrations/sanity/client";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import type { RoadmapListParams } from "@/types/roadmap";

// Type for Sanity roadmap item
type SanityRoadmapItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  targetAudience?: string[];
  estimatedQuarter?: string;
  estimatedYear?: number;
  slug?: { current?: string };
  publishedAt: string;
};

type ParsedRoadmapParams = {
  page: number;
  limit: number;
  locale: string;
  statusFilters: string[];
  categoryFilters: string[];
  targetAudience: RoadmapListParams["target_audience"] | null;
  search: string | null;
  sortBy: NonNullable<RoadmapListParams["sort_by"]>;
  sortOrder: NonNullable<RoadmapListParams["sort_order"]>;
};

export async function GET(request: Request) {
  try {
    const params = parseRoadmapParams(request);
    const supabase = createSupabaseAnonClient();
    const userId = await getUserId(supabase);
    const sanityItems = await fetchRoadmapItems(params);

    if (sanityItems.length === 0) {
      return NextResponse.json(buildRoadmapResponse([], params.page, params.limit, 0));
    }

    const voteCountMap = await fetchVoteCounts(supabase);
    const userVotes = userId ? await fetchUserVotes(supabase, userId) : new Set<string>();

    const itemsWithVotes = mergeRoadmapData(sanityItems, voteCountMap, userVotes, Boolean(userId));
    const sortedItems = sortRoadmapItems(itemsWithVotes, params.sortBy, params.sortOrder);
    const { data, total } = paginateRoadmapItems(sortedItems, params.page, params.limit);

    return NextResponse.json(buildRoadmapResponse(data, params.page, params.limit, total), {
      headers: CACHE_HEADERS.STANDARD,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

function parseRoadmapParams(request: Request): ParsedRoadmapParams {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(Number.parseInt(searchParams.get("limit") || "12", 10), 1);
  const locale = searchParams.get("locale") || "en";
  const statusFilters = splitParam(searchParams.get("status"));
  const categoryFilters = splitParam(searchParams.get("category"));
  const targetAudience =
    (searchParams.get("target_audience") as RoadmapListParams["target_audience"]) || null;
  const search = searchParams.get("search");
  const sortBy = (searchParams.get("sort_by") as RoadmapListParams["sort_by"]) || "vote_count";
  const sortOrder = (searchParams.get("sort_order") as RoadmapListParams["sort_order"]) || "desc";

  return {
    page,
    limit,
    locale,
    statusFilters,
    categoryFilters,
    targetAudience,
    search,
    sortBy,
    sortOrder,
  };
}

function splitParam(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function getUserId(supabase: ReturnType<typeof createSupabaseAnonClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Cached Sanity roadmap items fetch
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedRoadmapItems = unstable_cache(
  async (params: ParsedRoadmapParams): Promise<SanityRoadmapItem[]> => {
    const filters = buildGroqFilters(params);
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

    const items =
      (await serverClient.fetch(groqQuery, {
        language: params.locale,
      })) ?? [];

    return items as SanityRoadmapItem[];
  },
  ["roadmap-items"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.ROADMAP],
  }
);

function fetchRoadmapItems(params: ParsedRoadmapParams) {
  return getCachedRoadmapItems(params);
}

function buildGroqFilters(params: ParsedRoadmapParams) {
  const filters = [`_type == "roadmapItem"`, "language == $language", "isPublished == true"];

  if (params.statusFilters.length > 0) {
    filters.push(`status in [${toGroqList(params.statusFilters)}]`);
  }

  if (params.categoryFilters.length > 0) {
    filters.push(`category in [${toGroqList(params.categoryFilters)}]`);
  }

  if (params.targetAudience && params.targetAudience !== "all") {
    filters.push(`"${params.targetAudience}" in targetAudience`);
  }

  if (params.search) {
    filters.push(`(title match "*${params.search}*" || description match "*${params.search}*")`);
  }

  return filters;
}

function toGroqList(values: string[]) {
  return values.map((value) => `"${value}"`).join(",");
}

/**
 * Cached vote counts fetch
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedVoteCounts = unstable_cache(
  async (): Promise<Map<string, number>> => {
    const supabase = createSupabaseAnonClient();
    const { data: voteCounts } = await supabase
      .from("roadmap_votes_summary")
      .select("roadmap_item_id, vote_count");

    return new Map(voteCounts?.map((vc) => [vc.roadmap_item_id, vc.vote_count]) || []);
  },
  ["roadmap-vote-counts"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.ROADMAP],
  }
);

function fetchVoteCounts(_supabase: ReturnType<typeof createSupabaseAnonClient>) {
  return getCachedVoteCounts();
}

async function fetchUserVotes(
  supabase: ReturnType<typeof createSupabaseAnonClient>,
  userId: string
) {
  const { data: votes } = await supabase
    .from("roadmap_votes")
    .select("roadmap_item_id")
    .eq("user_id", userId);

  return new Set(votes?.map((vote) => vote.roadmap_item_id) || []);
}

function mergeRoadmapData(
  sanityItems: SanityRoadmapItem[],
  voteCountMap: Map<string, number>,
  userVotes: Set<string>,
  hasUser: boolean
) {
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
    hasVoted: hasUser ? userVotes.has(item._id) : false,
    canVote: hasUser,
    published_at: item.publishedAt,
  }));
}

function sortRoadmapItems(
  items: ReturnType<typeof mergeRoadmapData>,
  sortBy: ParsedRoadmapParams["sortBy"],
  sortOrder: ParsedRoadmapParams["sortOrder"]
) {
  const sorted = [...items];

  if (sortBy === "vote_count") {
    sorted.sort((a, b) =>
      sortOrder === "asc" ? a.vote_count - b.vote_count : b.vote_count - a.vote_count
    );
    return sorted;
  }

  if (sortBy === "created_at") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }

  return sorted;
}

function paginateRoadmapItems<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const offset = (page - 1) * limit;
  return {
    data: items.slice(offset, offset + limit),
    total,
  };
}

function buildRoadmapResponse<T>(data: T[], page: number, limit: number, total = data.length) {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}
