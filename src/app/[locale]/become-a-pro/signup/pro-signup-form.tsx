"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { ConsentCheckboxes } from "@/components/auth/consent-checkboxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proSignUpAction } from "./actions";
import type { ProSignUpActionState } from "./types";

const defaultState: ProSignUpActionState = { status: "idle" };

const SERVICE_CATEGORIES = [
  "housekeeping",
  "childcare",
  "cooking",
  "eldercare",
  "petcare",
  "gardening",
  "maintenance",
  "other",
] as const;

const EXPERIENCE_LEVELS = ["0-1", "1-3", "3-5", "5-10", "10+"] as const;

const AVAILABILITY_OPTIONS = ["full-time", "part-time", "weekends", "flexible"] as const;

function FormStatusMessages({
  state,
  t,
}: {
  state: ProSignUpActionState;
  t: (key: string) => string;
}) {
  if (state.status === "error" && state.error) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
        role="alert"
      >
        {state.error}
      </p>
    );
  }
  if (state.status === "success") {
    return (
      <p
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm"
        role="status"
      >
        {t("successMessage")}
      </p>
    );
  }
  return null;
}

export function ProSignUpForm() {
  const t = useTranslations("becomeAPro.signup.form");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const [state, formAction, isPending] = useActionState<ProSignUpActionState, FormData>(
    proSignUpAction,
    defaultState
  );

  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [selectedService, setSelectedService] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("CO");

  const fieldError = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Hidden fields */}
      <input name="role" type="hidden" value="professional" />
      <input name="referralCode" type="hidden" value={referralCode} />

      {/* Referral code indicator */}
      {referralCode && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-orange-700 text-sm">
            <span className="font-semibold">{t("referralApplied")}</span> {referralCode}
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.basicInfo")}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={fieldError("fullName")} label={t("fullNameLabel")}>
            <Input
              aria-invalid={Boolean(fieldError("fullName"))}
              className={fieldError("fullName") ? "border-red-500" : ""}
              id="fullName"
              name="fullName"
              placeholder={t("fullNamePlaceholder")}
              required
            />
          </Field>

          <Field error={fieldError("phone")} label={t("phoneLabel")}>
            <Input
              aria-invalid={Boolean(fieldError("phone"))}
              className={fieldError("phone") ? "border-red-500" : ""}
              id="phone"
              name="phone"
              placeholder={t("phonePlaceholder")}
              required
              type="tel"
            />
          </Field>
        </div>

        <Field error={fieldError("email")} label={t("emailLabel")}>
          <Input
            aria-invalid={Boolean(fieldError("email"))}
            autoComplete="email"
            className={fieldError("email") ? "border-red-500" : ""}
            id="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            type="email"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={fieldError("country")} label={t("countryLabel")}>
            <Select name="country" onValueChange={setSelectedCountry} value={selectedCountry}>
              <SelectTrigger
                aria-invalid={Boolean(fieldError("country"))}
                className={fieldError("country") ? "border-red-500" : ""}
                id="country"
              >
                <SelectValue placeholder={t("countryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CO">Colombia</SelectItem>
                <SelectItem value="PY">Paraguay</SelectItem>
                <SelectItem value="UY">Uruguay</SelectItem>
                <SelectItem value="AR">Argentina</SelectItem>
              </SelectContent>
            </Select>
            <input name="country" type="hidden" value={selectedCountry} />
          </Field>

          <Field error={fieldError("city")} label={t("cityLabel")}>
            <Input
              aria-invalid={Boolean(fieldError("city"))}
              className={fieldError("city") ? "border-red-500" : ""}
              id="city"
              name="city"
              placeholder={t("cityPlaceholder")}
              required
            />
          </Field>
        </div>
      </div>

      {/* Professional Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.professionalInfo")}</h3>

        <Field error={fieldError("primaryService")} label={t("primaryServiceLabel")}>
          <Select name="primaryService" onValueChange={setSelectedService} value={selectedService}>
            <SelectTrigger
              aria-invalid={Boolean(fieldError("primaryService"))}
              className={fieldError("primaryService") ? "border-red-500" : ""}
              id="primaryService"
            >
              <SelectValue placeholder={t("primaryServicePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_CATEGORIES.map((service) => (
                <SelectItem key={service} value={service}>
                  {t(`services.${service}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input name="primaryService" type="hidden" value={selectedService} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={fieldError("experience")} label={t("experienceLabel")}>
            <Select
              name="experience"
              onValueChange={setSelectedExperience}
              value={selectedExperience}
            >
              <SelectTrigger
                aria-invalid={Boolean(fieldError("experience"))}
                className={fieldError("experience") ? "border-red-500" : ""}
                id="experience"
              >
                <SelectValue placeholder={t("experiencePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {t(`experienceLevels.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input name="experience" type="hidden" value={selectedExperience} />
          </Field>

          <Field error={fieldError("availability")} label={t("availabilityLabel")}>
            <Select
              name="availability"
              onValueChange={setSelectedAvailability}
              value={selectedAvailability}
            >
              <SelectTrigger
                aria-invalid={Boolean(fieldError("availability"))}
                className={fieldError("availability") ? "border-red-500" : ""}
                id="availability"
              >
                <SelectValue placeholder={t("availabilityPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`availabilityOptions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input name="availability" type="hidden" value={selectedAvailability} />
          </Field>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.security")}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={fieldError("password")} label={t("passwordLabel")}>
            <Input
              aria-invalid={Boolean(fieldError("password"))}
              autoComplete="new-password"
              className={fieldError("password") ? "border-red-500" : ""}
              id="password"
              minLength={8}
              name="password"
              placeholder={t("passwordPlaceholder")}
              required
              type="password"
            />
          </Field>

          <Field error={fieldError("confirmPassword")} label={t("confirmPasswordLabel")}>
            <Input
              aria-invalid={Boolean(fieldError("confirmPassword"))}
              autoComplete="new-password"
              className={fieldError("confirmPassword") ? "border-red-500" : ""}
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              placeholder={t("confirmPasswordPlaceholder")}
              required
              type="password"
            />
          </Field>
        </div>
      </div>

      {/* Language preference */}
      <Field error={fieldError("locale")} label={t("preferredLanguageLabel")}>
        <Select name="locale" onValueChange={setSelectedLocale} value={selectedLocale}>
          <SelectTrigger
            aria-invalid={Boolean(fieldError("locale"))}
            className={fieldError("locale") ? "border-red-500" : ""}
            id="locale"
          >
            <SelectValue placeholder={t("preferredLanguagePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">English</SelectItem>
            <SelectItem value="es-CO">Español</SelectItem>
          </SelectContent>
        </Select>
        <input name="locale" type="hidden" value={selectedLocale} />
      </Field>

      {/* Consents */}
      <ConsentCheckboxes
        errors={{
          privacyConsent: fieldError("privacyConsent"),
          termsConsent: fieldError("termsConsent"),
          dataProcessingConsent: fieldError("dataProcessingConsent"),
        }}
        locale={locale}
      />

      <FormStatusMessages state={state} t={t} />

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? t("creatingAccountButton") : t("createAccountButton")}
      </Button>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
};

function Field({ label, children, error }: FieldProps) {
  const childId = (children as React.ReactElement<{ id?: string }>)?.props?.id;
  const errorId = childId ? `${childId}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={childId}>{label}</Label>
      {children}
      {error ? (
        <p className="text-red-600 text-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
