import { describe, expect, it } from "vitest";
import {
  type CalendarHealthMetrics,
  calculateCalendarHealth,
  calculateHealthMetrics,
  calculateHealthScore,
  generateRecommendations,
  type TravelBufferData,
  type WorkingHoursData,
} from "../calendar-health-calculator";

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const completeWorkingHours: WorkingHoursData[] = [
  { is_available: true }, // Monday
  { is_available: true }, // Tuesday
  { is_available: true }, // Wednesday
  { is_available: true }, // Thursday
  { is_available: true }, // Friday
  { is_available: false }, // Saturday
  { is_available: false }, // Sunday
];

const partialWorkingHours: WorkingHoursData[] = [
  { is_available: true }, // Monday
  { is_available: true }, // Tuesday
  { is_available: false }, // Wednesday
  { is_available: false }, // Thursday
  { is_available: false }, // Friday
  { is_available: false }, // Saturday
  { is_available: false }, // Sunday
];

const completeTravelBuffer: TravelBufferData = {
  service_radius_km: 10,
  travel_buffer_before_minutes: 15,
  travel_buffer_after_minutes: 15,
};

const partialTravelBuffer: TravelBufferData = {
  service_radius_km: 10,
  travel_buffer_before_minutes: null,
  travel_buffer_after_minutes: null,
};

// ============================================================================
// CALCULATE HEALTH METRICS
// ============================================================================

describe("calculateHealthMetrics", () => {
  describe("working hours detection", () => {
    it("detects when working hours are set", () => {
      const metrics = calculateHealthMetrics(completeWorkingHours, null);
      expect(metrics.hasWorkingHours).toBe(true);
    });

    it("detects when working hours are missing", () => {
      const metrics = calculateHealthMetrics(null, null);
      expect(metrics.hasWorkingHours).toBe(false);
    });

    it("detects when working hours array is empty", () => {
      const metrics = calculateHealthMetrics([], null);
      expect(metrics.hasWorkingHours).toBe(false);
    });
  });

  describe("service radius detection", () => {
    it("detects when service radius is set", () => {
      const metrics = calculateHealthMetrics(null, { service_radius_km: 10 });
      expect(metrics.hasServiceRadius).toBe(true);
    });

    it("detects when service radius is missing", () => {
      const metrics = calculateHealthMetrics(null, { service_radius_km: null });
      expect(metrics.hasServiceRadius).toBe(false);
    });

    it("detects when travel buffer data is null", () => {
      const metrics = calculateHealthMetrics(null, null);
      expect(metrics.hasServiceRadius).toBe(false);
    });

    it("considers 0 km as falsy", () => {
      const metrics = calculateHealthMetrics(null, { service_radius_km: 0 });
      expect(metrics.hasServiceRadius).toBe(false);
    });
  });

  describe("travel buffers detection", () => {
    it("detects when both travel buffers are set", () => {
      const metrics = calculateHealthMetrics(null, {
        travel_buffer_before_minutes: 15,
        travel_buffer_after_minutes: 15,
      });
      expect(metrics.hasTravelBuffers).toBe(true);
    });

    it("requires both before and after buffers", () => {
      const onlyBefore = calculateHealthMetrics(null, {
        travel_buffer_before_minutes: 15,
        travel_buffer_after_minutes: null,
      });
      expect(onlyBefore.hasTravelBuffers).toBe(false);

      const onlyAfter = calculateHealthMetrics(null, {
        travel_buffer_before_minutes: null,
        travel_buffer_after_minutes: 15,
      });
      expect(onlyAfter.hasTravelBuffers).toBe(false);
    });

    it("detects when travel buffers are missing", () => {
      const metrics = calculateHealthMetrics(null, null);
      expect(metrics.hasTravelBuffers).toBe(false);
    });

    it("considers 0 minutes as falsy", () => {
      const metrics = calculateHealthMetrics(null, {
        travel_buffer_before_minutes: 0,
        travel_buffer_after_minutes: 0,
      });
      expect(metrics.hasTravelBuffers).toBe(false);
    });
  });

  describe("available days count", () => {
    it("counts available days correctly", () => {
      const metrics = calculateHealthMetrics(completeWorkingHours, null);
      expect(metrics.availableDaysCount).toBe(5); // Mon-Fri
    });

    it("counts partial availability", () => {
      const metrics = calculateHealthMetrics(partialWorkingHours, null);
      expect(metrics.availableDaysCount).toBe(2); // Mon-Tue only
    });

    it("returns 0 when no working hours set", () => {
      const metrics = calculateHealthMetrics(null, null);
      expect(metrics.availableDaysCount).toBe(0);
    });

    it("returns 0 when working hours array is empty", () => {
      const metrics = calculateHealthMetrics([], null);
      expect(metrics.availableDaysCount).toBe(0);
    });

    it("counts all days when all are available", () => {
      const allAvailable: WorkingHoursData[] = Array.from({ length: 7 }, () => ({
        is_available: true,
      }));
      const metrics = calculateHealthMetrics(allAvailable, null);
      expect(metrics.availableDaysCount).toBe(7);
    });

    it("returns 0 when no days are available", () => {
      const noneAvailable: WorkingHoursData[] = Array.from({ length: 7 }, () => ({
        is_available: false,
      }));
      const metrics = calculateHealthMetrics(noneAvailable, null);
      expect(metrics.availableDaysCount).toBe(0);
    });
  });

  describe("complete metrics object", () => {
    it("returns all metrics properties", () => {
      const metrics = calculateHealthMetrics(completeWorkingHours, completeTravelBuffer);

      expect(metrics).toHaveProperty("hasWorkingHours");
      expect(metrics).toHaveProperty("hasServiceRadius");
      expect(metrics).toHaveProperty("hasTravelBuffers");
      expect(metrics).toHaveProperty("availableDaysCount");
    });

    it("handles completely empty calendar", () => {
      const metrics = calculateHealthMetrics(null, null);

      expect(metrics.hasWorkingHours).toBe(false);
      expect(metrics.hasServiceRadius).toBe(false);
      expect(metrics.hasTravelBuffers).toBe(false);
      expect(metrics.availableDaysCount).toBe(0);
    });

    it("handles complete calendar setup", () => {
      const metrics = calculateHealthMetrics(completeWorkingHours, completeTravelBuffer);

      expect(metrics.hasWorkingHours).toBe(true);
      expect(metrics.hasServiceRadius).toBe(true);
      expect(metrics.hasTravelBuffers).toBe(true);
      expect(metrics.availableDaysCount).toBe(5);
    });
  });
});

// ============================================================================
// CALCULATE HEALTH SCORE
// ============================================================================

describe("calculateHealthScore", () => {
  it("returns 100 for perfect calendar setup", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: true,
      hasTravelBuffers: true,
      availableDaysCount: 7,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(100);
  });

  it("returns 0 for completely empty calendar", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: false,
      hasServiceRadius: false,
      hasTravelBuffers: false,
      availableDaysCount: 0,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(0);
  });

  it("awards 40 points for working hours", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: false,
      hasTravelBuffers: false,
      availableDaysCount: 5,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(40);
  });

  it("awards 30 points for service radius", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: false,
      hasServiceRadius: true,
      hasTravelBuffers: false,
      availableDaysCount: 0,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(30);
  });

  it("awards 30 points for travel buffers", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: false,
      hasServiceRadius: false,
      hasTravelBuffers: true,
      availableDaysCount: 0,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(30);
  });

  it("combines working hours + service radius", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: true,
      hasTravelBuffers: false,
      availableDaysCount: 5,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(70); // 40 + 30
  });

  it("combines all components", () => {
    const metrics: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: true,
      hasTravelBuffers: true,
      availableDaysCount: 3,
    };
    const score = calculateHealthScore(metrics);
    expect(score).toBe(100); // 40 + 30 + 30
  });

  it("availableDaysCount does not affect score calculation", () => {
    const lowDays: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: true,
      hasTravelBuffers: true,
      availableDaysCount: 1,
    };

    const highDays: CalendarHealthMetrics = {
      hasWorkingHours: true,
      hasServiceRadius: true,
      hasTravelBuffers: true,
      availableDaysCount: 7,
    };

    expect(calculateHealthScore(lowDays)).toBe(calculateHealthScore(highDays));
  });
});

// ============================================================================
// GENERATE RECOMMENDATIONS
// ============================================================================

describe("generateRecommendations", () => {
  describe("working hours recommendations", () => {
    it("recommends setting working hours when missing", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: false,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 0,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).toContain(
        "Set your working hours to let customers know when you're available"
      );
    });

    it("does not recommend working hours when already set", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).not.toContain(
        "Set your working hours to let customers know when you're available"
      );
    });
  });

  describe("service radius recommendations", () => {
    it("recommends defining service area when missing", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: false,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).toContain(
        "Define your service area to appear in location-based searches"
      );
    });

    it("does not recommend service area when already set", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).not.toContain(
        "Define your service area to appear in location-based searches"
      );
    });
  });

  describe("travel buffer recommendations", () => {
    it("recommends setting travel buffers when missing", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: false,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).toContain(
        "Set travel buffers to prevent double-bookings and account for travel time"
      );
    });

    it("does not recommend travel buffers when already set", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).not.toContain(
        "Set travel buffers to prevent double-bookings and account for travel time"
      );
    });
  });

  describe("available days recommendations", () => {
    it("recommends more days when less than 5", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 4,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).toContain(
        "Add more available days to increase booking opportunities"
      );
    });

    it("does not recommend more days when 5 or more", () => {
      const fiveDays: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const sevenDays: CalendarHealthMetrics = {
        ...fiveDays,
        availableDaysCount: 7,
      };

      expect(generateRecommendations(fiveDays)).not.toContain(
        "Add more available days to increase booking opportunities"
      );
      expect(generateRecommendations(sevenDays)).not.toContain(
        "Add more available days to increase booking opportunities"
      );
    });

    it("recommends more days even when other setup is incomplete", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: false,
        hasServiceRadius: false,
        hasTravelBuffers: false,
        availableDaysCount: 2,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations).toContain(
        "Add more available days to increase booking opportunities"
      );
    });
  });

  describe("multiple recommendations", () => {
    it("returns all recommendations for completely empty calendar", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: false,
        hasServiceRadius: false,
        hasTravelBuffers: false,
        availableDaysCount: 0,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations.length).toBe(4);
      expect(recommendations).toContain(
        "Set your working hours to let customers know when you're available"
      );
      expect(recommendations).toContain(
        "Define your service area to appear in location-based searches"
      );
      expect(recommendations).toContain(
        "Set travel buffers to prevent double-bookings and account for travel time"
      );
      expect(recommendations).toContain(
        "Add more available days to increase booking opportunities"
      );
    });

    it("returns empty array for perfect calendar", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: true,
        hasTravelBuffers: true,
        availableDaysCount: 5,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations.length).toBe(0);
    });

    it("returns partial recommendations for partial setup", () => {
      const metrics: CalendarHealthMetrics = {
        hasWorkingHours: true,
        hasServiceRadius: false,
        hasTravelBuffers: true,
        availableDaysCount: 3,
      };
      const recommendations = generateRecommendations(metrics);

      expect(recommendations.length).toBe(2);
      expect(recommendations).toContain(
        "Define your service area to appear in location-based searches"
      );
      expect(recommendations).toContain(
        "Add more available days to increase booking opportunities"
      );
    });
  });
});

// ============================================================================
// CALCULATE CALENDAR HEALTH (INTEGRATION)
// ============================================================================

describe("calculateCalendarHealth", () => {
  it("returns complete health data for perfect setup", () => {
    const result = calculateCalendarHealth(completeWorkingHours, completeTravelBuffer);

    expect(result.hasWorkingHours).toBe(true);
    expect(result.hasServiceRadius).toBe(true);
    expect(result.hasTravelBuffers).toBe(true);
    expect(result.availableDaysCount).toBe(5);
    expect(result.healthScore).toBe(100);
    expect(result.recommendations).toEqual([]);
  });

  it("returns complete health data for empty setup", () => {
    const result = calculateCalendarHealth(null, null);

    expect(result.hasWorkingHours).toBe(false);
    expect(result.hasServiceRadius).toBe(false);
    expect(result.hasTravelBuffers).toBe(false);
    expect(result.availableDaysCount).toBe(0);
    expect(result.healthScore).toBe(0);
    expect(result.recommendations.length).toBe(4);
  });

  it("returns correct data for partial setup", () => {
    const result = calculateCalendarHealth(partialWorkingHours, partialTravelBuffer);

    expect(result.hasWorkingHours).toBe(true);
    expect(result.hasServiceRadius).toBe(true);
    expect(result.hasTravelBuffers).toBe(false);
    expect(result.availableDaysCount).toBe(2);
    expect(result.healthScore).toBe(70); // 40 + 30
    expect(result.recommendations.length).toBe(2);
    expect(result.recommendations).toContain(
      "Set travel buffers to prevent double-bookings and account for travel time"
    );
    expect(result.recommendations).toContain(
      "Add more available days to increase booking opportunities"
    );
  });

  it("combines all metrics, score, and recommendations", () => {
    const result = calculateCalendarHealth(completeWorkingHours, null);

    // Should have working hours but missing travel data
    expect(result.hasWorkingHours).toBe(true);
    expect(result.hasServiceRadius).toBe(false);
    expect(result.hasTravelBuffers).toBe(false);
    expect(result.availableDaysCount).toBe(5);
    expect(result.healthScore).toBe(40); // Only working hours
    expect(result.recommendations.length).toBe(2);
  });

  it("returns object with all expected properties", () => {
    const result = calculateCalendarHealth(completeWorkingHours, completeTravelBuffer);

    expect(result).toHaveProperty("hasWorkingHours");
    expect(result).toHaveProperty("hasServiceRadius");
    expect(result).toHaveProperty("hasTravelBuffers");
    expect(result).toHaveProperty("availableDaysCount");
    expect(result).toHaveProperty("healthScore");
    expect(result).toHaveProperty("recommendations");
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("Edge cases", () => {
  it("handles single available day", () => {
    const singleDay: WorkingHoursData[] = [
      { is_available: true },
      { is_available: false },
      { is_available: false },
      { is_available: false },
      { is_available: false },
      { is_available: false },
      { is_available: false },
    ];

    const result = calculateCalendarHealth(singleDay, null);
    expect(result.availableDaysCount).toBe(1);
    expect(result.recommendations).toContain(
      "Add more available days to increase booking opportunities"
    );
  });

  it("handles very large service radius", () => {
    const largeRadius: TravelBufferData = {
      service_radius_km: 1000,
    };

    const metrics = calculateHealthMetrics(null, largeRadius);
    expect(metrics.hasServiceRadius).toBe(true);
  });

  it("handles very large travel buffers", () => {
    const largeBuffers: TravelBufferData = {
      travel_buffer_before_minutes: 120,
      travel_buffer_after_minutes: 120,
    };

    const metrics = calculateHealthMetrics(null, largeBuffers);
    expect(metrics.hasTravelBuffers).toBe(true);
  });

  it("handles exactly 5 available days (boundary)", () => {
    const fiveDays: WorkingHoursData[] = Array.from({ length: 7 }, (_, i) => ({
      is_available: i < 5,
    }));

    const result = calculateCalendarHealth(fiveDays, null);
    expect(result.availableDaysCount).toBe(5);
    expect(result.recommendations).not.toContain(
      "Add more available days to increase booking opportunities"
    );
  });

  it("handles exactly 4 available days (boundary)", () => {
    const fourDays: WorkingHoursData[] = Array.from({ length: 7 }, (_, i) => ({
      is_available: i < 4,
    }));

    const result = calculateCalendarHealth(fourDays, null);
    expect(result.availableDaysCount).toBe(4);
    expect(result.recommendations).toContain(
      "Add more available days to increase booking opportunities"
    );
  });
});
