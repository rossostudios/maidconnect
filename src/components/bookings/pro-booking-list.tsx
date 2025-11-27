"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo, useOptimistic, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { formatCOP } from "@/lib/utils/format";
import { type BookingForExecution, ServiceExecutionCard } from "./service-execution-card";

// Type for translation function from next-intl
type TranslationFunction = ReturnType<typeof useTranslations<string>>;

// Type for Next.js router
type NextRouter = ReturnType<typeof useRouter>;

// Type for booking actions
type BookingAction = "capture" | "void" | "accept" | "decline";

export type ProfessionalBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_authorized: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  service_name?: string | null;
  customer?: { id: string; full_name?: string | null } | null;
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  duration_minutes?: number | null;
  time_extension_minutes?: number | null;
  service_hourly_rate?: number | null;
  address?: string | Record<string, unknown> | null;
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

// Helper: Format currency amount using centralized utility
function formatAmount(amount: number | null): string {
  if (!amount) {
    return "—";
  }
  return formatCOP(amount);
}

// Helper: Get status badge classes
function getStatusBadgeClass(status: string): string {
  if (status === "authorized") {
    return "border border-[#FF5200] bg-rausch-50 text-[#FF5200]";
  }
  if (status === "confirmed") {
    return "border border-border bg-foreground text-background";
  }
  if (status === "declined") {
    return "border border-border bg-muted text-muted-foreground";
  }
  return "border border-border bg-muted text-muted-foreground";
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
  t: TranslationFunction;
  size?: "default" | "mobile";
}) {
  const isMobile = size === "mobile";
  const baseClass = isMobile
    ? "inline-flex items-center justify-center px-4 py-3 font-semibold text-sm uppercase tracking-wider"
    : "inline-flex items-center px-3 py-1.5 font-semibold text-xs uppercase tracking-wider";

  return (
    <div className={isMobile ? "grid grid-cols-2 gap-3" : "flex flex-wrap items-center gap-2"}>
      <button
        className={cn(
          baseClass,
          "border border-neutral-200 bg-[#FF5200] text-white transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-70",
          geistSans.className
        )}
        disabled={loadingId !== null}
        onClick={() => onAction(booking, "accept")}
        type="button"
      >
        {loadingId === `${booking.id}-accept` ? t("actions.accepting") : t("actions.accept")}
      </button>
      <button
        className={cn(
          baseClass,
          `${isMobile ? "border-2" : "border"} border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70`,
          geistSans.className
        )}
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
  t: TranslationFunction;
  showCapture: boolean;
  showVoid: boolean;
  size?: "default" | "mobile";
}) {
  const isMobile = size === "mobile";
  const baseClass = isMobile
    ? "inline-flex items-center justify-center px-4 py-3 font-semibold text-sm uppercase tracking-wider"
    : "inline-flex items-center px-3 py-1.5 font-semibold text-xs uppercase tracking-wider";

  return (
    <div className={isMobile ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-2"}>
      {showCapture && (
        <button
          className={cn(
            baseClass,
            "border border-neutral-200 bg-[#FF5200] text-white transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-70",
            geistSans.className
          )}
          disabled={loadingId !== null}
          onClick={() => onAction(booking, "capture")}
          type="button"
        >
          {loadingId === `${booking.id}-capture` ? t("actions.capturing") : t("actions.capture")}
        </button>
      )}
      {showVoid && (
        <button
          className={cn(
            baseClass,
            `${isMobile ? "border-2" : "border"} border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70`,
            geistSans.className
          )}
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
  router: NextRouter,
  t: TranslationFunction
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
  router: NextRouter
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

// Component: Desktop table row for a booking (memoized to prevent re-renders)
const BookingTableRow = memo(function BookingTableRow({
  booking,
  loadingId,
  onAction,
  t,
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: BookingAction) => void;
  t: TranslationFunction;
}) {
  const scheduled = formatScheduled(booking.scheduled_start);
  const amountDisplay = formatAmount(booking.amount_authorized);
  const { showAcceptDecline, showCapture, showVoid } = getActionVisibility(booking.status);

  return (
    <tr className="text-foreground" key={booking.id}>
      <td className={cn("px-4 py-3 font-medium", geistSans.className)}>{booking.id.slice(0, 8)}</td>
      <td className={cn("px-4 py-3 text-muted-foreground", geistSans.className)}>
        {booking.service_name || "—"}
      </td>
      <td className={cn("px-4 py-3 text-muted-foreground tracking-tighter", geistSans.className)}>
        {scheduled}
      </td>
      <td className={cn("px-4 py-3 text-muted-foreground tracking-tighter", geistSans.className)}>
        {amountDisplay}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 font-semibold text-xs uppercase tracking-wider",
            getStatusBadgeClass(booking.status),
            geistSans.className
          )}
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
          return (
            <span className={cn("text-muted-foreground text-xs", geistSans.className)}>
              {t("actions.noActions")}
            </span>
          );
        })()}
      </td>
    </tr>
  );
});

// Component: Mobile card for a booking (memoized to prevent re-renders)
const BookingMobileCard = memo(function BookingMobileCard({
  booking,
  loadingId,
  onAction,
  t,
}: {
  booking: ProfessionalBooking;
  loadingId: string | null;
  onAction: (booking: ProfessionalBooking, action: BookingAction) => void;
  t: TranslationFunction;
}) {
  const scheduled = formatScheduled(booking.scheduled_start);
  const amountDisplay = formatAmount(booking.amount_authorized);
  const { showAcceptDecline, showCapture, showVoid } = getActionVisibility(booking.status);

  return (
    <div className="border border-border bg-card p-5" key={booking.id}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-muted-foreground text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {t("table.booking")}
          </p>
          <p
            className={cn(
              "mt-1 font-semibold text-base text-foreground tracking-tighter",
              geistSans.className
            )}
          >
            {booking.id.slice(0, 8)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center px-3 py-1.5 font-semibold text-xs uppercase tracking-wider",
            getStatusBadgeClass(booking.status),
            geistSans.className
          )}
        >
          {booking.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="space-y-3 border-border border-t pt-4">
        <div className="flex justify-between">
          <span className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("table.service")}
          </span>
          <span className={cn("font-medium text-foreground text-sm", geistSans.className)}>
            {booking.service_name || "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("table.scheduled")}
          </span>
          <span
            className={cn(
              "text-right font-medium text-foreground text-sm tracking-tighter",
              geistSans.className
            )}
          >
            {scheduled}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={cn("text-muted-foreground text-sm", geistSans.className)}>
            {t("table.amount")}
          </span>
          <span
            className={cn(
              "font-semibold text-base text-foreground tracking-tighter",
              geistSans.className
            )}
          >
            {amountDisplay}
          </span>
        </div>
      </div>

      {(showAcceptDecline || showCapture || showVoid) && (
        <div className="mt-4 border-border border-t pt-4">
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
});

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

  // Memoized callback to prevent re-renders of child components
  const handleAction = useCallback(
    async (booking: ProfessionalBooking, action: "capture" | "void" | "accept" | "decline") => {
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
    },
    [router, t, updateOptimisticBooking]
  );

  // Memoized filtered bookings to prevent recalculation on every render
  const activeServiceBookings = useMemo(
    () => optimisticBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress"),
    [optimisticBookings]
  );

  const otherBookings = useMemo(
    () => optimisticBookings.filter((b) => b.status !== "confirmed" && b.status !== "in_progress"),
    [optimisticBookings]
  );

  if (optimisticBookings.length === 0) {
    return (
      <p className={cn("text-muted-foreground text-sm", geistSans.className)}>{t("emptyState")}</p>
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p
          className={cn(
            "text-sm",
            message.includes("successfully") ? "text-foreground" : "text-foreground",
            geistSans.className
          )}
        >
          {message}
        </p>
      ) : null}

      {/* Active Service Bookings - Use ServiceExecutionCard */}
      {activeServiceBookings.length > 0 && (
        <div>
          <h3
            className={cn(
              "mb-4 font-semibold text-neutral-900 text-sm uppercase tracking-wider",
              geistSans.className
            )}
          >
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
          <h3
            className={cn(
              "mb-4 font-semibold text-neutral-900 text-sm uppercase tracking-wider",
              geistSans.className
            )}
          >
            {activeServiceBookings.length > 0
              ? t("sections.otherBookings")
              : t("sections.allBookings")}
          </h3>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden overflow-hidden border border-border md:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.booking")}
                  </th>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.service")}
                  </th>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.scheduled")}
                  </th>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.amount")}
                  </th>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.status")}
                  </th>
                  <th className={cn("px-4 py-3 text-left", geistSans.className)}>
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
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
