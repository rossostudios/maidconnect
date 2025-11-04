/**
 * Tests for formatting utilities
 */

import { describe, expect, it } from "vitest";
import {
  formatCOP,
  formatCurrency,
  formatDate,
  formatDateLong,
  formatDateShort,
  formatDateTime,
  formatDuration,
  formatDurationHours,
  formatNumber,
  formatPercentage,
  formatTime,
  formatTime12,
  formatTime24,
  formatUSD,
} from "../format";

// ============================================================================
// TEST REGEX PATTERNS (defined at top-level for performance)
// ============================================================================
const PATTERN_50000 = /50,000/;
const PATTERN_50 = /50/;
const PATTERN_DEC = /Dec/;
const PATTERN_25 = /25/;
const PATTERN_2024 = /2024/;
const PATTERN_DECEMBER = /December/;
const PATTERN_COLON = /:/;
const PATTERN_30 = /30/;
const PATTERN_AM_PM = /[ap]m/;
const PATTERN_45 = /45/;

// ============================================================================
// CURRENCY FORMATTING TESTS
// ============================================================================

describe("formatCurrency", () => {
  it("formats COP currency correctly", () => {
    expect(formatCurrency(50_000)).toBe("$50,000");
    expect(formatCurrency(1500)).toBe("$1,500");
    expect(formatCurrency(100)).toBe("$100");
  });

  it("formats USD currency correctly", () => {
    expect(formatCurrency(50_000, { currency: "USD" })).toBe("$50,000.00");
    expect(formatCurrency(1500.5, { currency: "USD" })).toBe("$1,500.50");
    expect(formatCurrency(100, { currency: "USD" })).toBe("$100.00");
  });

  it("handles null and undefined", () => {
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency(undefined)).toBe("$0");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(0, { currency: "USD" })).toBe("$0.00");
  });

  it("handles negative numbers", () => {
    expect(formatCurrency(-50_000)).toBe("-$50,000");
    expect(formatCurrency(-1500.5, { currency: "USD" })).toBe("-$1,500.50");
  });

  it("handles NaN", () => {
    expect(formatCurrency(Number.NaN)).toBe("$0");
    expect(formatCurrency(Number.NaN, { currency: "USD" })).toBe("$0.00");
  });

  it("handles Infinity", () => {
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("$0");
    expect(formatCurrency(Number.NEGATIVE_INFINITY)).toBe("$0");
  });

  it("respects custom fraction digits", () => {
    expect(formatCurrency(50_000, { minimumFractionDigits: 2 })).toBe("$50,000.00");
    expect(formatCurrency(50_000.5, { maximumFractionDigits: 0 })).toBe("$50,001");
    expect(formatCurrency(50_000.123, { maximumFractionDigits: 2 })).toBe("$50,000.12");
  });

  it("uses different locales", () => {
    expect(formatCurrency(50_000, { locale: "en-US" })).toMatch(PATTERN_50000);
    expect(formatCurrency(50_000, { locale: "es-CO" })).toMatch(PATTERN_50);
  });

  it("handles large numbers", () => {
    expect(formatCurrency(1_000_000)).toBe("$1,000,000");
    expect(formatCurrency(999_999_999)).toBe("$999,999,999");
  });

  it("handles small decimals", () => {
    expect(formatCurrency(0.01, { currency: "USD" })).toBe("$0.01");
    expect(formatCurrency(0.99, { currency: "USD" })).toBe("$0.99");
  });
});

describe("formatCOP", () => {
  it("formats Colombian pesos correctly", () => {
    expect(formatCOP(50_000)).toBe("$50,000");
    expect(formatCOP(1500)).toBe("$1,500");
  });

  it("handles edge cases", () => {
    expect(formatCOP(null)).toBe("$0");
    expect(formatCOP(undefined)).toBe("$0");
    expect(formatCOP(0)).toBe("$0");
    expect(formatCOP(-1000)).toBe("-$1,000");
  });

  it("does not show decimals", () => {
    expect(formatCOP(1500.99)).toBe("$1,501");
    expect(formatCOP(1500.01)).toBe("$1,500");
  });
});

describe("formatUSD", () => {
  it("formats US dollars correctly", () => {
    expect(formatUSD(50)).toBe("$50.00");
    expect(formatUSD(1500.5)).toBe("$1,500.50");
  });

  it("handles edge cases", () => {
    expect(formatUSD(null)).toBe("$0.00");
    expect(formatUSD(undefined)).toBe("$0.00");
    expect(formatUSD(0)).toBe("$0.00");
    expect(formatUSD(-10.5)).toBe("-$10.50");
  });

  it("always shows 2 decimals", () => {
    expect(formatUSD(100)).toBe("$100.00");
    expect(formatUSD(100.1)).toBe("$100.10");
  });
});

// ============================================================================
// DATE FORMATTING TESTS
// ============================================================================

describe("formatDate", () => {
  const testDate = new Date("2024-12-25T14:30:00Z");

  it("formats date correctly", () => {
    const result = formatDate(testDate);
    expect(result).toMatch(PATTERN_DEC);
    expect(result).toMatch(PATTERN_25);
    expect(result).toMatch(PATTERN_2024);
  });

  it("formats date with string input", () => {
    const result = formatDate("2024-12-25");
    expect(result).toMatch(PATTERN_DEC);
    expect(result).toMatch(PATTERN_25);
  });

  it("handles null and undefined", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("handles invalid date", () => {
    expect(formatDate("invalid")).toBe("");
    expect(formatDate(new Date("invalid"))).toBe("");
  });

  it("respects custom options", () => {
    const result = formatDate(testDate, {
      weekday: "long",
      month: "long",
    });
    expect(result).toMatch(PATTERN_DECEMBER);
  });

  it("uses different locales", () => {
    const resultEN = formatDate(testDate, { locale: "en-US" });
    const resultES = formatDate(testDate, { locale: "es-CO" });
    expect(resultEN).toBeTruthy();
    expect(resultES).toBeTruthy();
  });
});

describe("formatDateShort", () => {
  it("formats date in short format", () => {
    const result = formatDateShort(new Date("2024-12-25"));
    expect(result).toMatch(PATTERN_DEC);
    expect(result).toMatch(PATTERN_25);
    expect(result).not.toMatch(PATTERN_2024);
  });

  it("handles edge cases", () => {
    expect(formatDateShort(null)).toBe("");
    expect(formatDateShort(undefined)).toBe("");
  });
});

describe("formatDateLong", () => {
  it("formats date in long format", () => {
    const result = formatDateLong(new Date("2024-12-25"));
    expect(result).toMatch(PATTERN_DECEMBER);
    expect(result).toMatch(PATTERN_25);
    expect(result).toMatch(PATTERN_2024);
  });

  it("handles edge cases", () => {
    expect(formatDateLong(null)).toBe("");
    expect(formatDateLong(undefined)).toBe("");
  });
});

// ============================================================================
// TIME FORMATTING TESTS
// ============================================================================

describe("formatTime", () => {
  const testDate = new Date("2024-12-25T14:30:45Z");

  it("formats time correctly", () => {
    const result = formatTime(testDate);
    expect(result).toMatch(PATTERN_COLON);
    expect(result).toMatch(PATTERN_30);
  });

  it("formats time with string input", () => {
    const result = formatTime("2024-12-25T14:30:00Z");
    expect(result).toMatch(PATTERN_COLON);
  });

  it("handles null and undefined", () => {
    expect(formatTime(null)).toBe("");
    expect(formatTime(undefined)).toBe("");
  });

  it("handles invalid date", () => {
    expect(formatTime("invalid")).toBe("");
  });

  it("respects 12-hour format", () => {
    const result = formatTime(testDate, { hour12: true });
    // Should contain AM/PM indicator
    expect(result.toLowerCase()).toMatch(PATTERN_AM_PM);
  });

  it("respects 24-hour format", () => {
    const result = formatTime(testDate, { hour12: false });
    // Should NOT contain AM/PM indicator
    expect(result.toLowerCase()).not.toMatch(PATTERN_AM_PM);
  });

  it("includes seconds when specified", () => {
    const result = formatTime(testDate, { second: "2-digit" });
    expect(result).toMatch(PATTERN_45);
  });
});

describe("formatTime12", () => {
  it("formats time in 12-hour format", () => {
    const result = formatTime12(new Date("2024-12-25T14:30:00Z"));
    expect(result.toLowerCase()).toMatch(PATTERN_AM_PM);
  });

  it("handles edge cases", () => {
    expect(formatTime12(null)).toBe("");
    expect(formatTime12(undefined)).toBe("");
  });
});

describe("formatTime24", () => {
  it("formats time in 24-hour format", () => {
    const result = formatTime24(new Date("2024-12-25T14:30:00Z"));
    expect(result.toLowerCase()).not.toMatch(PATTERN_AM_PM);
    expect(result).toMatch(PATTERN_COLON);
  });

  it("handles edge cases", () => {
    expect(formatTime24(null)).toBe("");
    expect(formatTime24(undefined)).toBe("");
  });
});

// ============================================================================
// DATE + TIME FORMATTING TESTS
// ============================================================================

describe("formatDateTime", () => {
  const testDate = new Date("2024-12-25T14:30:00Z");

  it("formats date and time together", () => {
    const result = formatDateTime(testDate);
    expect(result).toMatch(PATTERN_DEC);
    expect(result).toMatch(PATTERN_25);
    expect(result).toMatch(PATTERN_COLON);
  });

  it("handles null and undefined", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime(undefined)).toBe("");
  });

  it("handles string input", () => {
    const result = formatDateTime("2024-12-25T14:30:00Z");
    expect(result).toBeTruthy();
  });

  it("respects custom options", () => {
    const result = formatDateTime(testDate, {
      weekday: "short",
      hour12: false,
    });
    expect(result).toMatch(PATTERN_COLON);
  });
});

// ============================================================================
// DURATION FORMATTING TESTS
// ============================================================================

describe("formatDuration", () => {
  it("formats duration in minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("handles null and undefined", () => {
    expect(formatDuration(null)).toBe("0m");
    expect(formatDuration(undefined)).toBe("0m");
  });

  it("handles edge cases", () => {
    expect(formatDuration(Number.NaN)).toBe("0m");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("0m");
    expect(formatDuration(-10)).toBe("0m");
  });

  it("rounds minutes correctly", () => {
    expect(formatDuration(90.5)).toBe("1h 31m");
    expect(formatDuration(90.4)).toBe("1h 30m");
  });

  it("handles large durations", () => {
    expect(formatDuration(1440)).toBe("24h"); // 1 day
    expect(formatDuration(1500)).toBe("25h"); // > 1 day
  });

  it("handles exact hours", () => {
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(180)).toBe("3h");
    expect(formatDuration(240)).toBe("4h");
  });
});

describe("formatDurationHours", () => {
  it("formats duration in hours", () => {
    expect(formatDurationHours(1.5)).toBe("1h 30m");
    expect(formatDurationHours(2)).toBe("2h");
    expect(formatDurationHours(0.25)).toBe("15m");
    expect(formatDurationHours(0.5)).toBe("30m");
  });

  it("handles null and undefined", () => {
    expect(formatDurationHours(null)).toBe("0m");
    expect(formatDurationHours(undefined)).toBe("0m");
  });

  it("handles edge cases", () => {
    expect(formatDurationHours(0)).toBe("0m");
    expect(formatDurationHours(Number.NaN)).toBe("0m");
  });
});

// ============================================================================
// UTILITY FUNCTIONS TESTS
// ============================================================================

describe("formatNumber", () => {
  it("formats numbers with thousand separators", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1_234_567)).toBe("1,234,567");
  });

  it("handles decimals", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });

  it("handles null and undefined", () => {
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
  });

  it("handles NaN and Infinity", () => {
    expect(formatNumber(Number.NaN)).toBe("0");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("0");
  });

  it("respects fraction digits options", () => {
    expect(formatNumber(1234.5, { minimumFractionDigits: 2 })).toBe("1,234.50");
    expect(formatNumber(1234.567, { maximumFractionDigits: 1 })).toBe("1,234.6");
  });

  it("handles negative numbers", () => {
    expect(formatNumber(-1000)).toBe("-1,000");
    expect(formatNumber(-1234.56)).toBe("-1,234.56");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(0, { minimumFractionDigits: 2 })).toBe("0.00");
  });
});

describe("formatPercentage", () => {
  it("formats percentages correctly", () => {
    expect(formatPercentage(0.19)).toBe("19%");
    expect(formatPercentage(0.5)).toBe("50%");
    expect(formatPercentage(1)).toBe("100%");
  });

  it("handles decimals", () => {
    expect(formatPercentage(0.195)).toBe("19.5%");
    expect(formatPercentage(0.195, { maximumFractionDigits: 0 })).toBe("20%");
  });

  it("handles null and undefined", () => {
    expect(formatPercentage(null)).toBe("0%");
    expect(formatPercentage(undefined)).toBe("0%");
  });

  it("handles NaN and Infinity", () => {
    expect(formatPercentage(Number.NaN)).toBe("0%");
    expect(formatPercentage(Number.POSITIVE_INFINITY)).toBe("0%");
  });

  it("handles zero and negative", () => {
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(-0.1)).toBe("-10%");
  });

  it("respects fraction digits options", () => {
    expect(formatPercentage(0.123, { minimumFractionDigits: 2 })).toBe("12.30%");
    expect(formatPercentage(0.123_45, { maximumFractionDigits: 2 })).toBe("12.35%");
  });

  it("handles values over 100%", () => {
    expect(formatPercentage(1.5)).toBe("150%");
    expect(formatPercentage(2)).toBe("200%");
  });
});
