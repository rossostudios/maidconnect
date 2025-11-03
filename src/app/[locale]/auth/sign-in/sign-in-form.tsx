"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { type SignInActionState, signInAction } from "./actions";

type Props = {
  redirectTo?: string | null;
};

const inputClasses =
  "w-full rounded-full border border-[#dcd6c7] bg-[#fefcf9] px-5 py-2.5 text-base text-[#211f1a] shadow-sm transition focus:border-[#211f1a] focus:outline-none focus:ring-2 focus:ring-[#211f1a1a]";

export function SignInForm({ redirectTo }: Props) {
  const t = useTranslations("pages.signIn.form");
  const [state, formAction, isPending] = useActionState<SignInActionState, FormData>(
    signInAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label className="block font-medium text-[#211f1a] text-sm" htmlFor="email">
          {t("emailLabel")}
        </label>
        <input
          autoComplete="email"
          className={inputClasses}
          id="email"
          name="email"
          placeholder={t("emailPlaceholder")}
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-[#211f1a] text-sm" htmlFor="password">
          {t("passwordLabel")}
        </label>
        <input
          autoComplete="current-password"
          className={inputClasses}
          id="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
          required
          type="password"
        />
      </div>

      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}

      {state.error ? <p className="text-red-600 text-sm">{state.error}</p> : null}

      <button
        className="w-full rounded-full border border-[#211f1a] bg-[#211f1a] px-5 py-2.5 font-semibold text-base text-white shadow-sm transition hover:border-[#8B7355] hover:bg-[#2b2624] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? t("signingInButton") : t("signInButton")}
      </button>
    </form>
  );
}
