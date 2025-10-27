"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cn } from "@/lib/utils";
import { signUpAction, defaultSignUpState, type SignUpActionState } from "./actions";

const inputClass = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const errorInputClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
];

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<SignUpActionState, FormData>(signUpAction, defaultSignUpState);

  const fieldError = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section className="space-y-4">
        <label className="block text-sm font-medium text-neutral-800">Account type</label>
        <p className="text-xs text-neutral-500">Choose the experience that best matches how you plan to use MaidConnect.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={cn("flex cursor-pointer flex-col rounded-lg border p-4 text-sm shadow-sm transition hover:border-blue-500", fieldError("role") ? "border-red-300" : "border-neutral-300")}>            <span className="flex items-center gap-2 text-neutral-900">
              <input type="radio" name="role" value="customer" defaultChecked className="h-4 w-4" /> Customer
            </span>
            <span className="mt-2 text-neutral-600">Book pre-vetted professionals for your home.</span>
          </label>
          <label className={cn("flex cursor-pointer flex-col rounded-lg border p-4 text-sm shadow-sm transition hover:border-blue-500", fieldError("role") ? "border-red-300" : "border-neutral-300")}>            <span className="flex items-center gap-2 text-neutral-900">
              <input type="radio" name="role" value="professional" className="h-4 w-4" /> Professional
            </span>
            <span className="mt-2 text-neutral-600">Manage your profile, bookings, and payouts.</span>
          </label>
        </div>
        {fieldError("role") ? <p className="text-xs text-red-600">{fieldError("role")}</p> : null}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" error={fieldError("fullName")}>          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            aria-invalid={Boolean(fieldError("fullName"))}
            className={cn(inputClass, fieldError("fullName") && errorInputClass)}
            placeholder="Andrea Martínez"
          />
        </Field>
        <Field label="Phone" helper="Include country code if outside Colombia" error={fieldError("phone")}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            aria-invalid={Boolean(fieldError("phone"))}
            className={cn(inputClass, fieldError("phone") && errorInputClass)}
            placeholder="+57 300 123 4567"
          />
        </Field>
        <Field label="City" error={fieldError("city")}>          <input
            id="city"
            name="city"
            type="text"
            required
            aria-invalid={Boolean(fieldError("city"))}
            className={cn(inputClass, fieldError("city") && errorInputClass)}
            placeholder="Medellín"
          />
        </Field>
        <Field label="Preferred language" error={fieldError("locale")}>
          <select
            id="locale"
            name="locale"
            defaultValue="en-US"
            className={cn(inputClass, fieldError("locale") && errorInputClass)}
          >
            <option value="en-US">English</option>
            <option value="es-CO">Español (Colombia)</option>
          </select>
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field label="Email" error={fieldError("email")}>          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldError("email"))}
            className={cn(inputClass, fieldError("email") && errorInputClass)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Property type" helper="Helps us match you with the right professionals" error={fieldError("propertyType")}>
          <select
            id="propertyType"
            name="propertyType"
            className={cn(inputClass, fieldError("propertyType") && errorInputClass)}
          >
            <option value="">Select a property type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Field label="Password" error={fieldError("password")}>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("password"))}
            className={cn(inputClass, fieldError("password") && errorInputClass)}
            placeholder="Create a password"
          />
        </Field>
        <Field label="Confirm password" error={fieldError("confirmPassword")}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldError("confirmPassword"))}
            className={cn(inputClass, fieldError("confirmPassword") && errorInputClass)}
            placeholder="Repeat password"
          />
        </Field>
      </section>

      <section className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="terms"
            className={cn("mt-[2px] h-4 w-4", fieldError("terms") && "border-red-300 text-red-600")}
            aria-invalid={Boolean(fieldError("terms"))}
          />
          <span>
            I agree to the MaidConnect <Link className="text-blue-600 hover:text-blue-700" href="/support/account-suspended">terms of service</Link> and confirm that I understand the mutual respect guidelines.
          </span>
        </label>
        {fieldError("terms") ? <p className="text-xs text-red-600">{fieldError("terms")}</p> : null}
      </section>

      {state.status === "error" && state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Account created. Please check your email to verify and finish signing in.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700",
          isPending && "cursor-not-allowed opacity-70",
        )}
      >
        {isPending ? "Creating account…" : "Create account"}
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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-800">{label}</label>
      {helper ? <p className="text-xs text-neutral-500">{helper}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
