/**
 * Admin Analytics Disputes API
 *
 * GET /api/admin/analytics/disputes?page=1&limit=20
 *
 * Returns recent disputes with pagination.
 * Cached for 1 minute (SHORT duration) to reduce database load.
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_TAGS } from "@/lib/cache";
import { createSupabaseAnonClient } from "@/lib/integrations/supabase/serverClient";
import { withAuth } from "@/lib/shared/api/middleware";

type Dispute = {
  id: string;
  dispute_type: string | null;
  status: string | null;
  priority: string | null;
  created_at: string;
  booking_id: string | null;
  opened_by: string | null;
  description: string | null;
};

type DisputeWithBooking = Dispute & {
  serviceName: string;
  bookingDate: string | null;
};

type DisputesData = {
  disputes: DisputeWithBooking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Cached disputes data fetch
 * Uses anon client since this is aggregate data, not user-specific
 */
const getCachedDisputes = unstable_cache(
  async (page: number, limit: number): Promise<DisputesData> => {
    const supabase = createSupabaseAnonClient();
    const offset = (page - 1) * limit;

    // Fetch recent disputes with pagination
    const { data: disputes, count } = await supabase
      .from("disputes")
      .select(
        `
        id,
        dispute_type,
        status,
        priority,
        created_at,
        booking_id,
        opened_by,
        description
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Collect all booking IDs to fetch in a single query (fix N+1)
    const bookingIds = (disputes ?? [])
      .map((d) => d.booking_id)
      .filter((id): id is string => id !== null);

    // Fetch all booking details in one query
    const { data: bookings } = bookingIds.length > 0
      ? await supabase
          .from("bookings")
          .select("id, service_name, scheduled_start")
          .in("id", bookingIds)
      : { data: [] };

    // Create a map for quick lookup
    const bookingMap = new Map(
      (bookings ?? []).map((b) => [b.id, { serviceName: b.service_name, bookingDate: b.scheduled_start }])
    );

    // Merge disputes with booking data
    const disputesWithBookings: DisputeWithBooking[] = (disputes ?? []).map((dispute) => ({
      ...dispute,
      serviceName: (dispute.booking_id && bookingMap.get(dispute.booking_id)?.serviceName) ?? "Unknown",
      bookingDate: (dispute.booking_id && bookingMap.get(dispute.booking_id)?.bookingDate) ?? null,
    }));

    return {
      disputes: disputesWithBookings,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  },
  ["admin-analytics-disputes"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.ADMIN_ANALYTICS, CACHE_TAGS.ADMIN_ANALYTICS_DISPUTES],
  }
);

async function handler(_context: unknown, req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "20", 10), 100);

    const data = await getCachedDisputes(page, limit);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Analytics disputes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const GET = withAuth(handler, { requiredRole: "admin" });
