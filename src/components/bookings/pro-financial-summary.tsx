"use client";

import { useMemo, useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import { Banknote, DollarSign, RefreshCw, ShieldAlert } from "lucide-react";

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
  if (!dateInput) return false;
  const date = new Date(dateInput);
  return date.getUTCFullYear() === reference.getUTCFullYear() && date.getUTCMonth() === reference.getUTCMonth();
}

export function ProFinancialSummary({ bookings, connectAccountId, connectStatus }: Props) {
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

    bookings.forEach((booking) => {
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
    });

    return summary;
  }, [bookings]);

  const noData = bookings.length === 0;
  const normalizedStatus = (connectStatus ?? "not_started").toLowerCase();
  const needsConnect = !connectAccountId || !["submitted", "complete", "verified"].includes(normalizedStatus);

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
        console.error(error);
        setOnboardingError(error instanceof Error ? error.message : "Unexpected error starting onboarding");
      }
    });
  };

  return (
    <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#fd857f]" />
          <h3 className="text-lg font-semibold text-[#211f1a]">Financial overview</h3>
        </div>
        {needsConnect ? (
          <button
            type="button"
            onClick={startStripeOnboarding}
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-[#fd857f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Opening Stripe…" : "Set up Stripe payouts"}
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-[#7a6d62]">Monitor captured payouts, active holds, and upcoming revenue.</p>
      <p className="mt-2 text-xs font-medium text-[#7a6d62]">
        Stripe status:{" "}
        <span className={needsConnect ? "text-[#c4534d]" : "text-[#2f7a47]"}>
          {needsConnect ? "Action required" : "Connected"}
        </span>
      </p>
      {onboardingError ? <p className="mt-3 text-xs text-red-600">{onboardingError}</p> : null}

      {noData ? (
        <p className="mt-6 text-sm text-[#7a6d62]">Once customers authorize bookings, you&apos;ll see financial metrics here.</p>
      ) : (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryCard
              icon={Banknote}
              title="Available after completion"
              amount={totals.captured}
              description="Payments captured"
              tone="bg-[#f4fbf6]"
              accent="text-[#2f7a47]"
            />
            <SummaryCard
              icon={RefreshCw}
              title="Active holds"
              amount={totals.authorized}
              description="Awaiting completion"
              tone="bg-[#fef1ee]"
              accent="text-[#c4534d]"
            />
          </dl>

          <div className="mt-6 rounded-lg border border-[#efe7dc] bg-[#fbfafa] p-4 text-xs text-[#7a6d62]">
            <p className="font-semibold text-[#211f1a]">This month</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#a49c90]">Captured payouts</p>
                <p className="text-sm font-semibold text-[#211f1a]">{formatCOP(totals.thisMonthCaptured)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#a49c90]">Upcoming holds</p>
                <p className="text-sm font-semibold text-[#211f1a]">{formatCOP(totals.thisMonthAuthorized)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-[#5d574b]">
            <div className="flex items-center justify-between rounded-lg border border-[#efe7dc] bg-white/80 px-3 py-2">
              <span>Pending payment requests</span>
              <span>{formatCOP(totals.pending)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#efe7dc] bg-white/80 px-3 py-2">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#c4534d]" />
                Holds released
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
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a6d62]">{title}</dt>
      </div>
      <dd className="mt-2 text-xl font-semibold text-[#211f1a]">{formatCOP(amount)}</dd>
      <p className="mt-1 text-xs text-[#7a6d62]">{description}</p>
    </div>
  );
}
