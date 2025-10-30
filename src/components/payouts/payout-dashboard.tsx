"use client";

import { useEffect, useState } from "react";
import { formatPayoutAmount, getPayoutScheduleDescription } from "@/lib/payout-calculator";

type PendingPayoutData = {
  currentPeriod: {
    periodStart: string;
    periodEnd: string;
    nextPayoutDate: string;
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    currency: string;
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
    currency: string;
    bookingCount: number;
  };
  recentPayouts: Array<{
    id: string;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    currency: string;
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

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
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
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-8 text-center">
        <p className="text-sm text-[#7a6d62]">Loading payout information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-800">{error}</p>
        <button
          onClick={fetchPayoutData}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
      <div className="rounded-xl border border-[#f0ece5] bg-gradient-to-br from-[#ff5d46]/10 to-white/90 p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#211f1a]">Next Payout</h3>
            <p className="mt-1 text-sm text-[#7a6d62]">
              {new Date(currentPeriod.nextPayoutDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setShowScheduleInfo(!showScheduleInfo)}
            className="text-xs font-medium text-[#ff5d46] hover:text-[#eb6c65]"
          >
            {showScheduleInfo ? "Hide" : "View"} Schedule
          </button>
        </div>

        {showScheduleInfo && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="whitespace-pre-line text-xs text-blue-900">
              {getPayoutScheduleDescription()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">
              Gross Earnings
            </p>
            <p className="mt-1 text-2xl font-bold text-[#211f1a]">
              {formatPayoutAmount(currentPeriod.grossAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-xs text-[#7a6d62]">
              {currentPeriod.bookingCount} booking{currentPeriod.bookingCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-lg bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#7a6d62]">
              Platform Fee (18%)
            </p>
            <p className="mt-1 text-2xl font-bold text-[#ff5d46]">
              -{formatPayoutAmount(currentPeriod.commissionAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-xs text-[#7a6d62]">Commission deducted</p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">
              You Receive
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatPayoutAmount(currentPeriod.netAmount, currentPeriod.currency)}
            </p>
            <p className="mt-1 text-xs text-white/80">Net payout amount</p>
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
          <h4 className="mb-3 font-semibold text-[#211f1a]">Future Payouts</h4>
          <p className="text-sm text-[#7a6d62]">
            You have{" "}
            <span className="font-semibold">
              {formatPayoutAmount(allPending.netAmount - currentPeriod.netAmount, allPending.currency)}
            </span>{" "}
            from {allPending.bookingCount - currentPeriod.bookingCount} booking(s) that will be
            included in future payout periods.
          </p>
        </div>
      )}

      {/* Current Period Bookings */}
      {currentPeriod.bookings.length > 0 && (
        <details className="rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm">
          <summary className="cursor-pointer font-semibold text-[#211f1a]">
            Bookings in Current Period ({currentPeriod.bookings.length})
          </summary>
          <div className="mt-4 space-y-2">
            {currentPeriod.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#211f1a]">
                    {booking.service_name || "Service"}
                  </p>
                  <p className="text-xs text-[#7a6d62]">
                    Completed:{" "}
                    {booking.checked_out_at
                      ? new Date(booking.checked_out_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#211f1a]">
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
          <h4 className="mb-4 font-semibold text-[#211f1a]">Recent Payouts</h4>
          <div className="space-y-3">
            {recentPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#211f1a]">
                      {formatPayoutAmount(payout.net_amount, payout.currency)}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        payout.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : payout.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : payout.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#7a6d62]">
                    {payout.booking_ids.length} booking(s) •{" "}
                    {new Date(payout.payout_date).toLocaleDateString()}
                  </p>
                  {payout.arrival_date && (
                    <p className="mt-1 text-xs text-[#7a6d62]">
                      Expected arrival: {new Date(payout.arrival_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#7a6d62]">Gross</p>
                  <p className="text-sm font-medium text-[#211f1a]">
                    {formatPayoutAmount(payout.gross_amount, payout.currency)}
                  </p>
                  <p className="text-xs text-[#ff5d46]">
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
          <p className="text-sm text-[#7a6d62]">
            No payout history yet. Complete your first booking to start earning!
          </p>
        </div>
      )}
    </div>
  );
}
