"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

type ServiceCategory = "cleaning" | "childcare" | "cooking" | "eldercare" | "petcare";

const SERVICE_BASE_RATES: Record<ServiceCategory, number> = {
  cleaning: 25_000, // COP per hour
  childcare: 20_000,
  cooking: 30_000,
  eldercare: 22_000,
  petcare: 18_000,
};

export function PricingCalculator() {
  const t = useTranslations("pricing.calculator");

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>("cleaning");
  const [hours, setHours] = useState(4);
  const [addInsurance, setAddInsurance] = useState(true);
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");

  // Calculations - Concierge-only 20% fee
  const baseRate = SERVICE_BASE_RATES[serviceCategory];
  const serviceTotal = baseRate * hours;
  const platformFeeRate = 0.2; // Concierge service fee
  const platformFee = serviceTotal * platformFeeRate;
  const insuranceFee = addInsurance ? 5000 : 0;
  const totalCost = serviceTotal + platformFee + insuranceFee;

  // Currency conversion (rough rate: 1 USD ≈ 4000 COP)
  const COP_TO_USD_RATE = 4000;
  const formatPrice = (amount: number) => {
    if (currency === "USD") {
      return formatCurrency(amount / COP_TO_USD_RATE, { currency: "USD" });
    }
    return formatCurrency(amount, { currency: "COP" });
  };

  return (
    <Card className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10">
      <CardContent className="p-8 md:p-12">
        <h3 className="mb-4 text-center font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-neutral-900">
          {t("title")}
        </h3>
        <p className="mb-8 text-center text-base text-neutral-600">
          {t("subtitle")}
        </p>

        {/* Currency Toggle */}
        <div className="mb-8 flex justify-center">
          <div
            aria-label="Currency selection"
            className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1.5"
            role="group"
          >
            <button
              aria-pressed={currency === "COP"}
              className={`rounded-lg px-6 py-2 font-semibold text-sm transition-all duration-200 ${currency === "COP"
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5"
                  : "text-neutral-500 hover:text-neutral-900"
                }`}
              onClick={() => setCurrency("COP")}
              type="button"
            >
              COP (₱)
            </button>
            <button
              aria-pressed={currency === "USD"}
              className={`rounded-lg px-6 py-2 font-semibold text-sm transition-all duration-200 ${currency === "USD"
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5"
                  : "text-neutral-500 hover:text-neutral-900"
                }`}
              onClick={() => setCurrency("USD")}
              type="button"
            >
              USD ($)
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Service Category */}
          <div>
            <label
              className="mb-3 block font-semibold text-base text-neutral-900"
              htmlFor="service-category"
            >
              {t("selectService")}
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 font-medium text-neutral-900 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                id="service-category"
                onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                value={serviceCategory}
              >
                <option value="cleaning">{t("services.cleaning")}</option>
                <option value="childcare">{t("services.childcare")}</option>
                <option value="cooking">{t("services.cooking")}</option>
                <option value="eldercare">{t("services.eldercare")}</option>
                <option value="petcare">{t("services.petcare")}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-neutral-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label
                className="font-semibold text-base text-neutral-900"
                htmlFor="hours"
              >
                {t("hours")}
              </label>
              <span className="rounded-lg bg-orange-100 px-3 py-1 font-bold text-orange-700 text-sm">
                {hours} hours
              </span>
            </div>
            <input
              aria-valuemax={8}
              aria-valuemin={2}
              aria-valuenow={hours}
              aria-valuetext={`${hours} hours`}
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-orange-500"
              id="hours"
              max="8"
              min="2"
              onChange={(e) => setHours(Number(e.target.value))}
              step="1"
              type="range"
              value={hours}
            />
            <div className="mt-2 flex justify-between font-medium text-neutral-500 text-xs uppercase tracking-wider">
              <span>2h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Insurance */}
          <div className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/30" onClick={() => setAddInsurance(!addInsurance)}>
            <div>
              <div className="font-semibold text-base text-neutral-900" id="insurance-label">
                {t("addInsurance")}
              </div>
              <div className="mt-1 text-neutral-500 text-sm" id="insurance-description">
                {t("insuranceDescription")}
              </div>
            </div>
            <div className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${addInsurance ? "bg-orange-500" : "bg-neutral-200"}`}>
              <div className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${addInsurance ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </div>

          {/* Price Breakdown */}
          <div
            aria-atomic="true"
            aria-live="polite"
            className="space-y-4 rounded-xl bg-neutral-50 p-6"
          >
            <div className="flex justify-between text-base">
              <span className="text-neutral-600">
                <span id="service-base-label">{t("serviceBase")}</span>
                <span className="ml-2 text-neutral-400 text-sm" id="service-base-desc">
                  ({hours}h × {formatPrice(baseRate)}/h)
                </span>
              </span>
              <span
                aria-describedby="service-base-desc"
                aria-labelledby="service-base-label"
                className="font-medium text-neutral-900"
              >
                {formatPrice(serviceTotal)}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-neutral-600">
                <span id="platform-fee-label">{t("platformFee")}</span>
                <span className="ml-2 text-neutral-400 text-sm" id="platform-fee-desc">
                  (20%)
                </span>
              </span>
              <span
                aria-describedby="platform-fee-desc"
                aria-labelledby="platform-fee-label"
                className="font-medium text-neutral-900"
              >
                {formatPrice(platformFee)}
              </span>
            </div>
            {addInsurance && (
              <div className="flex justify-between text-base">
                <span className="text-neutral-600">
                  <span id="insurance-fee-label">{t("insurance")}</span>
                </span>
                <span
                  aria-describedby="insurance-fee-desc"
                  aria-labelledby="insurance-fee-label"
                  className="font-medium text-neutral-900"
                >
                  {formatPrice(insuranceFee)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-neutral-200 border-t pt-4">
              <span className="font-bold text-lg text-neutral-900">
                {t("total")}
              </span>
              <span className="font-[family-name:var(--font-geist-sans)] font-bold text-3xl text-orange-600">
                {formatPrice(totalCost)}
              </span>
            </div>
          </div>

          {/* Professional Receives */}
          <div className="flex items-center justify-between rounded-xl bg-green-50 px-6 py-4 text-green-900">
            <span className="font-medium text-sm">
              {t("professionalReceives")}
            </span>
            <span className="font-bold text-lg">
              {formatPrice(serviceTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
