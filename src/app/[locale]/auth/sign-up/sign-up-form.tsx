"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { signUpAction } from "./actions";
import { defaultSignUpState, type SignUpActionState } from "./types";

const inputClass =
  "w-full rounded-full border border-[#dcd6c7] bg-[#fefcf9] px-5 py-2.5 text-base text-[#211f1a] shadow-sm transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a1a]";
const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-200";

export function SignUpForm() {
  const t = useTranslations("pages.signUp.form");
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
        <label className="block text-sm font-semibold text-[#211f1a]">
          {t("accountTypeLabel")}
        </label>
        <p className="text-xs text-[#5d574b]">{t("accountTypeHelper")}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label
            className={cn(
              "flex cursor-pointer flex-col gap-3 rounded-3xl border border-[#dcd6c7] bg-[#fefcf9] p-5 text-sm shadow-sm transition hover:border-[#ff5d46] focus-within:border-[#ff5d46]",
              fieldError("role") &&
                "border-red-400 hover:border-red-400 focus-within:border-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-[#211f1a]">
              <input
                type="radio"
                name="role"
                value="customer"
                defaultChecked
                className="h-4 w-4 accent-[#211f1a]"
              />{" "}
              {t("customerLabel")}
            </span>
            <span className="text-sm text-[#5d574b]">{t("customerDescription")}</span>
          </label>
          <label
            className={cn(
              "flex cursor-pointer flex-col gap-3 rounded-3xl border border-[#dcd6c7] bg-[#fefcf9] p-5 text-sm shadow-sm transition hover:border-[#ff5d46] focus-within:border-[#ff5d46]",
              fieldError("role") &&
                "border-red-400 hover:border-red-400 focus-within:border-red-400"
            )}
          >
            <span className="flex items-center gap-2 text-[#211f1a]">
              <input
                type="radio"
                name="role"
                value="professional"
                className="h-4 w-4 accent-[#211f1a]"
              />{" "}
              {t("professionalLabel")}
            </span>
            <span className="text-sm text-[#5d574b]">{t("professionalDescription")}</span>
          </label>
        </div>
        {fieldError("role") ? <p className="text-xs text-red-600">{fieldError("role")}</p> : null}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field label={t("fullNameLabel")} error={fieldError("fullName")}>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            aria-invalid={Boolean(fieldError("fullName"))}
            className={cn(inputClass, fieldError("fullName") && errorInputClass)}
            placeholder={t("fullNamePlaceholder")}
          />
        </Field>
        <Field label={t("phoneLabel")} error={fieldError("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-invalid={Boolean(fieldError("phone"))}
            className={cn(inputClass, fieldError("phone") && errorInputClass)}
            placeholder={t("phonePlaceholder")}
          />
        </Field>
        <Field label={t("cityLabel")} error={fieldError("city")}>
          <input
            id="city"
            name="city"
            type="text"
            required
            aria-invalid={Boolean(fieldError("city"))}
            className={cn(inputClass, fieldError("city") && errorInputClass)}
            placeholder={t("cityPlaceholder")}
          />
        </Field>
        <Field label={t("preferredLanguageLabel")} error={fieldError("locale")}>
          <select
            id="locale"
            name="locale"
            defaultValue="en-US"
            className={cn(inputClass, fieldError("locale") && errorInputClass)}
          >
            <option value="en-US">{t("languageEnglish")}</option>
            <option value="es-CO">{t("languageSpanish")}</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field label={t("emailLabel")} error={fieldError("email")}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            className={cn(inputClass, fieldError("email") && errorInputClass)}
            placeholder={t("emailPlaceholder")}
          />
        </Field>
        <Field label={t("propertyTypeLabel")} error={fieldError("propertyType")}>
          <select
            id="propertyType"
            name="propertyType"
            className={cn(inputClass, fieldError("propertyType") && errorInputClass)}
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
        <Field label={t("passwordLabel")} error={fieldError("password")}>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("password"))}
            className={cn(inputClass, fieldError("password") && errorInputClass)}
            placeholder={t("passwordPlaceholder")}
          />
        </Field>
        <Field label={t("confirmPasswordLabel")} error={fieldError("confirmPassword")}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("confirmPassword"))}
            className={cn(inputClass, fieldError("confirmPassword") && errorInputClass)}
            placeholder={t("confirmPasswordPlaceholder")}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-[#211f1a]">
          <input
            type="checkbox"
            name="terms"
            className={cn(
              "mt-[2px] h-4 w-4 accent-[#211f1a]",
              fieldError("terms") && "accent-red-600"
            )}
            aria-invalid={Boolean(fieldError("terms"))}
          />
          <span>
            {t("termsLabel")}{" "}
            <Link
              className="font-semibold text-[#211f1a] underline decoration-[#211f1a]/40 underline-offset-4 hover:decoration-[#ff5d46]"
              href="/support/account-suspended"
            >
              {t("termsLink")}
            </Link>{" "}
            {t("termsConfirm")}
          </span>
        </label>
        {fieldError("terms") ? <p className="text-xs text-red-600">{fieldError("terms")}</p> : null}
      </section>

      {state.status === "error" && state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t("successMessage")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:border-[#ff5d46] hover:bg-[#2b2624]",
          isPending && "cursor-not-allowed opacity-60"
        )}
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
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#211f1a]">{label}</label>
      {helper ? <p className="text-xs text-[#5d574b]">{helper}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
