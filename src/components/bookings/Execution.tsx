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

// --- Helper Functions (extracted for complexity reduction) ---

function getStatusBadgeClass(status: string): string {
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
}

function getMessageClass(type: "success" | "error"): string {
  return type === "success"
    ? "bg-[neutral-500]/10 text-[neutral-500]"
    : "bg-[neutral-500]/10 text-[neutral-500]";
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatScheduledDate(dateString: string | null): string {
  if (!dateString) {
    return "—";
  }
  return new Date(dateString).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAddressDisplay(address: Record<string, any> | null): string {
  if (!address) {
    return "";
  }
  if (typeof address === "object" && "formatted" in address) {
    return String(address.formatted);
  }
  return JSON.stringify(address);
}

function getGeoErrorMessage(geoError: GeolocationPositionError): string {
  switch (geoError.code) {
    case geoError.PERMISSION_DENIED:
      return "Location permission denied. Please enable location access.";
    case geoError.POSITION_UNAVAILABLE:
      return "Location information unavailable.";
    case geoError.TIMEOUT:
      return "Location request timed out.";
    default:
      return "An unknown error occurred while getting location.";
  }
}

function isLocationError(errorMessage: string): boolean {
  return errorMessage.includes("location") || errorMessage.includes("Location");
}

function extractErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function getOvertimeTextClass(isOvertime: boolean): string {
  return isOvertime ? "text-[neutral-500]" : "text-[neutral-500]";
}

function calculateTotalPlannedMinutes(duration: number | null, extension: number | null): number {
  return (duration || 0) + (extension || 0);
}

// Get GPS coordinates - extracted outside component for complexity reduction
function getGPSCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
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
        reject(new Error(getGeoErrorMessage(geoError)));
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0,
      }
    );
  });
}

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
      const errorMessage = extractErrorMessage(error, "Failed to check in");
      if (isLocationError(errorMessage)) {
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
      const errorMessage = extractErrorMessage(error, "Failed to check out");
      if (isLocationError(errorMessage)) {
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

  const scheduledDate = formatScheduledDate(optimisticBooking.scheduled_start);
  const totalPlannedMinutes = calculateTotalPlannedMinutes(
    optimisticBooking.duration_minutes,
    optimisticBooking.time_extension_minutes
  );
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
          className={`inline-flex items-center px-3 py-1 font-semibold text-xs ${getStatusBadgeClass(optimisticBooking.status)}`}
        >
          {optimisticBooking.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Address */}
      {optimisticBooking.address && (
        <div className="mb-4">
          <p className="text-[neutral-400] text-sm">
            📍 {formatAddressDisplay(optimisticBooking.address)}
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
              <p className={`font-bold text-2xl ${getOvertimeTextClass(isOvertime)}`}>
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
        <div className={`mb-4 p-3 text-sm ${getMessageClass(message.type)}`}>{message.text}</div>
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
