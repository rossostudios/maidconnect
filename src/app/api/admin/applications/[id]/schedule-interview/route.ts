import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { withRateLimit } from "@/lib/utils/rate-limit";

const scheduleInterviewSchema = z.object({
  interview_date: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  interview_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Invalid time format (use HH:MM)",
  }),
  interviewer_id: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().default("Casaora Office"),
  location_address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      directions: z.string().optional(),
    })
    .optional(),
});

/**
 * Schedule an interview for a professional application
 * POST /api/admin/applications/[id]/schedule-interview
 *
 * Body: { interview_date, interview_time, interviewer_id?, notes?, location?, location_address? }
 */
async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Verify admin access
    await requireAdmin();

    const { id: professionalId } = await context.params;
    const supabase = await createSupabaseServerClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = scheduleInterviewSchema.parse(body);

    // Combine date and time into a timestamp
    const scheduledAt = new Date(`${validatedData.interview_date}T${validatedData.interview_time}`);

    // Verify the professional exists
    const { data: professional, error: professionalError } = await supabase
      .from("professional_profiles")
      .select("profile_id, full_name")
      .eq("profile_id", professionalId)
      .maybeSingle();

    if (professionalError || !professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // Create interview slot
    const { data: interview, error: interviewError } = await supabase
      .from("interview_slots")
      .insert({
        professional_id: professionalId,
        scheduled_at: scheduledAt.toISOString(),
        location: validatedData.location,
        location_address: validatedData.location_address || {},
        status: "scheduled",
        interview_notes: validatedData.notes || null,
        interviewer_id: validatedData.interviewer_id || null,
      })
      .select()
      .single();

    if (interviewError) {
      console.error("[Admin] Failed to create interview slot:", interviewError);
      return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
    }

    // TODO: Send email notification to professional about scheduled interview
    // This would integrate with your email service (e.g., SendGrid, Resend)

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        professional_id: interview.professional_id,
        professional_name: professional.full_name,
        scheduled_at: interview.scheduled_at,
        location: interview.location,
        status: interview.status,
      },
    });
  } catch (error) {
    console.error("[Admin] Schedule interview error:", error);

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

    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
  }
}

export const POST = withRateLimit(handler, "admin");
