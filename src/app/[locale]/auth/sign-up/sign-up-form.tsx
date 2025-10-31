"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { ConsentCheckboxes } from "@/components/auth/consent-checkboxes";
import { cn } from "@/lib/utils";
import { signUpAction } from "./actions";
import { defaultSignUpState, type SignUpActionState } from "./types";

const inputClass =
  "w-full rounded-full border border-[#dcd6c7] bg-[#fefcf9] px-5 py-2.5 text-base text-[#211f1a] shadow-sm transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a1a]";
const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-200";

export function SignUpForm() {
  const t = useTranslations("pages.signUp.form");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState<SignUpActionState, FormData>(
    signUpAction,
    defaultSignUpState
  );

  const fieldError = (field: string) => state.fieldErrors?.[field];

  const PROPERTY_TYPES = [
    { value: "apartment", label: t("propertyApartment") },
    { value: "house", label: t("propertyHouse") },
    { value: "office", label: t("propertyOffice") },
    { value: "other", label: t("propertyOther") },
  ];

  return (
    <form action={formAction} className="space-y-10" noValidate>
      <section className="space-y-5">
        <div className="block font-semibold text-[#211f1a] text-sm">{t("accountTypeLabel")}</div>
        <p className="text-[#5d574b] text-xs">{t("accountTypeHelper")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={cn(
              "flex cursor-pointer flex-col gap-3 rounded-3xl border border-[#dcd6c7] bg-[#fefcf9] p-5 text-sm shadow-sm transition focus-within:border-[#ff5d46] hover:border-[#ff5d46]",
              fieldError("role") &&
                "border-red-400 focus-within:border-red-400 hover:border-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-[#211f1a]">
              <input
                className="h-4 w-4 accent-[#211f1a]"
                defaultChecked
                name="role"
                type="radio"
                value="customer"
              />{" "}
              {t("customerLabel")}
            </span>
            <span className="text-[#5d574b] text-sm">{t("customerDescription")}</span>
          </label>
          <label
            className={cn(
              "flex cursor-pointer flex-col gap-3 rounded-3xl border border-[#dcd6c7] bg-[#fefcf9] p-5 text-sm shadow-sm transition focus-within:border-[#ff5d46] hover:border-[#ff5d46]",
              fieldError("role") &&
                "border-red-400 focus-within:border-red-400 hover:border-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-[#211f1a]">
              <input
                className="h-4 w-4 accent-[#211f1a]"
                name="role"
                type="radio"
                value="professional"
              />{" "}
              {t("professionalLabel")}
            </span>
            <span className="text-[#5d574b] text-sm">{t("professionalDescription")}</span>
          </label>
        </div>
        {fieldError("role") ? <p className="text-red-600 text-xs">{fieldError("role")}</p> : null}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field error={fieldError("fullName")} label={t("fullNameLabel")}>
          <input
            aria-invalid={Boolean(fieldError("fullName"))}
            className={cn(inputClass, fieldError("fullName") && errorInputClass)}
            id="fullName"
            name="fullName"
            placeholder={t("fullNamePlaceholder")}
            required
            type="text"
          />
        </Field>
        <Field error={fieldError("phone")} label={t("phoneLabel")}>
          <input
            aria-invalid={Boolean(fieldError("phone"))}
            className={cn(inputClass, fieldError("phone") && errorInputClass)}
            id="phone"
            name="phone"
            placeholder={t("phonePlaceholder")}
            required
            type="tel"
          />
        </Field>
        <Field error={fieldError("city")} label={t("cityLabel")}>
          <input
            aria-invalid={Boolean(fieldError("city"))}
            className={cn(inputClass, fieldError("city") && errorInputClass)}
            id="city"
            name="city"
            placeholder={t("cityPlaceholder")}
            required
            type="text"
          />
        </Field>
        <Field error={fieldError("locale")} label={t("preferredLanguageLabel")}>
          <select
            className={cn(inputClass, fieldError("locale") && errorInputClass)}
            defaultValue="en-US"
            id="locale"
            name="locale"
          >
            <option value="en-US">{t("languageEnglish")}</option>
            <option value="es-CO">{t("languageSpanish")}</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field error={fieldError("email")} label={t("emailLabel")}>
          <input
            aria-invalid={Boolean(fieldError("email"))}
            autoComplete="email"
            className={cn(inputClass, fieldError("email") && errorInputClass)}
            id="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            required
            type="email"
          />
        </Field>
        <Field error={fieldError("propertyType")} label={t("propertyTypeLabel")}>
          <select
            className={cn(inputClass, fieldError("propertyType") && errorInputClass)}
            id="propertyType"
            name="propertyType"
          >
            <option value="">{t("propertyTypePlaceholder")}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field error={fieldError("password")} label={t("passwordLabel")}>
          <input
            aria-invalid={Boolean(fieldError("password"))}
            autoComplete="new-password"
            className={cn(inputClass, fieldError("password") && errorInputClass)}
            id="password"
            minLength={8}
            name="password"
            placeholder={t("passwordPlaceholder")}
            required
            type="password"
          />
        </Field>
        <Field error={fieldError("confirmPassword")} label={t("confirmPasswordLabel")}>
          <input
            aria-invalid={Boolean(fieldError("confirmPassword"))}
            autoComplete="new-password"
            className={cn(inputClass, fieldError("confirmPassword") && errorInputClass)}
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

      {state.status === "error" && state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-red-700 text-sm">{state.error}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-green-700 text-sm">
          {t("successMessage")}
        </p>
      ) : null}

      <button
        className={cn(
          "w-full rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2.5 font-semibold text-base text-white shadow-sm transition hover:border-[#ff5d46] hover:bg-[#2b2624]",
          isPending && "cursor-not-allowed opacity-60"
        )}
        disabled={isPending}
        type="submit"
      >
        {isPending ? t("creatingAccountButton") : t("createAccountButton")}
      </button>
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
  const childId = (children as React.ReactElement)?.props?.id;

  return (
    <div className="space-y-3">
      <label className="block font-semibold text-[#211f1a] text-sm" htmlFor={childId}>
        {label}
      </label>
      {helper ? <p className="text-[#5d574b] text-xs">{helper}</p> : null}
      {children}
      {error ? <p className="text-red-600 text-xs">{error}</p> : null}
    </div>
  );
}
