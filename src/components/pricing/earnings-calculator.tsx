"use client";

import { ArrowUp01Icon, Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

export function EarningsCalculator() {
  const t = useTranslations("pricing.earnings");

  const [hourlyRate, setHourlyRate] = useState(25_000); // COP
  const [hoursPerWeek, setHoursPerWeek] = useState(20);

  // Constants
  const PLATFORM_FEE_RATE = 0.2; // 20% concierge fee - customers pay this on top

  // Calculations (Professional keeps 100% of their rate)
  const weeklyEarnings = hourlyRate * hoursPerWeek;
  const monthlyEarnings = weeklyEarnings * 4;
  const yearlyEarnings = monthlyEarnings * 12;

  // What customer pays (for transparency)
  const customerPaysPerHour = hourlyRate * (1 + PLATFORM_FEE_RATE);
  const platformFeePerHour = hourlyRate * PLATFORM_FEE_RATE;

  return (
    <Card className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10">
      <CardContent className="p-8 md:p-12">
        <h3 className="mb-4 text-center font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
          {t("title")}
        </h3>
        <p className="mb-8 text-center text-base text-neutral-600">
          {t("subtitle")}
        </p>

        <div className="space-y-8">
          {/* Hourly Rate Input */}
          <div>
            <label
              className="mb-3 block font-semibold text-base text-neutral-900"
              htmlFor="hourly-rate"
            >
              {t("yourHourlyRate")}
            </label>
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-5 font-medium text-neutral-400 text-lg">
                $
              </span>
              <input
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-4 pr-20 pl-10 font-bold text-xl text-neutral-900 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                id="hourly-rate"
                max="100000"
                min="15000"
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                step="5000"
                type="number"
                value={hourlyRate}
              />
              <span className="-translate-y-1/2 absolute top-1/2 right-5 font-medium text-neutral-500 text-sm">
                COP/hr
              </span>
            </div>
            <div className="mt-2 text-neutral-500 text-sm">{t("rateRange")}</div>
          </div>

          {/* Hours Per Week */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label
                className="font-semibold text-base text-neutral-900"
                htmlFor="hours-per-week"
              >
                {t("hoursPerWeek")}
              </label>
              <span className="rounded-lg bg-orange-100 px-3 py-1 font-bold text-orange-700 text-sm">
                {hoursPerWeek}h/week
              </span>
            </div>
            <input
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-orange-500"
              id="hours-per-week"
              max="40"
              min="10"
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              step="5"
              type="range"
              value={hoursPerWeek}
            />
            <div className="mt-2 flex justify-between font-medium text-neutral-500 text-xs uppercase tracking-wider">
              <span>10h</span>
              <span>40h</span>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Weekly */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center transition-all hover:border-orange-200 hover:bg-white hover:shadow-lg hover:shadow-orange-900/5">
              <div className="mb-3 flex justify-center text-neutral-400">
                <HugeiconsIcon className="h-6 w-6" icon={Clock01Icon} />
              </div>
              <div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">{t("weekly")}</div>
              <div className="font-bold text-xl text-neutral-900">
                {formatCurrency(weeklyEarnings, { currency: "COP", compact: true })}
              </div>
            </div>

            {/* Monthly */}
            <div className="relative rounded-2xl border-2 border-orange-500 bg-orange-50 p-5 text-center shadow-md">
              <div className="-translate-x-1/2 absolute -top-3 left-1/2 rounded-full bg-orange-500 px-3 py-0.5 font-bold text-[10px] text-white uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-3 flex justify-center text-orange-500">
                <HugeiconsIcon className="h-6 w-6" icon={StarIcon} />
              </div>
              <div className="mb-1 font-bold text-orange-800 text-xs uppercase tracking-wider">{t("monthly")}</div>
              <div className="font-bold text-2xl text-orange-600">
                {formatCurrency(monthlyEarnings, { currency: "COP", compact: true })}
              </div>
            </div>

            {/* Yearly */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center transition-all hover:border-orange-200 hover:bg-white hover:shadow-lg hover:shadow-orange-900/5">
              <div className="mb-3 flex justify-center text-neutral-400">
                <HugeiconsIcon className="h-6 w-6" icon={ArrowUp01Icon} />
              </div>
              <div className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">{t("yearly")}</div>
              <div className="font-bold text-xl text-neutral-900">
                {formatCurrency(yearlyEarnings, { currency: "COP", compact: true })}
              </div>
            </div>
          </div>

          {/* Transparency Section */}
          <div className="rounded-2xl bg-neutral-50 p-6">
            <h4 className="mb-4 font-bold text-neutral-900 text-sm uppercase tracking-wider">{t("transparency.title")}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t("transparency.customerPays")}</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(customerPaysPerHour, { currency: "COP" })}/hr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">{t("transparency.youReceive")}</span>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  {formatCurrency(hourlyRate, { currency: "COP" })}/hr
                </span>
              </div>
              <div className="flex justify-between items-center border-neutral-200 border-t pt-3">
                <span className="text-neutral-500">{t("transparency.platformFee")}</span>
                <span className="text-neutral-500">
                  {formatCurrency(platformFeePerHour, { currency: "COP" })}/hr (20%)
                </span>
              </div>
            </div>
            <p className="mt-4 text-neutral-500 text-xs leading-relaxed">
              {t("transparency.note")}
            </p>
          </div>

          {/* CTA */}
          <a
            className="block w-full rounded-xl bg-orange-600 py-4 text-center font-bold text-lg text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:bg-orange-700 hover:shadow-xl hover:scale-[1.02]"
            href="/professionals/onboarding"
          >
            {t("cta")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
