/**
 * Professional Performance Metrics Types
 * Sprint 2: Performance Metrics & Insights
 */

// ============================================================================
// Core Analytics Types
// ============================================================================

export type PerformanceMetrics = {
  id: string;
  profileId: string;

  // Booking Metrics
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number; // Percentage (0-100)
  cancellationRate: number; // Percentage (0-100)

  // Revenue Metrics (in COP)
  totalRevenueCop: number;
  revenueLast30DaysCop: number;
  revenueLast7DaysCop: number;
  averageBookingValueCop: number;

  // Customer Satisfaction Metrics
  averageRating: number; // 0.00 to 5.00
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;

  // Performance Metrics
  averageResponseTimeMinutes: number;
  onTimeArrivalRate: number; // Percentage (0-100)
  repeatCustomerRate: number; // Percentage (0-100)

  // Time-based Metrics
  bookingsLast30Days: number;
  bookingsLast7Days: number;

  // Metadata
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type RevenueSnapshot = {
  id: string;
  profileId: string;
  snapshotDate: string; // ISO date string
  periodType: "daily" | "weekly" | "monthly";
  totalRevenueCop: number;
  completedBookings: number;
  averageBookingValueCop: number;
  createdAt: string;
};

export type RevenueTrendDataPoint = {
  date: string; // ISO date string
  revenueCop: number;
  bookingsCount: number;
};

export type PerformanceSummary = {
  totalBookings: number;
  completionRate: number;
  averageRating: number;
  totalRevenueCop: number;
  revenueLast30DaysCop: number;
  bookingsLast30Days: number;
  averageBookingValueCop: number;
  repeatCustomerRate: number;
};

export type BookingMetrics = {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  completionRate: number;
  cancellationRate: number;
};

export type RevenueMetrics = {
  totalRevenueCop: number;
  revenueLast30DaysCop: number;
  revenueLast7DaysCop: number;
  averageBookingValueCop: number;
  revenueGrowth: number; // Percentage change from previous period
  trend: RevenueTrendDataPoint[];
};

export type SatisfactionMetrics = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  satisfactionRate: number; // Percentage of 4+ star ratings
};

export type TopProfessional = {
  profileId: string;
  fullName: string;
  completionRate: number;
  totalBookings: number;
  averageRating: number;
};

// ============================================================================
// Dashboard Aggregated Types
// ============================================================================

export type AnalyticsDashboard = {
  performanceMetrics: PerformanceMetrics;
  bookingMetrics: BookingMetrics;
  revenueMetrics: RevenueMetrics;
  satisfactionMetrics: SatisfactionMetrics;
  recentTrend: RevenueTrendDataPoint[];
};

// ============================================================================
// Server Action Response Types
// ============================================================================

export type GetPerformanceMetricsResponse =
  | {
      success: true;
      metrics: PerformanceMetrics;
    }
  | {
      success: false;
      error: string;
    };

export type GetPerformanceSummaryResponse =
  | {
      success: true;
      summary: PerformanceSummary;
    }
  | {
      success: false;
      error: string;
    };

export type GetRevenueTrendResponse =
  | {
      success: true;
      trend: RevenueTrendDataPoint[];
    }
  | {
      success: false;
      error: string;
    };

export type GetTopProfessionalsResponse =
  | {
      success: true;
      professionals: TopProfessional[];
    }
  | {
      success: false;
      error: string;
    };

export type GetAnalyticsDashboardResponse =
  | {
      success: true;
      dashboard: AnalyticsDashboard;
    }
  | {
      success: false;
      error: string;
    };

export type InitializeMetricsResponse =
  | {
      success: true;
      metrics: PerformanceMetrics;
    }
  | {
      success: false;
      error: string;
    };

export type GenerateSnapshotResponse =
  | {
      success: true;
      snapshot: RevenueSnapshot;
    }
  | {
      success: false;
      error: string;
    };

// ============================================================================
// Chart/Visualization Types
// ============================================================================

export type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

export type TimeSeriesDataPoint = {
  timestamp: string;
  value: number;
  label?: string;
};

export type ComparisonMetric = {
  current: number;
  previous: number;
  change: number; // Percentage change
  trend: "up" | "down" | "stable";
};
