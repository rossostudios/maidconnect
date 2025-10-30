import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Mark notification(s) as read
 * POST /api/notifications/mark-read
 * Body: { notificationIds: string[] } or { markAllRead: true }
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
    const { notificationIds, markAllRead } = await request.json();

    if (markAllRead) {
      // Mark all unread notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (error) {
        console.error("Failed to mark all as read:", error);
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, markedAll: true });
    }
    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", notificationIds)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to mark notifications as read:", error);
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        marked: notificationIds.length,
      });
    }
    return NextResponse.json(
      { error: "Invalid request: provide notificationIds or markAllRead" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Mark read API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
