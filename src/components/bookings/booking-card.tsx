"use client";

import { Clock01Icon, Location01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { BookingWithDetails } from "@/types";
import { BookingStatusBadge } from "./booking-status-badge";

type BookingCardProps = {
  booking: BookingWithDetails;
  role: "customer" | "professional";
  onView?: (booking: BookingWithDetails) => void;
  onCancel?: (bookingId: string) => void;
  onRate?: (bookingId: string) => void;
};

/**
 * Booking Card Component
 *
 * Displays a single booking with actions
 */
export function BookingCard({ booking, role, onView, onCancel, onRate }: BookingCardProps) {
  const t = useTranslations("components.bookingCard");

  const formatPrice = (price: number) => `$${(price / 1000).toFixed(0)}k`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr: string) => {
    const [hours = "0", minutes = "00"] = timeStr.split(":");
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const otherParty = role === "customer" ? booking.professional : booking.customer;
  const canCancel = (booking.status === "pending" || booking.status === "confirmed") && onCancel;
  const canRate =
    booking.status === "completed" &&
    ((role === "customer" && !booking.customerRating) ||
      (role === "professional" && !booking.professionalRating)) &&
    onRate;

  return (
    <div className="group rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {booking.service?.name || "Service"}
            </h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-[#6b7280] text-sm">#{booking.bookingNumber}</p>
        </div>

        <div className="text-right">
          <p className="font-bold text-2xl text-[#E85D48]">{formatPrice(booking.totalPriceCop)}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mb-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-[#6b7280] text-sm">
          <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
          <span>
            {formatDate(booking.scheduledDate)} • {formatTime(booking.scheduledStartTime)} -{" "}
            {formatTime(booking.scheduledEndTime)}
          </span>
        </div>

        {/* Other Party */}
        {otherParty && (
          <div className="flex items-center gap-2 text-[#6b7280] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={UserIcon} />
            <span>
              {role === "customer" ? t("professional") : t("customer")}: {otherParty.fullName}
            </span>
          </div>
        )}

        {/* Location */}
        {booking.serviceAddressCity && (
          <div className="flex items-center gap-2 text-[#6b7280] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
            <span className="line-clamp-1">
              {booking.serviceAddressLine1}, {booking.serviceAddressCity}
            </span>
          </div>
        )}
      </div>

      {/* Add-ons */}
      {booking.addons && booking.addons.length > 0 && (
        <div className="mb-4 rounded-xl bg-[#f9fafb] p-3">
          <p className="mb-2 font-medium text-gray-900 text-xs">{t("addons")}:</p>
          <ul className="space-y-1">
            {booking.addons.map((addon) => (
              <li className="text-[#6b7280] text-xs" key={addon.id}>
                • {addon.addonName} ({formatPrice(addon.addonPriceCop)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Customer Notes */}
      {booking.customerNotes && role === "professional" && (
        <div className="mb-4 rounded-xl bg-blue-50 p-3">
          <p className="mb-1 font-medium text-blue-900 text-xs">{t("customerNotes")}:</p>
          <p className="text-blue-800 text-xs">{booking.customerNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-[#e5e7eb] border-t pt-4">
        {onView && (
          <button
            className="flex-1 rounded-xl border-2 border-[#e5e7eb] bg-white px-4 py-2 font-medium text-sm transition hover:bg-[#f9fafb]"
            onClick={() => onView(booking)}
            type="button"
          >
            {t("viewDetails")}
          </button>
        )}

        {canRate && (
          <button
            className="flex-1 rounded-xl bg-[#E85D48] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#D64A36]"
            onClick={() => onRate(booking.id)}
            type="button"
          >
            {t("rateBooking")}
          </button>
        )}

        {canCancel && (
          <button
            className="rounded-xl border-2 border-red-200 bg-white px-4 py-2 font-medium text-[#E85D48] text-sm transition hover:bg-[#E85D48]/10"
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
