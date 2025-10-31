import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get latest published changelog entry
 * GET /api/changelog/latest
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: changelog, error } = await supabase
      .from("changelogs")
      .select("*")
      .eq("visibility", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching latest changelog:", error);
      return NextResponse.json({ error: "Failed to fetch changelog" }, { status: 500 });
    }

    if (!changelog) {
      return NextResponse.json({ changelog: null });
    }

    // Check if current user has viewed this changelog
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
