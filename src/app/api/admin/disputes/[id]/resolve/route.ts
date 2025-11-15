/**
 * Admin Dispute Resolution API
 * POST /api/admin/disputes/[id]/resolve - Resolve dispute with action
 *
 * Rate Limit: 5 requests per minute (dispute tier)
 */

import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ResolveBody = {
  resolution_notes: string;
  resolution_action: string;
  refund_amount?: number;
};

async function handleResolveDispute(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const body: ResolveBody = await request.json();

    if (!(body.resolution_notes && body.resolution_action)) {
      return NextResponse.json(
        { error: "Resolution notes and action are required" },
        { status: 400 }
      );
    }

    const { data: dispute, error } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution_notes: body.resolution_notes,
        resolution_action: body.resolution_action,
        refund_amount: body.refund_amount || null,
        resolved_at: new Date().toISOString(),
        resolved_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to resolve dispute" }, { status: 500 });
    }

    await createAuditLog({
      adminId: admin.id,
      actionType: "resolve_dispute",
      targetResourceType: "dispute",
      targetResourceId: id,
      details: {
        action: body.resolution_action,
        refund_amount: body.refund_amount,
      },
      notes: body.resolution_notes,
    });

    return NextResponse.json({ success: true, dispute });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to resolve dispute" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 5 requests per minute (dispute tier)
export const POST = withRateLimit(handleResolveDispute, "dispute");
