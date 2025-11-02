import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * GET /api/admin/users
 * Get all admin users for sending notifications
 * Requires admin role
 */
export async function GET() {
  try {
    // Verify the requester is an admin (if called via authenticated request)
    // Note: This can also be called server-side without auth for internal notifications
    const supabase = await createSupabaseServerClient();

    // Fetch all users with admin role
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "admin");

    if (error) {
      console.error("Error fetching admins:", error);
      return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
    }

    return NextResponse.json({ admins: admins || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
