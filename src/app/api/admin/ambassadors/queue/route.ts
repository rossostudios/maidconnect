/**
 * Admin Ambassadors Queue API
 *
 * GET /api/admin/ambassadors/queue
 *
 * Returns all ambassador applications with grouping by status.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type Ambassador = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
};

type ProcessedAmbassador = Ambassador & {
  waitingDays: number;
};

type AmbassadorsData = {
  ambassadors: ProcessedAmbassador[];
  grouped: {
    pending: ProcessedAmbassador[];
    approved: ProcessedAmbassador[];
    rejected: ProcessedAmbassador[];
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
};

/**
 * Cached ambassadors data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedAmbassadors = unstable_cache(
  async (): Promise<AmbassadorsData> => {
    const supabase = createSupabaseAnonClient();

    // Fetch all ambassadors
    const { data: ambassadors, error } = await supabase
      .from("ambassadors")
      .select("*")
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching ambassadors:", error);
      throw new Error("Failed to fetch ambassadors");
    }

    // Calculate waiting days and group by status
    const now = new Date();
    const processedAmbassadors: ProcessedAmbassador[] = ((ambassadors ?? []) as Ambassador[]).map(
      (ambassador) => {
        const appliedAt = new Date(ambassador.applied_at);
        const waitingDays = Math.floor(
          (now.getTime() - appliedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          ...ambassador,
          waitingDays,
        };
      }
    );

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

    return { ambassadors: processedAmbassadors, grouped, counts };
  },
  ["admin-ambassadors-queue"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_AMBASSADORS],
  }
);

async function handler(_context: unknown, _req: NextRequest) {
  try {
    const data = await getCachedAmbassadors();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ambassador queue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
