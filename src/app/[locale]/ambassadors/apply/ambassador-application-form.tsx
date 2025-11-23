"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/routing";
import { submitAmbassadorApplication } from "./actions";
import type { AmbassadorApplicationState } from "./types";

const defaultState: AmbassadorApplicationState = { status: "idle" };

const PROFESSIONS = [
  "realtor",
  "lawyer",
  "accountant",
  "interior_designer",
  "property_manager",
  "blogger",
  "community_leader",
  "other",
] as const;

const REFERRAL_REACH = ["1-5", "6-15", "16-30", "31+"] as const;

function FormStatusMessages({
  state,
  t,
}: {
  state: AmbassadorApplicationState;
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
      <div
        className="rounded-lg border border-green-200 bg-green-50 px-6 py-6 text-center"
        role="status"
      >
        <div className="mb-2 text-4xl">🎉</div>
        <h3 className="mb-2 font-semibold text-green-800 text-lg">{t("successTitle")}</h3>
        <p className="text-green-700">{t("successMessage")}</p>
      </div>
    );
  }
  return null;
}

export function AmbassadorApplicationForm() {
  const t = useTranslations("ambassadors.apply.form");

  const [state, formAction, isPending] = useActionState<AmbassadorApplicationState, FormData>(
    submitAmbassadorApplication,
    defaultState
  );

  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedReach, setSelectedReach] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("CO");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const fieldError = (field: string) => state.fieldErrors?.[field];

  if (state.status === "success") {
    return <FormStatusMessages state={state} t={t} />;
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.contact")}</h3>

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

        <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.professional")}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={fieldError("profession")} label={t("professionLabel")}>
            <Select
              name="profession"
              onValueChange={setSelectedProfession}
              value={selectedProfession}
            >
              <SelectTrigger
                aria-invalid={Boolean(fieldError("profession"))}
                className={fieldError("profession") ? "border-red-500" : ""}
                id="profession"
              >
                <SelectValue placeholder={t("professionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {t(`professions.${profession}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input name="profession" type="hidden" value={selectedProfession} />
          </Field>

          <Field label={t("companyNameLabel")}>
            <Input
              id="companyName"
              name="companyName"
              placeholder={t("companyNamePlaceholder")}
            />
          </Field>
        </div>

        <Field error={fieldError("referralReach")} label={t("referralReachLabel")}>
          <Select name="referralReach" onValueChange={setSelectedReach} value={selectedReach}>
            <SelectTrigger
              aria-invalid={Boolean(fieldError("referralReach"))}
              className={fieldError("referralReach") ? "border-red-500" : ""}
              id="referralReach"
            >
              <SelectValue placeholder={t("referralReachPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_REACH.map((reach) => (
                <SelectItem key={reach} value={reach}>
                  {t(`referralReachOptions.${reach}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input name="referralReach" type="hidden" value={selectedReach} />
        </Field>

        <Field label={t("socialMediaLabel")}>
          <Input
            id="socialMedia"
            name="socialMedia"
            placeholder={t("socialMediaPlaceholder")}
            type="url"
          />
        </Field>
      </div>

      {/* Motivation */}
      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900">{t("sections.motivation")}</h3>

        <Field error={fieldError("motivation")} label={t("motivationLabel")}>
          <Textarea
            aria-invalid={Boolean(fieldError("motivation"))}
            className={fieldError("motivation") ? "border-red-500" : ""}
            id="motivation"
            name="motivation"
            placeholder={t("motivationPlaceholder")}
            required
            rows={4}
          />
        </Field>
      </div>

      {/* Terms */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={termsAccepted}
            id="termsAccepted"
            name="termsAccepted"
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <div className="space-y-1">
            <Label className="font-normal text-neutral-700 text-sm" htmlFor="termsAccepted">
              {t("termsLabel")}{" "}
              <Link className="text-orange-600 hover:underline" href="/ambassador-terms">
                {t("termsLink")}
              </Link>
            </Label>
            {fieldError("termsAccepted") && (
              <p className="text-red-600 text-xs" role="alert">
                {fieldError("termsAccepted")}
              </p>
            )}
          </div>
        </div>
      </div>

      <FormStatusMessages state={state} t={t} />

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? t("submittingButton") : t("submitButton")}
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
