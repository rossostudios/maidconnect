"use client";

import { Clock01Icon, Location01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";
import type { BookingStatus, BookingWithDetails } from "@/types";

type BookingCardProps = {
  booking: BookingWithDetails;
  role: "customer" | "professional";
  onView?: (booking: BookingWithDetails) => void;
  onCancel?: (bookingId: string) => void;
  onRate?: (bookingId: string) => void;
};

type BadgeVariant =
  | "default"
  | "secondary"
  | "primary"
  | "muted"
  | "outline"
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "success"
  | "warning"
  | "danger"
  | "info";

// --- Helper Functions (extracted for complexity reduction) ---

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatBookingTime(timeStr: string): string {
  const [hours = "0", minutes = "00"] = timeStr.split(":");
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Maps BookingStatus to a valid Badge variant
 * Note: 'disputed' status maps to 'danger' variant since Badge doesn't have a 'disputed' variant
 */
function getStatusBadgeVariant(status: BookingStatus): BadgeVariant {
  const statusToVariant: Record<BookingStatus, BadgeVariant> = {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
    disputed: "danger",
  };
  return statusToVariant[status];
}

/**
 * Get currency code for booking
 * Currently all bookings use COP (Colombian Peso) as indicated by *Cop price fields
 */
function getCurrencyCode(_booking: BookingWithDetails): Currency {
  // All price fields in BookingWithDetails are *Cop (e.g., totalPriceCop)
  // If multi-currency support is added, this function should be updated
  return "COP";
}

function getOtherParty(
  booking: BookingWithDetails,
  role: "customer" | "professional"
): BookingWithDetails["professional"] | BookingWithDetails["customer"] {
  return role === "customer" ? booking.professional : booking.customer;
}

function canCancelBooking(status: string, onCancel?: (bookingId: string) => void): boolean {
  return (status === "pending" || status === "confirmed") && !!onCancel;
}

function canRateBooking(
  booking: BookingWithDetails,
  role: "customer" | "professional",
  onRate?: (bookingId: string) => void
): boolean {
  if (booking.status !== "completed" || !onRate) {
    return false;
  }
  if (role === "customer" && !booking.customerRating) {
    return true;
  }
  if (role === "professional" && !booking.professionalRating) {
    return true;
  }
  return false;
}

/**
 * Booking Card Component
 *
 * Displays a single booking with actions
 * Lia Design: rounded-lg, neutral palette, rausch-500 primary
 */
export function BookingCard({ booking, role, onView, onCancel, onRate }: BookingCardProps) {
  const t = useTranslations("components.bookingCard");

  const currencyCode = getCurrencyCode(booking);
  const formatPrice = (price: number) => formatFromMinorUnits(price, currencyCode);
  const otherParty = getOtherParty(booking, role);
  const canCancel = canCancelBooking(booking.status, onCancel);
  const canRate = canRateBooking(booking, role, onRate);

  return (
    <div className="group rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-semibold text-lg text-neutral-900">
              {booking.service?.name || "Service"}
            </h3>
            <Badge variant={getStatusBadgeVariant(booking.status)}>
              {booking.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-neutral-500 text-sm">#{booking.bookingNumber}</p>
        </div>

        <div className="text-right">
          <p className="font-bold text-2xl text-neutral-900">
            {formatPrice(booking.totalPriceCop)}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mb-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-neutral-700 text-sm">
          <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Clock01Icon} />
          <span>
            {formatBookingDate(booking.scheduledDate)} •{" "}
            {formatBookingTime(booking.scheduledStartTime)} -{" "}
            {formatBookingTime(booking.scheduledEndTime)}
          </span>
        </div>

        {/* Other Party */}
        {otherParty && (
          <div className="flex items-center gap-2 text-neutral-700 text-sm">
            <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserIcon} />
            <span>
              {role === "customer" ? t("professional") : t("customer")}: {otherParty.fullName}
            </span>
          </div>
        )}

        {/* Location */}
        {booking.serviceAddressCity && (
          <div className="flex items-center gap-2 text-neutral-700 text-sm">
            <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={Location01Icon} />
            <span className="line-clamp-1">
              {booking.serviceAddressLine1}, {booking.serviceAddressCity}
            </span>
          </div>
        )}
      </div>

      {/* Add-ons */}
      {booking.addons && booking.addons.length > 0 && (
        <div className="mb-4 rounded-lg bg-neutral-50 p-3">
          <p className="mb-2 font-medium text-neutral-900 text-xs">{t("addons")}:</p>
          <ul className="space-y-1">
            {booking.addons.map((addon) => (
              <li className="text-neutral-700 text-xs" key={addon.id}>
                • {addon.addonName} ({formatPrice(addon.addonPriceCop)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Customer Notes */}
      {booking.customerNotes && role === "professional" && (
        <div className="mb-4 rounded-lg bg-neutral-50 p-3">
          <p className="mb-1 font-medium text-neutral-700 text-xs">{t("customerNotes")}:</p>
          <p className="text-neutral-700 text-xs">{booking.customerNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-neutral-200 border-t pt-4">
        {onView && (
          <button
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2"
            onClick={() => onView(booking)}
            type="button"
          >
            {t("viewDetails")}
          </button>
        )}

        {canRate && onRate && (
          <button
            className="flex-1 rounded-lg bg-rausch-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-rausch-600 focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2"
            onClick={() => onRate(booking.id)}
            type="button"
          >
            {t("rateBooking")}
          </button>
        )}

        {canCancel && onCancel && (
          <button
            className="rounded-lg border border-red-200 bg-white px-4 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => onCancel(booking.id)}
            type="button"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
