import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all ambassadors
    const { data: ambassadors, error } = await supabase
      .from("ambassadors")
      .select("*")
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching ambassadors:", error);
      return NextResponse.json({ error: "Failed to fetch ambassadors" }, { status: 500 });
    }

    // Calculate waiting days and group by status
    const now = new Date();
    const processedAmbassadors = (ambassadors || []).map((ambassador) => {
      const appliedAt = new Date(ambassador.applied_at);
      const waitingDays = Math.floor((now.getTime() - appliedAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...ambassador,
        waitingDays,
      };
    });

    // Group by status
    const grouped = {
      pending: processedAmbassadors.filter((a) => a.status === "pending"),
      approved: processedAmbassadors.filter((a) => a.status === "approved"),
      rejected: processedAmbassadors.filter((a) => a.status === "rejected"),
    };

    const counts = {
      pending: grouped.pending.length,
      approved: grouped.approved.length,
      rejected: grouped.rejected.length,
      total: processedAmbassadors.length,
    };

    return NextResponse.json({
      ambassadors: processedAmbassadors,
      grouped,
      counts,
    });
  } catch (error) {
    console.error("Ambassador queue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
