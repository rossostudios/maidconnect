import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type VerificationBody = {
  approved: boolean;
  reason?: string;
  notes?: string;
  checklist: {
    identityVerified: boolean;
    backgroundCheckPassed: boolean;
    documentsVerified: boolean;
    skillsAssessed: boolean;
  };
};

/**
 * Professional Verification Endpoint
 * POST /api/admin/users/[id]/verify
 *
 * Approves or rejects professional verification applications.
 * Updates professional profile with verification status and timestamp.
 *
 * Body:
 * - approved: boolean (required)
 * - reason?: string (required if rejected)
 * - notes?: string (optional additional notes)
 * - checklist: object with verification checklist status
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */
async function handleVerification(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id: userId } = await params;
    const body = (await request.json()) as VerificationBody;

    // Validate request body
    if (typeof body.approved !== "boolean") {
      return NextResponse.json(
        { error: "approved field is required and must be boolean" },
        { status: 400 }
      );
    }

    if (!(body.approved || body.reason)) {
      return NextResponse.json(
        { error: "reason is required when rejecting verification" },
        { status: 400 }
      );
    }

    // Get user and verify they are a professional
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "professional") {
      return NextResponse.json(
        { error: "User is not a professional and cannot be verified" },
        { status: 400 }
      );
    }

    // Get or create professional profile
    const { data: professionalProfile, error: profileError } = await supabase
      .from("professional_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: "Failed to fetch professional profile" }, { status: 500 });
    }

    // Update or create professional profile with verification status
    if (professionalProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from("professional_profiles")
        .update({
          is_verified: body.approved,
          verified_at: body.approved ? new Date().toISOString() : null,
          verified_by: body.approved ? admin.id : null,
          verification_notes: body.notes || null,
          verification_checklist: body.checklist,
          updated_at: new Date().toISOString(),
        })
        .eq("id", professionalProfile.id);

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update professional profile" },
          { status: 500 }
        );
      }
    } else {
      // Create new professional profile
      const { error: createError } = await supabase.from("professional_profiles").insert({
        user_id: userId,
        is_verified: body.approved,
        verified_at: body.approved ? new Date().toISOString() : null,
        verified_by: body.approved ? admin.id : null,
        verification_notes: body.notes || null,
        verification_checklist: body.checklist,
      });

      if (createError) {
        return NextResponse.json(
          { error: "Failed to create professional profile" },
          { status: 500 }
        );
      }
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: body.approved ? "verify_professional" : "reject_verification",
      targetUserId: userId,
      targetResourceType: "professional_profile",
      targetResourceId: professionalProfile?.id || null,
      details: {
        checklist: body.checklist,
        notes: body.notes,
      },
      notes: body.approved
        ? "Professional verification approved"
        : `Professional verification rejected: ${body.reason}`,
    });

    // TODO: Send email notification to professional about verification status
    // This can be implemented later with proper email templates

    return NextResponse.json({
      success: true,
      message: body.approved
        ? "Professional verification approved successfully"
        : "Professional verification rejected",
      verified: body.approved,
    });
  } catch (error: unknown) {
    console.error("[Admin] Professional verification error:", error);
    const message = error instanceof Error ? error.message : "Failed to process verification";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply rate limiting: 10 requests per minute
export const POST = withRateLimit(handleVerification, "admin");
