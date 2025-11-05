"use client";

import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../match-wizard";

type LocationStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const CITIES = [
  { value: "bogota", label: "Bogotá" },
  { value: "medellin", label: "Medellín" },
  { value: "cali", label: "Cali" },
  { value: "cartagena", label: "Cartagena" },
  { value: "barranquilla", label: "Barranquilla" },
];

const NEIGHBORHOODS: Record<string, Array<{ value: string; label: string }>> = {
  bogota: [
    { value: "chapinero", label: "Chapinero" },
    { value: "usaquen", label: "Usaquén" },
    { value: "suba", label: "Suba" },
    { value: "teusaquillo", label: "Teusaquillo" },
    { value: "engativa", label: "Engativá" },
  ],
  medellin: [
    { value: "el-poblado", label: "El Poblado" },
    { value: "laureles", label: "Laureles" },
    { value: "envigado", label: "Envigado" },
    { value: "sabaneta", label: "Sabaneta" },
    { value: "belen", label: "Belén" },
  ],
  cali: [
    { value: "granada", label: "Granada" },
    { value: "san-fernando", label: "San Fernando" },
    { value: "ciudad-jardin", label: "Ciudad Jardín" },
  ],
  cartagena: [
    { value: "bocagrande", label: "Bocagrande" },
    { value: "castillogrande", label: "Castillogrande" },
    { value: "manga", label: "Manga" },
  ],
  barranquilla: [
    { value: "el-prado", label: "El Prado" },
    { value: "riomar", label: "Riomar" },
    { value: "alto-prado", label: "Alto Prado" },
  ],
};

export function LocationStep({ data, onUpdate, onNext, onBack }: LocationStepProps) {
  const t = useTranslations("matchWizard.location");

  const handleCityChange = (city: string) => {
    onUpdate({ city, neighborhood: undefined });
  };

  const handleNext = () => {
    if (!data.city) {
      return;
    }
    onNext();
  };

  const neighborhoods = data.city ? NEIGHBORHOODS[data.city] || [] : [];

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)]/5">
          <HugeiconsIcon className="h-8 w-8 text-[var(--foreground)]" icon={Location01Icon} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-[var(--foreground)]">
          {t("title", { defaultValue: "Where do you need help?" })}
        </h2>
        <p className="mt-2 text-[#7a6d62]">
          {t("description", {
            defaultValue: "Select your city and neighborhood to find nearby professionals",
          })}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* City Selection */}
        <div>
          <label className="mb-2 block font-medium text-[var(--foreground)] text-sm" htmlFor="city">
            {t("cityLabel", { defaultValue: "City" })} *
          </label>
          <select
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            id="city"
            onChange={(e) => handleCityChange(e.target.value)}
            value={data.city}
          >
            <option value="">{t("selectCity", { defaultValue: "Select your city" })}</option>
            {CITIES.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood Selection */}
        {data.city && neighborhoods.length > 0 && (
          <div>
            <label
              className="mb-2 block font-medium text-[var(--foreground)] text-sm"
              htmlFor="neighborhood"
            >
              {t("neighborhoodLabel", { defaultValue: "Neighborhood" })}{" "}
              <span className="font-normal text-[#7a6d62]">
                ({t("optional", { defaultValue: "optional" })})
              </span>
            </label>
            <select
              className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
              id="neighborhood"
              onChange={(e) => onUpdate({ neighborhood: e.target.value })}
              value={data.neighborhood || ""}
            >
              <option value="">
                {t("selectNeighborhood", {
                  defaultValue: "Select your neighborhood (helps us show nearby pros)",
                })}
              </option>
              {neighborhoods.map((neighborhood) => (
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
          className="flex-1 rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          onClick={onBack}
          type="button"
        >
          {t("back", { defaultValue: "Back" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-[var(--foreground)] px-6 py-3 font-semibold text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] transition hover:bg-[#2d2822] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!data.city}
          onClick={handleNext}
          type="button"
        >
          {t("next", { defaultValue: "Next Step" })}
        </button>
      </div>
    </div>
  );
}
