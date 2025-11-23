import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { type RequiredEventProperties, videoEvents } from "@/lib/integrations/posthog";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const { user: admin } = await getSession();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    // Parse request body
    const { professionalId, rejectionReason } = await request.json();

    if (!professionalId) {
      return NextResponse.json({ error: "Professional ID required" }, { status: 400 });
    }

    if (!rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Get professional profile with video info
    const { data: profile, error: profileError } = await supabase
      .from("professional_profiles")
      .select("id, profile_id, country_code, intro_video_uploaded_at")
      .eq("profile_id", professionalId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // Calculate review time in minutes
    const uploadedAt = new Date(profile.intro_video_uploaded_at);
    const reviewedAt = new Date();
    const reviewTimeMinutes = Math.round(
      (reviewedAt.getTime() - uploadedAt.getTime()) / (1000 * 60)
    );

    // Update video status to rejected
    const { error: updateError } = await supabase
      .from("professional_profiles")
      .update({
        intro_video_status: "rejected",
        intro_video_reviewed_at: reviewedAt.toISOString(),
        intro_video_reviewed_by: admin.id,
        intro_video_rejection_reason: rejectionReason.trim(),
      })
      .eq("profile_id", professionalId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json({ error: "Failed to reject video" }, { status: 500 });
    }

    // Track rejection event
    const eventContext: RequiredEventProperties = {
      country_code: (profile.country_code as "CO" | "PY" | "UY" | "AR") || "CO",
      role: "admin",
    };

    videoEvents.rejected({
      ...eventContext,
      professionalId,
      reviewedBy: admin.id,
      rejectionReason: rejectionReason.trim(),
      reviewTimeMinutes,
    });

    return NextResponse.json({
      success: true,
      status: "rejected",
      reviewTimeMinutes,
    });
  } catch (error) {
    console.error("Video rejection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
