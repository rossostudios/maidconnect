import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

/**
 * Check if a professional is favorited
 */
export async function isFavorited(professionalId: string): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  const { data, error } = await supabase
    .from("customer_favorites")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("professional_id", professionalId)
    .maybeSingle();

  if (error) {
    console.error("Error checking favorite:", error);
    return false;
  }

  return !!data;
}

/**
 * Add a professional to favorites
 */
export async function addFavorite(professionalId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/customer/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ professionalId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add favorite");
  }
}

/**
 * Remove a professional from favorites
 */
export async function removeFavorite(professionalId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${env.apiUrl}/api/customer/favorites`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ professionalId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to remove favorite");
  }
}

/**
 * Fetch all favorited professionals for the current user
 */
export async function fetchFavorites(): Promise<string[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_favorites")
    .select("professional_id")
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data.map((fav) => fav.professional_id);
}

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 */
export async function toggleFavorite(professionalId: string): Promise<boolean> {
  const favorited = await isFavorited(professionalId);

  if (favorited) {
    await removeFavorite(professionalId);
    return false;
  } else {
    await addFavorite(professionalId);
    return true;
  }
}
