/**
 * Analytics Calculations Service
 * Pure calculation functions for analytics metrics
 * Reduces complexity of analytics-dashboard component
 */

type Booking = {
  id: string;
  status: string;
  created_at: string;
  customer_id: string | null;
  professional_id: string | null;
  amount_estimated: number | null;
  service_category: string | null;
  city: string | null;
};

type Professional = {
  id: string;
  role: string;
  created_at: string;
  approval_date: string | null;
};

/**
 * Calculate fill rate (% of booking requests accepted)
 */
export function calculateFillRate(bookings: Booking[] | null): number {
  if (!bookings || bookings.length === 0) {
    return 0;
  }

  const totalBookings = bookings.length;
  const acceptedBookings = bookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "pending_payment"
  ).length;

  return (acceptedBookings / totalBookings) * 100;
}

/**
 * Calculate average time from professional approval to first booking
 */
export function calculateAvgTimeToFirstBooking(
  professionals: Professional[] | null,
  bookings: Booking[] | null
): number {
  if (!(professionals && bookings)) {
    return 0;
  }

  const daysDiffs = professionals
    .map((pro) => {
      const firstBooking = bookings
        .filter((b) => b.professional_id === pro.id && b.status !== "cancelled")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

      if (!(firstBooking && pro.approval_date)) {
        return null;
      }

      const approvalDate = new Date(pro.approval_date);
      const firstBookingDate = new Date(firstBooking.created_at);
      const daysDiff = Math.floor(
        (firstBookingDate.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysDiff >= 0 ? daysDiff : null;
    })
    .filter((days): days is number => days !== null);

  if (daysDiffs.length === 0) {
    return 0;
  }

  return daysDiffs.reduce((sum, days) => sum + days, 0) / daysDiffs.length;
}

/**
 * Calculate repeat booking rate (% of customers with 2+ bookings)
 */
export function calculateRepeatBookingRate(bookings: Booking[] | null): number {
  if (!bookings) {
    return 0;
  }

  const customerBookingCounts = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.customer_id && booking.status !== "cancelled") {
      customerBookingCounts.set(
        booking.customer_id,
        (customerBookingCounts.get(booking.customer_id) || 0) + 1
      );
    }
  }

  const customersWithMultipleBookings = Array.from(customerBookingCounts.values()).filter(
    (count) => count >= 2
  ).length;

  const totalUniqueCustomers = customerBookingCounts.size;
  return totalUniqueCustomers > 0
    ? (customersWithMultipleBookings / totalUniqueCustomers) * 100
    : 0;
}

/**
 * Calculate number of active professionals (with bookings in last 30 days)
 */
export function calculateActiveProfessionals(bookings: Booking[] | null): number {
  if (!bookings) {
    return 0;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeProfessionalIds = new Set(
    bookings
      .filter((b) => new Date(b.created_at) >= thirtyDaysAgo && b.status !== "cancelled")
      .map((b) => b.professional_id)
  );

  return activeProfessionalIds.size;
}

/**
 * City-level metrics type
 */
export type CityMetrics = {
  city: string;
  fillRate: number;
  avgTimeToFirstBooking: number;
  bookingCount: number;
  professionalCount: number;
};

/**
 * Calculate metrics by city
 */
export function calculateCityMetrics(
  bookings: Booking[] | null,
  professionals: Professional[] | null
): CityMetrics[] {
  if (!bookings) {
    return [];
  }

  const citiesMap = new Map<
    string,
    { total: number; accepted: number; professionals: Set<string>; ttfbDays: number[] }
  >();

  // Aggregate booking data by city
  for (const booking of bookings) {
    const city = booking.city || "Unknown";
    if (!citiesMap.has(city)) {
      citiesMap.set(city, { total: 0, accepted: 0, professionals: new Set(), ttfbDays: [] });
    }

    const cityData = citiesMap.get(city)!;
    cityData.total++;
    if (booking.status !== "cancelled" && booking.status !== "pending_payment") {
      cityData.accepted++;
    }
    if (booking.professional_id) {
      cityData.professionals.add(booking.professional_id);
    }
  }

  // Add time-to-first-booking data
  if (professionals) {
    for (const pro of professionals) {
      const firstBooking = bookings
        .filter((b) => b.professional_id === pro.id && b.status !== "cancelled")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

      if (firstBooking && pro.approval_date && firstBooking.city) {
        const approvalDate = new Date(pro.approval_date);
        const firstBookingDate = new Date(firstBooking.created_at);
        const daysDiff = Math.floor(
          (firstBookingDate.getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff >= 0) {
          const cityData = citiesMap.get(firstBooking.city);
          if (cityData) {
            cityData.ttfbDays.push(daysDiff);
          }
        }
      }
    }
  }

  // Convert to array and sort
  return Array.from(citiesMap.entries())
    .map(([city, data]) => ({
      city,
      fillRate: data.total > 0 ? (data.accepted / data.total) * 100 : 0,
      avgTimeToFirstBooking:
        data.ttfbDays.length > 0
          ? data.ttfbDays.reduce((sum, d) => sum + d, 0) / data.ttfbDays.length
          : 0,
      bookingCount: data.total,
      professionalCount: data.professionals.size,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);
}

/**
 * Category-level metrics type
 */
export type CategoryMetrics = {
  category: string;
  fillRate: number;
  bookingCount: number;
  avgPrice: number;
};

/**
 * Calculate metrics by service category
 */
export function calculateCategoryMetrics(bookings: Booking[] | null): CategoryMetrics[] {
  if (!bookings) {
    return [];
  }

  const categoriesMap = new Map<string, { total: number; accepted: number; totalAmount: number }>();

  for (const booking of bookings) {
    const category = booking.service_category || "Unknown";
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, { total: 0, accepted: 0, totalAmount: 0 });
    }

    const categoryData = categoriesMap.get(category)!;
    categoryData.total++;
    if (booking.status !== "cancelled" && booking.status !== "pending_payment") {
      categoryData.accepted++;
      categoryData.totalAmount += booking.amount_estimated || 0;
    }
  }

  return Array.from(categoriesMap.entries())
    .map(([category, data]) => ({
      category,
      fillRate: data.total > 0 ? (data.accepted / data.total) * 100 : 0,
      bookingCount: data.total,
      avgPrice: data.accepted > 0 ? data.totalAmount / data.accepted : 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount);
}
