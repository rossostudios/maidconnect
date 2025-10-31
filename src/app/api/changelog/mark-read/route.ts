import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Mark changelog as read/dismissed
 * POST /api/changelog/mark-read
 * Body: { changelogId: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { changelogId } = await request.json();

    if (!changelogId) {
      return NextResponse.json({ error: "changelogId is required" }, { status: 400 });
    }

    // Check if view record exists
    const { data: existingView } = await supabase
      .from("changelog_views")
      .select("id")
      .eq("user_id", user.id)
      .eq("changelog_id", changelogId)
      .single();

    if (existingView) {
      // Update existing view with dismissed_at
      const { error } = await supabase
        .from("changelog_views")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", existingView.id);

      if (error) {
        console.error("Error updating changelog view:", error);
        return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
      }
    } else {
      // Create new view record with both viewed_at and dismissed_at
      const now = new Date().toISOString();
      const { error } = await supabase.from("changelog_views").insert({
        user_id: user.id,
        changelog_id: changelogId,
        viewed_at: now,
        dismissed_at: now,
      });

      if (error) {
        console.error("Error creating changelog view:", error);
        return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error marking changelog as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
