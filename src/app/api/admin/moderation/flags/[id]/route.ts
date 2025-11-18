/**
 * Moderation Flag Detail API
 * PATCH /api/admin/moderation/flags/[id] - Update flag status (review, dismiss, action_taken)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleUpdateFlag(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const params = await context.params;
    const flagId = params.id;

    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status field" }, { status: 400 });
    }

    // Validate status
    if (!["pending", "reviewed", "dismissed", "action_taken"].includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be: pending, reviewed, dismissed, or action_taken",
        },
        { status: 400 }
      );
    }

    // Update flag
    const { data: flag, error } = await supabase
      .from("moderation_flags")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewer_id: admin.id,
      })
      .eq("id", flagId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update flag:", error);
      return NextResponse.json({ error: "Failed to update flag" }, { status: 500 });
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetUserId: flag.user_id,
      targetResourceType: "moderation_flag",
      targetResourceId: flagId,
      details: {
        status,
        notes,
      },
      notes: `Updated moderation flag to status: ${status}`,
    });

    return NextResponse.json({ flag });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update flag" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting
export const PATCH = withRateLimit(handleUpdateFlag, "admin");
