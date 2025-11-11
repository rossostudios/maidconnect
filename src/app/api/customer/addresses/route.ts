import { NextResponse } from "next/server";
import { z } from "zod";
import type { SavedAddress } from "@/components/addresses/saved-addresses-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const updateAddressesSchema = z.object({
  addresses: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      is_default: z.boolean(),
      street: z.string(),
      neighborhood: z.string().optional(),
      city: z.string(),
      postal_code: z.string().optional(),
      building_access: z.string().optional(),
      parking_info: z.string().optional(),
      special_notes: z.string().optional(),
      created_at: z.string(),
    })
  ),
});

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
      return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
    }

    // Type the JSONB column as unknown, then validate it's an array
    const savedAddresses = profile?.saved_addresses as unknown;
    const addresses: SavedAddress[] = Array.isArray(savedAddresses) ? savedAddresses : [];

    return NextResponse.json({
      addresses,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
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
    const body = await request.json();
    const { addresses } = updateAddressesSchema.parse(body);

    // Update saved addresses
    const { error } = await supabase
      .from("customer_profiles")
      .update({ saved_addresses: addresses })
      .eq("profile_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to update addresses" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update addresses" }, { status: 500 });
  }
}
