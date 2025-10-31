import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  // Check authentication and admin role
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const { status, priority, admin_notes, assigned_to } = body;

    // Check if feedback exists
    const { data: existing, error: fetchError } = await supabase
      .from("feedback_submissions")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    // Append admin notes if provided
    if (admin_notes) {
      // Get existing notes
      const { data: current } = await supabase
        .from("feedback_submissions")
        .select("admin_notes")
        .eq("id", id)
        .single();

      const timestamp = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const newNote = `[${timestamp}] ${admin_notes}`;
      updateData.admin_notes = current?.admin_notes
        ? `${current.admin_notes}\n\n${newNote}`
        : newNote;
    }

    // If marking as resolved, set resolved timestamp
    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    }

    // Update feedback
    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating feedback:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error(`Error in PATCH /api/admin/feedback/${id}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
