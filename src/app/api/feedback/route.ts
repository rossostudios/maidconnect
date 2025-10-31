import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Submit user feedback
 * POST /api/feedback
 * Body: {
 *   feedback_type: 'bug' | 'feature_request' | 'improvement' | 'complaint' | 'praise' | 'other',
 *   subject?: string,
 *   message: string,
 *   user_email?: string, // For anonymous users
 *   page_url: string,
 *   page_path: string,
 *   user_agent?: string,
 *   viewport_size?: { width: number, height: number, pixelRatio: number }
 * }
 *
 * Rate limited to 5 submissions per hour
 */
async function handlePOST(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Get user (may be null for anonymous)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const body = await request.json();
    const {
      feedback_type,
      subject,
      message,
      user_email,
      page_url,
      page_path,
      user_agent,
      viewport_size,
    } = body;

    // Validation
    if (!(feedback_type && message && page_url && page_path)) {
      return NextResponse.json(
        {
          error: "Missing required fields: feedback_type, message, page_url, page_path",
        },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 5000 characters" },
        { status: 400 }
      );
    }

    // Validate subject length if provided
    if (subject && subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be less than 200 characters" },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (user_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Determine user role
    let userRole = "anonymous";
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      userRole = profile?.role || "anonymous";
    }

    // Check for duplicate submission in last 24 hours
    if (user) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: duplicates } = await supabase
        .from("feedback_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("message", message)
        .gte("created_at", oneDayAgo);

      if (duplicates && duplicates.length > 0) {
        return NextResponse.json(
          {
            error:
              "Similar feedback already submitted recently. Please wait 24 hours before resubmitting.",
          },
          { status: 429 }
        );
      }
    }

    // Insert feedback
    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .insert({
        user_id: user?.id || null,
        user_email: user ? null : user_email,
        user_role: userRole,
        feedback_type,
        subject,
        message,
        page_url,
        page_path,
        user_agent,
        viewport_size,
        status: "new",
        priority:
          feedback_type === "bug" ? "high" : feedback_type === "complaint" ? "medium" : "low",
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting feedback:", error);
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Unexpected error submitting feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 5 submissions per hour
export const POST = withRateLimit(handlePOST, "feedback");
