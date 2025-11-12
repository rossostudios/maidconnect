"use client";

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
import { cn } from "@/lib/utils";
import { signUpAction } from "./actions";
import { defaultSignUpState, type SignUpActionState } from "./types";

function getRoleOptionClassName(error: string | undefined): string {
  return cn(
    "flex cursor-pointer flex-col gap-3 rounded-lg border border-neutral-300 bg-white p-5 text-sm shadow-sm transition-colors focus-within:border-neutral-900 hover:border-neutral-400",
    error && "border-red-300 focus-within:border-red-500 hover:border-red-400"
  );
}

function RoleSelection({ t, error }: { t: (key: string) => string; error: string | undefined }) {
  return (
    <section className="space-y-5">
      <div className="block font-semibold text-neutral-900 text-sm">{t("accountTypeLabel")}</div>
      <p className="text-neutral-600 text-xs">{t("accountTypeHelper")}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={getRoleOptionClassName(error)}>
          <span className="flex items-center gap-2 text-neutral-900">
            <input
              className="h-4 w-4 accent-neutral-900"
              defaultChecked
              name="role"
              type="radio"
              value="customer"
            />{" "}
            {t("customerLabel")}
          </span>
          <span className="text-neutral-600 text-sm">{t("customerDescription")}</span>
        </label>
        <label className={getRoleOptionClassName(error)}>
          <span className="flex items-center gap-2 text-neutral-900">
            <input
              className="h-4 w-4 accent-neutral-900"
              name="role"
              type="radio"
              value="professional"
            />{" "}
            {t("professionalLabel")}
          </span>
          <span className="text-neutral-600 text-sm">{t("professionalDescription")}</span>
        </label>
      </div>
      {error ? (
        <p className="text-red-700 text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </section>
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
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm"
        role="alert"
      >
        {state.error}
      </p>
    );
  }
  if (state.status === "success") {
    return (
      <p
        className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-green-700 text-sm"
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
      <RoleSelection error={fieldError("role")} t={t} />

      <section className="grid gap-6 sm:grid-cols-2">
        <Field error={fieldError("fullName")} label={t("fullNameLabel")}>
          <Input
            aria-describedby={fieldError("fullName") ? "fullName-error" : undefined}
            aria-invalid={Boolean(fieldError("fullName"))}
            className={fieldError("fullName") ? "border-red-500" : ""}
            id="fullName"
            name="fullName"
            placeholder={t("fullNamePlaceholder")}
            required
            type="text"
          />
        </Field>
        <Field error={fieldError("phone")} label={t("phoneLabel")}>
          <Input
            aria-describedby={fieldError("phone") ? "phone-error" : undefined}
            aria-invalid={Boolean(fieldError("phone"))}
            className={fieldError("phone") ? "border-red-500" : ""}
            id="phone"
            name="phone"
            placeholder={t("phonePlaceholder")}
            required
            type="tel"
          />
        </Field>
        <Field error={fieldError("city")} label={t("cityLabel")}>
          <Input
            aria-describedby={fieldError("city") ? "city-error" : undefined}
            aria-invalid={Boolean(fieldError("city"))}
            className={fieldError("city") ? "border-red-500" : ""}
            id="city"
            name="city"
            placeholder={t("cityPlaceholder")}
            required
            type="text"
          />
        </Field>
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
        <Field error={fieldError("email")} label={t("emailLabel")}>
          <Input
            aria-describedby={fieldError("email") ? "email-error" : undefined}
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
        <Field error={fieldError("password")} label={t("passwordLabel")}>
          <Input
            aria-describedby={fieldError("password") ? "password-error" : undefined}
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
            aria-describedby={fieldError("confirmPassword") ? "confirmPassword-error" : undefined}
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
