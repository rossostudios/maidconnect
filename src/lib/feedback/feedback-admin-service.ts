/**
 * Feedback Admin Service - Business logic for admin feedback management
 *
 * Extracts query building and filtering logic to reduce route complexity
 * Handles: Query parsing, filter building, stats fetching, pagination
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedbackQueryParams = {
  page: number;
  limit: number;
  status: string | null;
  type: string | null;
  priority: string | null;
};

export type FeedbackPaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Parse feedback query parameters from URL search params
 * Applies limit cap of 100 items per page
 */
export function parseFeedbackQueryParams(searchParams: URLSearchParams): FeedbackQueryParams {
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20", 10), 100);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const priority = searchParams.get("priority");

  return { page, limit, status, type, priority };
}

/**
 * Calculate pagination range (from/to) for Supabase query
 */
export function calculateFeedbackPaginationRange(
  page: number,
  limit: number
): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Build feedback query with filters
 * Applies status, type, and priority filters if provided
 */
export function buildFeedbackQuery(
  supabase: SupabaseClient,
  params: FeedbackQueryParams,
  from: number,
  to: number
) {
  let query = supabase
    .from("feedback_submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply status filter
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  // Apply type filter
  if (params.type && params.type !== "all") {
    query = query.eq("feedback_type", params.type);
  }

  // Apply priority filter
  if (params.priority && params.priority !== "all") {
    query = query.eq("priority", params.priority);
  }

  return query;
}

/**
 * Fetch feedback statistics from database RPC
 * Returns null if stats unavailable
 */
export async function fetchFeedbackStats(supabase: SupabaseClient): Promise<any | null> {
  const { data: stats } = await supabase.rpc("get_feedback_stats");
  return stats?.[0] || null;
}

/**
 * Build pagination metadata for response
 */
export function buildFeedbackPagination(
  page: number,
  limit: number,
  total: number
): FeedbackPaginationMetadata {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
