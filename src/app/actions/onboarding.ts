"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  GetOnboardingProgressResponse,
  MarkItemCompletedResponse,
  OnboardingItemId,
  OnboardingProgress,
} from "@/types";

/**
 * Mark an onboarding checklist item as completed
 */
export async function markOnboardingItemCompleted(
  profileId: string,
  itemId: OnboardingItemId
): Promise<MarkItemCompletedResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Call the database function to mark the item as completed
    const { data, error } = await supabase.rpc("mark_onboarding_item_completed", {
      professional_profile_id: profileId,
      item_id: itemId,
    });

    if (error) {
      console.error("Error marking onboarding item completed:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      updatedChecklist: data,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get onboarding progress for a professional
 */
export async function getOnboardingProgress(
  profileId: string
): Promise<GetOnboardingProgressResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Call the database function to get progress
    const { data, error } = await supabase.rpc("get_onboarding_progress", {
      professional_profile_id: profileId,
    });

    if (error) {
      console.error("Error getting onboarding progress:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Profile not found" };
    }

    const progress: OnboardingProgress = {
      completionPercentage: data[0].completion_percentage,
      canAcceptBookings: data[0].can_accept_bookings,
      completedItems: data[0].completed_items || [],
      pendingRequiredItems: data[0].pending_required_items || [],
    };

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize onboarding checklist for a new professional
 */
export async function initializeOnboardingChecklist(
  profileId: string
): Promise<MarkItemCompletedResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // The default checklist is already set in the migration
    // This function can be used to reset or customize the checklist
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_checklist")
      .eq("id", profileId)
      .single();

    if (error) {
      console.error("Error initializing onboarding checklist:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      updatedChecklist: data.onboarding_checklist,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
