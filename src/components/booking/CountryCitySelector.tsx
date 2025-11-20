"use client";

/**
 * CountryCitySelector Component
 *
 * Two-step country and city selection for multi-market booking flow.
 * Lia Design System with Anthropic rounded corners and orange accents.
 *
 * Flow:
 * 1. Select country (CO, PY, UY, AR)
 * 2. Select city (dynamically populated based on country)
 *
 * @example
 * ```tsx
 * <CountryCitySelector
 *   country={selectedCountry}
 *   city={selectedCity}
 *   onCountryChange={(code) => setSelectedCountry(code)}
 *   onCityChange={(slug) => setSelectedCity(slug)}
 * />
 * ```
 */

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { COUNTRY_OPTIONS, COUNTRIES, type CountryCode, getCityOptions } from "@/lib/shared/config/territories";

export interface CountryCitySelectorProps {
  /**
   * Selected country code (CO, PY, UY, AR)
   */
  country?: CountryCode;
  /**
   * Selected city slug
   */
  city?: string;
  /**
   * Callback when country changes
   */
  onCountryChange: (countryCode: CountryCode) => void;
  /**
   * Callback when city changes
   */
  onCityChange: (citySlug: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function CountryCitySelector({
  country,
  city,
  onCountryChange,
  onCityChange,
  className,
}: CountryCitySelectorProps) {
  const t = useTranslations("booking");
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([]);

  // Update city options when country changes
  useEffect(() => {
    if (country) {
      const options = getCityOptions(country);
      setCityOptions(options);

      // Reset city if it doesn't belong to the new country
      if (city) {
        const cityExists = options.some((opt) => opt.value === city);
        if (!cityExists) {
          onCityChange("");
        }
      }
    } else {
      setCityOptions([]);
      onCityChange("");
    }
  }, [country, city, onCityChange]);

  return (
    <div className={className}>
      {/* Step 1: Country Selection */}
      <div className="space-y-2">
        <label className="block font-medium text-neutral-700 text-sm" htmlFor="country-select">
          {t("countryLabel") || "País"}
        </label>
        <Select
          onSelectionChange={(key) => onCountryChange(key as CountryCode)}
          selectedKey={country}
        >
          <SelectTrigger id="country-select">
            <SelectValue placeholder={t("countryPlaceholder") || "Selecciona tu país"} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((option) => {
              const paymentProcessor = COUNTRIES[option.value as CountryCode]?.paymentProcessor || "stripe";
              const isStripe = paymentProcessor === "stripe";

              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <span>{option.label}</span>
                    <Badge
                      className={`text-xs ${
                        isStripe
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}
                      variant="outline"
                    >
                      {isStripe ? "Stripe" : "PayPal"}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {country && (
          <p className="mt-2 text-neutral-600 text-xs">
            {COUNTRIES[country].paymentProcessor === "stripe"
              ? "💳 Payments processed via Stripe"
              : "💳 Payments processed via PayPal"}
          </p>
        )}
      </div>

      {/* Step 2: City Selection (shown only after country is selected) */}
      {country && (
        <div className="mt-4 space-y-2">
          <label className="block font-medium text-neutral-700 text-sm" htmlFor="city-select">
            {t("cityLabel") || "Ciudad"}
          </label>
          <Select onSelectionChange={(key) => onCityChange(key as string)} selectedKey={city}>
            <SelectTrigger id="city-select">
              <SelectValue placeholder={t("cityPlaceholder") || "Selecciona tu ciudad"} />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
