// Analytics metrics data transformation helpers

export type PerformanceMetricsData = {
  id: string;
  profile_id: string;
  total_bookings?: number | null;
  completed_bookings?: number | null;
  cancelled_bookings?: number | null;
  completion_rate?: number | string | null;
  cancellation_rate?: number | string | null;
  total_revenue_cop?: number | null;
  revenue_last_30_days_cop?: number | null;
  revenue_last_7_days_cop?: number | null;
  average_booking_value_cop?: number | null;
  average_rating?: number | string | null;
  total_reviews?: number | null;
  five_star_count?: number | null;
  four_star_count?: number | null;
  three_star_count?: number | null;
  two_star_count?: number | null;
  one_star_count?: number | null;
  average_response_time_minutes?: number | null;
  on_time_arrival_rate?: number | string | null;
  repeat_customer_rate?: number | string | null;
  bookings_last_30_days?: number | null;
  bookings_last_7_days?: number | null;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
};

export type PerformanceMetrics = {
  id: string;
  profileId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  cancellationRate: number;
  totalRevenueCop: number;
  revenueLast30DaysCop: number;
  revenueLast7DaysCop: number;
  averageBookingValueCop: number;
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  averageResponseTimeMinutes: number;
  onTimeArrivalRate: number;
  repeatCustomerRate: number;
  bookingsLast30Days: number;
  bookingsLast7Days: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Safely parse a value to float with fallback
 */
function parseFloatSafe(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number.parseFloat(String(value));
}

/**
 * Safely get number value with fallback to 0
 */
function getNumberSafe(value: number | null | undefined): number {
  return value ?? 0;
}

/**
 * Transform booking metrics from database format
 */
function transformBookingMetrics(data: PerformanceMetricsData) {
  return {
    totalBookings: getNumberSafe(data.total_bookings),
    completedBookings: getNumberSafe(data.completed_bookings),
    cancelledBookings: getNumberSafe(data.cancelled_bookings),
    completionRate: parseFloatSafe(data.completion_rate),
    cancellationRate: parseFloatSafe(data.cancellation_rate),
  };
}

/**
 * Transform revenue metrics from database format
 */
function transformRevenueMetrics(data: PerformanceMetricsData) {
  return {
    totalRevenueCop: getNumberSafe(data.total_revenue_cop),
    revenueLast30DaysCop: getNumberSafe(data.revenue_last_30_days_cop),
    revenueLast7DaysCop: getNumberSafe(data.revenue_last_7_days_cop),
    averageBookingValueCop: getNumberSafe(data.average_booking_value_cop),
  };
}

/**
 * Transform rating metrics from database format
 */
function transformRatingMetrics(data: PerformanceMetricsData) {
  return {
    averageRating: parseFloatSafe(data.average_rating),
    totalReviews: getNumberSafe(data.total_reviews),
    fiveStarCount: getNumberSafe(data.five_star_count),
    fourStarCount: getNumberSafe(data.four_star_count),
    threeStarCount: getNumberSafe(data.three_star_count),
    twoStarCount: getNumberSafe(data.two_star_count),
    oneStarCount: getNumberSafe(data.one_star_count),
  };
}

/**
 * Transform performance metrics from database format
 */
function transformPerformanceMetrics(data: PerformanceMetricsData) {
  return {
    averageResponseTimeMinutes: getNumberSafe(data.average_response_time_minutes),
    onTimeArrivalRate: parseFloatSafe(data.on_time_arrival_rate),
    repeatCustomerRate: parseFloatSafe(data.repeat_customer_rate),
    bookingsLast30Days: getNumberSafe(data.bookings_last_30_days),
    bookingsLast7Days: getNumberSafe(data.bookings_last_7_days),
  };
}

/**
 * Transform complete performance metrics from RPC result to typed object
 * Reduces complexity by breaking down large mapping into logical groups
 */
export function transformPerformanceMetricsData(data: PerformanceMetricsData): PerformanceMetrics {
  return {
    id: data.id,
    profileId: data.profile_id,
    ...transformBookingMetrics(data),
    ...transformRevenueMetrics(data),
    ...transformRatingMetrics(data),
    ...transformPerformanceMetrics(data),
    lastCalculatedAt: data.last_calculated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
