import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const actionType = searchParams.get("actionType");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("admin_audit_logs").select(
      `
        id,
        action_type,
        details,
        notes,
        created_at,
        admin:profiles!admin_audit_logs_admin_id_fkey(id, full_name),
        target_user:profiles!admin_audit_logs_target_user_id_fkey(id, full_name, email)
      `,
      { count: "exact" }
    );

    if (actionType) {
      query = query.eq("action_type", actionType);
    }

    query = query.range(from, to).order("created_at", { ascending: false });

    const { data: logs, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch logs" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
