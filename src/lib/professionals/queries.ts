import { unstable_cache } from "next/cache";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

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
 * Cached for 1 hour to improve performance and enable static generation
 * @param limit - Number of professionals to fetch (default: 7)
 * @returns Array of professional objects
 */
export const getLatestProfessionals = unstable_cache(
  async (limit = 7): Promise<NewProfessional[]> => {
    try {
      // Use anon client for public data (doesn't require auth)
      const supabase = createSupabaseAnonClient();

      const { data, error } = await supabase
        .from("users")
        .select(
          `
        id,
        name,
        city,
        country,
        profile_picture,
        hourly_rate,
        specialties
      `
        )
        .eq("role", "professional")
        .eq("is_active", true)
        .not("profile_picture", "is", null) // Only show pros with profile pictures
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching latest professionals:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return [];
      }

      // If no error but no data, return empty array
      if (!data || data.length === 0) {
        console.warn("No professionals found in database");
        return [];
      }

      // Transform to match component interface
      return data.map((pro) => ({
        id: pro.id,
        name: pro.name || "Professional",
        city: pro.city || "Unknown",
        country: pro.country || "",
        profilePicture: pro.profile_picture,
        hourlyRate: pro.hourly_rate || 25,
        specialties: Array.isArray(pro.specialties) ? pro.specialties : [],
      }));
    } catch (error) {
      console.error("Unexpected error fetching professionals:", error);
      return [];
    }
  },
  ["latest-professionals"], // Cache key
  {
    revalidate: 3600, // Revalidate every hour (1 hour = 3600 seconds)
    tags: ["professionals"], // Tags for on-demand revalidation
  }
);
