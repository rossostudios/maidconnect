import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Get active add-ons for a specific professional (public endpoint)
 * GET /api/professionals/[id]/addons
 *
 * Returns only active add-ons that customers can book
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: professionalId } = await context.params;
    const supabase = await createSupabaseServerClient();

    const { data: addons, error } = await supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
    }

    return NextResponse.json({ addons: addons || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
  }
}
