/**
 * Admin Dispute Resolution API
 * POST /api/admin/disputes/[id]/resolve - Resolve dispute with action
 *
 * Supports:
 * - Issue refund (partial or full)
 * - Issue warning to professional
 * - Suspend professional
 * - Mark as resolved (no action)
 * - Request more information
 *
 * Rate Limit: 5 requests per minute (dispute tier)
 */

import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ResolveBody = {
  resolution_type?: "refund" | "warning" | "suspend" | "no_action" | "request_info";
  resolution_notes?: string; // Legacy field
  resolution_action?: string; // Legacy field
  action_taken?: string; // New field
  notes?: string; // New field (admin notes, internal)
  message?: string; // New field (sent to users)
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

    // Support both legacy and new field names
    const actionTaken = body.action_taken || body.resolution_action;
    const adminNotes = body.notes || body.resolution_notes;
    const resolutionType = body.resolution_type || "no_action";
    const resolutionMessage = body.message || "";

    if (!actionTaken) {
      return NextResponse.json({ error: "Action taken is required" }, { status: 400 });
    }

    // Get dispute details for professional actions
    const { data: dispute } = await supabase
      .from("disputes")
      .select(
        `
        id,
        booking_id,
        opened_by,
        opened_by_role,
        dispute_type,
        booking:bookings(id, professional_id, customer_id, amount_estimated)
      `
      )
      .eq("id", id)
      .single();

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Update dispute with resolution
    const { data: updatedDispute, error } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution_type: resolutionType,
        resolution_notes: adminNotes || null,
        resolution_action: actionTaken,
        action_taken: actionTaken,
        admin_notes: adminNotes || null,
        resolution_message: resolutionMessage || null,
        refund_amount: body.refund_amount || null,
        resolved_at: new Date().toISOString(),
        resolved_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update dispute:", error);
      return NextResponse.json({ error: "Failed to resolve dispute" }, { status: 500 });
    }

    // Handle professional actions (warning, suspension)
    if ((resolutionType === "warning" || resolutionType === "suspend") && dispute.booking) {
      const professionalId = dispute.booking.professional_id;

      if (resolutionType === "suspend") {
        // Create suspension record
        await supabase.from("user_suspensions").insert({
          user_id: professionalId,
          suspension_type: "temporary",
          reason: `Dispute resolution: ${actionTaken}`,
          details: {
            dispute_id: id,
            resolution_type: resolutionType,
          },
          suspended_by: admin.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
      }

      // Create moderation flag for the professional
      await supabase.from("moderation_flags").insert({
        user_id: professionalId,
        flag_type: "dispute_resolution",
        severity: resolutionType === "suspend" ? "high" : "medium",
        reason: `Dispute ${id}: ${actionTaken}`,
        auto_detected: false,
        metadata: {
          dispute_id: id,
          resolution_type: resolutionType,
          action_taken: actionTaken,
        },
      });
    }

    await createAuditLog({
      adminId: admin.id,
      actionType: "resolve_dispute",
      targetResourceType: "dispute",
      targetResourceId: id,
      details: {
        resolution_type: resolutionType,
        action: actionTaken,
        refund_amount: body.refund_amount,
      },
      notes: adminNotes,
    });

    return NextResponse.json({ success: true, dispute: updatedDispute });
  } catch (error: any) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve dispute" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 5 requests per minute (dispute tier)
export const POST = withRateLimit(handleResolveDispute, "dispute");
