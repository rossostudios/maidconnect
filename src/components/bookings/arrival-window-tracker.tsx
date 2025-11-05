"use client";

import { Clock01Icon, Location01Icon, Navigation01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/lib/feature-flags";

export type ArrivalStatus = "scheduled" | "en_route" | "arriving_soon" | "arrived" | "in_progress";

type ArrivalWindowTrackerProps = {
  bookingId: string;
  professionalName: string;
  scheduledStart: string;
  status: string;
  className?: string;
};

type ArrivalWindow = {
  status: ArrivalStatus;
  estimatedArrival: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  lastUpdate: string | null;
};

/**
 * Arrival Window Tracker Component
 *
 * Privacy-conscious arrival tracking that shows customers when their professional
 * is nearby without revealing precise location data.
 *
 * Features:
 * - 30-minute arrival window (optimal per research)
 * - Progressive status updates (en route → arriving soon → arrived)
 * - Real-time polling during active arrival window
 * - Auto-dismisses after service starts
 */
export function ArrivalWindowTracker({
  bookingId,
  professionalName,
  scheduledStart,
  status,
  className = "",
}: ArrivalWindowTrackerProps) {
  const t = useTranslations("bookings.arrivalTracker");
  const [arrivalWindow, setArrivalWindow] = useState<ArrivalWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if feature is enabled
  const featureEnabled = isFeatureEnabled("arrival_notifications");

  // Don't show for past bookings or completed/canceled bookings
  const scheduledTime = new Date(scheduledStart);
  const now = new Date();
  const isPast = scheduledTime < now;
  const isCompleted = ["completed", "canceled", "declined"].includes(status);

  useEffect(() => {
    if (!featureEnabled || isPast || isCompleted) {
      setIsLoading(false);
      return;
    }

    // Fetch arrival window data
    async function fetchArrivalWindow() {
      try {
        const response = await fetch(`/api/notifications/arrival-alert?bookingId=${bookingId}`);

        if (!response.ok) {
          setArrivalWindow(null);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setArrivalWindow(data.arrivalWindow || null);
        setIsLoading(false);
      } catch (_error) {
        setArrivalWindow(null);
        setIsLoading(false);
      }
    }

    // Initial fetch
    fetchArrivalWindow();

    // Poll every 2 minutes during arrival window
    const pollInterval = setInterval(
      () => {
        fetchArrivalWindow();
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearInterval(pollInterval);
  }, [bookingId, featureEnabled, isPast, isCompleted]);

  // Don't render if feature disabled, loading, no data, or booking is scheduled (not en route yet)
  if (
    !featureEnabled ||
    isLoading ||
    !arrivalWindow ||
    arrivalWindow.status === "scheduled" ||
    arrivalWindow.status === "in_progress"
  ) {
    return null;
  }

  const statusConfig = {
    en_route: {
      icon: Navigation01Icon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      title: t("status.enRoute.title", { name: professionalName }),
      description: t("status.enRoute.description"),
    },
    arriving_soon: {
      icon: Location01Icon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      title: t("status.arrivingSoon.title", { name: professionalName }),
      description: t("status.arrivingSoon.description"),
    },
    arrived: {
      icon: Location01Icon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: t("status.arrived.title", { name: professionalName }),
      description: t("status.arrived.description"),
    },
    scheduled: {
      icon: Clock01Icon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      title: "",
      description: "",
    },
    in_progress: {
      icon: Clock01Icon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      title: "",
      description: "",
    },
  };

  const config = statusConfig[arrivalWindow.status];
  const Icon = config.icon;

  // Format arrival window
  let timeDisplay = "";
  if (arrivalWindow.windowStart && arrivalWindow.windowEnd) {
    const startTime = new Date(arrivalWindow.windowStart).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = new Date(arrivalWindow.windowEnd).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    timeDisplay = t("timeWindow", { start: startTime, end: endTime });
  } else if (arrivalWindow.estimatedArrival) {
    const eta = new Date(arrivalWindow.estimatedArrival).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    timeDisplay = t("estimatedArrival", { time: eta });
  }

  // Format last update
  let lastUpdateDisplay = "";
  if (arrivalWindow.lastUpdate) {
    const updateTime = new Date(arrivalWindow.lastUpdate);
    const minutesAgo = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));

    if (minutesAgo < 1) {
      lastUpdateDisplay = t("updatedJustNow");
    } else if (minutesAgo === 1) {
      lastUpdateDisplay = t("updatedMinuteAgo");
    } else {
      lastUpdateDisplay = t("updatedMinutesAgo", { minutes: minutesAgo });
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-full ${config.bgColor} p-3 ${config.color}`}>
          <HugeiconsIcon className="h-6 w-6" icon={Icon} />
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold ${config.color} text-lg`}>{config.title}</h3>
          <p className="mt-1 text-[var(--muted-foreground)] text-base">{config.description}</p>

          {timeDisplay && (
            <div className="mt-3 flex items-center gap-2 text-[var(--foreground)] text-base">
              <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
              <span className="font-medium">{timeDisplay}</span>
            </div>
          )}

          {lastUpdateDisplay && <p className="mt-2 text-[#8a8175] text-sm">{lastUpdateDisplay}</p>}
        </div>

        {/* Animated pulse indicator */}
        {arrivalWindow.status === "arriving_soon" && (
          <div className="relative">
            <div className="absolute h-3 w-3 animate-ping rounded-full bg-orange-400 opacity-75" />
            <div className="relative h-3 w-3 rounded-full bg-orange-500" />
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="mt-4 rounded-lg border border-[#ebe5d8] bg-white/50 p-3">
        <p className="text-[#8a8175] text-xs">{t("privacyNotice")}</p>
      </div>
    </div>
  );
}
