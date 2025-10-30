import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get unread message count for current user
 * GET /api/messages/unread-count
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get user's role to determine which unread count to sum
    const isCustomer = user.user_metadata?.role === "customer";
    const isProfessional = user.user_metadata?.role === "professional";

    if (!isCustomer && !isProfessional) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Fetch conversations and sum unread counts
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("customer_unread_count, professional_unread_count")
      .or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`);

    if (error) {
      console.error("Failed to fetch unread counts:", error);
      return NextResponse.json(
        { error: "Failed to fetch unread count" },
        { status: 500 }
      );
    }

    // Sum up the appropriate unread count based on user role
    const totalUnread = (conversations || []).reduce((sum, conv) => {
      if (isCustomer) {
        return sum + (conv.customer_unread_count || 0);
      } else {
        return sum + (conv.professional_unread_count || 0);
      }
    }, 0);

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error("Unread count API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
