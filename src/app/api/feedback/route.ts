import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type FeedbackPayload = {
  feedback_type: string;
  subject?: string;
  message: string;
  user_email?: string;
  page_url: string;
  page_path: string;
  user_agent?: string;
  viewport_size?: { width: number; height: number; pixelRatio: number };
};

const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function handlePOST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const rawBody = await request.json();
    const payload: FeedbackPayload = {
      feedback_type: rawBody.feedback_type,
      subject: rawBody.subject,
      message: rawBody.message,
      user_email: rawBody.user_email,
      page_url: rawBody.page_url,
      page_path: rawBody.page_path,
      user_agent: rawBody.user_agent,
      viewport_size: rawBody.viewport_size,
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      return validationError;
    }

    const duplicateError = await ensureNoDuplicateFeedback(supabase, user?.id, payload.message);
    if (duplicateError) {
      return duplicateError;
    }

    const userRole = await getUserRole(supabase, user?.id);
    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .insert({
        user_id: user?.id || null,
        user_email: user ? null : payload.user_email,
        user_role: userRole,
        feedback_type: payload.feedback_type,
        subject: payload.subject,
        message: payload.message,
        page_url: payload.page_url,
        page_path: payload.page_path,
        user_agent: payload.user_agent,
        viewport_size: payload.viewport_size,
        status: "new",
        priority: getPriority(payload.feedback_type),
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting feedback:", error);
      return createErrorResponse("Failed to submit feedback", 500);
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Unexpected error submitting feedback:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

function validatePayload(payload: FeedbackPayload) {
  if (!(payload.feedback_type && payload.message && payload.page_url && payload.page_path)) {
    return createErrorResponse(
      "Missing required fields: feedback_type, message, page_url, page_path",
      400
    );
  }

  if (payload.message.length < 10 || payload.message.length > 5000) {
    return createErrorResponse("Message must be between 10 and 5000 characters", 400);
  }

  if (payload.subject && payload.subject.length > 200) {
    return createErrorResponse("Subject must be less than 200 characters", 400);
  }

  if (payload.user_email && !EMAIL_VALIDATION_REGEX.test(payload.user_email)) {
    return createErrorResponse("Invalid email format", 400);
  }

  return null;
}

async function ensureNoDuplicateFeedback(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string | undefined,
  message: string
) {
  if (!userId) {
    return null;
  }

  const oneDayAgo = new Date(Date.now() - ONE_DAY_MS).toISOString();
  const { data: duplicates } = await supabase
    .from("feedback_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("message", message)
    .gte("created_at", oneDayAgo);

  if (duplicates && duplicates.length > 0) {
    return createErrorResponse(
      "Similar feedback already submitted recently. Please wait 24 hours before resubmitting.",
      429
    );
  }

  return null;
}

async function getUserRole(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string | undefined
) {
  if (!userId) {
    return "anonymous";
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role || "anonymous";
}

function getPriority(feedbackType: string) {
  if (feedbackType === "bug") {
    return "high";
  }

  if (feedbackType === "complaint") {
    return "medium";
  }

  return "low";
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// Apply rate limiting: 5 submissions per hour
export const POST = withRateLimit(handlePOST, "feedback");
