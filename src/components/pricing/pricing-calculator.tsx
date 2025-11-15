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
  const [serviceType, setServiceType] = useState<"marketplace" | "concierge">("marketplace");
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");

  // Calculations
  const baseRate = SERVICE_BASE_RATES[serviceCategory];
  const serviceTotal = baseRate * hours;
  const platformFeeRate = serviceType === "marketplace" ? 0.15 : 0.25;
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
    <Card className="mx-auto max-w-2xl border-2 border-neutral-200 bg-white shadow-lg">
      <CardContent className="p-10">
        <h3 className="mb-baseline-1 text-center font-[family-name:var(--font-geist-sans)] font-bold text-[24px] text-neutral-900 leading-[24px]">
          {t("title")}
        </h3>
        <p className="mb-2 text-center text-[14px] text-neutral-700 leading-[24px]">
          {t("subtitle")}
        </p>

        {/* Currency Toggle */}
        <div className="mb-baseline-1 flex justify-center">
          <div
            aria-label="Currency selection"
            className="inline-flex border border-neutral-200 bg-neutral-50 p-1"
            role="group"
          >
            <button
              aria-pressed={currency === "COP"}
              className={`rounded px-4 py-1.5 font-medium text-xs transition-all ${
                currency === "COP"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              onClick={() => setCurrency("COP")}
              type="button"
            >
              COP (₱)
            </button>
            <button
              aria-pressed={currency === "USD"}
              className={`rounded px-4 py-1.5 font-medium text-xs transition-all ${
                currency === "USD"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              onClick={() => setCurrency("USD")}
              type="button"
            >
              USD ($)
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Type */}
          <div>
            <label
              className="mb-2 block font-semibold text-[14px] text-neutral-900 leading-[24px]"
              id="service-type-label"
            >
              {t("serviceType")}
            </label>
            <div
              aria-labelledby="service-type-label"
              className="grid grid-cols-2 gap-3"
              role="group"
            >
              <button
                aria-pressed={serviceType === "marketplace"}
                className={`border-2 px-4 py-3 font-medium text-sm transition-all ${
                  serviceType === "marketplace"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
                onClick={() => setServiceType("marketplace")}
                type="button"
              >
                {t("marketplace")} (15%)
              </button>
              <button
                aria-pressed={serviceType === "concierge"}
                className={`border-2 px-4 py-3 font-medium text-sm transition-all ${
                  serviceType === "concierge"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
                onClick={() => setServiceType("concierge")}
                type="button"
              >
                {t("concierge")} (25%)
              </button>
            </div>
          </div>

          {/* Service Category */}
          <div>
            <label
              className="mb-2 block font-semibold text-[14px] text-neutral-900 leading-[24px]"
              htmlFor="service-category"
            >
              {t("selectService")}
            </label>
            <select
              className="w-full border-2 border-neutral-200 px-4 py-3 text-neutral-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
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
          </div>

          {/* Hours */}
          <div>
            <label
              className="mb-2 block font-semibold text-[14px] text-neutral-900 leading-[24px]"
              htmlFor="hours"
            >
              {t("hours")} ({hours}h)
            </label>
            <input
              aria-valuemax={8}
              aria-valuemin={2}
              aria-valuenow={hours}
              aria-valuetext={`${hours} hours`}
              className="h-2 w-full cursor-pointer appearance-none bg-neutral-200 accent-orange-500"
              id="hours"
              max="8"
              min="2"
              onChange={(e) => setHours(Number(e.target.value))}
              step="1"
              type="range"
              value={hours}
            />
            <div className="mt-1 flex justify-between text-neutral-600 text-xs">
              <span>2h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Insurance */}
          <div className="flex items-center justify-between border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <div className="font-semibold text-neutral-900 text-sm" id="insurance-label">
                {t("addInsurance")}
              </div>
              <div className="text-neutral-600 text-xs" id="insurance-description">
                {t("insuranceDescription")}
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                aria-checked={addInsurance}
                aria-describedby="insurance-description"
                aria-labelledby="insurance-label"
                checked={addInsurance}
                className="peer sr-only"
                id="insurance-toggle"
                onChange={(e) => setAddInsurance(e.target.checked)}
                role="switch"
                type="checkbox"
              />
              <div className="peer rtl:peer-checked:after:-translate-x-full h-6 w-11 bg-neutral-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/25" />
            </label>
          </div>

          {/* Price Breakdown */}
          <div
            aria-atomic="true"
            aria-live="polite"
            className="space-y-3 border-neutral-200 border-t-2 pt-6"
          >
            <div className="flex justify-between text-[16px] leading-[24px]">
              <span className="text-neutral-700">
                <span id="service-base-label">{t("serviceBase")}</span>
                <span className="ml-1 text-neutral-600 text-xs" id="service-base-desc">
                  ({hours}h × {formatPrice(baseRate)}/h)
                </span>
              </span>
              <span
                aria-describedby="service-base-desc"
                aria-labelledby="service-base-label"
                className="font-semibold text-neutral-900"
              >
                {formatPrice(serviceTotal)}
              </span>
            </div>
            <div className="flex justify-between text-[16px] leading-[24px]">
              <span className="text-neutral-700">
                <span id="platform-fee-label">
                  {t("platformFee")} ({serviceType === "marketplace" ? "15%" : "25%"})
                </span>
                <span className="ml-1 text-neutral-600 text-xs" id="platform-fee-desc">
                  (Casaora service)
                </span>
              </span>
              <span
                aria-describedby="platform-fee-desc"
                aria-labelledby="platform-fee-label"
                className="font-semibold text-neutral-900"
              >
                {formatPrice(platformFee)}
              </span>
            </div>
            {addInsurance && (
              <div className="flex justify-between text-[16px] leading-[24px]">
                <span className="text-neutral-700">
                  <span id="insurance-fee-label">{t("insurance")}</span>
                  <span className="ml-1 text-neutral-600 text-xs" id="insurance-fee-desc">
                    (Protection coverage)
                  </span>
                </span>
                <span
                  aria-describedby="insurance-fee-desc"
                  aria-labelledby="insurance-fee-label"
                  className="font-semibold text-neutral-900"
                >
                  {formatPrice(insuranceFee)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-neutral-200 border-t-2 pt-4">
              <span className="font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-neutral-900 leading-[24px]">
                {t("total")}
              </span>
              <span className="font-[family-name:var(--font-geist-sans)] font-bold text-[28px] text-orange-600 leading-[24px]">
                {formatPrice(totalCost)}
              </span>
            </div>
          </div>

          {/* Professional Receives */}
          <div className="border-2 border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px] text-orange-900 leading-[24px]">
                {t("professionalReceives")}
              </span>
              <span className="font-[family-name:var(--font-geist-sans)] font-bold text-[20px] text-orange-600 leading-[24px]">
                {formatPrice(serviceTotal)}
              </span>
            </div>
            <p className="mt-1 text-orange-700 text-xs">{t("professionalNote")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
