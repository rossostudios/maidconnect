"use client";

import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import {
  COUNTRY_OPTIONS,
  getCityOptions,
  getNeighborhoodOptions,
  type CountryCode,
} from "@/lib/shared/config/territories";
import type { WizardData } from "../match-wizard";

type LocationStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function LocationStep({ data, onUpdate, onNext, onBack }: LocationStepProps) {
  const t = useTranslations("matchWizard.location");

  const handleCountryChange = (country: string) => {
    onUpdate({ country: country as CountryCode, city: undefined, neighborhood: undefined });
  };

  const handleCityChange = (city: string) => {
    onUpdate({ city, neighborhood: undefined });
  };

  const handleNext = () => {
    if (!data.country || !data.city) {
      return;
    }
    onNext();
  };

  const cityOptions = data.country ? getCityOptions(data.country) : [];
  const neighborhoodOptions = data.city ? getNeighborhoodOptions(data.city) : [];

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center bg-[neutral-900]/5">
          <HugeiconsIcon className="h-8 w-8 text-[neutral-900]" icon={Location01Icon} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-[neutral-900]">
          {t("title", { defaultValue: "Where do you need help?" })}
        </h2>
        <p className="mt-2 text-[neutral-400]">
          {t("description", {
            defaultValue: "Select your city and neighborhood to find nearby professionals",
          })}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Country Selection */}
        <div>
          <label className="mb-2 block font-medium text-[neutral-900] text-sm" htmlFor="country">
            {t("countryLabel", { defaultValue: "Country" })} *
          </label>
          <select
            className="w-full rounded-lg border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] transition focus:border-[neutral-900] focus:outline-none focus:ring-2 focus:ring-[neutral-900]/20"
            id="country"
            onChange={(e) => handleCountryChange(e.target.value)}
            value={data.country || ""}
          >
            <option value="">{t("selectCountry", { defaultValue: "Select your country" })}</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Selection */}
        {data.country && (
          <div>
            <label className="mb-2 block font-medium text-[neutral-900] text-sm" htmlFor="city">
              {t("cityLabel", { defaultValue: "City" })} *
            </label>
            <select
              className="w-full rounded-lg border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] transition focus:border-[neutral-900] focus:outline-none focus:ring-2 focus:ring-[neutral-900]/20"
              id="city"
              onChange={(e) => handleCityChange(e.target.value)}
              value={data.city || ""}
            >
              <option value="">{t("selectCity", { defaultValue: "Select your city" })}</option>
              {cityOptions.map((city) => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Neighborhood Selection */}
        {data.city && neighborhoodOptions.length > 0 && (
          <div>
            <label
              className="mb-2 block font-medium text-[neutral-900] text-sm"
              htmlFor="neighborhood"
            >
              {t("neighborhoodLabel", { defaultValue: "Neighborhood" })}{" "}
              <span className="font-normal text-[neutral-400]">
                ({t("optional", { defaultValue: "optional" })})
              </span>
            </label>
            <select
              className="w-full rounded-lg border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] transition focus:border-[neutral-900] focus:outline-none focus:ring-2 focus:ring-[neutral-900]/20"
              id="neighborhood"
              onChange={(e) => onUpdate({ neighborhood: e.target.value })}
              value={data.neighborhood || ""}
            >
              <option value="">
                {t("selectNeighborhood", {
                  defaultValue: "Select your neighborhood (helps us show nearby pros)",
                })}
              </option>
              {neighborhoodOptions.map((neighborhood) => (
                <option key={neighborhood.value} value={neighborhood.value}>
                  {neighborhood.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 rounded-lg border border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-400] transition hover:border-[neutral-900] hover:text-[neutral-900]"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="flex-1 rounded-lg bg-[neutral-900] px-6 py-3 font-semibold text-[neutral-50] shadow-[0_6px_18px_rgba(22,22,22,0.22)] transition hover:bg-[neutral-900] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!data.country || !data.city}
          onClick={handleNext}
          type="button"
        >
          {t("next", { defaultValue: "Next Step" })}
        </button>
      </div>
    </div>
  );
}
