/**
 * Admin Roadmap API - Update & Delete Endpoints
 *
 * PATCH /api/admin/roadmap/[id] - Update roadmap item
 * DELETE /api/admin/roadmap/[id] - Delete/archive roadmap item
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireAdmin } from "@/lib/admin-helpers";
import { handleApiError } from "@/lib/error-handler";
import type { RoadmapItemInput } from "@/types/roadmap";
import { generateRoadmapSlug } from "@/types/roadmap";

/**
 * Update roadmap item
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify admin access
    await requireAdmin();

    const supabase = await createSupabaseServerClient();

    // Get request body
    const body: Partial<RoadmapItemInput> = await request.json();

    // Check if roadmap item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from("roadmap_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Roadmap item not found",
          },
        },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
      // Auto-update slug if title changed and no explicit slug provided
      if (!body.slug) {
        updateData.slug = generateRoadmapSlug(body.title);
      }
    }

    if (body.slug !== undefined) {
      // Check if new slug conflicts with existing items
      const { data: slugConflict } = await supabase
        .from("roadmap_items")
        .select("id")
        .eq("slug", body.slug)
        .neq("id", id)
        .single();

      if (slugConflict) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SLUG_EXISTS",
              message: `A roadmap item with slug "${body.slug}" already exists`,
            },
          },
          { status: 409 }
        );
      }

      updateData.slug = body.slug;
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.target_quarter !== undefined) updateData.target_quarter = body.target_quarter;
    if (body.visibility !== undefined) {
      updateData.visibility = body.visibility;

      // Set published_at when publishing
      if (body.visibility === "published" && !existingItem.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (body.target_audience !== undefined) updateData.target_audience = body.target_audience;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.featured_image_url !== undefined)
      updateData.featured_image_url = body.featured_image_url;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Set shipped_at if status changed to shipped
    if (body.status === "shipped" && existingItem.status !== "shipped") {
      updateData.shipped_at = new Date().toISOString();
    }

    // Update roadmap item
    const { data: updatedItem, error } = await supabase
      .from("roadmap_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating roadmap item:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to update roadmap item",
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Roadmap item updated successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

/**
 * Delete/archive roadmap item
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify admin access
    await requireAdmin();

    const supabase = await createSupabaseServerClient();

    // Check if roadmap item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from("roadmap_items")
      .select("id, title")
      .eq("id", id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Roadmap item not found",
          },
        },
        { status: 404 }
      );
    }

    // Soft delete by archiving instead of hard delete
    const { error } = await supabase
      .from("roadmap_items")
      .update({ visibility: "archived" })
      .eq("id", id);

    if (error) {
      console.error("Error archiving roadmap item:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to archive roadmap item",
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Roadmap item archived successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
