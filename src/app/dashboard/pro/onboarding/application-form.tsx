"use client";

import { useActionState } from "react";
import { submitApplication, defaultActionState, type OnboardingActionState } from "./actions";
import { cn } from "@/lib/utils";

type Props = {
  services: string[];
  countries: string[];
  inputClass: string;
};

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

export function ApplicationForm({ services, countries, inputClass }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(submitApplication, defaultActionState);

  const fieldError = (key: string) => state.fieldErrors?.[key];
  const hasError = (key: string) => Boolean(fieldError(key));

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" error={fieldError("fullName")}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className={cn(inputClass, hasError("fullName") && errorClass)}
            placeholder="María Rodríguez"
            aria-invalid={hasError("fullName")}
            required
          />
        </FormField>
        <FormField label="ID number" error={fieldError("idNumber")}>
          <input
            id="idNumber"
            name="idNumber"
            type="text"
            className={cn(inputClass, hasError("idNumber") && errorClass)}
            placeholder="CC 1234567890"
            aria-invalid={hasError("idNumber")}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone number" error={fieldError("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={cn(inputClass, hasError("phone") && errorClass)}
            placeholder="+57 300 123 4567"
            aria-invalid={hasError("phone")}
            required
          />
        </FormField>
        <FormField label="Country" error={fieldError("country")}>
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

      <FormField label="City" error={fieldError("city")}>
        <input
          id="city"
          name="city"
          type="text"
          className={cn(inputClass, hasError("city") && errorClass)}
          placeholder="Medellín"
          aria-invalid={hasError("city")}
          required
        />
      </FormField>

      <FormField
        label="Services offered"
        error={fieldError("services")}
        helper="Select all services you can confidently provide."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service}
              className={cn(
                "flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm",
                hasError("services") && "border-red-300",
              )}
            >
              <input type="checkbox" name="services" value={service} className="h-4 w-4" />
              {service}
            </label>
          ))}
        </div>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Years of experience" error={fieldError("experienceYears")}>
          <input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            className={cn(inputClass, hasError("experienceYears") && errorClass)}
            placeholder="5"
            aria-invalid={hasError("experienceYears")}
            required
          />
        </FormField>
        <FormField label="Rate expectations (per hour)" helper="COP/hour" error={fieldError("rate")}>
          <input
            id="rate"
            name="rate"
            type="number"
            min={0}
            className={cn(inputClass, hasError("rate") && errorClass)}
            placeholder="40000"
            aria-invalid={hasError("rate")}
            required
          />
        </FormField>
      </div>

      <FormField
        label="Availability"
        helper="Example: Monday to Friday 8am - 4pm. Mention weekends or flexible hours if applicable."
      >
        <textarea
          id="availability"
          name="availability"
          rows={3}
          className={`${inputClass} min-h-[100px]`}
          placeholder="Example: Monday to Friday 8am - 4pm"
        />
      </FormField>

      <FormField label="Professional references" helper="Provide two references we can contact." error={fieldError("references")}>
        <div className="space-y-3">
          {[1, 2].map((index) => (
            <div key={index} className="rounded-lg border border-neutral-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{`Reference ${index}`}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  name={`reference_name_${index}`}
                  className={cn(inputClass, hasError(`reference_name_${index}`) && errorClass)}
                  placeholder="Name"
                  aria-invalid={hasError(`reference_name_${index}`)}
                />
                <input
                  type="text"
                  name={`reference_relationship_${index}`}
                  className={inputClass}
                  placeholder="Relationship"
                />
                <input
                  type="text"
                  name={`reference_contact_${index}`}
                  className={cn(inputClass, hasError(`reference_contact_${index}`) && errorClass)}
                  placeholder="Phone or email"
                  aria-invalid={hasError(`reference_contact_${index}`)}
                />
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField label="Background check consent" error={fieldError("consent")}>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" name="consent" className="h-4 w-4" aria-invalid={hasError("consent")} />
          I authorize MaidConnect to conduct identity and background verifications for onboarding.
        </label>
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          Submitting this application triggers our review team to start verification. You can still edit details later.
        </p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]",
            pending && "cursor-not-allowed opacity-70",
          )}
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}

function Feedback({ state }: { state: OnboardingActionState }) {
  if (state.status === "error" && state.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {state.error}
      </div>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
        {state.message}
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
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-neutral-800">{label}</label>
      {helper ? <p className="text-xs text-neutral-500">{helper}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
