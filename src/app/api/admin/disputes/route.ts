/**
 * Admin Disputes API
 * GET /api/admin/disputes - List disputes with filters
 *
 * Rate Limit: 5 requests per minute (dispute tier)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function handleGetDisputes(request: Request) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("disputes").select(
      `
        id,
        booking_id,
        opened_by,
        opened_by_role,
        dispute_type,
        status,
        priority,
        description,
        assigned_to,
        created_at,
        updated_at,
        booking:bookings(id, service_category, amount_estimated),
        opener:profiles!disputes_opened_by_fkey(id, full_name, email),
        assignee:profiles!disputes_assigned_to_fkey(id, full_name)
      `,
      { count: "exact" }
    );

    if (status) {
      query = query.eq("status", status);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }

    query = query.range(from, to).order("created_at", { ascending: false });

    const { data: disputes, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
    }

    return NextResponse.json({
      disputes: disputes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch disputes" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 5 requests per minute (dispute tier)
export const GET = withRateLimit(handleGetDisputes, "dispute");
