"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { Link } from "@/i18n/routing";
import { signUpAction } from "./actions";
import { defaultSignUpState, type SignUpActionState } from "./types";

function ProfessionalCallout({ t }: { t: (key: string) => string }) {
  return (
    <div className="rounded-lg border border-rausch-200 bg-rausch-50 p-4">
      <p className="mb-2 font-medium text-neutral-900 text-sm">{t("professionalCallout")}</p>
      <Link
        className="inline-flex items-center gap-1.5 font-semibold text-rausch-600 text-sm transition-colors hover:text-rausch-700"
        href="/become-a-pro"
      >
        {t("professionalCalloutLink")}
        <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} />
      </Link>
    </div>
  );
}

function FormStatusMessages({
  state,
  t,
}: {
  state: SignUpActionState;
  t: (key: string) => string;
}) {
  if (state.status === "error" && state.error) {
    return (
      <p className="border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.status === "success") {
    return (
      <p
        className="border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm"
        role="status"
      >
        {t("successMessage")}
      </p>
    );
  }
  return null;
}

export function SignUpForm() {
  const t = useTranslations("pages.signUp.form");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState<SignUpActionState, FormData>(
    signUpAction,
    defaultSignUpState
  );
  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const fieldError = (field: string) => state.fieldErrors?.[field];

  const PROPERTY_TYPES = [
    { value: "apartment", label: t("propertyApartment") },
    { value: "house", label: t("propertyHouse") },
    { value: "office", label: t("propertyOffice") },
    { value: "other", label: t("propertyOther") },
  ];

  return (
    <form action={formAction} className="space-y-10" noValidate>
      {/* Hidden role input - customers only, professionals use /become-a-pro */}
      <input name="role" type="hidden" value="customer" />

      <ProfessionalCallout t={t} />

      <section className="grid gap-6 sm:grid-cols-2">
        <InputField
          error={fieldError("fullName")}
          id="fullName"
          label={t("fullNameLabel")}
          name="fullName"
          placeholder={t("fullNamePlaceholder")}
        />
        <InputField
          error={fieldError("phone")}
          id="phone"
          label={t("phoneLabel")}
          name="phone"
          placeholder={t("phonePlaceholder")}
          type="tel"
        />
        <InputField
          error={fieldError("city")}
          id="city"
          label={t("cityLabel")}
          name="city"
          placeholder={t("cityPlaceholder")}
        />
        <Field error={fieldError("locale")} label={t("preferredLanguageLabel")}>
          <Select name="locale" onValueChange={setSelectedLocale} value={selectedLocale}>
            <SelectTrigger
              aria-describedby={fieldError("locale") ? "locale-error" : undefined}
              aria-invalid={Boolean(fieldError("locale"))}
              className={fieldError("locale") ? "border-red-500" : ""}
              id="locale"
            >
              <SelectValue placeholder={t("preferredLanguageLabel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">{t("languageEnglish")}</SelectItem>
              <SelectItem value="es-CO">{t("languageSpanish")}</SelectItem>
            </SelectContent>
          </Select>
          <input name="locale" type="hidden" value={selectedLocale} />
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <InputField
          autoComplete="email"
          error={fieldError("email")}
          id="email"
          label={t("emailLabel")}
          name="email"
          placeholder={t("emailPlaceholder")}
          type="email"
        />
        <Field error={fieldError("propertyType")} label={t("propertyTypeLabel")}>
          <Select
            name="propertyType"
            onValueChange={setSelectedPropertyType}
            value={selectedPropertyType}
          >
            <SelectTrigger
              aria-describedby={fieldError("propertyType") ? "propertyType-error" : undefined}
              aria-invalid={Boolean(fieldError("propertyType"))}
              className={fieldError("propertyType") ? "border-red-500" : ""}
              id="propertyType"
            >
              <SelectValue placeholder={t("propertyTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input name="propertyType" type="hidden" value={selectedPropertyType} />
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <InputField
          autoComplete="new-password"
          error={fieldError("password")}
          id="password"
          label={t("passwordLabel")}
          minLength={8}
          name="password"
          placeholder={t("passwordPlaceholder")}
          type="password"
        />
        <InputField
          autoComplete="new-password"
          error={fieldError("confirmPassword")}
          id="confirmPassword"
          label={t("confirmPasswordLabel")}
          minLength={8}
          name="confirmPassword"
          placeholder={t("confirmPasswordPlaceholder")}
          type="password"
        />
      </section>

      <section>
        <ConsentCheckboxes
          errors={{
            privacyConsent: fieldError("privacyConsent"),
            termsConsent: fieldError("termsConsent"),
            dataProcessingConsent: fieldError("dataProcessingConsent"),
          }}
          locale={locale}
        />
      </section>

      <FormStatusMessages state={state} t={t} />

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? t("creatingAccountButton") : t("createAccountButton")}
      </Button>
    </form>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  helper?: string;
  error?: string;
};

function Field({ label, children, helper, error }: FieldProps) {
  const childId = (children as React.ReactElement<{ id?: string }>)?.props?.id;
  const errorId = childId ? `${childId}-error` : undefined;

  return (
    <div className="space-y-3">
      <Label htmlFor={childId}>{label}</Label>
      {helper ? <p className="text-neutral-600 text-xs">{helper}</p> : null}
      {children}
      {error ? (
        <p className="text-red-700 text-xs" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel" | "password";
  error?: string;
  autoComplete?: string;
  minLength?: number;
};

function InputField({
  id,
  name,
  label,
  placeholder,
  type = "text",
  error,
  autoComplete,
  minLength,
}: InputFieldProps) {
  return (
    <Field error={error} label={label}>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={error ? "border-red-500" : ""}
        id={id}
        minLength={minLength}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </Field>
  );
}
