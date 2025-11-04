import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
 * @param limit - Number of professionals to fetch (default: 7)
 * @returns Array of professional objects
 */
export async function getLatestProfessionals(limit = 7): Promise<NewProfessional[]> {
  const supabase = await createSupabaseServerClient();

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

  if (error || !data) {
    console.error("Error fetching latest professionals:", error);
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
}
