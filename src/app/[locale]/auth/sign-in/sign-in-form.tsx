"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInAction, type SignInActionState } from "./actions";

type Props = {
  redirectTo?: string | null;
};

const inputClasses =
  "w-full rounded-full border border-[#dcd6c7] bg-[#fefcf9] px-5 py-2.5 text-base text-[#211f1a] shadow-sm transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a1a]";

export function SignInForm({ redirectTo }: Props) {
  const t = useTranslations("pages.signIn.form");
  const [state, formAction, isPending] = useActionState<SignInActionState, FormData>(signInAction, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-[#211f1a]">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClasses}
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-[#211f1a]">
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClasses}
          placeholder={t("passwordPlaceholder")}
        />
      </div>

      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:border-[#ff5d46] hover:bg-[#2b2624] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t("signingInButton") : t("signInButton")}
      </button>
    </form>
  );
}
