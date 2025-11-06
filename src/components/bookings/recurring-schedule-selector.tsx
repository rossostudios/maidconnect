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
  const [startDate, setStartDate] = useState(
    initialSchedule?.startDate || new Date().toISOString().split("T")[0]!
  );
  const [dayOfWeek, setDayOfWeek] = useState(initialSchedule?.dayOfWeek ?? 1); // Default Monday
  const [endType, setEndType] = useState<"occurrences" | "date" | "never">(
    initialSchedule?.endType || "occurrences"
  );
  const [occurrences, setOccurrences] = useState(initialSchedule?.occurrences || 12);
  const [endDate, setEndDate] = useState(
    initialSchedule?.endDate ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!
  );

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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6 rounded-2xl border border-[#ebe5d8] bg-white p-6">
      {/* Toggle Recurring */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">Recurring Booking</h3>
          <p className="mt-1 text-[#7d7566] text-sm">
            Save up to 15% with weekly, biweekly, or monthly plans
          </p>
        </div>
        <button
          className={`relative h-7 w-12 rounded-full transition ${
            isEnabled ? "bg-[#E85D48]" : "bg-[#e5dfd4]"
          }`}
          onClick={() => handleToggle(!isEnabled)}
          type="button"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              isEnabled ? "right-1" : "left-1"
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Frequency Selection */}
          <div className="space-y-3">
            <div className="block font-medium text-gray-900 text-sm">Frequency</div>
            <div className="grid grid-cols-3 gap-3">
              {(["weekly", "biweekly", "monthly"] as RecurringFrequency[]).map((freq) => (
                <button
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                    frequency === freq
                      ? "border-[#E85D48] bg-[#fff5f3]"
                      : "border-[#e5dfd4] bg-white hover:border-[#d4cabb]"
                  }`}
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  type="button"
                >
                  <span className="font-semibold text-gray-900 text-sm">
                    {FREQUENCY_LABELS[freq]}
                  </span>
                  <span className="font-medium text-[#00a651] text-xs">
                    Save {(FREQUENCY_DISCOUNTS[freq] * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-900 text-sm" htmlFor="start-date">
              Start Date
            </label>
            <div className="relative">
              <HugeiconsIcon
                className="absolute top-3 left-3 h-5 w-5 text-[#7d7566]"
                icon={Calendar01Icon}
              />
              <input
                className="w-full rounded-xl border border-[#e5dfd4] py-3 pr-4 pl-11 text-gray-900 transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                id="start-date"
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleStartDateChange(e.target.value)}
                type="date"
                value={startDate}
              />
            </div>
          </div>

          {/* Day of Week (for weekly/biweekly) */}
          {frequency !== "monthly" && (
            <div className="space-y-3">
              <div className="block font-medium text-gray-900 text-sm">Day of Week</div>
              <div className="grid grid-cols-7 gap-2">
                {DAY_NAMES.map((day, index) => (
                  <button
                    className={`rounded-lg border-2 px-2 py-3 text-xs transition ${
                      dayOfWeek === index
                        ? "border-[#E85D48] bg-[#fff5f3] font-semibold text-[#E85D48]"
                        : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
                    }`}
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
            <div className="block font-medium text-gray-900 text-sm">End Condition</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                className={`rounded-xl border-2 px-4 py-3 text-sm transition ${
                  endType === "occurrences"
                    ? "border-[#E85D48] bg-[#fff5f3] font-semibold text-[#E85D48]"
                    : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
                }`}
                onClick={() => handleEndTypeChange("occurrences")}
                type="button"
              >
                # of times
              </button>
              <button
                className={`rounded-xl border-2 px-4 py-3 text-sm transition ${
                  endType === "date"
                    ? "border-[#E85D48] bg-[#fff5f3] font-semibold text-[#E85D48]"
                    : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
                }`}
                onClick={() => handleEndTypeChange("date")}
                type="button"
              >
                End date
              </button>
              <button
                className={`rounded-xl border-2 px-4 py-3 text-sm transition ${
                  endType === "never"
                    ? "border-[#E85D48] bg-[#fff5f3] font-semibold text-[#E85D48]"
                    : "border-[#e5dfd4] bg-white text-[#7d7566] hover:border-[#d4cabb]"
                }`}
                onClick={() => handleEndTypeChange("never")}
                type="button"
              >
                Never
              </button>
            </div>

            {endType === "occurrences" && (
              <div className="mt-3">
                <input
                  className="w-full rounded-xl border border-[#e5dfd4] px-4 py-3 text-gray-900 transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
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
                  className="absolute top-3 left-3 h-5 w-5 text-[#7d7566]"
                  icon={Calendar01Icon}
                />
                <input
                  className="w-full rounded-xl border border-[#e5dfd4] py-3 pr-4 pl-11 text-gray-900 transition focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
                  min={startDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  type="date"
                  value={endDate}
                />
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-4 rounded-xl bg-gradient-to-br from-[#fff5f3] to-[#fef8f6] p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#E85D48]/10 p-2">
                <HugeiconsIcon className="h-5 w-5 text-[#E85D48]" icon={InformationCircleIcon} />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-gray-900">Your Savings</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7d7566]">Regular price:</span>
                    <span className="text-[#7d7566] line-through">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Your price:</span>
                    <span className="font-semibold text-[#E85D48]">
                      {formatCurrency(discountedPrice)}
                    </span>
                  </div>
                  {endType === "occurrences" && (
                    <div className="flex justify-between border-[#e5dfd4] border-t pt-2">
                      <span className="font-medium text-gray-900">Total savings:</span>
                      <span className="font-bold text-[#00a651]">
                        {formatCurrency(totalSavings)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {endType === "never" && (
              <p className="text-[#7d7566] text-xs">Cancel anytime. No commitment required.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
