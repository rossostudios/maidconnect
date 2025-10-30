"use client";

import { useActionState, useState } from "react";
import { submitProfile } from "./actions";
import { defaultActionState, type OnboardingActionState } from "./state";
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

export function ProfileBuildForm({
  services,
  availabilityDays,
  languages,
  inputClass,
  initialData,
  submitLabel = "Submit profile for review",
  footnote = "Once approved, your profile goes live within 24 hours. You can continue refining details anytime.",
}: Props) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(submitProfile, defaultActionState);

  const fieldError = (key: string) => state.fieldErrors?.[key];
  const hasError = (key: string) => Boolean(fieldError(key));

  const serviceDefaults = new Map<string, { rate: number | null; description: string }>();
  if (initialData?.services) {
    initialData.services.forEach((service) => {
      if (!service?.name) return;
      const rawRate = service.hourly_rate_cop;
      const parsedRate =
        typeof rawRate === "number"
          ? rawRate
          : typeof rawRate === "string"
            ? Number.parseInt(rawRate, 10)
            : null;
      serviceDefaults.set(service.name, {
        rate: Number.isNaN(parsedRate) ? null : parsedRate,
        description: service.description ?? "",
      });
    });
  }

  const availabilityDefaults = new Map<string, { start: string; end: string; notes: string }>();
  if (initialData?.availability) {
    initialData.availability.forEach((slot) => {
      if (!slot?.day) return;
      const slug = slot.day.toLowerCase().replace(/\s+/g, "_");
      availabilityDefaults.set(slug, {
        start: slot.start ?? "",
        end: slot.end ?? "",
        notes: slot.notes ?? "",
      });
    });
  }

  const initialLanguages = initialData?.languages ?? [];
  const [bioLength, setBioLength] = useState((initialData?.bio ?? "").length);

  return (
    <form className="space-y-8" action={formAction} noValidate>
      <Feedback state={state} />

      <FormField
        label="Professional bio"
        error={fieldError("bio")}
        characterCount={bioLength}
      >
        <textarea
          id="bio"
          name="bio"
          rows={8}
          className={cn(`${inputClass} min-h-[200px]`, hasError("bio") && errorClass)}
          placeholder="Share your background, specialties, and why customers love working with you."
          minLength={150}
          defaultValue={initialData?.bio ?? ""}
          aria-invalid={hasError("bio")}
          onChange={(e) => setBioLength(e.target.value.length)}
          required
        />
      </FormField>

      <FormField label="Languages" error={fieldError("languages")}>
        <div className="flex flex-wrap gap-3">
          {languages.map((language) => (
            <label
              key={language}
              className={cn(
                "flex items-center gap-3 rounded-full border-2 border-[#ebe5d8] bg-white px-5 py-3 text-base font-medium text-[#211f1a] transition cursor-pointer hover:border-[#ff5d46] hover:bg-[#fff5f2]",
                hasError("languages") && "border-red-300",
              )}
            >
              <input
                type="checkbox"
                name="languages"
                value={language}
                className="h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
                defaultChecked={initialLanguages.includes(language)}
              />
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
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <input type="hidden" name="service_name" value={service.name} />
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[#211f1a]">{service.name}</h4>
                {(() => {
                  const defaults = serviceDefaults.get(service.name);
                  const rateValue =
                    defaults?.rate !== null && defaults?.rate !== undefined && !Number.isNaN(defaults.rate)
                      ? defaults.rate
                      : "";
                  return (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#5d574b]">Hourly rate (COP)</label>
                        <input
                          type="number"
                          name="service_rate"
                          className={cn(inputClass, hasError("services") && errorClass)}
                          placeholder="40000"
                          min={0}
                          defaultValue={rateValue === "" ? "" : String(rateValue)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#5d574b]">Service description</label>
                        <input
                          type="text"
                          name="service_description"
                          className={cn(inputClass, hasError("services") && errorClass)}
                          placeholder="Describe what's included in this service"
                          defaultValue={defaults?.description ?? ""}
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

      <FormField label="Weekly availability" helper="Set your typical working hours for each day.">
        <div className="space-y-3">
          {availabilityDays.map((day) => (
            <div
              key={day.slug}
              className="rounded-xl border border-[#ebe5d8] bg-white p-5 shadow-sm"
            >
              <div className="grid gap-4 sm:grid-cols-[120px_1fr_1fr_1fr]">
                <div className="flex items-center">
                  <span className="text-base font-semibold text-[#211f1a]">{day.label}</span>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#7d7566]">Start</label>
                  <input
                    type="time"
                    name={`availability_${day.slug}_start`}
                    className={inputClass}
                    defaultValue={availabilityDefaults.get(day.slug)?.start || "08:00"}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#7d7566]">End</label>
                  <input
                    type="time"
                    name={`availability_${day.slug}_end`}
                    className={inputClass}
                    defaultValue={availabilityDefaults.get(day.slug)?.end || "16:00"}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#7d7566]">Notes (optional)</label>
                  <input
                    type="text"
                    name={`availability_${day.slug}_notes`}
                    className={inputClass}
                    placeholder="e.g., Flexible"
                    defaultValue={availabilityDefaults.get(day.slug)?.notes ?? ""}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </FormField>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#ebe5d8] pt-8">
        <p className="text-sm text-[#5d574b]">{footnote}</p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]",
            pending && "cursor-not-allowed opacity-70",
          )}
        >
          {pending ? "Saving…" : submitLabel}
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
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  characterCount?: number;
};

function FormField({ label, children, helper, error, characterCount }: FormFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold text-[#211f1a]">{label}</label>
        {characterCount !== undefined ? (
          <span className="text-sm text-[#7d7566]">{characterCount.toLocaleString()} characters</span>
        ) : null}
      </div>
      {helper ? <p className="text-sm text-[#5d574b]">{helper}</p> : null}
      {children}
      {error ? (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
