import { unstable_cache } from "next/cache";
import {
  CACHE_DURATIONS,
  CACHE_TAGS,
  latestProfessionalsKey,
} from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";

export type NewProfessional = {
  id: string;
  name: string;
  city: string;
  country: string;
  profilePicture: string | null;
  hourlyRate: number;
  specialties: string[];
};

/**
 * Fetches the latest professionals who have joined the platform
 * Uses centralized cache infrastructure for consistent caching behavior
 * @param limit - Number of professionals to fetch (default: 7)
 * @returns Array of professional objects
 */
export const getLatestProfessionals = unstable_cache(
  async (limit = 7): Promise<NewProfessional[]> => {
    try {
      // Use anon client for public data (doesn't require auth)
      const supabase = createSupabaseAnonClient();

      const { data, error } = await supabase
        .from("professional_profiles")
        .select(
          `
        profile_id,
        full_name,
        avatar_url,
        hourly_rate,
        primary_services,
        profiles!inner (
          city,
          country
        )
      `
        )
        .eq("status", "active")
        .not("avatar_url", "is", null) // Only show pros with profile pictures
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching latest professionals:", error);
        return [];
      }

      // If no error but no data, return empty array
      if (!data || data.length === 0) {
        console.warn("No professionals found in database");
        return [];
      }

      // Transform to match component interface
      return data.map((pro) => {
        const profile = Array.isArray(pro.profiles) ? pro.profiles[0] : pro.profiles;
        return {
          id: pro.profile_id,
          name: pro.full_name || "Professional",
          city: profile?.city || "Unknown",
          country: profile?.country || "",
          profilePicture: pro.avatar_url,
          hourlyRate: pro.hourly_rate || 25,
          specialties: Array.isArray(pro.primary_services) ? pro.primary_services : [],
        };
      });
    } catch (error) {
      console.error("Unexpected error fetching professionals:", error);
      return [];
    }
  },
  latestProfessionalsKey(),
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.PROFESSIONALS, CACHE_TAGS.PROFESSIONALS_DIRECTORY],
  }
);
