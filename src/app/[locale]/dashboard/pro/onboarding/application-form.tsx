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

const errorClass = "border-orange-500/50 focus:border-orange-500 focus:ring-orange-500/30";

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
        <FormField error={fieldError("fullName")} label={t("fullName.label")}>
          <input
            aria-invalid={hasError("fullName")}
            className={cn(inputClass, hasError("fullName") && errorClass)}
            id="fullName"
            name="fullName"
            placeholder={t("fullName.placeholder")}
            required
            type="text"
          />
        </FormField>
        <FormField error={fieldError("idNumber")} label={t("idNumber.label")}>
          <input
            aria-invalid={hasError("idNumber")}
            className={cn(inputClass, hasError("idNumber") && errorClass)}
            id="idNumber"
            name="idNumber"
            placeholder={t("idNumber.placeholder")}
            required
            type="text"
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField error={fieldError("phone")} label={t("phone.label")}>
          <input
            aria-invalid={hasError("phone")}
            className={cn(inputClass, hasError("phone") && errorClass)}
            id="phone"
            name="phone"
            placeholder={t("phone.placeholder")}
            required
            type="tel"
          />
        </FormField>
        <FormField error={fieldError("country")} label={t("country.label")}>
          <select
            aria-invalid={hasError("country")}
            className={cn(inputClass, hasError("country") && errorClass)}
            defaultValue="Colombia"
            id="country"
            name="country"
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

      <FormField error={fieldError("city")} label={t("city.label")}>
        <input
          aria-invalid={hasError("city")}
          className={cn(inputClass, hasError("city") && errorClass)}
          id="city"
          name="city"
          placeholder={t("city.placeholder")}
          required
          type="text"
        />
      </FormField>

      <FormField
        error={fieldError("services")}
        helper={t("services.helper")}
        label={t("services.label")}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-4 font-medium text-base text-neutral-900 transition hover:border-orange-500 hover:bg-neutral-50",
                hasError("services") && "border-orange-500/50"
              )}
              key={service}
            >
              <input
                className="h-5 w-5 rounded border-neutral-200 text-orange-500 focus:ring-orange-500"
                name="services"
                type="checkbox"
                value={service}
              />
              {service}
            </label>
          ))}
        </div>
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField error={fieldError("experienceYears")} label={t("experienceYears.label")}>
          <input
            aria-invalid={hasError("experienceYears")}
            className={cn(inputClass, hasError("experienceYears") && errorClass)}
            id="experienceYears"
            min={0}
            name="experienceYears"
            placeholder={t("experienceYears.placeholder")}
            required
            type="number"
          />
        </FormField>
        <FormField error={fieldError("rate")} helper={t("rate.helper")} label={t("rate.label")}>
          <input
            aria-invalid={hasError("rate")}
            className={cn(inputClass, hasError("rate") && errorClass)}
            id="rate"
            min={0}
            name="rate"
            placeholder={t("rate.placeholder")}
            required
            type="number"
          />
        </FormField>
      </div>

      <FormField helper={t("availability.helper")} label={t("availability.label")}>
        <textarea
          className={`${inputClass} min-h-[100px]`}
          id="availability"
          name="availability"
          placeholder={t("availability.placeholder")}
          rows={3}
        />
      </FormField>

      <FormField
        error={fieldError("references")}
        helper={t("references.helper")}
        label={t("references.label")}
      >
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6" key={index}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-semibold text-sm text-white">
                  {index}
                </div>
                <p className="font-semibold text-neutral-500 text-sm uppercase tracking-[0.2em]">
                  {t("references.referenceLabel", { number: index })}
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <input
                  aria-invalid={hasError(`reference_name_${index}`)}
                  className={cn(inputClass, hasError(`reference_name_${index}`) && errorClass)}
                  name={`reference_name_${index}`}
                  placeholder={t("references.namePlaceholder")}
                  type="text"
                />
                <input
                  className={inputClass}
                  name={`reference_relationship_${index}`}
                  placeholder={t("references.relationshipPlaceholder")}
                  type="text"
                />
                <input
                  aria-invalid={hasError(`reference_contact_${index}`)}
                  className={cn(inputClass, hasError(`reference_contact_${index}`) && errorClass)}
                  name={`reference_contact_${index}`}
                  placeholder={t("references.contactPlaceholder")}
                  type="text"
                />
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField error={fieldError("consent")} label={t("consent.label")}>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-neutral-200 bg-neutral-50 p-5 text-base text-neutral-900 transition hover:border-orange-500 hover:bg-neutral-50">
          <input
            aria-invalid={hasError("consent")}
            className="mt-0.5 h-5 w-5 rounded border-neutral-200 text-orange-500 focus:ring-orange-500"
            name="consent"
            type="checkbox"
          />
          <span>{t("consent.text")}</span>
        </label>
      </FormField>

      <div className="flex flex-col gap-4 border-neutral-200 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-neutral-500 text-sm">{t("footer.note")}</p>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-orange-500",
            pending && "cursor-not-allowed opacity-70"
          )}
          disabled={pending}
          type="submit"
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
      <div
        className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 shadow-sm"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
            <svg
              aria-label="Error icon"
              className="h-5 w-5 text-orange-500"
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
          <p className="flex-1 text-base text-orange-500 leading-relaxed">{state.error}</p>
        </div>
      </div>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <div
        className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-6 shadow-sm"
        role="status"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
            <svg
              aria-label="Success icon"
              className="h-5 w-5 text-orange-500"
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
          <p className="flex-1 text-base text-orange-500 leading-relaxed">{state.message}</p>
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
  const childId = (children as React.ReactElement<{ id?: string }>)?.props?.id;

  return (
    <div className={cn("space-y-3", className)}>
      <label className="block font-semibold text-base text-neutral-900" htmlFor={childId}>
        {label}
      </label>
      {helper ? <p className="text-neutral-500 text-sm">{helper}</p> : null}
      {children}
      {error ? (
        <p className="flex items-center gap-2 text-orange-500 text-sm">
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
