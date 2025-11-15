"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState } from "react";

// Dynamic imports for modals (lazy load on demand)
const TimeExtensionModal = dynamic(
  () => import("@/components/bookings/TimeExtension").then((mod) => mod.TimeExtensionModal),
  { ssr: false }
);
const RatingPromptModal = dynamic(
  () => import("@/components/reviews/Rating").then((mod) => mod.RatingPromptModal),
  { ssr: false }
);

export type BookingForExecution = {
  id: string;
  status: string;
  scheduled_start: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  duration_minutes: number | null;
  time_extension_minutes: number | null;
  service_name?: string | null;
  service_hourly_rate?: number | null;
  address?: Record<string, any> | null;
  amount_authorized: number | null;
  currency?: string | null;
  customer?: { id: string } | null;
};

type Props = {
  booking: BookingForExecution;
  onRatingComplete?: () => void;
};

export function ServiceExecutionCard({ booking, onRatingComplete }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showTimeExtensionModal, setShowTimeExtensionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // React 19: useOptimistic for instant status updates
  const [optimisticBooking, setOptimisticBooking] = useOptimistic(
    booking,
    (state, newStatus: string) => ({
      ...state,
      status: newStatus,
      checked_in_at: newStatus === "in_progress" ? new Date().toISOString() : state.checked_in_at,
      checked_out_at: newStatus === "completed" ? new Date().toISOString() : state.checked_out_at,
    })
  );

  // Calculate elapsed time for in_progress bookings
  useEffect(() => {
    if (optimisticBooking.status === "in_progress" && optimisticBooking.checked_in_at) {
      const interval = setInterval(() => {
        const checkedInTime = new Date(optimisticBooking.checked_in_at!).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - checkedInTime) / 1000 / 60); // minutes
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
    return;
  }, [optimisticBooking.status, optimisticBooking.checked_in_at]);

  // Get GPS coordinates
  const getGPSCoordinates = (): Promise<{ latitude: number; longitude: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          let errorMessage = "Unable to get location";
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case geoError.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred while getting location.";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 0,
        }
      );
    });

  // Handle check-in
  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);
    setGpsError(null);

    try {
      // Get GPS coordinates first (not optimistic)
      const { latitude, longitude } = await getGPSCoordinates();

      // React 19: Update status optimistically - Timer starts instantly!
      setOptimisticBooking("in_progress");

      // Call check-in API in background
      const response = await fetch("/api/bookings/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to check in");
      }

      setMessage({ type: "success", text: "Checked in successfully!" });
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check in";
      if (errorMessage.includes("location") || errorMessage.includes("Location")) {
        setGpsError(errorMessage);
      }
      setMessage({ type: "error", text: errorMessage });
      // Optimistic update reverts automatically on error
    } finally {
      setLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async (completionNotes?: string) => {
    setLoading(true);
    setMessage(null);
    setGpsError(null);

    try {
      // Get GPS coordinates first (not optimistic)
      const { latitude, longitude } = await getGPSCoordinates();

      // React 19: Update status optimistically - Shows "completed" instantly!
      setOptimisticBooking("completed");

      // Call check-out API in background
      const response = await fetch("/api/bookings/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          latitude,
          longitude,
          completionNotes,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to check out");
      }

      setMessage({ type: "success", text: "Checked out successfully! Payment captured." });

      // Show rating prompt after successful checkout
      setTimeout(() => {
        setShowRatingModal(true);
      }, 1500);

      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to check out";
      if (errorMessage.includes("location") || errorMessage.includes("Location")) {
        setGpsError(errorMessage);
      }
      setMessage({ type: "error", text: errorMessage });
      // Optimistic update reverts automatically on error
    } finally {
      setLoading(false);
    }
  };

  // Handle time extension success
  const handleExtensionSuccess = (minutes: number, formattedAmount: string) => {
    setMessage({
      type: "success",
      text: `Extended by ${minutes} minutes (+${formattedAmount})`,
    });
    router.refresh();
  };

  // Format time display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const scheduledDate = optimisticBooking.scheduled_start
    ? new Date(optimisticBooking.scheduled_start).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const totalPlannedMinutes =
    (optimisticBooking.duration_minutes || 0) + (optimisticBooking.time_extension_minutes || 0);
  const isOvertime = elapsedTime > totalPlannedMinutes;

  return (
    <div className="border border-[neutral-200] bg-[neutral-50] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[neutral-900] text-lg">
            {optimisticBooking.service_name || "Service"}
          </h3>
          <p className="text-[neutral-400] text-sm">{scheduledDate}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 font-semibold text-xs ${(() => {
            const status = optimisticBooking.status;
            if (status === "confirmed") {
              return "bg-[neutral-500]/10 text-[neutral-500]";
            }
            if (status === "in_progress") {
              return "bg-[neutral-50] text-[neutral-500]";
            }
            if (status === "completed") {
              return "bg-[neutral-500]/10 text-[neutral-500]";
            }
            return "bg-[neutral-200]/30 text-[neutral-900]";
          })()}`}
        >
          {optimisticBooking.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Address */}
      {optimisticBooking.address && (
        <div className="mb-4">
          <p className="text-[neutral-400] text-sm">
            📍{" "}
            {typeof optimisticBooking.address === "object" &&
            "formatted" in optimisticBooking.address
              ? String(optimisticBooking.address.formatted)
              : JSON.stringify(optimisticBooking.address)}
          </p>
        </div>
      )}

      {/* Timer for in_progress bookings */}
      {optimisticBooking.status === "in_progress" && (
        <div className="mb-4 bg-[neutral-50] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[neutral-500] text-sm">Service in progress</p>
              <p className="text-[neutral-500] text-xs">
                Planned: {formatDuration(totalPlannedMinutes)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-2xl ${isOvertime ? "text-[neutral-500]" : "text-[neutral-500]"}`}
              >
                {formatDuration(elapsedTime)}
              </p>
              {isOvertime && (
                <p className="font-semibold text-[neutral-500] text-xs">
                  +{formatDuration(elapsedTime - totalPlannedMinutes)} overtime
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`mb-4 p-3 text-sm ${
            message.type === "success"
              ? "bg-[neutral-500]/10 text-[neutral-500]"
              : "bg-[neutral-500]/10 text-[neutral-500]"
          }`}
        >
          {message.text}
        </div>
      )}

      {gpsError && (
        <div className="mb-4 bg-[neutral-500]/5 p-3 text-[neutral-500] text-sm">
          <p className="font-medium">Location Access Required</p>
          <p>{gpsError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Check-in button for confirmed bookings */}
        {optimisticBooking.status === "confirmed" && (
          <button
            className="w-full bg-[neutral-500] px-4 py-3 font-semibold text-[neutral-50] transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            onClick={handleCheckIn}
            type="button"
          >
            {loading ? "Checking in..." : "Check In & Start Service"}
          </button>
        )}

        {/* Time extension for in_progress bookings */}
        {optimisticBooking.status === "in_progress" && (
          <>
            {/* Extend Time Button */}
            <button
              className="w-full border-2 border-[neutral-500] bg-[neutral-50] px-4 py-3 font-semibold text-[neutral-500] transition hover:bg-[neutral-500] hover:text-[neutral-50]"
              onClick={() => setShowTimeExtensionModal(true)}
              type="button"
            >
              ⏱️ Request More Time
            </button>

            {/* Check-out button */}
            <button
              className="w-full bg-[neutral-500] px-4 py-3 font-semibold text-[neutral-50] transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              onClick={() => handleCheckOut()}
              type="button"
            >
              {loading ? "Checking out..." : "Check Out & Complete Service"}
            </button>
          </>
        )}
      </div>

      {/* Time Extension Modal */}
      <TimeExtensionModal
        bookingId={optimisticBooking.id}
        currency={optimisticBooking.currency || "COP"}
        hourlyRate={optimisticBooking.service_hourly_rate || 0}
        isOpen={showTimeExtensionModal}
        onClose={() => setShowTimeExtensionModal(false)}
        onSuccess={handleExtensionSuccess}
      />

      {/* Rating Prompt Modal */}
      {optimisticBooking.customer && (
        <RatingPromptModal
          bookingId={optimisticBooking.id}
          customerId={optimisticBooking.customer.id}
          customerName="Customer"
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            if (onRatingComplete) {
              onRatingComplete();
            }
          }}
        />
      )}
    </div>
  );
}
