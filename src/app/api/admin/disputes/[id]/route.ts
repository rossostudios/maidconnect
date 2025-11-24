/**
 * Admin Dispute Detail API
 * GET /api/admin/disputes/[id] - Get dispute details
 * PATCH /api/admin/disputes/[id] - Update dispute (assign, change status)
 *
 * Rate Limit: 5 requests per minute (dispute tier)
 */

import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleGetDispute(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { data: dispute, error } = await supabase
      .from("disputes")
      .select(`
        *,
        booking:bookings(*),
        opener:profiles!disputes_opened_by_fkey(id, full_name, email, avatar_url),
        assignee:profiles!disputes_assigned_to_fkey(id, full_name),
        resolver:profiles!disputes_resolved_by_fkey(id, full_name)
      `)
      .eq("id", id)
      .single();

    if (error || !dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch dispute";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function handlePatchDispute(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.status) {
      updates.status = body.status;
    }
    if (body.priority) {
      updates.priority = body.priority;
    }
    if (body.assigned_to !== undefined) {
      updates.assigned_to = body.assigned_to;
    }
    if (body.resolution_notes) {
      updates.resolution_notes = body.resolution_notes;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("disputes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update dispute" }, { status: 500 });
    }

    await createAuditLog({
      adminId: admin.id,
      actionType: "resolve_dispute",
      targetResourceType: "dispute",
      targetResourceId: id,
      details: updates,
      notes: "Updated dispute",
    });

    return NextResponse.json({ success: true, dispute: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update dispute";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply rate limiting: 5 requests per minute (dispute tier)
export const GET = withRateLimit(handleGetDispute, "dispute");
export const PATCH = withRateLimit(handlePatchDispute, "dispute");
