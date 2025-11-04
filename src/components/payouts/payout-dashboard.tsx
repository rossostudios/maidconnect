"use client";

import { useCallback, useEffect, useState } from "react";
import type { Currency } from "@/lib/format";
import { formatPayoutAmount, getPayoutScheduleDescription } from "@/lib/payout-calculator";

type PendingPayoutData = {
  currentPeriod: {
    periodStart: string;
    periodEnd: string;
    nextPayoutDate: string;
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    currency: Currency;
    bookingCount: number;
    bookings: Array<{
      id: string;
      service_name: string | null;
      scheduled_start: string | null;
      checked_out_at: string | null;
      amount_captured: number;
    }>;
  };
  allPending: {
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    currency: Currency;
    bookingCount: number;
  };
  recentPayouts: Array<{
    id: string;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    currency: Currency;
    status: string;
    payout_date: string;
    arrival_date: string | null;
    booking_ids: string[];
    created_at: string;
  }>;
};

export function PayoutDashboard() {
  const [data, setData] = useState<PendingPayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleInfo, setShowScheduleInfo] = useState(false);

  const fetchPayoutData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pro/payouts/pending");

      if (!response.ok) {
        throw new Error("Failed to load payout data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayoutData();
  }, [fetchPayoutData]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-8 text-center">
        <p className="text-[#7a6d62] text-sm">Loading payout information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-800 text-sm">{error}</p>
        <button
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-sm text-white hover:bg-red-700"
          onClick={fetchPayoutData}
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { currentPeriod, allPending, recentPayouts } = data;

  return (
    <div className="space-y-6">
      {/* Current Period Earnings */}
      <div className="rounded-xl border border-[#f0ece5] bg-gradient-to-br from-[var(--red)]/10 to-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[var(--foreground)] text-lg">Next Payout</h3>
            <p className="mt-1 text-[#7a6d62] text-sm">
              {new Date(currentPeriod.nextPayoutDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            className="font-medium text-[var(--red)] text-xs hover:text-[var(--red-hover)]"
            onClick={() => setShowScheduleInfo(!showScheduleInfo)}
            type="button"
          >
            {showScheduleInfo ? "Hide" : "View"} Schedule
          </button>
        </div>

        {showScheduleInfo && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="whitespace-pre-line text-blue-900 text-xs">
              {getPayoutScheduleDescription()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/80 p-4">
            <p className="font-medium text-[#7a6d62] text-xs uppercase tracking-wide">
              Gross Earnings
            </p>
            <p className="mt-1 font-bold text-2xl text-[var(--foreground)]">
              {formatPayoutAmount(currentPeriod.grossAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-[#7a6d62] text-xs">
              {currentPeriod.bookingCount} booking{currentPeriod.bookingCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-lg bg-white/80 p-4">
            <p className="font-medium text-[#7a6d62] text-xs uppercase tracking-wide">
              Platform Fee (18%)
            </p>
            <p className="mt-1 font-bold text-2xl text-[var(--red)]">
              -{formatPayoutAmount(currentPeriod.commissionAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-[#7a6d62] text-xs">Commission deducted</p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4">
            <p className="font-medium text-white/80 text-xs uppercase tracking-wide">You Receive</p>
            <p className="mt-1 font-bold text-2xl text-white">
              {formatPayoutAmount(currentPeriod.netAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-white/80 text-xs">Net payout amount</p>
          </div>
        </div>

        {currentPeriod.bookingCount === 0 && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-xs text-yellow-800">
              No completed bookings in the current payout period yet. Complete services to earn!
            </p>
          </div>
        )}
      </div>

      {/* All Pending Earnings (future periods) */}
      {allPending.bookingCount > currentPeriod.bookingCount && (
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h4 className="mb-3 font-semibold text-[var(--foreground)]">Future Payouts</h4>
          <p className="text-[#7a6d62] text-sm">
            You have{" "}
            <span className="font-semibold">
              {formatPayoutAmount(
                allPending.netAmount - currentPeriod.netAmount,
                allPending.currency
              )}
            </span>{" "}
            from {allPending.bookingCount - currentPeriod.bookingCount} booking(s) that will be
            included in future payout periods.
          </p>
        </div>
      )}

      {/* Current Period Bookings */}
      {currentPeriod.bookings.length > 0 && (
        <details className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
            Bookings in Current Period ({currentPeriod.bookings.length})
          </summary>
          <div className="mt-4 space-y-2">
            {currentPeriod.bookings.map((booking) => (
              <div
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3"
                key={booking.id}
              >
                <div>
                  <p className="font-medium text-[var(--foreground)] text-sm">
                    {booking.service_name || "Service"}
                  </p>
                  <p className="text-[#7a6d62] text-xs">
                    Completed:{" "}
                    {booking.checked_out_at
                      ? new Date(booking.checked_out_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <p className="font-semibold text-[var(--foreground)] text-sm">
                  {formatPayoutAmount(booking.amount_captured, currentPeriod.currency)}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Recent Payout History */}
      {recentPayouts.length > 0 && (
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <h4 className="mb-4 font-semibold text-[var(--foreground)]">Recent Payouts</h4>
          <div className="space-y-3">
            {recentPayouts.map((payout) => (
              <div
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] p-4"
                key={payout.id}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--foreground)] text-sm">
                      {formatPayoutAmount(payout.net_amount, payout.currency)}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-xs ${(() => {
                        const status = payout.status;
                        if (status === "paid") {
                          return "bg-green-100 text-green-800";
                        }
                        if (status === "processing") {
                          return "bg-yellow-100 text-yellow-800";
                        }
                        if (status === "failed") {
                          return "bg-red-100 text-red-800";
                        }
                        return "bg-gray-100 text-gray-800";
                      })()}`}
                    >
                      {payout.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[#7a6d62] text-xs">
                    {payout.booking_ids.length} booking(s) •{" "}
                    {new Date(payout.payout_date).toLocaleDateString()}
                  </p>
                  {payout.arrival_date && (
                    <p className="mt-1 text-[#7a6d62] text-xs">
                      Expected arrival: {new Date(payout.arrival_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[#7a6d62] text-xs">Gross</p>
                  <p className="font-medium text-[var(--foreground)] text-sm">
                    {formatPayoutAmount(payout.gross_amount, payout.currency)}
                  </p>
                  <p className="text-[var(--red)] text-xs">
                    -{formatPayoutAmount(payout.commission_amount, payout.currency)} fee
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentPayouts.length === 0 && currentPeriod.bookingCount === 0 && (
        <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-8 text-center">
          <p className="text-[#7a6d62] text-sm">
            No payout history yet. Complete your first booking to start earning!
          </p>
        </div>
      )}
    </div>
  );
}
