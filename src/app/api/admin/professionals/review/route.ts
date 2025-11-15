import { NextResponse } from "next/server";
import {
  createProfessionalReview,
  determineNewStatus,
  getReviewSuccessMessage,
  type ReviewInput,
  sendReviewNotificationEmail,
  updateProfessionalStatus,
  validateProfessionalProfile,
  validateReviewInput,
} from "@/lib/admin/professional-review-service";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Review professional application
 * POST /api/admin/professionals/review
 *
 * Rate Limit: 10 requests per minute (admin tier)
 *
 * Body:
 * - professionalId: string (required)
 * - action: 'approve' | 'reject' | 'request_info' (required)
 * - notes: string (optional) - Admin notes visible to professional
 * - internalNotes: string (optional) - Internal admin notes
 * - rejectionReason: string (required if action='reject')
 * - documentsVerified: boolean (optional)
 * - backgroundCheckPassed: boolean (optional)
 * - referencesVerified: boolean (optional)
 *
 * Actions:
 * - approve: Move from 'application_in_review' -> 'approved'
 * - reject: Reject application, send notification
 * - request_info: Request more information from professional
 */
async function handleReviewProfessional(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const body = (await request.json()) as ReviewInput;

    // Validate input using service
    const inputValidation = validateReviewInput(body);
    if (!inputValidation.success) {
      return NextResponse.json({ error: inputValidation.error }, { status: 400 });
    }

    // Fetch professional profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, onboarding_status, full_name")
      .eq("id", body.professionalId)
      .single();

    // Validate profile using service
    const profileValidation = validateProfessionalProfile(profile);
    if (!profileValidation.success) {
      return NextResponse.json({ error: profileValidation.error }, { status: profile ? 400 : 404 });
    }

    // Determine new status using service
    const statusResult = determineNewStatus(body.action, profile!.onboarding_status);
    if (!statusResult.success) {
      return NextResponse.json({ error: statusResult.error }, { status: 400 });
    }

    const { newStatus, reviewStatus } = statusResult.result!;

    // Create review record using service
    const review = await createProfessionalReview(supabase, body, admin.id, reviewStatus);

    // Update professional status if approved
    if (newStatus) {
      await updateProfessionalStatus(supabase, body.professionalId, newStatus);
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: body.action === "approve" ? "approve_professional" : "reject_professional",
      targetUserId: body.professionalId,
      targetResourceType: "professional_review",
      targetResourceId: review.id,
      details: {
        action: body.action,
        reviewStatus,
        previousStatus: profile!.onboarding_status,
        newStatus: newStatus || profile!.onboarding_status,
        documentsVerified: body.documentsVerified,
        backgroundCheckPassed: body.backgroundCheckPassed,
        referencesVerified: body.referencesVerified,
      },
      notes: body.notes || body.internalNotes || undefined,
    });

    // Send email notification using service
    await sendReviewNotificationEmail(
      supabase,
      body.professionalId,
      profile!.full_name || "Professional",
      body.action,
      body.notes,
      body.rejectionReason
    );

    return NextResponse.json({
      success: true,
      review,
      newStatus: newStatus || profile!.onboarding_status,
      message: getReviewSuccessMessage(body.action),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to review professional" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const POST = withRateLimit(handleReviewProfessional, "admin");
