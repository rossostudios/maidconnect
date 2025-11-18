/**
 * Moderation Flags API
 * GET /api/admin/moderation/flags - List moderation flags with filters
 * POST /api/admin/moderation/flags - Create manual flag
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleGetFlags(request: Request) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const flagType = searchParams.get("flagType");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("moderation_flags").select(
      `
        id,
        user_id,
        flag_type,
        severity,
        reason,
        auto_detected,
        metadata,
        created_at,
        reviewed_at,
        reviewer_id,
        status,
        user:profiles!moderation_flags_user_id_fkey(id, full_name, email, role, avatar_url),
        reviewer:profiles!moderation_flags_reviewer_id_fkey(id, full_name)
      `,
      { count: "exact" }
    );

    if (severity) {
      query = query.eq("severity", severity);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (flagType) {
      query = query.eq("flag_type", flagType);
    }

    query = query.range(from, to).order("created_at", { ascending: false });

    const { data: flags, error, count } = await query;

    if (error) {
      console.error("Failed to fetch flags:", error);
      return NextResponse.json({ error: "Failed to fetch flags" }, { status: 500 });
    }

    return NextResponse.json({
      flags: flags || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch flags" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

async function handleCreateFlag(request: Request) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const body = await request.json();
    const { userId, flagType, severity, reason, metadata } = body;

    if (!(userId && flagType && severity && reason)) {
      return NextResponse.json(
        { error: "Missing required fields: userId, flagType, severity, reason" },
        { status: 400 }
      );
    }

    // Validate severity
    if (!["low", "medium", "high", "critical"].includes(severity)) {
      return NextResponse.json(
        { error: "Invalid severity. Must be: low, medium, high, or critical" },
        { status: 400 }
      );
    }

    // Create flag
    const { data: flag, error } = await supabase
      .from("moderation_flags")
      .insert({
        user_id: userId,
        flag_type: flagType,
        severity,
        reason,
        auto_detected: false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create flag:", error);
      return NextResponse.json({ error: "Failed to create flag" }, { status: 500 });
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetUserId: userId,
      targetResourceType: "moderation_flag",
      targetResourceId: flag.id,
      details: {
        flagType,
        severity,
        reason,
      },
      notes: `Created manual moderation flag: ${flagType}`,
    });

    return NextResponse.json({ flag });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create flag" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting
export const GET = withRateLimit(handleGetFlags, "admin");
export const POST = withRateLimit(handleCreateFlag, "admin");
