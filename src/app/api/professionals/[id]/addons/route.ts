import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { CACHE_DURATIONS, CACHE_HEADERS, CACHE_TAGS, addonsKey } from "@/lib/cache";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AddonResponse = {
  addons: Array<{
    id: string;
    professional_id: string;
    name: string;
    description: string | null;
    price_cents: number;
    duration_minutes: number | null;
    is_active: boolean;
    created_at: string;
  }>;
};

/**
 * Cached function to fetch professional add-ons
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedAddons = unstable_cache(
  async (professionalId: string): Promise<AddonResponse> => {
    const supabase = createSupabaseAnonClient();

    const { data: addons, error } = await supabase
      .from("service_addons")
      .select("*")
      .eq("professional_id", professionalId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching add-ons:", error);
      throw new Error("Failed to fetch add-ons");
    }

    return { addons: addons || [] };
  },
  ["professional-addons"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.PROFESSIONALS_ADDONS],
  }
);

/**
 * Get active add-ons for a specific professional (public endpoint)
 * GET /api/professionals/[id]/addons
 *
 * Returns only active add-ons that customers can book.
 * Cached for 10 minutes with CDN support.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: professionalId } = await context.params;

    // Use cached function for data fetching
    const response = await getCachedAddons(professionalId);

    // Return with CDN cache headers
    return NextResponse.json(response, { headers: CACHE_HEADERS.STANDARD });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
  }
}
