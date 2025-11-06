/**
 * Admin Roadmap API - Update & Delete Endpoints
 *
 * PATCH /api/admin/roadmap/[id] - Update roadmap item
 * DELETE /api/admin/roadmap/[id] - Delete/archive roadmap item
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { handleApiError } from "@/lib/error-handler";
import { mapRoadmapInputToUpdateData } from "@/lib/roadmap/roadmap-field-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { RoadmapItemInput } from "@/types/roadmap";

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

    // Check slug conflict if slug is being updated
    if (body.slug !== undefined) {
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
    }

    // Build update object using field mapper to reduce complexity
    const updateData = mapRoadmapInputToUpdateData({
      body,
      existingItem: {
        status: existingItem.status,
        published_at: existingItem.published_at,
      },
    });

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
