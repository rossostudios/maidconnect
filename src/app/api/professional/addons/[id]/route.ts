import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Update a specific service add-on
 * PATCH /api/professional/addons/[id]
 *
 * Body: Partial<ServiceAddon>
 */
export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { id: addonId } = await context.params;
    const body = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from("service_addons")
      .select("professional_id")
      .eq("id", addonId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return NextResponse.json(
        { error: "Add-on not found" },
        { status: 404 }
      );
    }

    const { data: addon, error } = await supabase
      .from("service_addons")
      .update({
        name: body.name,
        description: body.description,
        price_cop: body.price_cop,
        duration_minutes: body.duration_minutes,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addonId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update add-on:", error);
      return NextResponse.json(
        { error: "Failed to update add-on" },
        { status: 500 }
      );
    }

    return NextResponse.json({ addon });
  } catch (error) {
    console.error("Update add-on API error:", error);
    return NextResponse.json(
      { error: "Failed to update add-on" },
      { status: 500 }
    );
  }
}

/**
 * Delete a specific service add-on
 * DELETE /api/professional/addons/[id]
 */
export async function DELETE(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { id: addonId } = await context.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from("service_addons")
      .select("professional_id")
      .eq("id", addonId)
      .single();

    if (!existing || existing.professional_id !== user.id) {
      return NextResponse.json(
        { error: "Add-on not found" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("service_addons")
      .delete()
      .eq("id", addonId);

    if (error) {
      console.error("Failed to delete add-on:", error);
      return NextResponse.json(
        { error: "Failed to delete add-on" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete add-on API error:", error);
    return NextResponse.json(
      { error: "Failed to delete add-on" },
      { status: 500 }
    );
  }
}
