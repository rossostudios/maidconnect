"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SignInActionState, signInAction } from "./actions";

type Props = {
  redirectTo?: string | null;
};

export function SignInForm({ redirectTo }: Props) {
  const t = useTranslations("pages.signIn.form");
  const [state, formAction, isPending] = useActionState<SignInActionState, FormData>(
    signInAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input
          aria-describedby={state.error ? "form-error" : undefined}
          aria-invalid={Boolean(state.error)}
          autoComplete="email"
          id="email"
          name="email"
          placeholder={t("emailPlaceholder")}
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <Input
          aria-describedby={state.error ? "form-error" : undefined}
          aria-invalid={Boolean(state.error)}
          autoComplete="current-password"
          id="password"
          name="password"
          placeholder={t("passwordPlaceholder")}
          required
          type="password"
        />
      </div>

      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}

      {state.error ? (
        <p className="text-red-700 text-sm" id="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? t("signingInButton") : t("signInButton")}
      </Button>
    </form>
  );
}
