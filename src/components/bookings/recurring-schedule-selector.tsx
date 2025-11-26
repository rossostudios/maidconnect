"use client";

import { Calendar01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

/**
 * Recurring Schedule Selector Component
 *
 * Research insights applied:
 * - Stripe: Subscription schedules use RRULE format for recurring patterns
 * - Calendar UX: Weekly/biweekly/monthly patterns are most common
 * - Pricing: Dynamic discount displays increase conversion by showing savings
 * - Industry: Recurring customers have 3-5x higher LTV than one-time customers
 */

export type RecurringFrequency = "weekly" | "biweekly" | "monthly";

export type RecurringSchedule = {
  frequency: RecurringFrequency;
  startDate: string; // ISO date string
  dayOfWeek?: number; // 0-6 (Sunday-Saturday), only for weekly/biweekly
  endType: "occurrences" | "date" | "never";
  occurrences?: number; // Number of bookings if endType is "occurrences"
  endDate?: string; // ISO date string if endType is "date"
};

type RecurringScheduleSelectorProps = {
  basePrice: number; // Price per booking
  currency?: string;
  onScheduleChange: (schedule: RecurringSchedule | null) => void;
  initialSchedule?: RecurringSchedule;
};

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 Weeks",
  monthly: "Monthly",
};

const FREQUENCY_DISCOUNTS: Record<RecurringFrequency, number> = {
  weekly: 0.15, // 15% discount
  biweekly: 0.12, // 12% discount
  monthly: 0.1, // 10% discount
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- Helper Functions (extracted for complexity reduction) ---

function getToggleClass(isEnabled: boolean): string {
  return isEnabled ? "bg-rausch-500" : "bg-neutral-200";
}

function getToggleKnobClass(isEnabled: boolean): string {
  return isEnabled ? "right-1" : "left-1";
}

function getFrequencyButtonClass(
  freq: RecurringFrequency,
  currentFrequency: RecurringFrequency
): string {
  if (freq === currentFrequency) {
    return "border-rausch-500 bg-rausch-50";
  }
  return "border-neutral-200 bg-neutral-50 hover:border-rausch-300";
}

function getDayButtonClass(dayIndex: number, selectedDay: number): string {
  if (dayIndex === selectedDay) {
    return "border-rausch-500 bg-rausch-50 font-semibold text-rausch-600";
  }
  return "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-rausch-300";
}

function getEndTypeButtonClass(type: string, selectedType: string): string {
  if (type === selectedType) {
    return "border-rausch-500 bg-rausch-50 font-semibold text-rausch-600";
  }
  return "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-rausch-300";
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]!;
}

function createDefaultEndDate(): string {
  return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function RecurringScheduleSelector({
  basePrice,
  currency = "COP",
  onScheduleChange,
  initialSchedule,
}: RecurringScheduleSelectorProps) {
  const [isEnabled, setIsEnabled] = useState(!!initialSchedule);
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    initialSchedule?.frequency || "biweekly"
  );
  const [startDate, setStartDate] = useState(initialSchedule?.startDate || getTodayDateString());
  const [dayOfWeek, setDayOfWeek] = useState(initialSchedule?.dayOfWeek ?? 1); // Default Monday
  const [endType, setEndType] = useState<"occurrences" | "date" | "never">(
    initialSchedule?.endType || "occurrences"
  );
  const [occurrences, setOccurrences] = useState(initialSchedule?.occurrences || 12);
  const [endDate, setEndDate] = useState(initialSchedule?.endDate || createDefaultEndDate());

  // Calculate pricing
  const discount = FREQUENCY_DISCOUNTS[frequency];
  const discountedPrice = basePrice * (1 - discount);
  const totalOccurrences = endType === "occurrences" ? occurrences : 12; // Estimate for "never"
  const totalSavings = (basePrice - discountedPrice) * totalOccurrences;

  // Update parent whenever schedule changes
  const updateSchedule = (updates: Partial<RecurringSchedule> = {}) => {
    if (!isEnabled) {
      onScheduleChange(null);
      return;
    }

    const schedule: RecurringSchedule = {
      frequency,
      startDate,
      dayOfWeek: frequency !== "monthly" ? dayOfWeek : undefined,
      endType,
      occurrences: endType === "occurrences" ? occurrences : undefined,
      endDate: endType === "date" ? endDate : undefined,
      ...updates,
    };

    onScheduleChange(schedule);
  };

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      updateSchedule();
    } else {
      onScheduleChange(null);
    }
  };

  const handleFrequencyChange = (newFrequency: RecurringFrequency) => {
    setFrequency(newFrequency);
    updateSchedule({ frequency: newFrequency });
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    updateSchedule({ startDate: date });
  };

  const handleDayOfWeekChange = (day: number) => {
    setDayOfWeek(day);
    updateSchedule({ dayOfWeek: day });
  };

  const handleEndTypeChange = (type: "occurrences" | "date" | "never") => {
    setEndType(type);
    updateSchedule({ endType: type });
  };

  const handleOccurrencesChange = (count: number) => {
    setOccurrences(count);
    updateSchedule({ occurrences: count });
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    updateSchedule({ endDate: date });
  };

  const formatCurrency = (amount: number) => formatAmount(amount, currency);

  return (
    <div className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
      {/* Toggle Recurring */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-neutral-900">Recurring Booking</h3>
          <p className="mt-1 text-neutral-500 text-sm">
            Save up to 15% with weekly, biweekly, or monthly plans
          </p>
        </div>
        <button
          className={`relative h-7 w-12 rounded-full transition ${getToggleClass(isEnabled)}`}
          onClick={() => handleToggle(!isEnabled)}
          type="button"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${getToggleKnobClass(isEnabled)}`}
          />
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Frequency Selection */}
          <div className="space-y-3">
            <div className="block font-medium text-neutral-900 text-sm">Frequency</div>
            <div className="grid grid-cols-3 gap-3">
              {(["weekly", "biweekly", "monthly"] as RecurringFrequency[]).map((freq) => (
                <button
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${getFrequencyButtonClass(freq, frequency)}`}
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  type="button"
                >
                  <span className="font-semibold text-neutral-900 text-sm">
                    {FREQUENCY_LABELS[freq]}
                  </span>
                  <span className="font-medium text-green-600 text-xs">
                    Save {(FREQUENCY_DISCOUNTS[freq] * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-3">
            <label className="block font-medium text-neutral-900 text-sm" htmlFor="start-date">
              Start Date
            </label>
            <div className="relative">
              <HugeiconsIcon
                className="absolute top-3 left-3 h-5 w-5 text-neutral-500"
                icon={Calendar01Icon}
              />
              <input
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-11 text-neutral-900 transition focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                id="start-date"
                min={getTodayDateString()}
                onChange={(e) => handleStartDateChange(e.target.value)}
                type="date"
                value={startDate}
              />
            </div>
          </div>

          {/* Day of Week (for weekly/biweekly) */}
          {frequency !== "monthly" && (
            <div className="space-y-3">
              <div className="block font-medium text-neutral-900 text-sm">Day of Week</div>
              <div className="grid grid-cols-7 gap-2">
                {DAY_NAMES.map((day, index) => (
                  <button
                    className={`rounded-lg border-2 px-2 py-3 text-xs transition ${getDayButtonClass(index, dayOfWeek)}`}
                    key={day}
                    onClick={() => handleDayOfWeekChange(index)}
                    type="button"
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End Condition */}
          <div className="space-y-3">
            <div className="block font-medium text-neutral-900 text-sm">End Condition</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                className={`rounded-lg border-2 px-4 py-3 text-sm transition ${getEndTypeButtonClass("occurrences", endType)}`}
                onClick={() => handleEndTypeChange("occurrences")}
                type="button"
              >
                # of times
              </button>
              <button
                className={`rounded-lg border-2 px-4 py-3 text-sm transition ${getEndTypeButtonClass("date", endType)}`}
                onClick={() => handleEndTypeChange("date")}
                type="button"
              >
                End date
              </button>
              <button
                className={`rounded-lg border-2 px-4 py-3 text-sm transition ${getEndTypeButtonClass("never", endType)}`}
                onClick={() => handleEndTypeChange("never")}
                type="button"
              >
                Never
              </button>
            </div>

            {endType === "occurrences" && (
              <div className="mt-3">
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 transition focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  max="52"
                  min="2"
                  onChange={(e) => handleOccurrencesChange(Number(e.target.value))}
                  placeholder="Number of bookings"
                  type="number"
                  value={occurrences}
                />
              </div>
            )}

            {endType === "date" && (
              <div className="relative mt-3">
                <HugeiconsIcon
                  className="absolute top-3 left-3 h-5 w-5 text-neutral-500"
                  icon={Calendar01Icon}
                />
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-11 text-neutral-900 transition focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20"
                  min={startDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  type="date"
                  value={endDate}
                />
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-4 rounded-lg bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <HugeiconsIcon className="h-5 w-5 text-green-600" icon={InformationCircleIcon} />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-neutral-900">Your Savings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Regular price:</span>
                    <span className="text-neutral-500 line-through">
                      {formatCurrency(basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-900">Your price:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(discountedPrice)}
                    </span>
                  </div>
                  {endType === "occurrences" && (
                    <div className="flex justify-between border-green-200 border-t pt-2">
                      <span className="font-medium text-neutral-900">Total savings:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(totalSavings)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {endType === "never" && (
              <p className="text-neutral-500 text-xs">Cancel anytime. No commitment required.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
