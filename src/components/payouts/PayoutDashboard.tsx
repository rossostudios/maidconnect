"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Currency } from "@/lib/format";
import { formatPayoutAmount, getPayoutScheduleDescription } from "@/lib/payoutCalculator";

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
      <Card className="border-stone-200 bg-stone-50">
        <CardContent className="p-8 text-center text-sm text-stone-600">
          Loading payout information...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-stone-300 bg-stone-100">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-stone-800">{error}</p>
          <button
            className="mt-4 rounded-lg bg-stone-900 px-4 py-2 font-semibold text-sm text-white hover:bg-stone-800"
            onClick={fetchPayoutData}
            type="button"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { currentPeriod, allPending, recentPayouts } = data;

  return (
    <div className="space-y-6">
      {/* Current Period Earnings */}
      <Card className="border-stone-200 bg-gradient-to-br from-stone-50 to-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-stone-900">Next Payout</h3>
              <p className="mt-1 text-sm text-stone-600">
                {new Date(currentPeriod.nextPayoutDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              className="font-medium text-stone-700 text-xs hover:text-stone-900"
              onClick={() => setShowScheduleInfo(!showScheduleInfo)}
              type="button"
            >
              {showScheduleInfo ? "Hide" : "View"} Schedule
            </button>
          </div>

          {showScheduleInfo && (
            <Card className="mb-4 border-stone-200 bg-white">
              <CardContent className="p-3">
                <p className="whitespace-pre-line text-stone-600 text-xs">
                  {getPayoutScheduleDescription()}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-stone-200 bg-white/80">
              <CardContent className="p-4">
                <p className="font-medium text-stone-600 text-xs uppercase tracking-wide">
                  Gross Earnings
                </p>
                <p className="mt-1 font-bold text-2xl text-stone-900">
                  {formatPayoutAmount(currentPeriod.grossAmount, currentPeriod.currency)}
                </p>
                <p className="mt-1 text-stone-600 text-xs">
                  {currentPeriod.bookingCount} booking{currentPeriod.bookingCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            <Card className="border-stone-200 bg-white/80">
              <CardContent className="p-4">
                <p className="font-medium text-stone-600 text-xs uppercase tracking-wide">
                  Platform Fee (18%)
                </p>
                <p className="mt-1 font-bold text-2xl text-stone-800">
                  -{formatPayoutAmount(currentPeriod.commissionAmount, currentPeriod.currency)}
                </p>
                <p className="mt-1 text-stone-600 text-xs">Commission deducted</p>
              </CardContent>
            </Card>

            <Card className="border-stone-900 bg-gradient-to-br from-stone-900 to-stone-800">
              <CardContent className="p-4">
                <p className="font-medium text-white/80 text-xs uppercase tracking-wide">
                  You Receive
                </p>
                <p className="mt-1 font-bold text-2xl text-white">
                  {formatPayoutAmount(currentPeriod.netAmount, currentPeriod.currency)}
                </p>
                <p className="mt-1 text-white/80 text-xs">Net payout amount</p>
              </CardContent>
            </Card>
          </div>

          {currentPeriod.bookingCount === 0 && (
            <Card className="mt-4 border-amber-200 bg-stone-100">
              <CardContent className="p-3 text-amber-800 text-xs">
                No completed bookings in the current payout period yet. Complete services to earn!
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* All Pending Earnings (future periods) */}
      {allPending.bookingCount > currentPeriod.bookingCount && (
        <Card className="border-stone-200 bg-stone-50 shadow-sm">
          <CardContent className="p-6">
            <h4 className="mb-3 font-semibold text-stone-900">Future Payouts</h4>
            <p className="text-sm text-stone-600">
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
          </CardContent>
        </Card>
      )}

      {/* Recent Payout History */}
      {recentPayouts.length > 0 && (
        <Card className="border-stone-200 bg-white shadow-sm">
          <CardHeader className="p-6 pb-4">
            <h4 className="font-semibold text-stone-900">Recent Payouts</h4>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {recentPayouts.map((payout) => (
              <div
                className="flex items-center justify-between rounded-lg border border-stone-200 p-4"
                key={payout.id}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-stone-900">
                      {formatPayoutAmount(payout.net_amount, payout.currency)}
                    </p>
                    <Badge
                      size="sm"
                      variant={
                        payout.status === "paid"
                          ? "success"
                          : payout.status === "failed"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-stone-600 text-xs">
                    {payout.booking_ids.length} booking(s) •{" "}
                    {new Date(payout.payout_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-stone-600 text-xs">Gross</p>
                  <p className="font-medium text-sm text-stone-900">
                    {formatPayoutAmount(payout.gross_amount, payout.currency)}
                  </p>
                  <p className="text-stone-800 text-xs">
                    -{formatPayoutAmount(payout.commission_amount, payout.currency)} fee
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
