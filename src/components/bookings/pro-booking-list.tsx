"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ServiceExecutionCard, type BookingForExecution } from "./service-execution-card";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAction = async (booking: ProfessionalBooking, action: "capture" | "void" | "accept" | "decline") => {
    // Accept and decline actions use different endpoints
    if (action === "accept" || action === "decline") {
      setLoadingId(`${booking.id}-${action}`);
      setMessage(null);

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

        setMessage(`Booking ${action === "accept" ? "accepted" : "declined"} successfully!`);
        router.refresh();
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? error.message : `Unexpected error ${action}ing booking`);
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
      const endpoint = action === "capture" ? "/api/payments/capture-intent" : "/api/payments/void-intent";
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
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unexpected error running payment action");
    } finally {
      setLoadingId(null);
    }
  };

  if (bookings.length === 0) {
    return <p className="text-sm text-[#7a6d62]">No bookings yet. Once customers authorize a booking, it will appear here.</p>;
  }

  // Separate active service bookings from others
  const activeServiceBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "in_progress"
  );
  const otherBookings = bookings.filter(
    (b) => b.status !== "confirmed" && b.status !== "in_progress"
  );

  return (
    <div className="space-y-6">
      {message ? (
        <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      ) : null}

      {/* Active Service Bookings - Use ServiceExecutionCard */}
      {activeServiceBookings.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7a6d62]">
            Active Services
          </h3>
          <div className="space-y-4">
            {activeServiceBookings.map((booking) => (
              <ServiceExecutionCard
                key={booking.id}
                booking={booking as BookingForExecution}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Bookings - Use table view */}
      {otherBookings.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7a6d62]">
            {activeServiceBookings.length > 0 ? "Other Bookings" : "All Bookings"}
          </h3>
          <div className="overflow-hidden rounded-2xl border border-[#ebe5d8]">
        <table className="min-w-full divide-y divide-[#ebe5d8] text-sm">
          <thead className="bg-[#fbfafa] text-xs uppercase tracking-wide text-[#7a6d62]">
            <tr>
              <th className="px-4 py-3 text-left">Booking</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Scheduled</th>
              <th className="px-4 py-3 text-left">Amount (COP)</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
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
                ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(
                    booking.amount_authorized,
                  )
                : "—";

              // Determine which actions to show based on status
              const showAcceptDecline = booking.status === "authorized";
              const showCapture = booking.status === "confirmed";
              const showVoid = booking.status === "confirmed";

              return (
                <tr key={booking.id} className="text-[#211f1a]">
                  <td className="px-4 py-3 font-medium">{booking.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-[#5d574b]">{booking.service_name || "—"}</td>
                  <td className="px-4 py-3 text-[#5d574b]">{scheduled}</td>
                  <td className="px-4 py-3 text-[#5d574b]">{amountDisplay}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      booking.status === "authorized" ? "bg-yellow-100 text-yellow-800" :
                      booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                      booking.status === "declined" ? "bg-red-100 text-red-800" :
                      "bg-[#ff5d46]/10 text-[#8a3934]"
                    }`}>
                      {booking.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {showAcceptDecline ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => handleAction(booking, "accept")}
                          disabled={loadingId !== null}
                        >
                          {loadingId === `${booking.id}-accept` ? "Accepting…" : "Accept"}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => handleAction(booking, "decline")}
                          disabled={loadingId !== null}
                        >
                          {loadingId === `${booking.id}-decline` ? "Declining…" : "Decline"}
                        </button>
                      </div>
                    ) : showCapture || showVoid ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {showCapture ? (
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-[#ff5d46] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
                            onClick={() => handleAction(booking, "capture")}
                            disabled={loadingId !== null}
                          >
                            {loadingId === `${booking.id}-capture` ? "Capturing…" : "Capture"}
                          </button>
                        ) : null}
                        {showVoid ? (
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-[#f0e1dc] px-3 py-1.5 text-xs font-semibold text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:cursor-not-allowed disabled:opacity-70"
                            onClick={() => handleAction(booking, "void")}
                            disabled={loadingId !== null}
                          >
                            {loadingId === `${booking.id}-void` ? "Canceling…" : "Cancel hold"}
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-[#8a826d]">No actions available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
        </div>
      )}
    </div>
  );
}
