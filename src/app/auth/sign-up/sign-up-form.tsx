"use client";

import { useActionState } from "react";
import { signUpAction, type SignUpActionState } from "./actions";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<SignUpActionState, FormData>(signUpAction, {});

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-800">Account type</label>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col rounded-lg border border-neutral-300 p-4 text-sm shadow-sm hover:border-blue-500">
            <span className="flex items-center gap-2 text-neutral-900">
              <input type="radio" name="role" value="customer" defaultChecked className="h-4 w-4" /> Customer
            </span>
            <span className="mt-2 text-neutral-600">Book pre-vetted professionals for your home.</span>
          </label>
          <label className="flex cursor-pointer flex-col rounded-lg border border-neutral-300 p-4 text-sm shadow-sm hover:border-blue-500">
            <span className="flex items-center gap-2 text-neutral-900">
              <input type="radio" name="role" value="professional" className="h-4 w-4" /> Professional
            </span>
            <span className="mt-2 text-neutral-600">Manage your profile, bookings, and payouts.</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-800">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Create a password"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-800">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Repeat password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="locale" className="block text-sm font-medium text-neutral-800">
          Preferred language
        </label>
        <select
          id="locale"
          name="locale"
          defaultValue="en-US"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="en-US">English</option>
          <option value="es-CO">Español (Colombia)</option>
        </select>
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Account created. Please check your email to verify and finish signing in.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
