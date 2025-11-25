import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_HEADERS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Changelog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  visibility: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * Cached changelog fetch
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedLatestChangelog = unstable_cache(
  async (): Promise<Changelog | null> => {
    const supabase = createSupabaseAnonClient();

    const { data: changelog, error } = await supabase
      .from("changelogs")
      .select("*")
      .eq("visibility", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching latest changelog:", error);
      throw new Error("Failed to fetch changelog");
    }

    return changelog as Changelog | null;
  },
  ["changelog-latest"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.CHANGELOGS],
  }
);

/**
 * Get latest published changelog entry
 * GET /api/changelog/latest
 *
 * Changelog data is cached; user view status is fetched separately
 */
export async function GET() {
  try {
    // Fetch cached changelog (public data)
    const changelog = await getCachedLatestChangelog();

    if (!changelog) {
      return NextResponse.json({ changelog: null }, { headers: CACHE_HEADERS.STANDARD });
    }

    // User-specific view status (not cached)
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let hasViewed = false;
    if (user) {
      const { data: view } = await supabase
        .from("changelog_views")
        .select("id, dismissed_at")
        .eq("user_id", user.id)
        .eq("changelog_id", changelog.id)
        .single();

      hasViewed = !!view?.dismissed_at;
    }

    return NextResponse.json({
      changelog,
      hasViewed,
    });
  } catch (error) {
    console.error("Unexpected error fetching changelog:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
