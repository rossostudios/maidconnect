import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Get professional's service add-ons
 * GET /api/professional/addons
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { data: addons, error } = await supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
    }

    return NextResponse.json({ addons: addons || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
  }
}

/**
 * Create a new service add-on
 * POST /api/professional/addons
 *
 * Body: {
 *   name: string,
 *   description?: string,
 *   price_cop: number,
 *   duration_minutes: number,
 *   is_active: boolean
 * }
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.price_cop === undefined) {
      return NextResponse.json({ error: "name and price_cop are required" }, { status: 400 });
    }

    if (body.price_cop < 0) {
      return NextResponse.json({ error: "price_cop must be non-negative" }, { status: 400 });
    }

    const { data: addon, error } = await supabase
      .from("service_addons")
      .insert({
        professional_id: user.id,
        name: body.name,
        description: body.description || null,
        price_cop: body.price_cop,
        duration_minutes: body.duration_minutes || 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create add-on" }, { status: 500 });
    }

    return NextResponse.json({ addon }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create add-on" }, { status: 500 });
  }
}

/**
 * Update service add-ons (bulk)
 * PUT /api/professional/addons
 *
 * Body: { addons: ServiceAddon[] }
 */
export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body.addons)) {
      return NextResponse.json({ error: "addons must be an array" }, { status: 400 });
    }

    // Get existing add-ons
    const { data: existingAddons } = await supabase
      .from("service_addons")
      .select("id")
      .eq("professional_id", user.id);

    const existingIds = new Set(existingAddons?.map((a) => a.id) || []);
    const incomingIds = new Set(body.addons.map((a: any) => a.id));

    // Delete add-ons not in incoming list
    const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from("service_addons").delete().in("id", toDelete);
    }

    // Upsert all incoming add-ons
    const { data: updatedAddons, error } = await supabase
      .from("service_addons")
      .upsert(
        body.addons.map((addon: any) => ({
          id: addon.id,
          professional_id: user.id,
          name: addon.name,
          description: addon.description,
          price_cop: addon.price_cop,
          duration_minutes: addon.duration_minutes,
          is_active: addon.is_active,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" }
      )
      .select();

    if (error) {
      return NextResponse.json({ error: "Failed to update add-ons" }, { status: 500 });
    }

    return NextResponse.json({ addons: updatedAddons || [] });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update add-ons" }, { status: 500 });
  }
}
