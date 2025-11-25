import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import {
  CACHE_DURATIONS,
  CACHE_HEADERS,
  CACHE_TAGS,
} from "@/lib/cache";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";

/**
 * Professional Search API Route
 * Implements full-text search with PostgreSQL's tsvector and tsquery
 *
 * Research findings:
 * - Milvus: Use inverted indexes (GIN in PostgreSQL) for fast lookups
 * - Elasticsearch: TF-IDF and BM25 for relevance ranking (PostgreSQL uses ts_rank)
 * - Baymard: Only 19% of ecommerce sites implement autocomplete well
 * - OpenSearch: Proper data typing and text analyzers enhance search quality
 * - PostgreSQL: Weighted search vectors (A=name, B=bio, C=service, D=location)
 *
 * Performance optimizations:
 * - GIN indexes on tsvector columns (created in migration)
 * - Debounced queries from client (300ms)
 * - Limited result sets (default 8 for autocomplete, max 50)
 * - Rate limiting to prevent abuse (100 searches/minute)
 */

// Regex for splitting search query into tokens (whitespace)
const QUERY_SPLIT_PATTERN = /\s+/;
// Regex for removing special characters from tokens
const SPECIAL_CHARS_PATTERN = /[^\w]/g;

type SearchResult = {
  id: string;
  name: string;
  service: string | null;
  location: string;
  photoUrl: string;
  rating?: number;
  reviewCount?: number;
  rank?: number; // Relevance score
};

type FallbackProfessionalResult = {
  profile_id: string;
  full_name: string | null;
  primary_services: string[] | null;
  bio: string | null;
  avatar_url: string | null;
  profiles: { city: string | null; country: string | null } | { city: string | null; country: string | null }[] | null;
};

type FullTextSearchResult = {
  id: string;
  full_name: string | null;
  service_types: string[] | null;
  city: string | null;
  country: string | null;
  profile_photo_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
  rank: number;
};

/**
 * Cached search function using anon client for public data
 * Revalidates every 1 minute (SHORT duration)
 */
const getCachedSearchResults = unstable_cache(
  async (tsquery: string, limit: number, originalQuery: string) => {
    const supabase = createSupabaseAnonClient();

    // Build the full-text search query with RPC function (defined in migration)
    const { data: ftsResults, error: ftsError } = await supabase.rpc("search_professionals", {
      search_query: tsquery,
      result_limit: limit,
    });

    if (ftsError) {
      console.error("[Search API] Full-text search error:", ftsError);

      // Fallback to ILIKE search if FTS fails
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from("professional_profiles")
        .select(
          `
          profile_id,
          full_name,
          primary_services,
          bio,
          avatar_url,
          profiles!inner (
            city,
            country
          )
        `
        )
        .or(`full_name.ilike.%${originalQuery}%,primary_services.cs.{${originalQuery}},bio.ilike.%${originalQuery}%`)
        .eq("status", "active")
        .limit(limit);

      if (fallbackError) {
        throw new Error(`Search failed: ${fallbackError.message}`);
      }

      // Format fallback results
      const formattedResults: SearchResult[] = ((fallbackResults || []) as FallbackProfessionalResult[]).map((prof) => {
        const profiles = Array.isArray(prof.profiles) ? prof.profiles[0] : prof.profiles;
        return {
          id: prof.profile_id,
          name: prof.full_name || "Professional",
          service: Array.isArray(prof.primary_services) ? prof.primary_services[0] : null,
          location:
            [profiles?.city, profiles?.country].filter(Boolean).join(", ") ||
            "Location TBD",
          photoUrl: prof.avatar_url || "/images/placeholder-avatar.png",
        };
      });

      return {
        results: formattedResults,
        count: formattedResults.length,
        searchType: "fallback" as const,
      };
    }

    // Format full-text search results
    const formattedResults: SearchResult[] = ((ftsResults || []) as FullTextSearchResult[]).map((prof) => ({
      id: prof.id,
      name: prof.full_name || "Professional",
      service: Array.isArray(prof.service_types) ? prof.service_types[0] : null,
      location: [prof.city, prof.country].filter(Boolean).join(", ") || "Location TBD",
      photoUrl: prof.profile_photo_url || "/images/placeholder-avatar.png",
      rating: prof.avg_rating ?? undefined,
      reviewCount: prof.review_count ?? undefined,
      rank: prof.rank,
    }));

    return {
      results: formattedResults,
      count: formattedResults.length,
      searchType: "fulltext" as const,
    };
  },
  ["professionals-search"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.PROFESSIONALS_SEARCH],
  }
);

async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q")?.trim() || "";
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "8", 10), 50);

  // Require minimum 2 characters for search (research-backed threshold)
  if (query.length < 2) {
    return NextResponse.json({
      results: [],
      count: 0,
      message: "Query must be at least 2 characters",
    });
  }

  try {
    /**
     * Full-Text Search Strategy:
     *
     * 1. Use PostgreSQL's to_tsquery for query parsing
     * 2. Search across multiple fields with different weights:
     *    - A (highest): full_name (professional name)
     *    - B: bio (professional description)
     *    - C: service types
     *    - D (lowest): location (city, country)
     *
     * 3. Use ts_rank for relevance scoring
     * 4. Fallback to ILIKE if full-text search returns no results
     */

    // Sanitize query for tsquery (replace spaces with &, handle special chars)
    const tsquery = query
      .split(QUERY_SPLIT_PATTERN)
      .filter((word) => word.length > 0)
      .map((word) => word.replace(SPECIAL_CHARS_PATTERN, ""))
      .filter((word) => word.length > 0)
      .join(" & ");

    if (!tsquery) {
      return NextResponse.json({
        results: [],
        count: 0,
        message: "Invalid search query",
      });
    }

    // Use cached search function
    const searchResults = await getCachedSearchResults(tsquery, limit, query);

    return NextResponse.json(
      { ...searchResults, query },
      { headers: CACHE_HEADERS.SHORT }
    );
  } catch (error) {
    console.error("[Search API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Unexpected error during search",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 100 searches per minute (prevent abuse while allowing natural usage)
export const GET = withRateLimit(handleGET, "api");
