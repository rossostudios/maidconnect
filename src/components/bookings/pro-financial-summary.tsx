"use client";

import { AlertCircleIcon, DollarCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import type { HugeIcon } from "@/types/icons";

type FinancialBooking = {
  status: string;
  amount_estimated: number | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  scheduled_start: string | null;
  created_at: string | null;
};

type Props = {
  bookings: FinancialBooking[];
  connectAccountId: string | null;
  connectStatus: string | null;
};

type Totals = {
  captured: number;
  authorized: number;
  pending: number;
  canceled: number;
  thisMonthCaptured: number;
  thisMonthAuthorized: number;
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function isSameMonth(dateInput: string | null, reference: Date) {
  if (!dateInput) {
    return false;
  }
  const date = new Date(dateInput);
  return (
    date.getUTCFullYear() === reference.getUTCFullYear() &&
    date.getUTCMonth() === reference.getUTCMonth()
  );
}

export function ProFinancialSummary({ bookings, connectAccountId, connectStatus }: Props) {
  const t = useTranslations("dashboard.pro.financialSummary");
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const totals = useMemo(() => {
    const summary: Totals = {
      captured: 0,
      authorized: 0,
      pending: 0,
      canceled: 0,
      thisMonthCaptured: 0,
      thisMonthAuthorized: 0,
    };

    const reference = new Date();

    for (const booking of bookings) {
      const captured = booking.amount_captured ?? 0;
      const authorized = booking.amount_authorized ?? 0;
      const estimated = booking.amount_estimated ?? 0;

      switch (booking.status) {
        case "completed":
          summary.captured += captured || authorized || estimated;
          if (isSameMonth(booking.scheduled_start ?? booking.created_at, reference)) {
            summary.thisMonthCaptured += captured || authorized || estimated;
          }
          break;
        case "authorized":
          summary.authorized += authorized || estimated;
          if (isSameMonth(booking.scheduled_start ?? booking.created_at, reference)) {
            summary.thisMonthAuthorized += authorized || estimated;
          }
          break;
        case "pending_payment":
          summary.pending += estimated;
          break;
        case "canceled":
          summary.canceled += authorized || estimated;
          break;
        default:
          break;
      }
    }

    return summary;
  }, [bookings]);

  const noData = bookings.length === 0;
  const normalizedStatus = (connectStatus ?? "not_started").toLowerCase();
  const needsConnect = !(
    connectAccountId && ["submitted", "complete", "verified"].includes(normalizedStatus)
  );

  const startStripeOnboarding = () => {
    setOnboardingError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/pro/stripe/connect", { method: "POST" });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to start onboarding");
        }
        const payload = (await response.json()) as { url: string };

        // Validate that the URL is from Stripe's domain to prevent open redirect
        const url = new URL(payload.url);
        const allowedHosts = ["connect.stripe.com", "dashboard.stripe.com"];
        if (!allowedHosts.includes(url.hostname)) {
          throw new Error("Invalid redirect URL from server");
        }

        // snyk:ignore javascript/OR - URL is validated against allowlist of Stripe domains above (line 118-123)
        window.location.href = payload.url;
      } catch (error) {
        setOnboardingError(
          error instanceof Error ? error.message : "Unexpected error starting onboarding"
        );
      }
    });
  };

  return (
    <div className="border border-[neutral-200] bg-[neutral-50]/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[neutral-500]" icon={DollarCircleIcon} />
          <h3 className="font-semibold text-[neutral-900] text-lg">{t("title")}</h3>
        </div>
        {needsConnect ? (
          <button
            className="inline-flex items-center bg-[neutral-500] px-3 py-1.5 font-semibold text-[neutral-50] text-xs shadow-sm transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending}
            onClick={startStripeOnboarding}
            type="button"
          >
            {isPending ? t("stripe.opening") : t("stripe.setup")}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[neutral-400] text-sm">{t("description")}</p>
      <p className="mt-2 font-medium text-[neutral-400] text-xs">
        {t("stripe.statusLabel")}{" "}
        <span className={needsConnect ? "text-[neutral-500]" : "text-[neutral-500]"}>
          {needsConnect ? t("stripe.actionRequired") : t("stripe.connected")}
        </span>
      </p>
      {onboardingError ? (
        <p className="mt-3 text-[neutral-500] text-xs">{onboardingError}</p>
      ) : null}

      {noData ? (
        <p className="mt-6 text-[neutral-400] text-sm">{t("emptyState")}</p>
      ) : (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryCard
              accent="text-[neutral-500]"
              amount={totals.captured}
              description={t("cards.availableAfterCompletion.description")}
              icon={DollarCircleIcon}
              title={t("cards.availableAfterCompletion.title")}
              tone="bg-[neutral-50]"
            />
            <SummaryCard
              accent="text-[neutral-500]"
              amount={totals.authorized}
              description={t("cards.activeHolds.description")}
              icon={RefreshIcon}
              title={t("cards.activeHolds.title")}
              tone="bg-[neutral-50]"
            />
          </dl>

          <div className="mt-6 border border-[neutral-200] bg-[neutral-50] p-4 text-[neutral-400] text-xs">
            <p className="font-semibold text-[neutral-900]">{t("thisMonth")}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[neutral-400] text-xs uppercase tracking-wide">
                  {t("metrics.capturedPayouts")}
                </p>
                <p className="font-semibold text-[neutral-900] text-sm">
                  {formatCOP(totals.thisMonthCaptured)}
                </p>
              </div>
              <div>
                <p className="text-[neutral-400] text-xs uppercase tracking-wide">
                  {t("metrics.upcomingHolds")}
                </p>
                <p className="font-semibold text-[neutral-900] text-sm">
                  {formatCOP(totals.thisMonthAuthorized)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[neutral-400] text-sm">
            <div className="flex items-center justify-between border border-[neutral-200] bg-[neutral-50]/80 px-3 py-2">
              <span>{t("metrics.pendingRequests")}</span>
              <span>{formatCOP(totals.pending)}</span>
            </div>
            <div className="flex items-center justify-between border border-[neutral-200] bg-[neutral-50]/80 px-3 py-2">
              <span className="flex items-center gap-2">
                <HugeiconsIcon className="h-4 w-4 text-[neutral-500]" icon={AlertCircleIcon} />
                {t("metrics.holdsReleased")}
              </span>
              <span>{formatCOP(totals.canceled)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type SummaryCardProps = {
  icon: HugeIcon;
  title: string;
  amount: number;
  description: string;
  tone: string;
  accent: string;
};

function SummaryCard({ icon, title, amount, description, tone, accent }: SummaryCardProps) {
  return (
    <div className={`border border-[neutral-200] ${tone} p-4`}>
      <div className="flex items-center gap-2">
        <HugeiconsIcon className={`h-4 w-4 ${accent}`} icon={icon} />
        <dt className="font-semibold text-[neutral-400] text-xs uppercase tracking-wide">
          {title}
        </dt>
      </div>
      <dd className="mt-2 font-semibold text-[neutral-900] text-xl">{formatCOP(amount)}</dd>
      <p className="mt-1 text-[neutral-400] text-xs">{description}</p>
    </div>
  );
}
