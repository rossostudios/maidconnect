/**
 * Help Article Feedback Service
 *
 * Handles article helpfulness feedback (thumbs up/down)
 * Extracts Supabase mutations from article-viewer.tsx component
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export type ArticleFeedback = {
  id: string;
  article_id: string;
  user_id: string | null;
  session_id: string | null;
  is_helpful: boolean;
  feedback_text: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedbackInput = {
  articleId: string;
  isHelpful: boolean;
  feedbackText?: string;
  sessionId?: string | null;
};

export type FeedbackResult = {
  success: boolean;
  feedbackId?: string;
  error?: string;
  alreadySubmitted?: boolean;
};

export type UserFeedbackStatus = {
  hasFeedback: boolean;
  isHelpful?: boolean;
  feedbackId?: string;
};

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get current user from Supabase auth
 */
export async function getCurrentUser(
  supabase: SupabaseClient
): Promise<{ id: string; email?: string } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Check if user has already provided feedback for an article
 */
export async function getUserFeedbackForArticle(
  supabase: SupabaseClient,
  articleId: string,
  userId: string
): Promise<UserFeedbackStatus> {
  const { data } = await supabase
    .from("help_article_feedback")
    .select("id, is_helpful")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  if (!data) {
    return { hasFeedback: false };
  }

  return {
    hasFeedback: true,
    isHelpful: data.is_helpful,
    feedbackId: data.id,
  };
}

/**
 * Get feedback statistics for an article
 */
export async function getArticleFeedbackStats(
  supabase: SupabaseClient,
  articleId: string
): Promise<{ helpful: number; notHelpful: number; total: number }> {
  const { data } = await supabase
    .from("help_article_feedback")
    .select("is_helpful")
    .eq("article_id", articleId);

  if (!data || data.length === 0) {
    return { helpful: 0, notHelpful: 0, total: 0 };
  }

  const helpful = data.filter((f) => f.is_helpful).length;
  const notHelpful = data.filter((f) => !f.is_helpful).length;

  return {
    helpful,
    notHelpful,
    total: data.length,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Submit new article feedback
 * Supports both authenticated users and anonymous users with sessionId
 */
export async function submitArticleFeedback(
  supabase: SupabaseClient,
  input: FeedbackInput,
  userId: string | null
): Promise<FeedbackResult> {
  const { data, error } = await supabase
    .from("help_article_feedback")
    .insert({
      article_id: input.articleId,
      user_id: userId,
      session_id: userId ? null : input.sessionId || null,
      is_helpful: input.isHelpful,
      feedback_text: input.feedbackText || null,
    })
    .select("id")
    .single();

  if (error) {
    // Handle unique constraint violation (already submitted)
    if (error.code === "23505") {
      return {
        success: false,
        alreadySubmitted: true,
        error: "Feedback already submitted",
      };
    }
    console.error("Error submitting article feedback:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    feedbackId: data.id,
  };
}

/**
 * Update existing feedback with additional text
 */
export async function updateFeedbackText(
  supabase: SupabaseClient,
  feedbackId: string,
  feedbackText: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("help_article_feedback")
    .update({
      feedback_text: feedbackText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error updating feedback text:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Change feedback helpfulness vote
 */
export async function updateFeedbackVote(
  supabase: SupabaseClient,
  feedbackId: string,
  isHelpful: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("help_article_feedback")
    .update({
      is_helpful: isHelpful,
      updated_at: new Date().toISOString(),
    })
    .eq("id", feedbackId);

  if (error) {
    console.error("Error updating feedback vote:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

/**
 * Delete article feedback
 */
export async function deleteFeedback(
  supabase: SupabaseClient,
  feedbackId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("help_article_feedback").delete().eq("id", feedbackId);

  if (error) {
    console.error("Error deleting feedback:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

// ============================================================================
// Orchestrator Functions
// ============================================================================

/**
 * Submit feedback with user authentication check
 * Main orchestrator for article feedback submission
 */
export async function submitFeedbackWithAuth(
  supabase: SupabaseClient,
  input: FeedbackInput
): Promise<FeedbackResult> {
  // Get current user (optional - anonymous feedback allowed)
  const user = await getCurrentUser(supabase);

  // If user is logged in, check for existing feedback
  if (user) {
    const existingFeedback = await getUserFeedbackForArticle(supabase, input.articleId, user.id);

    if (existingFeedback.hasFeedback && existingFeedback.feedbackId) {
      // Update existing feedback instead of creating new
      const updateResult = await updateFeedbackVote(
        supabase,
        existingFeedback.feedbackId,
        input.isHelpful
      );

      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
        };
      }

      return {
        success: true,
        feedbackId: existingFeedback.feedbackId,
      };
    }
  }

  // Submit new feedback
  return submitArticleFeedback(supabase, input, user?.id || null);
}

/**
 * Add text feedback to existing vote
 */
export async function addTextToFeedback(
  supabase: SupabaseClient,
  feedbackId: string,
  feedbackText: string
): Promise<{ success: boolean; error?: string }> {
  // Validate text length
  if (feedbackText.length > 1000) {
    return {
      success: false,
      error: "Feedback text must be less than 1000 characters",
    };
  }

  return updateFeedbackText(supabase, feedbackId, feedbackText);
}

/**
 * Update feedback text by matching article_id with user_id or session_id
 * Used when feedbackId is not available but we know the article and user/session
 */
export async function updateFeedbackTextByIdentifier(
  supabase: SupabaseClient,
  articleId: string,
  feedbackText: string,
  identifier: { userId: string } | { sessionId: string }
): Promise<{ success: boolean; error?: string }> {
  const matchCondition = {
    article_id: articleId,
    ...("userId" in identifier
      ? { user_id: identifier.userId }
      : { session_id: identifier.sessionId }),
  };

  const { error } = await supabase
    .from("help_article_feedback")
    .update({
      feedback_text: feedbackText,
      updated_at: new Date().toISOString(),
    })
    .match(matchCondition);

  if (error) {
    console.error("Error updating feedback text by identifier:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}
