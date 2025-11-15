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
  const PLATFORM_FEE_RATE = 0.15; // 15% - customers pay this on top

  // Calculations (Professional keeps 100% of their rate)
  const weeklyEarnings = hourlyRate * hoursPerWeek;
  const monthlyEarnings = weeklyEarnings * 4;
  const yearlyEarnings = monthlyEarnings * 12;

  // What customer pays (for transparency)
  const customerPaysPerHour = hourlyRate * (1 + PLATFORM_FEE_RATE);
  const platformFeePerHour = hourlyRate * PLATFORM_FEE_RATE;

  return (
    <Card className="mx-auto max-w-2xl border-2 border-neutral-200 bg-white shadow-lg">
      <CardContent className="p-8">
        <h3 className="mb-baseline-1 text-center font-[family-name:var(--font-geist-sans)] font-bold text-[24px] text-neutral-900 leading-[24px]">
          {t("title")}
        </h3>
        <p className="mb-baseline-1 text-center text-[14px] text-neutral-700 leading-[24px]">
          {t("subtitle")}
        </p>

        <div className="space-y-6">
          {/* Hourly Rate Input */}
          <div>
            <label
              className="mb-2 block font-semibold text-[14px] text-neutral-900 leading-[24px]"
              htmlFor="hourly-rate"
            >
              {t("yourHourlyRate")}
            </label>
            <div className="relative">
              <span className="-translate-y-1/2 absolute top-1/2 left-4 font-medium text-neutral-600">
                $
              </span>
              <input
                className="w-full rounded-lg border-2 border-neutral-200 py-3 pr-20 pl-8 font-semibold text-lg text-neutral-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                id="hourly-rate"
                max="100000"
                min="15000"
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                step="5000"
                type="number"
                value={hourlyRate}
              />
              <span className="-translate-y-1/2 absolute top-1/2 right-4 text-neutral-600 text-sm">
                COP/hr
              </span>
            </div>
            <div className="mt-2 text-neutral-600 text-xs">{t("rateRange")}</div>
          </div>

          {/* Hours Per Week */}
          <div>
            <label
              className="mb-2 block font-semibold text-[14px] text-neutral-900 leading-[24px]"
              htmlFor="hours-per-week"
            >
              {t("hoursPerWeek")} ({hoursPerWeek}h/week)
            </label>
            <input
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-orange-500"
              id="hours-per-week"
              max="40"
              min="10"
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              step="5"
              type="range"
              value={hoursPerWeek}
            />
            <div className="mt-1 flex justify-between text-neutral-600 text-xs">
              <span>10h</span>
              <span>40h</span>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="space-y-4 border-neutral-200 border-t-2 pt-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Weekly */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
                <HugeiconsIcon
                  className="mx-auto mb-2 h-6 w-6 text-neutral-600"
                  icon={Clock01Icon}
                />
                <div className="mb-1 text-neutral-600 text-xs">{t("weekly")}</div>
                <div className="font-bold text-lg text-neutral-900">
                  {formatCurrency(weeklyEarnings, { currency: "COP", compact: true })}
                </div>
              </div>

              {/* Monthly */}
              <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4 text-center">
                <HugeiconsIcon className="mx-auto mb-2 h-6 w-6 text-orange-600" icon={StarIcon} />
                <div className="mb-1 font-semibold text-orange-700 text-xs">{t("monthly")}</div>
                <div className="font-bold text-orange-600 text-xl">
                  {formatCurrency(monthlyEarnings, { currency: "COP", compact: true })}
                </div>
              </div>

              {/* Yearly */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
                <HugeiconsIcon
                  className="mx-auto mb-2 h-6 w-6 text-neutral-600"
                  icon={ArrowUp01Icon}
                />
                <div className="mb-1 text-neutral-600 text-xs">{t("yearly")}</div>
                <div className="font-bold text-lg text-neutral-900">
                  {formatCurrency(yearlyEarnings, { currency: "COP", compact: true })}
                </div>
              </div>
            </div>
          </div>

          {/* Transparency Section */}
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="font-semibold text-neutral-900 text-sm">{t("transparency.title")}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-700">{t("transparency.customerPays")}</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(customerPaysPerHour, { currency: "COP" })}/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-700">{t("transparency.youReceive")}</span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(hourlyRate, { currency: "COP" })}/hr
                </span>
              </div>
              <div className="flex justify-between border-neutral-200 border-t pt-2">
                <span className="text-neutral-700">{t("transparency.platformFee")}</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(platformFeePerHour, { currency: "COP" })}/hr (15%)
                </span>
              </div>
            </div>
            <p className="border-neutral-200 border-t pt-2 text-neutral-600 text-xs">
              {t("transparency.note")}
            </p>
          </div>

          {/* What Platform Fee Covers */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h4 className="mb-3 font-semibold text-orange-900 text-sm">{t("feeCovers.title")}</h4>
            <ul className="space-y-2">
              {(t.raw("feeCovers.items") as string[]).map((item, idx) => (
                <li className="flex items-start gap-2 text-orange-900 text-sm" key={idx}>
                  <span className="font-bold text-orange-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <a
            className="block w-full rounded-full bg-orange-500 py-4 text-center font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
            href="/professionals/onboarding"
          >
            {t("cta")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
