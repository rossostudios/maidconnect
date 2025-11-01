/**
 * Public Roadmap API - Get Single Item
 *
 * GET /api/roadmap/[slug]
 * Returns a single published roadmap item by slug with comments
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { handleApiError } from "@/lib/error-handler";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch roadmap item
    const { data: item, error } = await supabase
      .from("roadmap_items")
      .select("*")
      .eq("slug", slug)
      .eq("visibility", "published")
      .single();

    if (error || !item) {
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

    // Check if user has voted
    let hasVoted = false;
    if (user) {
      const { data: vote } = await supabase
        .from("roadmap_votes")
        .select("id")
        .eq("roadmap_item_id", item.id)
        .eq("user_id", user.id)
        .single();

      hasVoted = !!vote;
    }

    // Fetch approved comments with user profiles
    const { data: comments } = await supabase
      .from("roadmap_comments")
      .select(
        `
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq("roadmap_item_id", item.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    // Format comments
    const formattedComments = (comments || []).map((comment) => ({
      id: comment.id,
      roadmap_item_id: comment.roadmap_item_id,
      user_id: comment.user_id,
      comment: comment.comment,
      is_approved: comment.is_approved,
      is_from_admin: comment.is_from_admin,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.profiles.id,
        full_name: comment.profiles.full_name,
        avatar_url: comment.profiles.avatar_url,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        hasVoted,
        canVote: !!user,
      },
      comments: formattedComments,
    });
  } catch (error) {
    return handleApiError(error, "/api/roadmap/[slug]");
  }
}
