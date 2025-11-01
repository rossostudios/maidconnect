/**
 * Admin Roadmap API - List Endpoint
 *
 * GET /api/admin/roadmap/list
 * Returns all roadmap items with admin filtering (draft, published, archived)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { handleApiError } from "@/lib/error-handler";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RoadmapAdminListParams } from "@/types/roadmap";

export async function GET(request: Request) {
  try {
    // Access request data first to ensure dynamic rendering
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Verify admin access
    await requireAdmin();

    const supabase = await createSupabaseServerClient();

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const visibility = searchParams.get("visibility") as RoadmapAdminListParams["visibility"];
    const status = searchParams.get("status") as RoadmapAdminListParams["status"];
    const category = searchParams.get("category") as RoadmapAdminListParams["category"];
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("roadmap_items").select("*", { count: "exact" });

    // Apply filters
    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Order by created_at DESC (newest first)
    query = query.order("created_at", { ascending: false });

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

    return NextResponse.json({
      success: true,
      data: items || [],
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
