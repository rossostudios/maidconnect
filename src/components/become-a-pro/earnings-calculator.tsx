"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils/core";
import { formatCurrency } from "@/lib/utils/format";

/**
 * EarningsCalculator - Interactive earnings calculator for professionals
 *
 * Features:
 * - Service type selector with average rates
 * - Hours per week slider (10-40 hours)
 * - Professional's own hourly rate input
 * - Real-time weekly/monthly earnings calculation
 * - Note about 15% fee charged to clients only
 *
 * Following Lia Design System - Airbnb-inspired rounded corners.
 */

type ServiceType = {
  id: string;
  label: string;
  averageRate: number;
};

// Service types with average rates from market research
// In production, this would come from the database via props
const SERVICE_TYPES: ServiceType[] = [
  { id: "cleaning", label: "Cleaning", averageRate: 35_000 },
  { id: "deep-cleaning", label: "Deep Clean / Move-out", averageRate: 45_000 },
  { id: "childcare", label: "Nanny & Childcare", averageRate: 50_000 },
  { id: "senior-care", label: "Senior Companionship", averageRate: 40_000 },
  { id: "private-chef", label: "Private Chef", averageRate: 60_000 },
  { id: "meal-prep", label: "Meal Prep", averageRate: 45_000 },
  { id: "laundry", label: "Laundry & Ironing", averageRate: 30_000 },
];

type EarningsCalculatorProps = {
  averageRates?: Record<string, number>;
  className?: string;
  currency?: string;
};

export function EarningsCalculator({
  averageRates,
  className,
  currency = "COP",
}: EarningsCalculatorProps) {
  const t = useTranslations("becomeAPro.earnings.calculator");

  // Get service types with potentially overridden average rates from props
  const serviceTypes = SERVICE_TYPES.map((service) => ({
    ...service,
    averageRate: averageRates?.[service.id] ?? service.averageRate,
  }));

  const [selectedService, setSelectedService] = useState(serviceTypes[0].id);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(serviceTypes[0].averageRate);

  // Update hourly rate when service changes (suggest the average)
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = serviceTypes.find((s) => s.id === serviceId);
    if (service) {
      setHourlyRate(service.averageRate);
    }
  };

  // Calculate earnings
  const weeklyEarnings = hoursPerWeek * hourlyRate;
  const monthlyEarnings = weeklyEarnings * 4;

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm",
        "dark:border-rausch-700 dark:bg-rausch-900/50",
        className
      )}
    >
      {/* Service Selector */}
      <div className="mb-6">
        <label
          className="mb-2 block font-medium text-neutral-900 text-sm dark:text-white"
          htmlFor="service-select"
        >
          {t("service")}
        </label>
        <select
          className={cn(
            "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3",
            "font-medium text-neutral-900",
            "transition-colors focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
            "dark:border-rausch-700 dark:bg-rausch-800 dark:text-white"
          )}
          id="service-select"
          onChange={(e) => handleServiceChange(e.target.value)}
          value={selectedService}
        >
          {serviceTypes.map((service) => (
            <option key={service.id} value={service.id}>
              {service.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hours Per Week Slider */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label
            className="font-medium text-neutral-900 text-sm dark:text-white"
            htmlFor="hours-slider"
          >
            {t("hoursPerWeek")}
          </label>
          <span className="font-semibold text-rausch-600 dark:text-rausch-300">
            {hoursPerWeek}h
          </span>
        </div>
        <input
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200",
            "dark:bg-rausch-700",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rausch-500",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:hover:scale-110"
          )}
          id="hours-slider"
          max={40}
          min={10}
          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
          type="range"
          value={hoursPerWeek}
        />
        <div className="mt-1 flex justify-between text-neutral-500 text-xs dark:text-rausch-400">
          <span>10h</span>
          <span>25h</span>
          <span>40h</span>
        </div>
      </div>

      {/* Hourly Rate Input */}
      <div className="mb-8">
        <label
          className="mb-2 block font-medium text-neutral-900 text-sm dark:text-white"
          htmlFor="hourly-rate"
        >
          {t("hourlyRate")}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-500 dark:text-rausch-400">
            $
          </span>
          <input
            className={cn(
              "w-full rounded-lg border border-neutral-200 bg-neutral-50 py-3 pr-16 pl-8",
              "font-semibold text-lg text-neutral-900",
              "transition-colors focus:border-rausch-500 focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
              "dark:border-rausch-700 dark:bg-rausch-800 dark:text-white"
            )}
            id="hourly-rate"
            min={10_000}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            step={1000}
            type="number"
            value={hourlyRate}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500 text-sm dark:text-rausch-400">
            {currency}/hr
          </span>
        </div>
      </div>

      {/* Earnings Results */}
      <div className="rounded-xl bg-rausch-50 p-6 dark:bg-rausch-800">
        <div className="grid grid-cols-2 gap-6">
          {/* Weekly Earnings */}
          <div>
            <p className="mb-1 text-neutral-600 text-sm dark:text-rausch-300">
              {t("weeklyEarnings")}
            </p>
            <p className="font-bold text-2xl text-rausch-600 dark:text-white">
              {formatCurrency(weeklyEarnings, currency)}
            </p>
          </div>

          {/* Monthly Earnings */}
          <div>
            <p className="mb-1 text-neutral-600 text-sm dark:text-rausch-300">
              {t("monthlyEarnings")}
            </p>
            <p className="font-bold text-2xl text-rausch-600 dark:text-white">
              {formatCurrency(monthlyEarnings, currency)}
            </p>
          </div>
        </div>

        {/* Note about 15% fee */}
        <p className="mt-4 border-neutral-200 border-t pt-4 text-neutral-600 text-sm dark:border-rausch-700 dark:text-rausch-300">
          {t("note")}
        </p>
      </div>
    </div>
  );
}
