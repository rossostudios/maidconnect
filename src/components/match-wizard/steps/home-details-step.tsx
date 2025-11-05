"use client";

import {
  Bathtub01Icon,
  Building01Icon,
  Home01Icon,
  Home01Icon as HomeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { WizardData } from "../match-wizard";

type HomeDetailsStepProps = {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

export function HomeDetailsStep({ data, onUpdate, onNext, onBack, onSkip }: HomeDetailsStepProps) {
  const t = useTranslations("matchWizard.homeDetails");

  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)]/5">
          <HugeiconsIcon className="h-8 w-8 text-[var(--foreground)]" icon={HomeIcon} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="font-semibold text-2xl text-[var(--foreground)]">
          {t("title", { defaultValue: "Tell us about your home" })}
        </h2>
        <p className="mt-2 text-[#7a6d62]">
          {t("description", {
            defaultValue: "This helps us estimate time and match you with the right professionals",
          })}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Bedrooms */}
        <div>
          <label
            className="mb-2 flex items-center gap-2 font-medium text-[var(--foreground)] text-sm"
            htmlFor="bedrooms"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Building01Icon} />
            {t("bedroomsLabel", { defaultValue: "Bedrooms" })}
          </label>
          <select
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            id="bedrooms"
            onChange={(e) => onUpdate({ bedrooms: Number(e.target.value) })}
            value={data.bedrooms || ""}
          >
            <option value="">
              {t("selectBedrooms", { defaultValue: "Select number of bedrooms" })}
            </option>
            <option value="1">1 {t("bedroom", { defaultValue: "bedroom" })}</option>
            <option value="2">2 {t("bedrooms", { defaultValue: "bedrooms" })}</option>
            <option value="3">3 {t("bedrooms", { defaultValue: "bedrooms" })}</option>
            <option value="4">4 {t("bedrooms", { defaultValue: "bedrooms" })}</option>
            <option value="5">5+ {t("bedrooms", { defaultValue: "bedrooms" })}</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label
            className="mb-2 flex items-center gap-2 font-medium text-[var(--foreground)] text-sm"
            htmlFor="bathrooms"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Bathtub01Icon} />
            {t("bathroomsLabel", { defaultValue: "Bathrooms" })}
          </label>
          <select
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            id="bathrooms"
            onChange={(e) => onUpdate({ bathrooms: Number(e.target.value) })}
            value={data.bathrooms || ""}
          >
            <option value="">
              {t("selectBathrooms", { defaultValue: "Select number of bathrooms" })}
            </option>
            <option value="1">1 {t("bathroom", { defaultValue: "bathroom" })}</option>
            <option value="2">2 {t("bathrooms", { defaultValue: "bathrooms" })}</option>
            <option value="3">3 {t("bathrooms", { defaultValue: "bathrooms" })}</option>
            <option value="4">4+ {t("bathrooms", { defaultValue: "bathrooms" })}</option>
          </select>
        </div>

        {/* Square Meters */}
        <div>
          <label
            className="mb-2 block font-medium text-[var(--foreground)] text-sm"
            htmlFor="square-meters"
          >
            {t("squareMetersLabel", { defaultValue: "Approximate size (m²)" })}
          </label>
          <input
            className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            id="square-meters"
            min="20"
            onChange={(e) => onUpdate({ squareMeters: Number(e.target.value) })}
            placeholder={t("squareMetersPlaceholder", { defaultValue: "e.g., 80" })}
            type="number"
            value={data.squareMeters || ""}
          />
        </div>

        {/* Pets */}
        <div className="rounded-xl border border-[#ebe5d8] bg-[#fbfafa] p-4">
          <label className="flex items-center gap-3">
            <input
              checked={data.hasPets}
              className="h-5 w-5 rounded border-[#ebe5d8] text-[var(--foreground)] focus:ring-[var(--foreground)]"
              onChange={(e) => onUpdate({ hasPets: e.target.checked })}
              type="checkbox"
            />
            <div className="flex flex-1 items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-[var(--foreground)]" icon={Home01Icon} />
              <span className="font-medium text-[var(--foreground)]">
                {t("hasPetsLabel", { defaultValue: "I have pets" })}
              </span>
            </div>
          </label>
        </div>

        {/* Pet Details */}
        {data.hasPets && (
          <div>
            <label
              className="mb-2 block font-medium text-[var(--foreground)] text-sm"
              htmlFor="pet-details"
            >
              {t("petDetailsLabel", { defaultValue: "Pet details (optional)" })}
            </label>
            <input
              className="w-full rounded-xl border border-[#ebe5d8] bg-[#fbfafa] px-4 py-3 text-[var(--foreground)] transition focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
              id="pet-details"
              onChange={(e) => onUpdate({ petDetails: e.target.value })}
              placeholder={t("petDetailsPlaceholder", {
                defaultValue: "e.g., 2 friendly dogs, hypoallergenic cat",
              })}
              type="text"
              value={data.petDetails || ""}
            />
          </div>
        )}

        {/* Supplies Needed */}
        <div className="rounded-xl border border-[#ebe5d8] bg-[#fbfafa] p-4">
          <label className="flex items-center gap-3">
            <input
              checked={data.suppliesNeeded}
              className="h-5 w-5 rounded border-[#ebe5d8] text-[var(--foreground)] focus:ring-[var(--foreground)]"
              onChange={(e) => onUpdate({ suppliesNeeded: e.target.checked })}
              type="checkbox"
            />
            <div className="flex-1">
              <span className="font-medium text-[var(--foreground)]">
                {t("suppliesNeededLabel", {
                  defaultValue: "I need the professional to bring supplies",
                })}
              </span>
              <p className="mt-1 text-[#7a6d62] text-xs">
                {t("suppliesNeededHelper", {
                  defaultValue: "Cleaning products, equipment, etc. (may increase cost)",
                })}
              </p>
            </div>
          </label>
        </div>
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
          className="rounded-xl border border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#7a6d62] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          onClick={onSkip}
          type="button"
        >
          {t("skip", { defaultValue: "Skip" })}
        </button>
        <button
          className="flex-1 rounded-xl bg-[var(--foreground)] px-6 py-3 font-semibold text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] transition hover:bg-[#2d2822]"
          onClick={onNext}
          type="button"
        >
          {t("next", { defaultValue: "Next Step" })}
        </button>
      </div>
    </div>
  );
}
