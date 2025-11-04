import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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

async function handleGET(request: Request) {
  const supabase = await createSupabaseServerClient();
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

    // Build the full-text search query with RPC function (defined in migration)
    const { data: ftsResults, error: ftsError } = await supabase.rpc("search_professionals", {
      search_query: tsquery,
      result_limit: limit,
    });

    if (ftsError) {
      console.error("[Search API] Full-text search error:", ftsError);

      // Fallback to ILIKE search if FTS fails
      // Query professional_profiles joined with profiles for location
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
        .or(`full_name.ilike.%${query}%,primary_services.cs.{${query}},bio.ilike.%${query}%`)
        .eq("status", "active")
        .limit(limit);

      if (fallbackError) {
        console.error("[Search API] Fallback search error:", fallbackError);
        return NextResponse.json(
          { error: "Search failed", details: fallbackError.message },
          { status: 500 }
        );
      }

      // Format fallback results
      const formattedResults: SearchResult[] = (fallbackResults || []).map((prof: any) => ({
        id: prof.profile_id,
        name: prof.full_name || "Professional",
        service: Array.isArray(prof.primary_services) ? prof.primary_services[0] : null,
        location:
          [prof.profiles?.city, prof.profiles?.country].filter(Boolean).join(", ") ||
          "Location TBD",
        photoUrl: prof.avatar_url || "/images/placeholder-avatar.png",
      }));

      return NextResponse.json({
        results: formattedResults,
        count: formattedResults.length,
        searchType: "fallback",
        query,
      });
    }

    // Format full-text search results
    const formattedResults: SearchResult[] = (ftsResults || []).map((prof: any) => ({
      id: prof.id,
      name: prof.full_name || "Professional",
      service: Array.isArray(prof.service_types) ? prof.service_types[0] : null,
      location: [prof.city, prof.country].filter(Boolean).join(", ") || "Location TBD",
      photoUrl: prof.profile_photo_url || "/images/placeholder-avatar.png",
      rating: prof.avg_rating,
      reviewCount: prof.review_count,
      rank: prof.rank, // Relevance score from ts_rank
    }));

    return NextResponse.json({
      results: formattedResults,
      count: formattedResults.length,
      searchType: "fulltext",
      query,
    });
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
