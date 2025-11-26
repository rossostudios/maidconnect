import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ReviewRequest = {
  action: "approve" | "reject";
  rejectionReason?: string;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body: ReviewRequest = await request.json();
    const { action, rejectionReason } = body;

    if (!(action && ["approve", "reject"].includes(action))) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "reject" && !rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    // Fetch the ambassador application
    const { data: ambassador, error: fetchError } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ambassador) {
      return NextResponse.json({ error: "Ambassador not found" }, { status: 404 });
    }

    if (ambassador.status !== "pending") {
      return NextResponse.json(
        { error: "This application has already been reviewed" },
        { status: 400 }
      );
    }

    // Update ambassador status
    const now = new Date().toISOString();
    const updateData =
      action === "approve"
        ? {
            status: "approved" as const,
            is_active: true,
            approved_at: now,
          }
        : {
            status: "rejected" as const,
            is_active: false,
            rejected_at: now,
            rejection_reason: rejectionReason,
          };

    const { error: updateError } = await supabase
      .from("ambassadors")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating ambassador:", updateError);
      return NextResponse.json({ error: "Failed to update ambassador" }, { status: 500 });
    }

    // TODO: Send email notification to ambassador about their application status
    // This would be a good place to integrate with your email service (e.g., Resend)

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Ambassador approved successfully" : "Application rejected",
    });
  } catch (error) {
    console.error("Ambassador review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
