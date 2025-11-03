"use client";

import type { LucideIcon } from "lucide-react";
import { Banknote, DollarSign, RefreshCw, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";

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
        window.location.href = payload.url;
      } catch (error) {
        setOnboardingError(
          error instanceof Error ? error.message : "Unexpected error starting onboarding"
        );
      }
    });
  };

  return (
    <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#8B7355]" />
          <h3 className="font-semibold text-[#211f1a] text-lg">{t("title")}</h3>
        </div>
        {needsConnect ? (
          <button
            className="inline-flex items-center rounded-md bg-[#8B7355] px-3 py-1.5 font-semibold text-white text-xs shadow-sm transition hover:bg-[#9B8B7E] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending}
            onClick={startStripeOnboarding}
            type="button"
          >
            {isPending ? t("stripe.opening") : t("stripe.setup")}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-[#7a6d62] text-sm">{t("description")}</p>
      <p className="mt-2 font-medium text-[#7a6d62] text-xs">
        {t("stripe.statusLabel")}{" "}
        <span className={needsConnect ? "text-[#c4534d]" : "text-[#2f7a47]"}>
          {needsConnect ? t("stripe.actionRequired") : t("stripe.connected")}
        </span>
      </p>
      {onboardingError ? <p className="mt-3 text-red-600 text-xs">{onboardingError}</p> : null}

      {noData ? (
        <p className="mt-6 text-[#7a6d62] text-sm">{t("emptyState")}</p>
      ) : (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryCard
              accent="text-[#2f7a47]"
              amount={totals.captured}
              description={t("cards.availableAfterCompletion.description")}
              icon={Banknote}
              title={t("cards.availableAfterCompletion.title")}
              tone="bg-[#f4fbf6]"
            />
            <SummaryCard
              accent="text-[#c4534d]"
              amount={totals.authorized}
              description={t("cards.activeHolds.description")}
              icon={RefreshCw}
              title={t("cards.activeHolds.title")}
              tone="bg-[#fef1ee]"
            />
          </dl>

          <div className="mt-6 rounded-lg border border-[#efe7dc] bg-[#fbfafa] p-4 text-[#7a6d62] text-xs">
            <p className="font-semibold text-[#211f1a]">{t("thisMonth")}</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[#a49c90] text-xs uppercase tracking-wide">
                  {t("metrics.capturedPayouts")}
                </p>
                <p className="font-semibold text-[#211f1a] text-sm">
                  {formatCOP(totals.thisMonthCaptured)}
                </p>
              </div>
              <div>
                <p className="text-[#a49c90] text-xs uppercase tracking-wide">
                  {t("metrics.upcomingHolds")}
                </p>
                <p className="font-semibold text-[#211f1a] text-sm">
                  {formatCOP(totals.thisMonthAuthorized)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-[#5d574b] text-sm">
            <div className="flex items-center justify-between rounded-lg border border-[#efe7dc] bg-white/80 px-3 py-2">
              <span>{t("metrics.pendingRequests")}</span>
              <span>{formatCOP(totals.pending)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#efe7dc] bg-white/80 px-3 py-2">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#c4534d]" />
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
  icon: LucideIcon;
  title: string;
  amount: number;
  description: string;
  tone: string;
  accent: string;
};

function SummaryCard({ icon: Icon, title, amount, description, tone, accent }: SummaryCardProps) {
  return (
    <div className={`rounded-lg border border-[#efe7dc] ${tone} p-4`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <dt className="font-semibold text-[#7a6d62] text-xs uppercase tracking-wide">{title}</dt>
      </div>
      <dd className="mt-2 font-semibold text-[#211f1a] text-xl">{formatCOP(amount)}</dd>
      <p className="mt-1 text-[#7a6d62] text-xs">{description}</p>
    </div>
  );
}
