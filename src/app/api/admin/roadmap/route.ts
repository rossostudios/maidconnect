/**
 * Admin Roadmap API - Create Endpoint
 *
 * POST /api/admin/roadmap
 * Creates a new roadmap item (admin only)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { handleApiError } from "@/lib/error-handler";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RoadmapItemInput } from "@/types/roadmap";
import { generateRoadmapSlug } from "@/types/roadmap";

export async function POST(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();

    const supabase = await createSupabaseServerClient();

    // Get request body
    const body: RoadmapItemInput = await request.json();

    // Validate required fields
    if (!(body.title && body.description && body.status && body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Missing required fields: title, description, status, and category are required",
          },
        },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const slug = body.slug || generateRoadmapSlug(body.title);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("roadmap_items")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SLUG_EXISTS",
            message: `A roadmap item with slug "${slug}" already exists`,
          },
        },
        { status: 409 }
      );
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create roadmap item
    const { data: roadmapItem, error } = await supabase
      .from("roadmap_items")
      .insert({
        title: body.title,
        slug,
        description: body.description,
        status: body.status,
        category: body.category,
        priority: body.priority || "medium",
        target_quarter: body.target_quarter || null,
        visibility: body.visibility || "draft",
        target_audience: body.target_audience || ["all"],
        tags: body.tags || [],
        featured_image_url: body.featured_image_url || null,
        metadata: body.metadata || {},
        created_by: user?.id || null,
        published_at: body.visibility === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating roadmap item:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to create roadmap item",
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: roadmapItem,
        message: "Roadmap item created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
