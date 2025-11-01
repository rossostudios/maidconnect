/**
 * Roadmap Voting API
 *
 * POST /api/roadmap/vote
 * Toggle vote on a roadmap item (requires authentication)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireUser } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/error-handler";
import type { VoteToggleRequest } from "@/types/roadmap";

export async function POST(request: Request) {
  try {
    // Require authentication
    const user = await requireUser();

    const supabase = await createSupabaseServerClient();

    // Get request body
    const body: VoteToggleRequest = await request.json();

    if (!body.roadmap_item_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "roadmap_item_id is required",
          },
        },
        { status: 400 }
      );
    }

    // Check if roadmap item exists and is published
    const { data: roadmapItem, error: fetchError } = await supabase
      .from("roadmap_items")
      .select("id, status, visibility, vote_count")
      .eq("id", body.roadmap_item_id)
      .single();

    if (fetchError || !roadmapItem) {
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

    if (roadmapItem.visibility !== "published") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot vote on unpublished roadmap items",
          },
        },
        { status: 403 }
      );
    }

    // Don't allow voting on shipped items
    if (roadmapItem.status === "shipped") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot vote on shipped items",
          },
        },
        { status: 403 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from("roadmap_votes")
      .select("id")
      .eq("roadmap_item_id", body.roadmap_item_id)
      .eq("user_id", user.id)
      .single();

    let action: "added" | "removed";
    let newVoteCount: number;

    if (existingVote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from("roadmap_votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("Error removing vote:", deleteError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Failed to remove vote",
            },
          },
          { status: 500 }
        );
      }

      action = "removed";
      newVoteCount = Math.max(0, roadmapItem.vote_count - 1);
    } else {
      // Add vote
      const { error: insertError } = await supabase.from("roadmap_votes").insert({
        roadmap_item_id: body.roadmap_item_id,
        user_id: user.id,
      });

      if (insertError) {
        console.error("Error adding vote:", insertError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Failed to add vote",
            },
          },
          { status: 500 }
        );
      }

      action = "added";
      newVoteCount = roadmapItem.vote_count + 1;
    }

    // Note: vote_count is updated automatically by database trigger

    return NextResponse.json({
      success: true,
      action,
      vote_count: newVoteCount,
      has_voted: action === "added",
    });
  } catch (error) {
    return handleApiError(error, "/api/roadmap/vote");
  }
}
