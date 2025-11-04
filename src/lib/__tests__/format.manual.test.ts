/**
 * Manual tests for formatting utilities
 * Run with: npx tsx src/lib/__tests__/format.manual.test.ts
 */

import {
  formatCurrency,
  formatCOP,
  formatUSD,
  formatDate,
  formatDateShort,
  formatDateLong,
  formatTime,
  formatTime12,
  formatTime24,
  formatDateTime,
  formatDuration,
  formatDurationHours,
  formatNumber,
  formatPercentage,
} from "../format";

console.log("🧪 Testing Formatting Utilities\n");

// ============================================================================
// CURRENCY FORMATTING TESTS
// ============================================================================

console.log("💰 Currency Formatting:");
console.log("  formatCOP(50000):", formatCOP(50_000));
console.log("  formatCOP(1500):", formatCOP(1500));
console.log("  formatCOP(null):", formatCOP(null));
console.log("  formatCOP(0):", formatCOP(0));
console.log("  formatCOP(-1000):", formatCOP(-1000));

console.log("\n  formatUSD(50.5):", formatUSD(50.5));
console.log("  formatUSD(1000):", formatUSD(1000));
console.log("  formatUSD(null):", formatUSD(null));

console.log("\n  formatCurrency(50000):", formatCurrency(50_000));
console.log("  formatCurrency(50000, { currency: 'USD' }):", formatCurrency(50_000, { currency: "USD" }));
console.log("  formatCurrency(NaN):", formatCurrency(Number.NaN));
console.log("  formatCurrency(Infinity):", formatCurrency(Number.POSITIVE_INFINITY));

// ============================================================================
// DATE FORMATTING TESTS
// ============================================================================

const testDate = new Date("2024-12-25T14:30:00Z");

console.log("\n📅 Date Formatting:");
console.log("  formatDate(testDate):", formatDate(testDate));
console.log("  formatDate('2024-12-25'):", formatDate("2024-12-25"));
console.log("  formatDateShort(testDate):", formatDateShort(testDate));
console.log("  formatDateLong(testDate):", formatDateLong(testDate));
console.log("  formatDate(null):", formatDate(null));
console.log("  formatDate('invalid'):", formatDate("invalid"));

console.log("\n  formatDate with weekday:", formatDate(testDate, { weekday: "long", month: "long" }));
console.log("  formatDate es-CO:", formatDate(testDate, { locale: "es-CO" }));

// ============================================================================
// TIME FORMATTING TESTS
// ============================================================================

console.log("\n🕐 Time Formatting:");
console.log("  formatTime(testDate):", formatTime(testDate));
console.log("  formatTime12(testDate):", formatTime12(testDate));
console.log("  formatTime24(testDate):", formatTime24(testDate));
console.log("  formatTime with seconds:", formatTime(testDate, { second: "2-digit" }));
console.log("  formatTime(null):", formatTime(null));

// ============================================================================
// DATE + TIME FORMATTING TESTS
// ============================================================================

console.log("\n📅🕐 DateTime Formatting:");
console.log("  formatDateTime(testDate):", formatDateTime(testDate));
console.log("  formatDateTime with weekday:", formatDateTime(testDate, { weekday: "short", hour12: false }));
console.log("  formatDateTime(null):", formatDateTime(null));

// ============================================================================
// DURATION FORMATTING TESTS
// ============================================================================

console.log("\n⏱️  Duration Formatting:");
console.log("  formatDuration(90):", formatDuration(90));
console.log("  formatDuration(60):", formatDuration(60));
console.log("  formatDuration(45):", formatDuration(45));
console.log("  formatDuration(0):", formatDuration(0));
console.log("  formatDuration(150):", formatDuration(150));
console.log("  formatDuration(null):", formatDuration(null));
console.log("  formatDuration(1440):", formatDuration(1440)); // 24 hours

console.log("\n  formatDurationHours(1.5):", formatDurationHours(1.5));
console.log("  formatDurationHours(2):", formatDurationHours(2));
console.log("  formatDurationHours(0.25):", formatDurationHours(0.25));

// ============================================================================
// UTILITY FUNCTIONS TESTS
// ============================================================================

console.log("\n🔢 Number Formatting:");
console.log("  formatNumber(1000):", formatNumber(1000));
console.log("  formatNumber(1234567):", formatNumber(1_234_567));
console.log("  formatNumber(1234.56):", formatNumber(1234.56));
console.log("  formatNumber(null):", formatNumber(null));
console.log("  formatNumber(-1000):", formatNumber(-1000));

console.log("\n📊 Percentage Formatting:");
console.log("  formatPercentage(0.19):", formatPercentage(0.19));
console.log("  formatPercentage(0.5):", formatPercentage(0.5));
console.log("  formatPercentage(1):", formatPercentage(1));
console.log("  formatPercentage(0.195):", formatPercentage(0.195));
console.log("  formatPercentage(null):", formatPercentage(null));
console.log("  formatPercentage(1.5):", formatPercentage(1.5));

console.log("\n✅ All manual tests completed!");
