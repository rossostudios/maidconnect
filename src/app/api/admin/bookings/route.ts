import { NextResponse } from "next/server";
import {
  type BookingData,
  buildBookingQuery,
  buildPaginationMetadata,
  calculatePaginationRange,
  combineBookingData,
  fetchBookingProfiles,
  parseBookingQueryParams,
} from "@/lib/admin/booking-management-service";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * GET /api/admin/bookings
 *
 * Fetch all bookings with filtering, search, and pagination.
 * Supports country filtering via AdminCountryFilterContext.
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20)
 * - status: Filter by booking status (pending, confirmed, etc.)
 * - search: Search by service name or address
 * - country: Filter by country code (CO, PY, UY, AR) or "ALL"
 *
 * Example:
 * GET /api/admin/bookings?page=1&limit=20&status=pending&country=CO
 */
export async function GET(request: Request) {
  try {
    // 1. Verify admin authentication
    await requireUser({ allowedRoles: ["admin"] });

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = parseBookingQueryParams(searchParams);

    // 3. Create Supabase client
    const supabase = await createSupabaseServerClient();

    // 4. Calculate pagination range
    const { from, to } = calculatePaginationRange(params.page, params.limit);

    // 5. Build and execute booking query
    const query = buildBookingQuery(supabase, params, from, to);
    const { data: bookings, error, count } = await query;

    if (error) {
      console.error("[Admin Bookings API] Query error:", error);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    // 6. Fetch customer and professional profiles
    const { customerMap, professionalMap } = await fetchBookingProfiles(
      supabase,
      (bookings || []) as BookingData[]
    );

    // 7. Combine booking data with profiles
    const combinedBookings = combineBookingData(
      (bookings || []) as BookingData[],
      customerMap,
      professionalMap
    );

    // 8. Build pagination metadata
    const pagination = buildPaginationMetadata(params.page, params.limit, count || 0);

    return NextResponse.json({
      bookings: combinedBookings,
      pagination,
    });
  } catch (error) {
    console.error("[Admin Bookings API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
