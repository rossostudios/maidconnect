import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get customer's saved addresses
 * GET /api/customer/addresses
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "customer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    // Fetch customer profile with saved addresses
    const { data: profile, error } = await supabase
      .from("customer_profiles")
      .select("saved_addresses")
      .eq("profile_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch addresses:", error);
      return NextResponse.json(
        { error: "Failed to fetch addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      addresses: (profile?.saved_addresses as any[]) || [],
    });
  } catch (error) {
    console.error("Addresses API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

/**
 * Update customer's saved addresses
 * PUT /api/customer/addresses
 *
 * Body: { addresses: SavedAddress[] }
 */
export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "customer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { addresses: any[] };

    if (!Array.isArray(body.addresses)) {
      return NextResponse.json(
        { error: "addresses must be an array" },
        { status: 400 }
      );
    }

    // Update saved addresses
    const { error } = await supabase
      .from("customer_profiles")
      .update({ saved_addresses: body.addresses })
      .eq("profile_id", user.id);

    if (error) {
      console.error("Failed to update addresses:", error);
      return NextResponse.json(
        { error: "Failed to update addresses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: body.addresses,
    });
  } catch (error) {
    console.error("Update addresses API error:", error);
    return NextResponse.json(
      { error: "Failed to update addresses" },
      { status: 500 }
    );
  }
}
