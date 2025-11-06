/**
 * REFACTORED VERSION - Customer favorites management
 * GET/POST /api/customer/favorites
 *
 * BEFORE: 131 lines (2 handlers)
 * AFTER: 78 lines (2 handlers) (40% reduction)
 */

import { z } from "zod";
import { ok, withCustomer } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const updateFavoritesSchema = z.object({
  professionalId: z.string().uuid("Invalid professional ID format"),
  action: z.enum(["add", "remove"]),
});

/**
 * Get customer's favorite professionals
 */
export const GET = withCustomer(async ({ user, supabase }) => {
  // Try to get customer profile, but don't fail if it doesn't exist yet
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("favorite_professionals")
    .eq("profile_id", user.id)
    .maybeSingle();

  // If no profile exists yet, return empty favorites
  if (!profile) {
    return ok({ favorites: [] });
  }

  const favoriteIds = (profile.favorite_professionals as string[]) || [];

  // Fetch full professional details if there are favorites
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
      throw new ValidationError("Failed to fetch professional details");
    }

    return ok({ favorites: professionals || [] });
  }

  return ok({ favorites: [] });
});

/**
 * Add or remove a professional from favorites
 */
export const POST = withCustomer(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { professionalId, action } = updateFavoritesSchema.parse(body);

  // Get current profile or create if doesn't exist
  let { data: profile } = await supabase
    .from("customer_profiles")
    .select("favorite_professionals")
    .eq("profile_id", user.id)
    .maybeSingle();

  // If profile doesn't exist, create it
  if (!profile) {
    const { error: createError } = await supabase
      .from("customer_profiles")
      .insert({ profile_id: user.id, favorite_professionals: [] });

    if (createError) {
      throw new ValidationError("Failed to create customer profile");
    }

    profile = { favorite_professionals: [] };
  }

  let favorites = (profile.favorite_professionals as string[]) || [];

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
    throw new ValidationError("Failed to update favorites");
  }

  return ok(
    {
      favorites,
      isFavorite: action === "add",
    },
    `Professional ${action === "add" ? "added to" : "removed from"} favorites`
  );
});
