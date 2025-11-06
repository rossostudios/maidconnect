// Professional review service - Extract professional application review logic

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendProfessionalApprovedEmail,
  sendProfessionalInfoRequestedEmail,
  sendProfessionalRejectedEmail,
} from "@/lib/email/send";

export type ReviewAction = "approve" | "reject" | "request_info";

export type ReviewInput = {
  professionalId: string;
  action: ReviewAction;
  notes?: string;
  internalNotes?: string;
  rejectionReason?: string;
  documentsVerified?: boolean;
  backgroundCheckPassed?: boolean;
  referencesVerified?: boolean;
};

export type ProfileData = {
  id: string;
  role: string;
  onboarding_status: string;
  full_name: string | null;
};

export type ValidationResult = {
  success: boolean;
  error?: string;
};

export type StatusResult = {
  newStatus: string | null;
  reviewStatus: "approved" | "rejected" | "needs_info";
};

/**
 * Validate review input
 */
export function validateReviewInput(input: ReviewInput): ValidationResult {
  if (!(input.professionalId && input.action)) {
    return { success: false, error: "professionalId and action are required" };
  }

  if (input.action === "reject" && !input.rejectionReason) {
    return { success: false, error: "rejectionReason is required when rejecting" };
  }

  return { success: true };
}

/**
 * Validate professional profile for review
 */
export function validateProfessionalProfile(profile: ProfileData | null): ValidationResult {
  if (!profile) {
    return { success: false, error: "Professional not found" };
  }

  if (profile.role !== "professional") {
    return { success: false, error: "User is not a professional" };
  }

  return { success: true };
}

/**
 * Determine new status based on action
 */
export function determineNewStatus(
  action: ReviewAction,
  currentStatus: string
): { success: boolean; error?: string; result?: StatusResult } {
  let newStatus: string | null = null;
  let reviewStatus: "approved" | "rejected" | "needs_info" = "approved";

  switch (action) {
    case "approve":
      // Move from application_in_review -> approved
      if (currentStatus !== "application_in_review") {
        return {
          success: false,
          error: `Cannot approve professional in status: ${currentStatus}`,
        };
      }
      newStatus = "approved";
      reviewStatus = "approved";
      break;

    case "reject":
      reviewStatus = "rejected";
      // Keep status same but mark as rejected
      break;

    case "request_info":
      reviewStatus = "needs_info";
      // Keep status same
      break;

    default:
      return { success: false, error: "Invalid action" };
  }

  return { success: true, result: { newStatus, reviewStatus } };
}

/**
 * Create professional review record
 */
export async function createProfessionalReview(
  supabase: SupabaseClient,
  input: ReviewInput,
  adminId: string,
  reviewStatus: "approved" | "rejected" | "needs_info"
) {
  const { data: review, error: reviewError } = await supabase
    .from("admin_professional_reviews")
    .insert({
      professional_id: input.professionalId,
      reviewed_by: adminId,
      review_type: "application",
      status: reviewStatus,
      documents_verified: input.documentsVerified,
      background_check_passed: input.backgroundCheckPassed || null,
      references_verified: input.referencesVerified,
      notes: input.notes || null,
      internal_notes: input.internalNotes || null,
      rejection_reason: reviewStatus === "rejected" ? input.rejectionReason : null,
      reviewed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (reviewError) {
    throw new Error("Failed to create review record");
  }

  return review;
}

/**
 * Update professional onboarding status
 */
export async function updateProfessionalStatus(
  supabase: SupabaseClient,
  professionalId: string,
  newStatus: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ onboarding_status: newStatus })
    .eq("id", professionalId);

  if (updateError) {
    throw new Error("Failed to update professional status");
  }
}

/**
 * Send review notification email to professional
 */
export async function sendReviewNotificationEmail(
  supabase: SupabaseClient,
  professionalId: string,
  professionalName: string,
  action: ReviewAction,
  notes?: string,
  rejectionReason?: string
): Promise<void> {
  try {
    const { data: professionalAuth } = await supabase.auth.admin.getUserById(professionalId);
    const professionalEmail = professionalAuth?.user?.email;

    if (!professionalEmail) {
      return;
    }

    if (action === "approve") {
      await sendProfessionalApprovedEmail(professionalEmail, professionalName, notes);
    } else if (action === "reject" && rejectionReason) {
      await sendProfessionalRejectedEmail(
        professionalEmail,
        professionalName,
        rejectionReason,
        notes
      );
    } else if (action === "request_info") {
      await sendProfessionalInfoRequestedEmail(professionalEmail, professionalName, notes);
    }
  } catch (emailError) {
    // Intentionally suppress email errors - notification emails are non-critical
    console.warn("Failed to send professional review notification email:", emailError);
  }
}

/**
 * Get success message based on action
 */
export function getReviewSuccessMessage(action: ReviewAction): string {
  if (action === "approve") {
    return "Professional approved successfully";
  }
  if (action === "reject") {
    return "Professional application rejected";
  }
  return "Information requested from professional";
}
