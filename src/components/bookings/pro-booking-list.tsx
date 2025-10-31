"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useOptimistic, useState } from "react";
import { type BookingForExecution, ServiceExecutionCard } from "./service-execution-card";

export type ProfessionalBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_authorized: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  service_name?: string | null;
  customer?: { id: string } | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  duration_minutes?: number | null;
  time_extension_minutes?: number | null;
  service_hourly_rate?: number | null;
  address?: Record<string, any> | null;
  currency?: string | null;
};

type Props = {
  bookings: ProfessionalBooking[];
};

export function ProBookingList({ bookings }: Props) {
  const router = useRouter();
  const t = useTranslations("dashboard.pro.bookingList");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // React 19: useOptimistic for instant status updates
  const [optimisticBookings, updateOptimisticBooking] = useOptimistic(
    bookings,
    (state, { id, status }: { id: string; status: string }) =>
      state.map((booking) => (booking.id === id ? { ...booking, status } : booking))
  );

  const handleAction = async (
    booking: ProfessionalBooking,
    action: "capture" | "void" | "accept" | "decline"
  ) => {
    // Accept and decline actions use different endpoints
    if (action === "accept" || action === "decline") {
      setLoadingId(`${booking.id}-${action}`);
      setMessage(null);

      // React 19: Update status optimistically - Badge changes instantly!
      const newStatus = action === "accept" ? "confirmed" : "declined";
      updateOptimisticBooking({ id: booking.id, status: newStatus });

      try {
        const endpoint = action === "accept" ? "/api/bookings/accept" : "/api/bookings/decline";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to ${action} booking`);
        }

        setMessage(
          t("success", { action: action === "accept" ? t("actions.accept") : t("actions.decline") })
        );
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : `Unexpected error ${action}ing booking`
        );
        // Optimistic update reverts automatically on error
      } finally {
        setLoadingId(null);
      }
      return;
    }

    // Original capture/void logic for payment intents
    if (!booking.stripe_payment_intent_id) {
      setMessage("Missing payment intent for this booking.");
      return;
    }

    setLoadingId(`${booking.id}-${action}`);
    setMessage(null);

    try {
      const endpoint =
        action === "capture" ? "/api/payments/capture-intent" : "/api/payments/void-intent";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: booking.stripe_payment_intent_id,
          amountToCapture: booking.amount_authorized ?? undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Stripe action failed");
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unexpected error running payment action"
      );
    } finally {
      setLoadingId(null);
    }
  };

  if (optimisticBookings.length === 0) {
    return <p className="text-[#7a6d62] text-sm">{t("emptyState")}</p>;
  }

  // Separate active service bookings from others (using optimistic state)
  const activeServiceBookings = optimisticBookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  );
  const otherBookings = optimisticBookings.filter(
    (b) => b.status !== "confirmed" && b.status !== "in_progress"
  );

  return (
    <div className="space-y-6">
      {message ? (
        <p
          className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}
        >
          {message}
        </p>
      ) : null}

      {/* Active Service Bookings - Use ServiceExecutionCard */}
      {activeServiceBookings.length > 0 && (
        <div>
          <h3 className="mb-4 font-semibold text-[#7a6d62] text-sm uppercase tracking-wide">
            {t("sections.activeServices")}
          </h3>
          <div className="space-y-4">
            {activeServiceBookings.map((booking) => (
              <ServiceExecutionCard booking={booking as BookingForExecution} key={booking.id} />
            ))}
          </div>
        </div>
      )}

      {/* Other Bookings - Table view (Desktop) */}
      {otherBookings.length > 0 && (
        <div>
          <h3 className="mb-4 font-semibold text-[#7a6d62] text-sm uppercase tracking-wide">
            {activeServiceBookings.length > 0
              ? t("sections.otherBookings")
              : t("sections.allBookings")}
          </h3>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#ebe5d8] md:block">
            <table className="min-w-full divide-y divide-[#ebe5d8] text-sm">
              <thead className="bg-[#fbfafa] text-[#7a6d62] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">{t("table.booking")}</th>
                  <th className="px-4 py-3 text-left">{t("table.service")}</th>
                  <th className="px-4 py-3 text-left">{t("table.scheduled")}</th>
                  <th className="px-4 py-3 text-left">{t("table.amount")}</th>
                  <th className="px-4 py-3 text-left">{t("table.status")}</th>
                  <th className="px-4 py-3 text-left">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e8dc] bg-white">
                {otherBookings.map((booking) => {
                  const scheduled = booking.scheduled_start
                    ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—";

                  const amountDisplay = booking.amount_authorized
                    ? new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(booking.amount_authorized)
                    : "—";

                  // Determine which actions to show based on status
                  const showAcceptDecline = booking.status === "authorized";
                  const showCapture = booking.status === "confirmed";
                  const showVoid = booking.status === "confirmed";

                  return (
                    <tr className="text-[#211f1a]" key={booking.id}>
                      <td className="px-4 py-3 font-medium">{booking.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-[#5d574b]">{booking.service_name || "—"}</td>
                      <td className="px-4 py-3 text-[#5d574b]">{scheduled}</td>
                      <td className="px-4 py-3 text-[#5d574b]">{amountDisplay}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${
                            booking.status === "authorized"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-[#ff5d46]/10 text-[#8a3934]"
                          }`}
                        >
                          {booking.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {showAcceptDecline ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-semibold text-white text-xs shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={loadingId !== null}
                              onClick={() => handleAction(booking, "accept")}
                              type="button"
                            >
                              {loadingId === `${booking.id}-accept`
                                ? t("actions.accepting")
                                : t("actions.accept")}
                            </button>
                            <button
                              className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 font-semibold text-red-700 text-xs transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={loadingId !== null}
                              onClick={() => handleAction(booking, "decline")}
                              type="button"
                            >
                              {loadingId === `${booking.id}-decline`
                                ? t("actions.declining")
                                : t("actions.decline")}
                            </button>
                          </div>
                        ) : showCapture || showVoid ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {showCapture ? (
                              <button
                                className="inline-flex items-center rounded-md bg-[#ff5d46] px-3 py-1.5 font-semibold text-white text-xs shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={loadingId !== null}
                                onClick={() => handleAction(booking, "capture")}
                                type="button"
                              >
                                {loadingId === `${booking.id}-capture`
                                  ? t("actions.capturing")
                                  : t("actions.capture")}
                              </button>
                            ) : null}
                            {showVoid ? (
                              <button
                                className="inline-flex items-center rounded-md border border-[#f0e1dc] px-3 py-1.5 font-semibold text-[#7a6d62] text-xs transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={loadingId !== null}
                                onClick={() => handleAction(booking, "void")}
                                type="button"
                              >
                                {loadingId === `${booking.id}-void`
                                  ? t("actions.canceling")
                                  : t("actions.cancelHold")}
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[#8a826d] text-xs">{t("actions.noActions")}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="space-y-4 md:hidden">
            {otherBookings.map((booking) => {
              const scheduled = booking.scheduled_start
                ? new Date(booking.scheduled_start).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—";

              const amountDisplay = booking.amount_authorized
                ? new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  }).format(booking.amount_authorized)
                : "—";

              const showAcceptDecline = booking.status === "authorized";
              const showCapture = booking.status === "confirmed";
              const showVoid = booking.status === "confirmed";

              return (
                <div
                  className="rounded-2xl border border-[#ebe5d8] bg-white p-5 shadow-sm"
                  key={booking.id}
                >
                  {/* Header: Booking ID and Status */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[#7a6d62] text-xs uppercase tracking-wide">
                        {t("table.booking")}
                      </p>
                      <p className="mt-1 font-semibold text-[#211f1a] text-base">
                        {booking.id.slice(0, 8)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 font-semibold text-xs ${
                        booking.status === "authorized"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-[#ff5d46]/10 text-[#8a3934]"
                      }`}
                    >
                      {booking.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Service and Details */}
                  <div className="space-y-3 border-[#f0e8dc] border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-[#7a6d62] text-sm">{t("table.service")}</span>
                      <span className="font-medium text-[#211f1a] text-sm">
                        {booking.service_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7a6d62] text-sm">{t("table.scheduled")}</span>
                      <span className="text-right font-medium text-[#211f1a] text-sm">
                        {scheduled}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7a6d62] text-sm">{t("table.amount")}</span>
                      <span className="font-semibold text-[#211f1a] text-base">
                        {amountDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(showAcceptDecline || showCapture || showVoid) && (
                    <div className="mt-4 border-[#f0e8dc] border-t pt-4">
                      {showAcceptDecline && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white text-sm shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={loadingId !== null}
                            onClick={() => handleAction(booking, "accept")}
                            type="button"
                          >
                            {loadingId === `${booking.id}-accept`
                              ? t("actions.accepting")
                              : t("actions.accept")}
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red-300 bg-white px-4 py-3 font-semibold text-red-700 text-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={loadingId !== null}
                            onClick={() => handleAction(booking, "decline")}
                            type="button"
                          >
                            {loadingId === `${booking.id}-decline`
                              ? t("actions.declining")
                              : t("actions.decline")}
                          </button>
                        </div>
                      )}
                      {(showCapture || showVoid) && (
                        <div className="flex flex-col gap-3">
                          {showCapture && (
                            <button
                              className="inline-flex items-center justify-center rounded-xl bg-[#ff5d46] px-4 py-3 font-semibold text-white text-sm shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={loadingId !== null}
                              onClick={() => handleAction(booking, "capture")}
                              type="button"
                            >
                              {loadingId === `${booking.id}-capture`
                                ? t("actions.capturing")
                                : t("actions.capture")}
                            </button>
                          )}
                          {showVoid && (
                            <button
                              className="inline-flex items-center justify-center rounded-xl border-2 border-[#ebe5d8] bg-white px-4 py-3 font-semibold text-[#7a6d62] text-sm transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={loadingId !== null}
                              onClick={() => handleAction(booking, "void")}
                              type="button"
                            >
                              {loadingId === `${booking.id}-void`
                                ? t("actions.canceling")
                                : t("actions.cancelHold")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
