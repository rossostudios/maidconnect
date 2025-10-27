"use client";

import { useActionState } from "react";
import { submitProfile, defaultActionState, type OnboardingActionState } from "./actions";
import { cn } from "@/lib/utils";

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
};

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

export function ProfileBuildForm({ services, availabilityDays, languages, inputClass }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(submitProfile, defaultActionState);

  const fieldError = (key: string) => state.fieldErrors?.[key];
  const hasError = (key: string) => Boolean(fieldError(key));

  return (
    <form className="space-y-6" action={formAction} noValidate>
      <Feedback state={state} />

      <FormField label="Professional bio" helper="150-300 words works best." error={fieldError("bio")}>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          className={cn(`${inputClass} min-h-[140px]`, hasError("bio") && errorClass)}
          placeholder="Share your background, specialties, and why customers love working with you."
          minLength={150}
          aria-invalid={hasError("bio")}
          required
        />
      </FormField>

      <FormField label="Languages" error={fieldError("languages")}>
        <div className="grid gap-2 sm:grid-cols-3">
          {languages.map((language) => (
            <label
              key={language}
              className={cn(
                "flex items-center gap-2 rounded-md border border-neutral-200 p-3 text-sm",
                hasError("languages") && "border-red-300",
              )}
            >
              <input type="checkbox" name="languages" value={language} className="h-4 w-4" />
              {language}
            </label>
          ))}
        </div>
      </FormField>

      <FormField
        label="Services & rates"
        helper="Tell customers what to expect for each service."
        error={fieldError("services")}
      >
        <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
          {services.map((service) => (
            <div key={service.name}>
              <input type="hidden" name="service_name" value={service.name} />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center text-sm font-medium text-neutral-800">{service.name}</div>
                <input
                  type="number"
                  name="service_rate"
                  className={cn(inputClass, hasError("services") && errorClass)}
                  placeholder="COP/hour"
                  min={0}
                />
                <input
                  type="text"
                  name="service_description"
                  className={cn(inputClass, hasError("services") && errorClass)}
                  placeholder="Short description of service"
                />
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <FormField label="Weekly availability">
        <table className="w-full text-left text-sm text-neutral-700">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 font-semibold">Day</th>
              <th className="py-2 font-semibold">Start</th>
              <th className="py-2 font-semibold">End</th>
              <th className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {availabilityDays.map((day) => (
              <tr key={day.slug} className="border-b border-neutral-100">
                <td className="py-2">{day.label}</td>
                <td className="py-2">
                  <input type="time" name={`availability_${day.slug}_start`} className={inputClass} defaultValue="08:00" />
                </td>
                <td className="py-2">
                  <input type="time" name={`availability_${day.slug}_end`} className={inputClass} defaultValue="16:00" />
                </td>
                <td className="py-2">
                  <input
                    type="text"
                    name={`availability_${day.slug}_notes`}
                    className={inputClass}
                    placeholder="Optional notes"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          Once approved, your profile goes live within 24 hours. You can continue refining details anytime.
        </p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]",
            pending && "cursor-not-allowed opacity-70",
          )}
        >
          {pending ? "Submitting…" : "Submit profile for review"}
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
};

function FormField({ label, children, helper, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-800">{label}</label>
      {helper ? <p className="text-xs text-neutral-500">{helper}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
