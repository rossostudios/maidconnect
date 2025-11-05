"use client";

import { useTranslations } from "next-intl";
import type { BookingStatus } from "@/types";

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

/**
 * Booking Status Badge Component
 *
 * Displays booking status with appropriate styling
 */
export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const t = useTranslations("components.bookingStatusBadge");

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "disputed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-1 font-medium text-xs ${getStatusColor(
        status
      )}`}
    >
      {t(status)}
    </span>
  );
}
