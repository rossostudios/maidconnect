/**
 * Tests for Availability Calculation Utilities
 *
 * CRITICAL: These tests ensure correct booking slot availability calculations.
 * Bugs here could lead to double-bookings or incorrect availability displays.
 *
 * Tests cover:
 * - Working hours and time slot generation
 * - Blocked dates and buffer times
 * - Instant booking eligibility
 * - Conflict detection with existing bookings
 * - Availability status calculation
 */

import { describe, expect, it } from "vitest";
import {
  calculateDayStatus,
  canInstantBook,
  formatDate,
  generateTimeSlots,
  getAvailabilityForRange,
  getNextAvailableDate,
  getWorkingHoursForDate,
  isDateBlocked,
  isSlotAvailable,
  type AvailabilitySettings,
  type InstantBookingSettings,
  type WorkingHours,
} from "../availability";

// ============================================================================
// TEST DATA
// ============================================================================

const standardWorkingHours: WorkingHours = {
  monday: [{ start: "09:00", end: "17:00" }],
  tuesday: [{ start: "09:00", end: "17:00" }],
  wednesday: [{ start: "09:00", end: "17:00" }],
  thursday: [{ start: "09:00", end: "17:00" }],
  friday: [{ start: "09:00", end: "17:00" }],
};

const splitShiftHours: WorkingHours = {
  monday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "18:00" },
  ],
  wednesday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "18:00" },
  ],
  friday: [
    { start: "09:00", end: "12:00" },
    { start: "14:00", end: "18:00" },
  ],
};

const standardSettings: AvailabilitySettings = {
  working_hours: standardWorkingHours,
  buffer_time_minutes: 15,
  max_bookings_per_day: 5,
  advance_booking_days: 30,
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

describe("formatDate", () => {
  it("formats date as YYYY-MM-DD", () => {
    const date = new Date("2024-12-25T14:30:00Z");
    expect(formatDate(date)).toBe("2024-12-25");
  });

  it("pads single-digit months", () => {
    const date = new Date("2024-03-05T00:00:00Z");
    expect(formatDate(date)).toBe("2024-03-05");
  });

  it("handles different timezones consistently", () => {
    const date1 = new Date("2024-12-25T00:00:00Z");
    const date2 = new Date("2024-12-25T23:59:59Z");

    expect(formatDate(date1)).toBe("2024-12-25");
    expect(formatDate(date2)).toBe("2024-12-25");
  });

  it("handles year boundaries", () => {
    const newYear = new Date("2024-01-01T00:00:00Z");
    expect(formatDate(newYear)).toBe("2024-01-01");

    const newYearsEve = new Date("2024-12-31T23:59:59Z");
    expect(formatDate(newYearsEve)).toBe("2024-12-31");
  });
});

// ============================================================================
// BLOCKED DATES
// ============================================================================

describe("isDateBlocked", () => {
  const blockedDates = ["2024-12-25", "2024-12-26", "2024-01-01"];

  it("returns true for blocked dates", () => {
    const christmas = new Date("2024-12-25T10:00:00Z");
    expect(isDateBlocked(christmas, blockedDates)).toBe(true);
  });

  it("returns false for non-blocked dates", () => {
    const normalDay = new Date("2024-12-24T10:00:00Z");
    expect(isDateBlocked(normalDay, blockedDates)).toBe(false);
  });

  it("handles empty blocked dates array", () => {
    const anyDate = new Date("2024-12-25T10:00:00Z");
    expect(isDateBlocked(anyDate, [])).toBe(false);
  });

  it("compares dates correctly regardless of time", () => {
    const morning = new Date("2024-12-25T08:00:00Z");
    const evening = new Date("2024-12-25T20:00:00Z");

    expect(isDateBlocked(morning, blockedDates)).toBe(true);
    expect(isDateBlocked(evening, blockedDates)).toBe(true);
  });
});

// ============================================================================
// WORKING HOURS
// ============================================================================

describe("getWorkingHoursForDate", () => {
  it("returns working hours for weekdays", () => {
    const monday = new Date("2024-12-23T00:00:00Z"); // Monday
    const hours = getWorkingHoursForDate(monday, standardSettings);

    expect(hours).toEqual([{ start: "09:00", end: "17:00" }]);
  });

  it("returns empty array for weekend if not configured", () => {
    const saturday = new Date("2024-12-21T00:00:00Z"); // Saturday
    const sunday = new Date("2024-12-22T00:00:00Z"); // Sunday

    expect(getWorkingHoursForDate(saturday, standardSettings)).toEqual([]);
    expect(getWorkingHoursForDate(sunday, standardSettings)).toEqual([]);
  });

  it("handles split shift hours", () => {
    const settings: AvailabilitySettings = {
      working_hours: splitShiftHours,
    };

    const monday = new Date("2024-12-23T00:00:00Z");
    const hours = getWorkingHoursForDate(monday, settings);

    expect(hours).toHaveLength(2);
    expect(hours[0]).toEqual({ start: "09:00", end: "12:00" });
    expect(hours[1]).toEqual({ start: "14:00", end: "18:00" });
  });

  it("returns empty array for days without hours", () => {
    const settings: AvailabilitySettings = {
      working_hours: splitShiftHours,
    };

    const tuesday = new Date("2024-12-24T00:00:00Z"); // Not in splitShiftHours
    expect(getWorkingHoursForDate(tuesday, settings)).toEqual([]);
  });

  it("handles missing working_hours gracefully", () => {
    const invalidSettings = {} as AvailabilitySettings;
    const anyDate = new Date("2024-12-23T00:00:00Z");

    expect(getWorkingHoursForDate(anyDate, invalidSettings)).toEqual([]);
  });
});

// ============================================================================
// TIME SLOT GENERATION
// ============================================================================

describe("generateTimeSlots", () => {
  describe("basic slot generation", () => {
    it("generates slots for working hours", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const slots = generateTimeSlots(monday, standardSettings, [], []);

      expect(slots.length).toBeGreaterThan(0);
      expect(slots).toContain("09:00");
      expect(slots).toContain("09:30");
      expect(slots).toContain("16:00"); // Last slot before 17:00 end
    });

    it("returns empty for blocked dates", () => {
      const blockedDate = new Date("2024-12-25T00:00:00Z");
      const slots = generateTimeSlots(blockedDate, standardSettings, [], ["2024-12-25"]);

      expect(slots).toEqual([]);
    });

    it("returns empty for non-working days", () => {
      const saturday = new Date("2024-12-21T00:00:00Z");
      const slots = generateTimeSlots(saturday, standardSettings, [], []);

      expect(slots).toEqual([]);
    });

    it("generates slots at 30-minute intervals", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const slots = generateTimeSlots(monday, standardSettings, [], []);

      expect(slots).toContain("09:00");
      expect(slots).toContain("09:30");
      expect(slots).toContain("10:00");
      expect(slots).toContain("10:30");
    });
  });

  describe("slot duration", () => {
    it("respects custom slot duration", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const slots120 = generateTimeSlots(monday, standardSettings, [], [], 120);

      // 2-hour slots: should not include 16:00 (would end at 18:00, beyond 17:00)
      expect(slots120).toContain("09:00");
      expect(slots120).toContain("15:00"); // Last 2-hour slot (ends at 17:00)
      expect(slots120).not.toContain("16:00"); // Would end at 18:00
    });
  });

  describe("existing bookings conflict", () => {
    it("excludes slots conflicting with bookings", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const existingBookings = [
        {
          scheduled_start: "2024-12-23T10:00:00Z",
          scheduled_end: "2024-12-23T11:00:00Z",
        },
      ];

      const slots = generateTimeSlots(monday, standardSettings, existingBookings, [], 30);

      expect(slots).toContain("09:00");
      expect(slots).not.toContain("10:00"); // Conflicts with booking
      expect(slots).not.toContain("10:30"); // Still within booking
      expect(slots).not.toContain("11:00"); // 30-min slot would overlap with 15-min buffer
      expect(slots).toContain("11:30"); // After booking + buffer
    });

    it("applies buffer time around bookings", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const settings: AvailabilitySettings = {
        ...standardSettings,
        buffer_time_minutes: 30,
      };

      const existingBookings = [
        {
          scheduled_start: "2024-12-23T10:00:00Z",
          scheduled_end: "2024-12-23T11:00:00Z",
        },
      ];

      const slots = generateTimeSlots(monday, settings, existingBookings, [], 30);

      expect(slots).toContain("09:00");
      expect(slots).not.toContain("09:30"); // Within 30min buffer before
      expect(slots).not.toContain("10:00"); // During booking
      expect(slots).not.toContain("11:00"); // Within 30min buffer after
      expect(slots).toContain("11:30"); // After buffer
    });

    it("handles multiple bookings", () => {
      const monday = new Date("2024-12-23T00:00:00Z");
      const existingBookings = [
        {
          scheduled_start: "2024-12-23T09:00:00Z",
          scheduled_end: "2024-12-23T10:00:00Z",
        },
        {
          scheduled_start: "2024-12-23T14:00:00Z",
          scheduled_end: "2024-12-23T15:00:00Z",
        },
      ];

      const slots = generateTimeSlots(monday, standardSettings, existingBookings, [], 30);

      expect(slots).not.toContain("09:00"); // Conflicts with first booking
      expect(slots).not.toContain("10:00"); // 30-min slot would overlap with 15-min buffer
      expect(slots).toContain("10:30"); // After first booking + buffer
      expect(slots).not.toContain("14:00"); // Conflicts with second booking
      expect(slots).not.toContain("15:00"); // 30-min slot would overlap with 15-min buffer
      expect(slots).toContain("15:30"); // After second booking + buffer
    });
  });

  describe("split shift hours", () => {
    it("generates slots for split shifts", () => {
      const settings: AvailabilitySettings = {
        working_hours: splitShiftHours,
        buffer_time_minutes: 0,
      };

      const monday = new Date("2024-12-23T00:00:00Z");
      const slots = generateTimeSlots(monday, settings, [], [], 30);

      // Morning shift: 09:00-12:00
      expect(slots).toContain("09:00");
      expect(slots).toContain("11:30"); // Last morning slot

      // Lunch break: no slots
      expect(slots).not.toContain("12:30");
      expect(slots).not.toContain("13:00");

      // Afternoon shift: 14:00-18:00
      expect(slots).toContain("14:00");
      expect(slots).toContain("17:30"); // Last afternoon slot
    });
  });
});

// ============================================================================
// INSTANT BOOKING
// ============================================================================

describe("canInstantBook", () => {
  const settings: InstantBookingSettings = {
    min_notice_hours: 24,
    max_booking_duration_hours: 8,
    auto_accept_recurring: false,
    only_verified_customers: true,
  };

  it("allows booking with sufficient notice", () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 48); // 48 hours ahead

    const result = canInstantBook(tomorrow, 4, settings);

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("rejects booking with insufficient notice", () => {
    const soon = new Date();
    soon.setHours(soon.getHours() + 12); // Only 12 hours ahead

    const result = canInstantBook(soon, 4, settings);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("24 hours notice");
  });

  it("rejects booking exceeding max duration", () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 48);

    const result = canInstantBook(tomorrow, 10, settings); // 10 hours > 8 max

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Maximum duration is 8 hours");
  });

  it("rejects recurring without auto_accept_recurring", () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 48);

    const result = canInstantBook(tomorrow, 4, settings, true); // isRecurring = true

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Recurring bookings require approval");
  });

  it("allows recurring when auto_accept_recurring is true", () => {
    const recurringSettings: InstantBookingSettings = {
      ...settings,
      auto_accept_recurring: true,
    };

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 48);

    const result = canInstantBook(tomorrow, 4, recurringSettings, true);

    expect(result.allowed).toBe(true);
  });

  it("allows booking at exact minimum notice", () => {
    const exactTime = new Date();
    exactTime.setHours(exactTime.getHours() + 24); // Exactly 24 hours

    const result = canInstantBook(exactTime, 4, settings);

    expect(result.allowed).toBe(true);
  });
});

// ============================================================================
// DAY STATUS CALCULATION
// ============================================================================

describe("calculateDayStatus", () => {
  const date = new Date("2024-12-23T00:00:00Z");

  it("returns 'blocked' for blocked dates", () => {
    const status = calculateDayStatus(date, ["09:00", "10:00"], 0, 5, ["2024-12-23"]);
    expect(status).toBe("blocked");
  });

  it("returns 'booked' when max bookings reached", () => {
    const status = calculateDayStatus(date, ["09:00", "10:00"], 5, 5, []);
    expect(status).toBe("booked");
  });

  it("returns 'booked' when no slots available", () => {
    const status = calculateDayStatus(date, [], 2, 5, []);
    expect(status).toBe("booked");
  });

  it("returns 'limited' when few slots remain", () => {
    const status = calculateDayStatus(date, ["09:00", "10:00"], 2, 5, []);
    expect(status).toBe("limited"); // 2 slots <= 2 threshold
  });

  it("returns 'limited' when booking count near max (70%)", () => {
    const status = calculateDayStatus(date, ["09:00", "10:00", "11:00"], 4, 5, []);
    expect(status).toBe("limited"); // 4/5 = 80% >= 70%
  });

  it("returns 'available' with many slots and low bookings", () => {
    const status = calculateDayStatus(
      date,
      ["09:00", "10:00", "11:00", "12:00", "13:00"],
      1,
      5,
      []
    );
    expect(status).toBe("available");
  });
});

// ============================================================================
// SLOT AVAILABILITY CHECK
// ============================================================================

describe("isSlotAvailable", () => {
  const monday = new Date("2024-12-23T00:00:00Z");

  it("returns true for available slot", () => {
    const available = isSlotAvailable(monday, "10:00", 60, standardSettings, [], []);
    expect(available).toBe(true);
  });

  it("returns false for blocked date", () => {
    const available = isSlotAvailable(monday, "10:00", 60, standardSettings, [], ["2024-12-23"]);
    expect(available).toBe(false);
  });

  it("returns false for non-working day", () => {
    const saturday = new Date("2024-12-21T00:00:00Z");
    const available = isSlotAvailable(saturday, "10:00", 60, standardSettings, [], []);
    expect(available).toBe(false);
  });

  it("returns false for slot outside working hours", () => {
    const available = isSlotAvailable(monday, "18:00", 60, standardSettings, [], []);
    expect(available).toBe(false); // Would end at 19:00, beyond 17:00
  });

  it("returns false when slot conflicts with booking", () => {
    const existingBookings = [
      {
        scheduled_start: "2024-12-23T10:00:00Z",
        scheduled_end: "2024-12-23T11:00:00Z",
      },
    ];

    const available = isSlotAvailable(monday, "10:00", 60, standardSettings, existingBookings, []);
    expect(available).toBe(false);
  });

  it("considers buffer time in conflict detection", () => {
    const settings: AvailabilitySettings = {
      ...standardSettings,
      buffer_time_minutes: 30,
    };

    const existingBookings = [
      {
        scheduled_start: "2024-12-23T11:00:00Z",
        scheduled_end: "2024-12-23T12:00:00Z",
      },
    ];

    // 10:00-11:00 slot would conflict with 30min buffer before 11:00 booking
    const available = isSlotAvailable(monday, "10:00", 60, settings, existingBookings, []);
    expect(available).toBe(false);
  });

  it("returns true when slot is after buffered booking", () => {
    const settings: AvailabilitySettings = {
      ...standardSettings,
      buffer_time_minutes: 15,
    };

    const existingBookings = [
      {
        scheduled_start: "2024-12-23T09:00:00Z",
        scheduled_end: "2024-12-23T10:00:00Z",
      },
    ];

    // 10:30-11:30 is after 10:00 + 15min buffer = 10:15
    const available = isSlotAvailable(monday, "10:30", 60, settings, existingBookings, []);
    expect(available).toBe(true);
  });
});

// ============================================================================
// NEXT AVAILABLE DATE
// ============================================================================

describe("getNextAvailableDate", () => {
  it("finds next available date", () => {
    const nextDate = getNextAvailableDate(standardSettings, [], []);

    expect(nextDate).not.toBeNull();
    if (nextDate) {
      const today = new Date();
      expect(nextDate.getTime()).toBeGreaterThan(today.getTime());
    }
  });

  it("skips blocked dates", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    const nextDate = getNextAvailableDate(standardSettings, [], [tomorrowStr]);

    expect(nextDate).not.toBeNull();
    if (nextDate) {
      expect(formatDate(nextDate)).not.toBe(tomorrowStr);
    }
  });

  it("skips fully booked days", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Create bookings that fill entire day
    const existingBookings = [
      {
        scheduled_start: tomorrow.toISOString().replace(/T.*/, "T09:00:00Z"),
        scheduled_end: tomorrow.toISOString().replace(/T.*/, "T17:00:00Z"),
      },
    ];

    const nextDate = getNextAvailableDate(standardSettings, existingBookings, []);

    expect(nextDate).not.toBeNull();
    if (nextDate) {
      // Should be at least 2 days ahead (skipped tomorrow)
      const twoDaysAhead = new Date();
      twoDaysAhead.setDate(twoDaysAhead.getDate() + 2);
      expect(nextDate.getTime()).toBeGreaterThanOrEqual(twoDaysAhead.getTime() - 86400000);
    }
  });

  it("returns null when no availability within max days", () => {
    // Block all days for next 30 days
    const blockedDates: string[] = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      blockedDates.push(formatDate(date));
    }

    const nextDate = getNextAvailableDate(standardSettings, [], blockedDates, 30);
    expect(nextDate).toBeNull();
  });

  it("respects maxDaysAhead parameter", () => {
    const nextDate = getNextAvailableDate(standardSettings, [], [], 7);

    if (nextDate) {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);

      expect(nextDate.getTime()).toBeLessThanOrEqual(weekAhead.getTime());
    }
  });
});

// ============================================================================
// AVAILABILITY RANGE
// ============================================================================

describe("getAvailabilityForRange", () => {
  it("returns availability for date range", () => {
    const start = new Date("2024-12-23T00:00:00Z"); // Monday
    const end = new Date("2024-12-27T00:00:00Z"); // Friday

    const availability = getAvailabilityForRange(start, end, standardSettings, [], []);

    expect(availability).toHaveLength(5); // Mon-Fri
    expect(availability[0].date).toBe("2024-12-23");
    expect(availability[4].date).toBe("2024-12-27");
  });

  it("marks blocked dates correctly", () => {
    const start = new Date("2024-12-23T00:00:00Z");
    const end = new Date("2024-12-25T00:00:00Z");

    const availability = getAvailabilityForRange(start, end, standardSettings, [], ["2024-12-25"]);

    const christmas = availability.find((day) => day.date === "2024-12-25");
    expect(christmas?.status).toBe("blocked");
    expect(christmas?.availableSlots).toEqual([]);
  });

  it("counts bookings per day correctly", () => {
    const start = new Date("2024-12-23T00:00:00Z");
    const end = new Date("2024-12-23T00:00:00Z");

    const existingBookings = [
      {
        scheduled_start: "2024-12-23T09:00:00Z",
        scheduled_end: "2024-12-23T10:00:00Z",
      },
      {
        scheduled_start: "2024-12-23T14:00:00Z",
        scheduled_end: "2024-12-23T15:00:00Z",
      },
    ];

    const availability = getAvailabilityForRange(start, end, standardSettings, existingBookings, []);

    expect(availability[0].bookingCount).toBe(2);
  });

  it("includes available slots for each day", () => {
    const start = new Date("2024-12-23T00:00:00Z");
    const end = new Date("2024-12-23T00:00:00Z");

    const availability = getAvailabilityForRange(start, end, standardSettings, [], []);

    expect(availability[0].availableSlots.length).toBeGreaterThan(0);
    expect(availability[0].availableSlots).toContain("09:00");
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("edge cases", () => {
  it("handles midnight rollover correctly", () => {
    const lateNight = new Date("2024-12-23T23:59:59Z");
    expect(formatDate(lateNight)).toBe("2024-12-23");
  });

  it("handles leap year dates", () => {
    const leapDay = new Date("2024-02-29T00:00:00Z");
    expect(formatDate(leapDay)).toBe("2024-02-29");
  });

  it("handles daylight saving time transitions", () => {
    // Just ensure no crashes, date formatting should be consistent
    const dstDate = new Date("2024-03-10T10:00:00Z"); // DST in US
    expect(formatDate(dstDate)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
