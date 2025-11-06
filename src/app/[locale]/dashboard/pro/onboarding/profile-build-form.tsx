"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { cn } from "@/lib/utils";
import { submitProfile } from "./actions";
import { defaultActionState, type OnboardingActionState } from "./state";

type ServiceOption = {
  name: string;
};

type AvailabilityDay = {
  label: string;
  slug: string;
};

type Props = {
  services: ServiceOption[];
  availabilityDays: AvailabilityDay[];
  languages: string[];
  inputClass: string;
  initialData?: {
    bio?: string | null;
    languages?: string[] | null;
    services?: Array<{
      name?: string | null;
      hourly_rate_cop?: number | null;
      description?: string | null;
    }> | null;
    availability?: Array<{
      day?: string | null;
      start?: string | null;
      end?: string | null;
      notes?: string | null;
    }> | null;
  };
  submitLabel?: string;
  footnote?: string;
};

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

function parseServiceDefaults(
  services?: Array<{
    name?: string | null;
    hourly_rate_cop?: number | null;
    description?: string | null;
  }> | null
): Map<string, { rate: number | null; description: string }> {
  const serviceDefaults = new Map<string, { rate: number | null; description: string }>();

  if (!services) {
    return serviceDefaults;
  }

  for (const service of services) {
    if (!service?.name) {
      continue;
    }

    const rawRate = service.hourly_rate_cop;
    let parsedRate: number | null = null;

    if (typeof rawRate === "number") {
      parsedRate = rawRate;
    } else if (typeof rawRate === "string") {
      parsedRate = Number.parseInt(rawRate, 10);
    }

    serviceDefaults.set(service.name, {
      rate: Number.isNaN(parsedRate) ? null : parsedRate,
      description: service.description ?? "",
    });
  }

  return serviceDefaults;
}

function parseAvailabilityDefaults(
  availability?: Array<{
    day?: string | null;
    start?: string | null;
    end?: string | null;
    notes?: string | null;
  }> | null
): Map<string, { start: string; end: string; notes: string }> {
  const availabilityDefaults = new Map<string, { start: string; end: string; notes: string }>();

  if (!availability) {
    return availabilityDefaults;
  }

  for (const slot of availability) {
    if (!slot?.day) {
      continue;
    }

    const slug = slot.day.toLowerCase().replace(/\s+/g, "_");
    availabilityDefaults.set(slug, {
      start: slot.start ?? "",
      end: slot.end ?? "",
      notes: slot.notes ?? "",
    });
  }

  return availabilityDefaults;
}

export function ProfileBuildForm({
  services,
  availabilityDays,
  languages,
  inputClass,
  initialData,
  submitLabel,
  footnote,
}: Props) {
  const t = useTranslations("dashboard.pro.profileBuildForm");
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    submitProfile,
    defaultActionState
  );

  const fieldError = (key: string) => state.fieldErrors?.[key];
  const hasError = (key: string) => Boolean(fieldError(key));

  const defaultSubmitLabel = submitLabel ?? t("footer.submitDefault");
  const defaultFootnote = footnote ?? t("footer.footnoteDefault");

  const serviceDefaults = parseServiceDefaults(initialData?.services);
  const availabilityDefaults = parseAvailabilityDefaults(initialData?.availability);

  const initialLanguages = initialData?.languages ?? [];
  const [bioLength, setBioLength] = useState((initialData?.bio ?? "").length);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <Feedback state={state} />

      <FormField characterCount={bioLength} error={fieldError("bio")} label={t("bio.label")}>
        <textarea
          aria-invalid={hasError("bio")}
          className={cn(`${inputClass} min-h-[200px]`, hasError("bio") && errorClass)}
          defaultValue={initialData?.bio ?? ""}
          id="bio"
          minLength={150}
          name="bio"
          onChange={(e) => setBioLength(e.target.value.length)}
          placeholder={t("bio.placeholder")}
          required
          rows={8}
        />
      </FormField>

      <FormField error={fieldError("languages")} label={t("languages.label")}>
        <div className="flex flex-wrap gap-3">
          {languages.map((language) => (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-full border-2 border-[#ebe5d8] bg-white px-5 py-3 font-medium text-base text-gray-900 transition hover:border-[#E85D48] hover:bg-[#fff5f2]",
                hasError("languages") && "border-red-300"
              )}
              key={language}
            >
              <input
                className="h-5 w-5 rounded border-[#ebe5d8] text-[#E85D48] focus:ring-[#E85D48]"
                defaultChecked={initialLanguages.includes(language)}
                name="languages"
                type="checkbox"
                value={language}
              />
              {language}
            </label>
          ))}
        </div>
      </FormField>

      <FormField
        error={fieldError("services")}
        helper={t("services.helper")}
        label={t("services.label")}
      >
        <div className="space-y-4">
          {services.map((service) => (
            <div
              className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
              key={service.name}
            >
              <input name="service_name" type="hidden" value={service.name} />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">{service.name}</h4>
                {(() => {
                  const defaults = serviceDefaults.get(service.name);
                  const rateValue =
                    defaults?.rate !== null &&
                    defaults?.rate !== undefined &&
                    !Number.isNaN(defaults.rate)
                      ? defaults.rate
                      : "";
                  return (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-2 block font-medium text-gray-600 text-sm"
                          htmlFor={`service_rate_${service.name}`}
                        >
                          {t("services.hourlyRate")}
                        </label>
                        <input
                          className={cn(inputClass, hasError("services") && errorClass)}
                          defaultValue={rateValue === "" ? "" : String(rateValue)}
                          id={`service_rate_${service.name}`}
                          min={0}
                          name="service_rate"
                          placeholder={t("services.ratePlaceholder")}
                          type="number"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className="mb-2 block font-medium text-gray-600 text-sm"
                          htmlFor={`service_description_${service.name}`}
                        >
                          {t("services.serviceDescription")}
                        </label>
                        <input
                          className={cn(inputClass, hasError("services") && errorClass)}
                          defaultValue={defaults?.description ?? ""}
                          id={`service_description_${service.name}`}
                          name="service_description"
                          placeholder={t("services.descriptionPlaceholder")}
                          type="text"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField helper={t("availability.helper")} label={t("availability.label")}>
        <div className="space-y-3">
          {availabilityDays.map((day) => (
            <div
              className="rounded-xl border border-[#ebe5d8] bg-white p-5 shadow-sm"
              key={day.slug}
            >
              <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr_1fr]">
                <div className="flex items-center">
                  <span className="font-semibold text-base text-gray-900">{day.label}</span>
                </div>
                <div>
                  <label
                    className="mb-2 block font-medium text-[#7d7566] text-xs uppercase tracking-wide"
                    htmlFor={`availability_${day.slug}_start`}
                  >
                    {t("availability.start")}
                  </label>
                  <input
                    className={inputClass}
                    defaultValue={availabilityDefaults.get(day.slug)?.start || "08:00"}
                    id={`availability_${day.slug}_start`}
                    name={`availability_${day.slug}_start`}
                    type="time"
                  />
                </div>
                <div>
                  <label
                    className="mb-2 block font-medium text-[#7d7566] text-xs uppercase tracking-wide"
                    htmlFor={`availability_${day.slug}_end`}
                  >
                    {t("availability.end")}
                  </label>
                  <input
                    className={inputClass}
                    defaultValue={availabilityDefaults.get(day.slug)?.end || "16:00"}
                    id={`availability_${day.slug}_end`}
                    name={`availability_${day.slug}_end`}
                    type="time"
                  />
                </div>
                <div>
                  <label
                    className="mb-2 block font-medium text-[#7d7566] text-xs uppercase tracking-wide"
                    htmlFor={`availability_${day.slug}_notes`}
                  >
                    {t("availability.notes")}
                  </label>
                  <input
                    className={inputClass}
                    defaultValue={availabilityDefaults.get(day.slug)?.notes ?? ""}
                    id={`availability_${day.slug}_notes`}
                    name={`availability_${day.slug}_notes`}
                    placeholder={t("availability.notesPlaceholder")}
                    type="text"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <div className="flex flex-col gap-4 border-[#ebe5d8] border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 text-sm">{defaultFootnote}</p>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#D64A36]",
            pending && "cursor-not-allowed opacity-70"
          )}
          disabled={pending}
          type="submit"
        >
          {pending ? t("footer.saving") : defaultSubmitLabel}
        </button>
      </div>
    </form>
  );
}

function Feedback({ state }: { state: OnboardingActionState }) {
  if (state.status === "error" && state.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-[#E85D48]/10 p-6 shadow-sm" role="alert">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              aria-label="Error icon"
              className="h-5 w-5 text-[#E85D48]"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="flex-1 text-base text-red-800 leading-relaxed">{state.error}</p>
        </div>
      </div>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm" role="status">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg
              aria-label="Success icon"
              className="h-5 w-5 text-green-600"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="flex-1 text-base text-green-800 leading-relaxed">{state.message}</p>
        </div>
      </div>
    );
  }
  return null;
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  helper?: string;
  error?: string;
  characterCount?: number;
};

function FormField({ label, children, helper, error, characterCount }: FormFieldProps) {
  const t = useTranslations("dashboard.pro.profileBuildForm");
  const childId = (children as React.ReactElement<{ id?: string }>)?.props?.id;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-base text-gray-900" htmlFor={childId}>
          {label}
        </label>
        {characterCount !== undefined ? (
          <span className="text-[#7d7566] text-sm">
            {t("characterCount", { count: characterCount })}
          </span>
        ) : null}
      </div>
      {helper ? <p className="text-gray-600 text-sm">{helper}</p> : null}
      {children}
      {error ? (
        <p className="flex items-center gap-2 text-[#E85D48] text-sm">
          <svg
            aria-label="Error icon"
            className="h-4 w-4"
            fill="currentColor"
            role="img"
            viewBox="0 0 20 20"
          >
            <path
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
