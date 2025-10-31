"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState } from "react";
import { RatingPromptModal } from "@/components/reviews/rating-prompt-modal";

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
  const [extensionMinutes, setExtensionMinutes] = useState<string>("30");
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
        (error) => {
          let message = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              message = "Location request timed out.";
              break;
            default:
              message = "An unknown error occurred while getting location.";
              break;
          }
          reject(new Error(message));
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

  // Handle time extension
  const handleExtendTime = async () => {
    const minutes = Number.parseInt(extensionMinutes, 10);
    if (Number.isNaN(minutes) || minutes <= 0) {
      setMessage({ type: "error", text: "Please enter a valid number of minutes" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/bookings/extend-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          additionalMinutes: minutes,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to extend time");
      }

      const result = await response.json();
      setMessage({
        type: "success",
        text: `Extended by ${minutes} minutes (+${result.extension.formatted_amount})`,
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to extend time",
      });
    } finally {
      setLoading(false);
    }
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
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[#211f1a] text-lg">
            {optimisticBooking.service_name || "Service"}
          </h3>
          <p className="text-[#7a6d62] text-sm">{scheduledDate}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs ${
            optimisticBooking.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : optimisticBooking.status === "in_progress"
                ? "bg-blue-100 text-blue-800"
                : optimisticBooking.status === "completed"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {optimisticBooking.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Address */}
      {optimisticBooking.address && (
        <div className="mb-4">
          <p className="text-[#5d574b] text-sm">
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
        <div className="mb-4 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900 text-sm">Service in progress</p>
              <p className="text-blue-700 text-xs">
                Planned: {formatDuration(totalPlannedMinutes)}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-bold text-2xl ${isOvertime ? "text-red-600" : "text-blue-900"}`}>
                {formatDuration(elapsedTime)}
              </p>
              {isOvertime && (
                <p className="font-semibold text-red-600 text-xs">
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
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {gpsError && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-medium">Location Access Required</p>
          <p>{gpsError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Check-in button for confirmed bookings */}
        {optimisticBooking.status === "confirmed" && (
          <button
            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
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
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
                max="240"
                min="1"
                onChange={(e) => setExtensionMinutes(e.target.value)}
                placeholder="Minutes"
                type="number"
                value={extensionMinutes}
              />
              <button
                className="rounded-lg border border-[#ff5d46] bg-white px-4 py-2 font-semibold text-[#ff5d46] text-sm transition hover:bg-[#ff5d46] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                onClick={handleExtendTime}
                type="button"
              >
                {loading ? "Extending..." : "Extend Time"}
              </button>
            </div>

            {/* Check-out button */}
            <button
              className="w-full rounded-lg bg-[#ff5d46] px-4 py-3 font-semibold text-white transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              onClick={() => handleCheckOut()}
              type="button"
            >
              {loading ? "Checking out..." : "Check Out & Complete Service"}
            </button>
          </>
        )}
      </div>

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
