/**
 * Utility functions for booking operations
 */

import { formatCOP } from "@/lib/format";

/**
 * Format a number as Colombian Peso (COP) currency
 * @deprecated Use formatCOP from @/lib/format instead
 */
export function formatCurrencyCOP(value: number): string {
  return formatCOP(value);
}

/**
 * Normalize service name - handles null/undefined
 */
export function normalizeServiceName(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value;
}

/**
 * Calculate total booking amount
 */
export function calculateBookingAmount(
  hourlyRate: number,
  durationHours: number,
  addonsTotal = 0
): { baseAmount: number; totalAmount: number } {
  const baseAmount = hourlyRate && durationHours > 0 ? Math.round(hourlyRate * durationHours) : 0;
  const totalAmount = baseAmount + addonsTotal;

  return { baseAmount, totalAmount };
}

/**
 * Validate booking data before submission
 */
export function validateBookingData(data: {
  serviceName: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  address: any;
  customAddress?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.serviceName) {
    errors.push("Please select a service");
  }

  if (!data.selectedDate) {
    errors.push("Please select a date");
  }

  if (!data.selectedTime) {
    errors.push("Please select a time");
  }

  if (!(data.address || data.customAddress)) {
    errors.push("Please provide a service address");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
