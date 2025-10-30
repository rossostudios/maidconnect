import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get customer's favorite professionals
 * GET /api/customer/favorites
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
    const { data: profile, error } = await supabase
      .from("customer_profiles")
      .select("favorite_professionals")
      .eq("profile_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch favorites:", error);
      return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }

    const favoriteIds = (profile?.favorite_professionals as string[]) || [];

    // Fetch full professional details
    if (favoriteIds.length > 0) {
      const { data: professionals, error: proError } = await supabase
        .from("professional_profiles")
        .select(
          `
          profile_id,
          business_name,
          bio,
          hourly_rate_cop,
          rating,
          total_reviews,
          verified,
          profile:profiles!professional_profiles_profile_id_fkey(
            full_name,
            avatar_url
          )
        `
        )
        .in("profile_id", favoriteIds);

      if (proError) {
        console.error("Failed to fetch professional details:", proError);
        return NextResponse.json(
          { error: "Failed to fetch professional details" },
          { status: 500 }
        );
      }

      return NextResponse.json({ favorites: professionals || [] });
    }

    return NextResponse.json({ favorites: [] });
  } catch (error) {
    console.error("Favorites API error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

/**
 * Add or remove a professional from favorites
 * POST /api/customer/favorites
 *
 * Body: { professionalId: string, action: 'add' | 'remove' }
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "customer") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { professionalId, action } = body;

    if (!(professionalId && ["add", "remove"].includes(action))) {
      return NextResponse.json(
        { error: "Invalid request: professionalId and action required" },
        { status: 400 }
      );
    }

    // Get current favorites
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("favorite_professionals")
      .eq("profile_id", user.id)
      .single();

    let favorites = (profile?.favorite_professionals as string[]) || [];

    // Update favorites array
    if (action === "add") {
      if (!favorites.includes(professionalId)) {
        favorites = [...favorites, professionalId];
      }
    } else {
      favorites = favorites.filter((id) => id !== professionalId);
    }

    // Save updated favorites
    const { error: updateError } = await supabase
      .from("customer_profiles")
      .update({ favorite_professionals: favorites })
      .eq("profile_id", user.id);

    if (updateError) {
      console.error("Failed to update favorites:", updateError);
      return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      favorites,
      isFavorite: action === "add",
    });
  } catch (error) {
    console.error("Update favorites API error:", error);
    return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 });
  }
}
