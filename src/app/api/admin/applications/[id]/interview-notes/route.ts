import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { withRateLimit } from "@/lib/utils/rate-limit";
import { sanitizeHTML } from "@/lib/utils/sanitize";

const interviewNotesSchema = z.object({
  ratings: z.object({
    professionalism: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    technical_knowledge: z.number().min(1).max(5),
    customer_service: z.number().min(1).max(5),
  }),
  notes: z.string().min(10, "Notes must be at least 10 characters"),
  recommendation: z.enum(["approve", "reject", "second_interview"]),
  interview_date: z.string().optional(),
  interview_time: z.string().optional(),
  interviewer_name: z.string().optional(),
});

/**
 * Save interview notes and scoring for a professional application
 * POST /api/admin/applications/[id]/interview-notes
 *
 * Body: { ratings, notes, recommendation, interview_date?, interview_time?, interviewer_name? }
 */
async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Verify admin access
    const adminUser = await requireAdmin();

    const { id: professionalId } = await context.params;
    const supabase = await createSupabaseServerClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = interviewNotesSchema.parse(body);

    // Sanitize notes to prevent XSS
    const sanitizedNotes = sanitizeHTML(validatedData.notes);

    // Verify the professional exists
    const { data: professional, error: professionalError } = await supabase
      .from("professional_profiles")
      .select("profile_id, full_name, status")
      .eq("profile_id", professionalId)
      .maybeSingle();

    if (professionalError || !professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // Calculate average score
    const { professionalism, communication, technical_knowledge, customer_service } =
      validatedData.ratings;
    const averageScore =
      (professionalism + communication + technical_knowledge + customer_service) / 4;

    // Create or update interview review record
    const { data: review, error: reviewError } = await supabase
      .from("admin_professional_reviews")
      .insert({
        professional_id: professionalId,
        review_type: "interview",
        status: validatedData.recommendation === "approve" ? "approved" : "pending",
        interview_scores: validatedData.ratings,
        interview_average_score: averageScore,
        notes: sanitizedNotes,
        recommendation: validatedData.recommendation,
        interviewer_name: validatedData.interviewer_name || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUser.id,
      })
      .select()
      .single();

    if (reviewError) {
      console.error("[Admin] Failed to save interview notes:", reviewError);
      return NextResponse.json({ error: "Failed to save interview notes" }, { status: 500 });
    }

    // If recommendation is approve, update professional status
    if (validatedData.recommendation === "approve") {
      const { error: updateError } = await supabase
        .from("professional_profiles")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", professionalId);

      if (updateError) {
        console.error("[Admin] Failed to update professional status:", updateError);
        // Don't fail the request if status update fails
      }

      // Update onboarding status in profiles table
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          onboarding_status: "approved",
        })
        .eq("id", professionalId);

      if (profileUpdateError) {
        console.error("[Admin] Failed to update profile onboarding status:", profileUpdateError);
      }
    }

    // If recommendation is reject, update professional status
    if (validatedData.recommendation === "reject") {
      const { error: updateError } = await supabase
        .from("professional_profiles")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", professionalId);

      if (updateError) {
        console.error("[Admin] Failed to update professional status:", updateError);
      }
    }

    // TODO: Send email notification to professional about interview results
    // This would integrate with your email service

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        professional_id: review.professional_id,
        professional_name: professional.full_name,
        ratings: validatedData.ratings,
        average_score: averageScore,
        recommendation: validatedData.recommendation,
        status: review.status,
        reviewed_at: review.reviewed_at,
      },
    });
  } catch (error) {
    console.error("[Admin] Interview notes error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to save interview notes" }, { status: 500 });
  }
}

export const POST = withRateLimit(handler, "admin");
