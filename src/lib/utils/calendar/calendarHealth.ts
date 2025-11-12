// Calendar health calculator - Extract health score and recommendations logic

export type WorkingHoursData = {
  is_available: boolean;
};

export type TravelBufferData = {
  service_radius_km?: number | null;
  travel_buffer_before_minutes?: number | null;
  travel_buffer_after_minutes?: number | null;
};

export type CalendarHealthMetrics = {
  hasWorkingHours: boolean;
  hasServiceRadius: boolean;
  hasTravelBuffers: boolean;
  availableDaysCount: number;
};

export type CalendarHealthScore = {
  healthScore: number;
  recommendations: string[];
};

/**
 * Calculate calendar health metrics from database data
 */
export function calculateHealthMetrics(
  workingHoursData: WorkingHoursData[] | null,
  travelBufferData: TravelBufferData | null
): CalendarHealthMetrics {
  const hasWorkingHours = Boolean(workingHoursData && workingHoursData.length > 0);
  const hasServiceRadius = Boolean(travelBufferData?.service_radius_km);
  const hasTravelBuffers = Boolean(
    travelBufferData?.travel_buffer_before_minutes && travelBufferData?.travel_buffer_after_minutes
  );

  const availableDaysCount = workingHoursData
    ? workingHoursData.filter((h) => h.is_available).length
    : 0;

  return {
    hasWorkingHours,
    hasServiceRadius,
    hasTravelBuffers,
    availableDaysCount,
  };
}

/**
 * Calculate health score from metrics (0-100)
 */
export function calculateHealthScore(metrics: CalendarHealthMetrics): number {
  let healthScore = 0;

  if (metrics.hasWorkingHours) {
    healthScore += 40;
  }

  if (metrics.hasServiceRadius) {
    healthScore += 30;
  }

  if (metrics.hasTravelBuffers) {
    healthScore += 30;
  }

  return healthScore;
}

/**
 * Generate recommendations based on missing calendar setup
 */
export function generateRecommendations(metrics: CalendarHealthMetrics): string[] {
  const recommendations: string[] = [];

  if (!metrics.hasWorkingHours) {
    recommendations.push("Set your working hours to let customers know when you're available");
  }

  if (!metrics.hasServiceRadius) {
    recommendations.push("Define your service area to appear in location-based searches");
  }

  if (!metrics.hasTravelBuffers) {
    recommendations.push(
      "Set travel buffers to prevent double-bookings and account for travel time"
    );
  }

  if (metrics.availableDaysCount < 5) {
    recommendations.push("Add more available days to increase booking opportunities");
  }

  return recommendations;
}

/**
 * Calculate complete calendar health score with recommendations
 */
export function calculateCalendarHealth(
  workingHoursData: WorkingHoursData[] | null,
  travelBufferData: TravelBufferData | null
): CalendarHealthMetrics & CalendarHealthScore {
  const metrics = calculateHealthMetrics(workingHoursData, travelBufferData);
  const healthScore = calculateHealthScore(metrics);
  const recommendations = generateRecommendations(metrics);

  return {
    ...metrics,
    healthScore,
    recommendations,
  };
}
