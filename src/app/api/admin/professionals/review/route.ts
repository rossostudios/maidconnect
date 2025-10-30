import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import {
  sendProfessionalApprovedEmail,
  sendProfessionalInfoRequestedEmail,
  sendProfessionalRejectedEmail,
} from "@/lib/email/send";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Review professional application
 * POST /api/admin/professionals/review
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
export async function POST(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();

    const supabase = await createSupabaseServerClient();

    const body = (await request.json()) as {
      professionalId: string;
      action: "approve" | "reject" | "request_info";
      notes?: string;
      internalNotes?: string;
      rejectionReason?: string;
      documentsVerified?: boolean;
      backgroundCheckPassed?: boolean;
      referencesVerified?: boolean;
    };

    const {
      professionalId,
      action,
      notes,
      internalNotes,
      rejectionReason,
      documentsVerified,
      backgroundCheckPassed,
      referencesVerified,
    } = body;

    if (!professionalId || !action) {
      return NextResponse.json(
        { error: "professionalId and action are required" },
        { status: 400 }
      );
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "rejectionReason is required when rejecting" },
        { status: 400 }
      );
    }

    // Fetch professional profile with current status and name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, onboarding_status, full_name")
      .eq("id", professionalId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    if (profile.role !== "professional") {
      return NextResponse.json({ error: "User is not a professional" }, { status: 400 });
    }

    // Determine new status based on action
    let newStatus: string | null = null;
    let reviewStatus: "approved" | "rejected" | "needs_info" = "approved";

    switch (action) {
      case "approve":
        // Move from application_in_review -> approved
        if (profile.onboarding_status !== "application_in_review") {
          return NextResponse.json(
            {
              error: `Cannot approve professional in status: ${profile.onboarding_status}`,
            },
            { status: 400 }
          );
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
    }

    // Create professional review record
    const { data: review, error: reviewError } = await supabase
      .from("admin_professional_reviews")
      .insert({
        professional_id: professionalId,
        reviewed_by: admin.id,
        review_type: "application",
        status: reviewStatus,
        documents_verified: documentsVerified || false,
        background_check_passed: backgroundCheckPassed || null,
        references_verified: referencesVerified || false,
        notes: notes || null,
        internal_notes: internalNotes || null,
        rejection_reason: reviewStatus === "rejected" ? rejectionReason : null,
        reviewed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) {
      console.error("Failed to create review:", reviewError);
      return NextResponse.json({ error: "Failed to create review record" }, { status: 500 });
    }

    // Update professional onboarding status if approved
    if (newStatus) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ onboarding_status: newStatus })
        .eq("id", professionalId);

      if (updateError) {
        console.error("Failed to update professional status:", updateError);
        return NextResponse.json(
          { error: "Failed to update professional status" },
          { status: 500 }
        );
      }
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: action === "approve" ? "approve_professional" : "reject_professional",
      targetUserId: professionalId,
      targetResourceType: "professional_review",
      targetResourceId: review.id,
      details: {
        action,
        reviewStatus,
        previousStatus: profile.onboarding_status,
        newStatus: newStatus || profile.onboarding_status,
        documentsVerified,
        backgroundCheckPassed,
        referencesVerified,
      },
      notes: notes || internalNotes || undefined,
    });

    // Send email notification to professional
    try {
      const { data: professionalAuth } = await supabase.auth.admin.getUserById(professionalId);
      const professionalEmail = professionalAuth?.user?.email;

      if (professionalEmail) {
        const professionalName = profile.full_name || "Professional";

        if (action === "approve") {
          await sendProfessionalApprovedEmail(professionalEmail, professionalName, notes);
        } else if (action === "reject") {
          await sendProfessionalRejectedEmail(
            professionalEmail,
            professionalName,
            rejectionReason!,
            notes
          );
        } else if (action === "request_info") {
          await sendProfessionalInfoRequestedEmail(professionalEmail, professionalName, notes);
        }
      }
    } catch (emailError) {
      // Log but don't fail the operation if email fails
      console.error("Failed to send professional review email:", emailError);
    }

    return NextResponse.json({
      success: true,
      review,
      newStatus: newStatus || profile.onboarding_status,
      message:
        action === "approve"
          ? "Professional approved successfully"
          : action === "reject"
            ? "Professional application rejected"
            : "Information requested from professional",
    });
  } catch (error: any) {
    console.error("Admin review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review professional" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
