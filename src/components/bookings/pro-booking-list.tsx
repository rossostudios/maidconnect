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

// Helper: Format scheduled date/time
function formatScheduled(scheduledStart: string | null): string {
  if (!scheduledStart) {
    return "—";
  }
  return new Date(scheduledStart).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Helper: Format currency amount
function formatAmount(amount: number | null): string {
  if (!amount) {
    return "—";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper: Get status badge classes
function getStatusBadgeClass(status: string): string {
  if (status === "authorized") {
    return "bg-[#64748b]/10 text-[#64748b]";
  }
  if (status === "confirmed") {
    return "bg-[#64748b]/10 text-[#64748b]";
  }
  if (status === "declined") {
    return "bg-[#64748b]/10 text-[#64748b]";
  }
  return "bg-[#64748b]/10 text-[#64748b]";
}

// Helper: Determine action visibility
function getActionVisibility(status: string) {
  return {
    showAcceptDecline: status === "authorized",
    showCapture: status === "confirmed",
    showVoid: status === "confirmed",
  };
}

// Component: Accept/Decline Action Buttons
function AcceptDeclineActions({
  booking,
  loadingId,
  onAction,
  t,
  size = "default",
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: "accept" | "decline") => void;
  t: any;
  size?: "default" | "mobile";
}) {
  const isMobile = size === "mobile";
  const baseClass = isMobile
    ? "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-sm"
    : "inline-flex items-center rounded-md px-3 py-1.5 font-semibold text-xs";

  return (
    <div className={isMobile ? "grid grid-cols-2 gap-3" : "flex flex-wrap items-center gap-2"}>
      <button
        className={`${baseClass} bg-[#64748b] text-[#f8fafc] shadow-sm transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70`}
        disabled={loadingId !== null}
        onClick={() => onAction(booking, "accept")}
        type="button"
      >
        {loadingId === `${booking.id}-accept` ? t("actions.accepting") : t("actions.accept")}
      </button>
      <button
        className={`${baseClass} ${isMobile ? "border-2" : "border"} border-[#64748b]/50 bg-[#f8fafc] text-[#64748b] transition hover:bg-[#64748b]/10 disabled:cursor-not-allowed disabled:opacity-70`}
        disabled={loadingId !== null}
        onClick={() => onAction(booking, "decline")}
        type="button"
      >
        {loadingId === `${booking.id}-decline` ? t("actions.declining") : t("actions.decline")}
      </button>
    </div>
  );
}

// Component: Capture/Void Action Buttons
function CaptureVoidActions({
  booking,
  loadingId,
  onAction,
  t,
  showCapture,
  showVoid,
  size = "default",
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: "capture" | "void") => void;
  t: any;
  showCapture: boolean;
  showVoid: boolean;
  size?: "default" | "mobile";
}) {
  const isMobile = size === "mobile";
  const baseClass = isMobile
    ? "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-sm"
    : "inline-flex items-center rounded-md px-3 py-1.5 font-semibold text-xs";

  return (
    <div className={isMobile ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-2"}>
      {showCapture && (
        <button
          className={`${baseClass} bg-[#64748b] text-[#f8fafc] shadow-sm transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70`}
          disabled={loadingId !== null}
          onClick={() => onAction(booking, "capture")}
          type="button"
        >
          {loadingId === `${booking.id}-capture` ? t("actions.capturing") : t("actions.capture")}
        </button>
      )}
      {showVoid && (
        <button
          className={`${baseClass} ${isMobile ? "border-2" : "border"} ${isMobile ? "border-[#e2e8f0]" : "border-[#e2e8f0]"} bg-[#f8fafc] text-[#94a3b8] transition hover:border-[#64748b] hover:text-[#64748b] disabled:cursor-not-allowed disabled:opacity-70`}
          disabled={loadingId !== null}
          onClick={() => onAction(booking, "void")}
          type="button"
        >
          {loadingId === `${booking.id}-void` ? t("actions.canceling") : t("actions.cancelHold")}
        </button>
      )}
    </div>
  );
}

// Helper: Handle accept/decline actions
async function handleAcceptDecline(
  booking: ProfessionalBooking,
  action: "accept" | "decline",
  setLoadingId: (id: string | null) => void,
  setMessage: (msg: string | null) => void,
  updateOptimisticBooking: (update: { id: string; status: string }) => void,
  router: any,
  t: any
) {
  setLoadingId(`${booking.id}-${action}`);
  setMessage(null);

  const newStatus = action === "accept" ? "confirmed" : "declined";
  updateOptimisticBooking({ id: booking.id, status: newStatus });

  try {
    const endpoint = action === "accept" ? "/api/bookings/accept" : "/api/bookings/decline";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id }),
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
    setMessage(error instanceof Error ? error.message : `Unexpected error ${action}ing booking`);
  } finally {
    setLoadingId(null);
  }
}

// Helper: Handle capture/void actions
async function handleCaptureVoid(
  booking: ProfessionalBooking,
  action: "capture" | "void",
  setLoadingId: (id: string | null) => void,
  setMessage: (msg: string | null) => void,
  router: any
) {
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
      headers: { "Content-Type": "application/json" },
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
    setMessage(error instanceof Error ? error.message : "Unexpected error running payment action");
  } finally {
    setLoadingId(null);
  }
}

// Component: Desktop table row for a booking
function BookingTableRow({
  booking,
  loadingId,
  onAction,
  t,
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: any) => void;
  t: any;
}) {
  const scheduled = formatScheduled(booking.scheduled_start);
  const amountDisplay = formatAmount(booking.amount_authorized);
  const { showAcceptDecline, showCapture, showVoid } = getActionVisibility(booking.status);

  return (
    <tr className="text-[#0f172a]" key={booking.id}>
      <td className="px-4 py-3 font-medium">{booking.id.slice(0, 8)}</td>
      <td className="px-4 py-3 text-[#94a3b8]">{booking.service_name || "—"}</td>
      <td className="px-4 py-3 text-[#94a3b8]">{scheduled}</td>
      <td className="px-4 py-3 text-[#94a3b8]">{amountDisplay}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${getStatusBadgeClass(booking.status)}`}
        >
          {booking.status.replace(/_/g, " ")}
        </span>
      </td>
      <td className="px-4 py-3">
        {(() => {
          if (showAcceptDecline) {
            return (
              <AcceptDeclineActions
                booking={booking}
                loadingId={loadingId}
                onAction={onAction}
                t={t}
              />
            );
          }
          if (showCapture || showVoid) {
            return (
              <CaptureVoidActions
                booking={booking}
                loadingId={loadingId}
                onAction={onAction}
                showCapture={showCapture}
                showVoid={showVoid}
                t={t}
              />
            );
          }
          return <span className="text-[#94a3b8] text-xs">{t("actions.noActions")}</span>;
        })()}
      </td>
    </tr>
  );
}

// Component: Mobile card for a booking
function BookingMobileCard({
  booking,
  loadingId,
  onAction,
  t,
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: any) => void;
  t: any;
}) {
  const scheduled = formatScheduled(booking.scheduled_start);
  const amountDisplay = formatAmount(booking.amount_authorized);
  const { showAcceptDecline, showCapture, showVoid } = getActionVisibility(booking.status);

  return (
    <div
      className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 shadow-sm"
      key={booking.id}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[#94a3b8] text-xs uppercase tracking-wide">{t("table.booking")}</p>
          <p className="mt-1 font-semibold text-[#0f172a] text-base">{booking.id.slice(0, 8)}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1.5 font-semibold text-xs ${getStatusBadgeClass(booking.status)}`}
        >
          {booking.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="space-y-3 border-[#e2e8f0] border-t pt-4">
        <div className="flex justify-between">
          <span className="text-[#94a3b8] text-sm">{t("table.service")}</span>
          <span className="font-medium text-[#0f172a] text-sm">{booking.service_name || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#94a3b8] text-sm">{t("table.scheduled")}</span>
          <span className="text-right font-medium text-[#0f172a] text-sm">{scheduled}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#94a3b8] text-sm">{t("table.amount")}</span>
          <span className="font-semibold text-[#0f172a] text-base">{amountDisplay}</span>
        </div>
      </div>

      {(showAcceptDecline || showCapture || showVoid) && (
        <div className="mt-4 border-[#e2e8f0] border-t pt-4">
          {showAcceptDecline && (
            <AcceptDeclineActions
              booking={booking}
              loadingId={loadingId}
              onAction={onAction}
              size="mobile"
              t={t}
            />
          )}
          {(showCapture || showVoid) && (
            <CaptureVoidActions
              booking={booking}
              loadingId={loadingId}
              onAction={onAction}
              showCapture={showCapture}
              showVoid={showVoid}
              size="mobile"
              t={t}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function ProBookingList({ bookings }: Props) {
  const router = useRouter();
  const t = useTranslations("dashboard.pro.bookingList");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [optimisticBookings, updateOptimisticBooking] = useOptimistic(
    bookings,
    (state, { id, status }: { id: string; status: string }) =>
      state.map((booking) => (booking.id === id ? { ...booking, status } : booking))
  );

  const handleAction = async (
    booking: ProfessionalBooking,
    action: "capture" | "void" | "accept" | "decline"
  ) => {
    if (action === "accept" || action === "decline") {
      return handleAcceptDecline(
        booking,
        action,
        setLoadingId,
        setMessage,
        updateOptimisticBooking,
        router,
        t
      );
    }
    return handleCaptureVoid(booking, action, setLoadingId, setMessage, router);
  };

  if (optimisticBookings.length === 0) {
    return <p className="text-[#94a3b8] text-sm">{t("emptyState")}</p>;
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
          className={`text-sm ${message.includes("successfully") ? "text-[#64748b]" : "text-[#64748b]"}`}
        >
          {message}
        </p>
      ) : null}

      {/* Active Service Bookings - Use ServiceExecutionCard */}
      {activeServiceBookings.length > 0 && (
        <div>
          <h3 className="mb-4 font-semibold text-[#94a3b8] text-sm uppercase tracking-wide">
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
          <h3 className="mb-4 font-semibold text-[#94a3b8] text-sm uppercase tracking-wide">
            {activeServiceBookings.length > 0
              ? t("sections.otherBookings")
              : t("sections.allBookings")}
          </h3>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#e2e8f0] md:block">
            <table className="min-w-full divide-y divide-[#e2e8f0] text-sm">
              <thead className="bg-[#f8fafc] text-[#94a3b8] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">{t("table.booking")}</th>
                  <th className="px-4 py-3 text-left">{t("table.service")}</th>
                  <th className="px-4 py-3 text-left">{t("table.scheduled")}</th>
                  <th className="px-4 py-3 text-left">{t("table.amount")}</th>
                  <th className="px-4 py-3 text-left">{t("table.status")}</th>
                  <th className="px-4 py-3 text-left">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8fafc] bg-[#f8fafc]">
                {otherBookings.map((booking) => (
                  <BookingTableRow
                    booking={booking}
                    key={booking.id}
                    loadingId={loadingId}
                    onAction={handleAction}
                    t={t}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="space-y-4 md:hidden">
            {otherBookings.map((booking) => (
              <BookingMobileCard
                booking={booking}
                key={booking.id}
                loadingId={loadingId}
                onAction={handleAction}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
