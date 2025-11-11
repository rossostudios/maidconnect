/**
 * Feedback Submission Service
 * Handles validation, duplicate checking, and submission logic
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FeedbackType =
  | "bug"
  | "feature_request"
  | "improvement"
  | "complaint"
  | "praise"
  | "other";

export type FeedbackInput = {
  feedback_type: FeedbackType;
  subject?: string;
  message: string;
  user_email?: string;
  page_url: string;
  page_path: string;
  user_agent?: string;
  viewport_size?: { width: number; height: number; pixelRatio: number };
};

export type ValidationResult = { valid: true } | { valid: false; error: string };

/**
 * Validate feedback submission input
 */
export function validateFeedbackInput(input: Partial<FeedbackInput>): ValidationResult {
  // Check required fields
  if (!(input.feedback_type && input.message && input.page_url && input.page_path)) {
    return {
      valid: false,
      error: "Missing required fields: feedback_type, message, page_url, page_path",
    };
  }

  // Validate message length
  if (input.message.length < 10 || input.message.length > 5000) {
    return {
      valid: false,
      error: "Message must be between 10 and 5000 characters",
    };
  }

  // Validate subject length if provided
  if (input.subject && input.subject.length > 200) {
    return {
      valid: false,
      error: "Subject must be less than 200 characters",
    };
  }

  // Validate email if provided
  if (input.user_email && !EMAIL_VALIDATION_REGEX.test(input.user_email)) {
    return {
      valid: false,
      error: "Invalid email format",
    };
  }

  return { valid: true };
}

/**
 * Get user role from profile or return 'anonymous'
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<string> {
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

/**
 * Check for duplicate feedback submission in last 24 hours
 * Returns true if duplicate found
 */
export async function isDuplicateSubmission(
  supabase: SupabaseClient,
  userId: string,
  message: string
): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: duplicates } = await supabase
    .from("feedback_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("message", message)
    .gte("created_at", oneDayAgo);

  return Boolean(duplicates && duplicates.length > 0);
}

/**
 * Calculate feedback priority based on type
 */
export function calculateFeedbackPriority(feedbackType: FeedbackType): "high" | "medium" | "low" {
  if (feedbackType === "bug") {
    return "high";
  }
  if (feedbackType === "complaint") {
    return "medium";
  }
  return "low";
}

/**
 * Submit feedback to database
 */
export async function submitFeedback({
  supabase,
  input,
  userId,
  userRole,
}: {
  supabase: SupabaseClient;
  input: FeedbackInput;
  userId: string | undefined;
  userRole: string;
}): Promise<{ success: true; feedbackId: string } | { success: false; error: string }> {
  const priority = calculateFeedbackPriority(input.feedback_type);

  const { data: feedback, error } = await supabase
    .from("feedback_submissions")
    .insert({
      user_id: userId || null,
      user_email: userId ? null : input.user_email,
      user_role: userRole,
      feedback_type: input.feedback_type,
      subject: input.subject,
      message: input.message,
      page_url: input.page_url,
      page_path: input.page_path,
      user_agent: input.user_agent,
      viewport_size: input.viewport_size,
      status: "new",
      priority,
    })
    .select()
    .single();

  if (error || !feedback) {
    console.error("Error submitting feedback:", error);
    return {
      success: false,
      error: "Failed to submit feedback",
    };
  }

  return {
    success: true,
    feedbackId: feedback.id,
  };
}

/**
 * Complete feedback submission orchestrator
 */
export async function submitFeedbackComplete({
  supabase,
  userId,
  input,
}: {
  supabase: SupabaseClient;
  userId: string | undefined;
  input: FeedbackInput;
}): Promise<
  | { success: true; feedbackId: string; message: string }
  | { success: false; error: string; status: number }
> {
  // Validate input
  const validation = validateFeedbackInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      status: 400,
    };
  }

  // Get user role
  const userRole = await getUserRole(supabase, userId);

  // Check for duplicates if authenticated
  if (userId) {
    const isDuplicate = await isDuplicateSubmission(supabase, userId, input.message);
    if (isDuplicate) {
      return {
        success: false,
        error:
          "Similar feedback already submitted recently. Please wait 24 hours before resubmitting.",
        status: 429,
      };
    }
  }

  // Submit feedback
  const result = await submitFeedback({
    supabase,
    input,
    userId,
    userRole,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      status: 500,
    };
  }

  return {
    success: true,
    feedbackId: result.feedbackId,
    message: "Thank you for your feedback!",
  };
}
