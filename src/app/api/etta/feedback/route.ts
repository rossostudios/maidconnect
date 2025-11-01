/**
 * Etta Feedback API Route
 *
 * Handles user feedback (thumbs up/down) for Etta's responses.
 * Stores feedback in the etta_messages table for analytics and improvement.
 */

import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

interface FeedbackRequest {
  messageId: string;
  feedback: "positive" | "negative";
  comment?: string;
}

async function feedbackHandler(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: FeedbackRequest = await request.json();
    const { messageId, feedback, comment } = body;

    if (!(messageId && feedback)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (feedback !== "positive" && feedback !== "negative") {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    // First, get the current message to retrieve existing metadata
    const { data: message, error: fetchError } = await supabase
      .from("etta_messages")
      .select("metadata")
      .eq("id", messageId)
      .eq("role", "assistant")
      .single();

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update the message with feedback (merge with existing metadata)
    const updatedMetadata = {
      ...(message.metadata || {}),
      feedback: {
        type: feedback,
        comment,
        timestamp: new Date().toISOString(),
      },
    };

    const { error: updateError } = await supabase
      .from("etta_messages")
      .update({
        metadata: updatedMetadata,
      })
      .eq("id", messageId);

    if (updateError) {
      console.error("Failed to save feedback:", updateError);
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId,
      feedback,
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withRateLimit(feedbackHandler, "feedback");
