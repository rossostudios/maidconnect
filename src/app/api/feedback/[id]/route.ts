import { NextRequest, NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get feedback by ID
 * GET /api/feedback/[id]
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if user is admin or the feedback creator
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    let query = supabase.from("feedback_submissions").select("*").eq("id", id);

    // Non-admins can only see their own feedback
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: feedback, error } = await query.single();

    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Update feedback (admin only)
 * PATCH /api/feedback/[id]
 * Body: {
 *   status?: 'new' | 'in_review' | 'resolved' | 'closed' | 'spam',
 *   priority?: 'low' | 'medium' | 'high' | 'critical',
 *   assigned_to?: string,
 *   admin_notes?: string
 * }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    const updates = await request.json();

    const allowedFields = ["status", "priority", "assigned_to", "admin_notes"];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // If status is being changed to 'resolved', set resolved_at and resolved_by
    if (updates.status === "resolved") {
      filteredUpdates.resolved_at = new Date().toISOString();
      filteredUpdates.resolved_by = admin.id;
    }

    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .update(filteredUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating feedback:", error);
      return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }

    // Log audit
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetResourceType: "feedback",
      targetResourceId: id,
      details: filteredUpdates,
      notes: `Updated feedback #${id}`,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Delete feedback (admin only)
 * DELETE /api/feedback/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { error } = await supabase.from("feedback_submissions").delete().eq("id", id);

    if (error) {
      console.error("Error deleting feedback:", error);
      return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
    }

    // Log audit
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetResourceType: "feedback",
      targetResourceId: id,
      details: {},
      notes: `Deleted feedback #${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
