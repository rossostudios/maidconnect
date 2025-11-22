/**
 * Booking Management Service - Business logic for admin booking management
 *
 * Handles filtering, searching, and pagination of bookings for admin dashboard.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined";

export type BookingQueryParams = {
  page: number;
  limit: number;
  status: BookingStatus | null;
  search: string;
  /** Filter by country code (CO, PY, UY, AR) or "ALL" for all countries */
  country: string | null;
};

export type BookingData = {
  id: string;
  status: string;
  booking_type: string | null;
  created_at: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  total_amount: number | null;
  currency: string | null;
  country_code: string;
  city_id: string;
  customer_id: string | null;
  professional_id: string;
  service_name: string | null;
  address: string | null;
};

export type CustomerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type ProfessionalProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type CombinedBooking = {
  id: string;
  status: string;
  booking_type: string | null;
  created_at: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  total_amount: number | null;
  currency: string | null;
  country_code: string;
  city_id: string;
  service_name: string | null;
  address: string | null;
  customer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  professional: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

/**
 * Parse and validate query parameters for booking filtering
 */
export function parseBookingQueryParams(searchParams: URLSearchParams): BookingQueryParams {
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
  const status = searchParams.get("status") as BookingStatus | null;
  const search = searchParams.get("search") || "";
  const country = searchParams.get("country") || null;

  return { page, limit, status, search, country };
}

/**
 * Calculate pagination range (from, to)
 */
export function calculatePaginationRange(
  page: number,
  limit: number
): { from: number; to: number } {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

/**
 * Build booking query with filters and pagination
 */
export function buildBookingQuery(
  supabase: SupabaseClient,
  params: BookingQueryParams,
  from: number,
  to: number
) {
  let query = supabase.from("bookings").select(
    `
      id,
      status,
      booking_type,
      created_at,
      scheduled_start,
      scheduled_end,
      total_amount,
      currency,
      country_code,
      city_id,
      customer_id,
      professional_id,
      service_name,
      address
    `,
    { count: "exact" }
  );

  // Apply status filter
  if (params.status) {
    query = query.eq("status", params.status);
  }

  // Apply country filter (skip if "ALL" or null)
  if (params.country && params.country !== "ALL") {
    query = query.eq("country_code", params.country);
  }

  // Apply search filter (search by service name or address)
  if (params.search) {
    query = query.or(`service_name.ilike.%${params.search}%,address.ilike.%${params.search}%`);
  }

  // Apply pagination and ordering
  query = query.range(from, to).order("created_at", { ascending: false });

  return query;
}

/**
 * Fetch customer and professional profiles for bookings
 */
export async function fetchBookingProfiles(
  supabase: SupabaseClient,
  bookings: BookingData[]
): Promise<{
  customerMap: Map<string, CustomerProfile>;
  professionalMap: Map<string, ProfessionalProfile>;
}> {
  // Extract unique customer and professional IDs
  const customerIds = [
    ...new Set(bookings.map((b) => b.customer_id).filter((id): id is string => id !== null)),
  ];
  const professionalIds = [...new Set(bookings.map((b) => b.professional_id))];

  // Fetch customer profiles
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", customerIds);

  // Fetch professional profiles
  const { data: professionals } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", professionalIds);

  const customerMap = new Map<string, CustomerProfile>((customers || []).map((c) => [c.id, c]));

  const professionalMap = new Map<string, ProfessionalProfile>(
    (professionals || []).map((p) => [p.id, p])
  );

  return { customerMap, professionalMap };
}

/**
 * Combine booking data with customer and professional profiles
 */
export function combineBookingData(
  bookings: BookingData[],
  customerMap: Map<string, CustomerProfile>,
  professionalMap: Map<string, ProfessionalProfile>
): CombinedBooking[] {
  return bookings.map((booking) => {
    const customer = booking.customer_id ? customerMap.get(booking.customer_id) || null : null;
    const professional = professionalMap.get(booking.professional_id) || {
      id: booking.professional_id,
      full_name: null,
      avatar_url: null,
    };

    return {
      id: booking.id,
      status: booking.status,
      booking_type: booking.booking_type,
      created_at: booking.created_at,
      scheduled_start: booking.scheduled_start,
      scheduled_end: booking.scheduled_end,
      total_amount: booking.total_amount,
      currency: booking.currency,
      country_code: booking.country_code,
      city_id: booking.city_id,
      service_name: booking.service_name,
      address: booking.address,
      customer: customer
        ? {
            id: customer.id,
            full_name: customer.full_name,
            avatar_url: customer.avatar_url,
          }
        : null,
      professional: {
        id: professional.id,
        full_name: professional.full_name,
        avatar_url: professional.avatar_url,
      },
    };
  });
}

/**
 * Build pagination metadata
 */
export function buildPaginationMetadata(
  page: number,
  limit: number,
  totalCount: number
): PaginationMetadata {
  return {
    page,
    limit,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
