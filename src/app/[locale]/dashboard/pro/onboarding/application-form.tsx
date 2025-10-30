"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { submitApplication } from "./actions";
import { defaultActionState, type OnboardingActionState } from "./state";

type Props = {
  services: string[];
  countries: string[];
  inputClass: string;
};

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

export function ApplicationForm({ services, countries, inputClass }: Props) {
  const t = useTranslations("dashboard.pro.applicationForm");
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    submitApplication,
    defaultActionState
  );

  const fieldError = (key: string) => state.fieldErrors?.[key];
  const hasError = (key: string) => Boolean(fieldError(key));

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <Feedback state={state} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label={t("fullName.label")} error={fieldError("fullName")}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={cn(inputClass, hasError("fullName") && errorClass)}
            placeholder={t("fullName.placeholder")}
            aria-invalid={hasError("fullName")}
            required
          />
        </FormField>
        <FormField label={t("idNumber.label")} error={fieldError("idNumber")}>
          <input
            id="idNumber"
            name="idNumber"
            type="text"
            className={cn(inputClass, hasError("idNumber") && errorClass)}
            placeholder={t("idNumber.placeholder")}
            aria-invalid={hasError("idNumber")}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label={t("phone.label")} error={fieldError("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={cn(inputClass, hasError("phone") && errorClass)}
            placeholder={t("phone.placeholder")}
            aria-invalid={hasError("phone")}
            required
          />
        </FormField>
        <FormField label={t("country.label")} error={fieldError("country")}>
          <select
            id="country"
            name="country"
            className={cn(inputClass, hasError("country") && errorClass)}
            defaultValue="Colombia"
            aria-invalid={hasError("country")}
            required
          >
            {countries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={t("city.label")} error={fieldError("city")}>
        <input
          id="city"
          name="city"
          type="text"
          className={cn(inputClass, hasError("city") && errorClass)}
          placeholder={t("city.placeholder")}
          aria-invalid={hasError("city")}
          required
        />
      </FormField>

      <FormField
        label={t("services.label")}
        error={fieldError("services")}
        helper={t("services.helper")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 border-[#ebe5d8] bg-white p-4 text-base font-medium text-[#211f1a] transition cursor-pointer hover:border-[#ff5d46] hover:bg-[#fff5f2]",
                hasError("services") && "border-red-300"
              )}
            >
              <input
                type="checkbox"
                name="services"
                value={service}
                className="h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
              />
              {service}
            </label>
          ))}
        </div>
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label={t("experienceYears.label")} error={fieldError("experienceYears")}>
          <input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            className={cn(inputClass, hasError("experienceYears") && errorClass)}
            placeholder={t("experienceYears.placeholder")}
            aria-invalid={hasError("experienceYears")}
            required
          />
        </FormField>
        <FormField label={t("rate.label")} helper={t("rate.helper")} error={fieldError("rate")}>
          <input
            id="rate"
            name="rate"
            type="number"
            min={0}
            className={cn(inputClass, hasError("rate") && errorClass)}
            placeholder={t("rate.placeholder")}
            aria-invalid={hasError("rate")}
            required
          />
        </FormField>
      </div>

      <FormField label={t("availability.label")} helper={t("availability.helper")}>
        <textarea
          id="availability"
          name="availability"
          rows={3}
          className={`${inputClass} min-h-[100px]`}
          placeholder={t("availability.placeholder")}
        />
      </FormField>

      <FormField
        label={t("references.label")}
        helper={t("references.helper")}
        error={fieldError("references")}
      >
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div key={index} className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5d46] text-sm font-semibold text-white">
                  {index}
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7d7566]">
                  {t("references.referenceLabel", { number: index })}
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  name={`reference_name_${index}`}
                  className={cn(inputClass, hasError(`reference_name_${index}`) && errorClass)}
                  placeholder={t("references.namePlaceholder")}
                  aria-invalid={hasError(`reference_name_${index}`)}
                />
                <input
                  type="text"
                  name={`reference_relationship_${index}`}
                  className={inputClass}
                  placeholder={t("references.relationshipPlaceholder")}
                />
                <input
                  type="text"
                  name={`reference_contact_${index}`}
                  className={cn(inputClass, hasError(`reference_contact_${index}`) && errorClass)}
                  placeholder={t("references.contactPlaceholder")}
                  aria-invalid={hasError(`reference_contact_${index}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField label={t("consent.label")} error={fieldError("consent")}>
        <label className="flex items-start gap-3 rounded-xl border-2 border-[#ebe5d8] bg-white p-5 text-base text-[#211f1a] cursor-pointer hover:border-[#ff5d46] hover:bg-[#fff5f2] transition">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
            aria-invalid={hasError("consent")}
          />
          <span>{t("consent.text")}</span>
        </label>
      </FormField>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#ebe5d8] pt-8">
        <p className="text-sm text-[#5d574b]">{t("footer.note")}</p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]",
            pending && "cursor-not-allowed opacity-70"
          )}
        >
          {pending ? t("footer.submitting") : t("footer.submit")}
        </button>
      </div>
    </form>
  );
}

function Feedback({ state }: { state: OnboardingActionState }) {
  if (state.status === "error" && state.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm" role="alert">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="flex-1 text-base leading-relaxed text-red-800">{state.error}</p>
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
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="flex-1 text-base leading-relaxed text-green-800">{state.message}</p>
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
  className?: string;
};

function FormField({ label, children, helper, error, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-base font-semibold text-[#211f1a]">{label}</label>
      {helper ? <p className="text-sm text-[#5d574b]">{helper}</p> : null}
      {children}
      {error ? (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
