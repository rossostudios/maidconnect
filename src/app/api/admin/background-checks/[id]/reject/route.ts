import { NextRequest, NextResponse } from "next/server";
import { sendProfessionalRejectedEmail } from "@/lib/email/send";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;
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

    // 4. Update background check status to suspended
    const { error: checkUpdateError } = await supabase
      .from("background_checks")
      .update({
        status: "suspended",
      })
      .eq("id", id);

    if (checkUpdateError) {
      console.error("[Admin] Failed to update background check:", checkUpdateError);
      return NextResponse.json({ error: "Failed to update background check" }, { status: 500 });
    }

    // 5. Update professional_profiles to mark background check as suspended
    const { error: profileUpdateError } = await supabase
      .from("professional_profiles")
      .update({
        latest_background_check_id: check.id,
        background_check_status: "suspended",
      })
      .eq("profile_id", check.professional_id);

    if (profileUpdateError) {
      console.error("[Admin] Failed to update professional profile:", profileUpdateError);
      return NextResponse.json({ error: "Failed to update professional profile" }, { status: 500 });
    }

    // 6. Update profiles onboarding_status to rejected
    const { error: statusUpdateError } = await supabase
      .from("profiles")
      .update({
        onboarding_status: "rejected",
      })
      .eq("id", check.professional_id);

    if (statusUpdateError) {
      console.error("[Admin] Failed to update onboarding status:", statusUpdateError);
      // Continue anyway - this is not critical
    }

    // 7. Send rejection email
    if (professionalProfile.email && professionalProfile.full_name) {
      await sendProfessionalRejectedEmail(
        professionalProfile.email,
        professionalProfile.full_name,
        reason || "Background check findings",
        "Our team has reviewed your background check results and unfortunately cannot approve your application at this time."
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin] Reject background check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
