import { NextRequest, NextResponse } from "next/server";
import { sendProfessionalApprovedEmail } from "@/lib/email/send";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 3. Get background check details
    const { data: check, error: checkError } = await supabase
      .from("background_checks")
      .select(
        `
        id,
        professional_id,
        status,
        profiles!background_checks_professional_id_fkey (
          id,
          full_name,
          email,
          onboarding_status
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (checkError || !check) {
      return NextResponse.json({ error: "Background check not found" }, { status: 404 });
    }

    // Extract professional profile from array (Supabase joins return arrays)
    const professionalProfile = Array.isArray(check.profiles) ? check.profiles[0] : check.profiles;

    if (!professionalProfile) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    // 4. Update professional_profiles to mark background check as clear
    const { error: profileUpdateError } = await supabase
      .from("professional_profiles")
      .update({
        latest_background_check_id: check.id,
        background_check_status: "clear",
      })
      .eq("profile_id", check.professional_id);

    if (profileUpdateError) {
      console.error("[Admin] Failed to update professional profile:", profileUpdateError);
      return NextResponse.json({ error: "Failed to update professional profile" }, { status: 500 });
    }

    // 5. Update profiles onboarding_status if currently in review
    if (professionalProfile.onboarding_status === "application_in_review") {
      const { error: statusUpdateError } = await supabase
        .from("profiles")
        .update({
          onboarding_status: "approved",
        })
        .eq("id", check.professional_id);

      if (statusUpdateError) {
        console.error("[Admin] Failed to update onboarding status:", statusUpdateError);
        // Continue anyway - this is not critical
      }
    }

    // 6. Send approval email
    if (professionalProfile.email && professionalProfile.full_name) {
      await sendProfessionalApprovedEmail(
        professionalProfile.email,
        professionalProfile.full_name,
        "Your background check has been approved by our team."
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Approve background check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
