"use client";

import { FilterIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getBookings } from "@/app/actions/bookings";
import type { BookingStatus, BookingWithDetails } from "@/types";
import { BookingCard } from "./booking-card";

type BookingListProps = {
  userId: string;
  role: "customer" | "professional";
  onViewBooking?: (booking: BookingWithDetails) => void;
  onCancelBooking?: (bookingId: string) => void;
  onRateBooking?: (bookingId: string) => void;
};

type FilterStatus = "all" | BookingStatus;

/**
 * Booking List Component
 *
 * Displays list of bookings with filtering
 * Lia Design: rounded-lg cards, rounded-full filter pills (Airbnb-style)
 */
export function BookingList({
  userId,
  role,
  onViewBooking,
  onCancelBooking,
  onRateBooking,
}: BookingListProps) {
  const t = useTranslations("components.bookingList");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const statusFilter = filter === "all" ? undefined : filter;
      const response = await getBookings(userId, role, statusFilter);

      if (!response.success) {
        setError(response.error);
        return;
      }

      setBookings(response.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusCount = (status: FilterStatus) => {
    if (status === "all") {
      return bookings.length;
    }
    return bookings.filter((b) => b.status === status).length;
  };

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "pending", label: t("pending") },
    { key: "confirmed", label: t("confirmed") },
    { key: "in_progress", label: t("inProgress") },
    { key: "completed", label: t("completed") },
    { key: "cancelled", label: t("cancelled") },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-8 w-8 animate-spin text-orange-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">{t("error")}</p>
        <p className="mt-2 text-red-600 text-sm">{error}</p>
        <button
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => loadBookings()}
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-bold text-2xl text-neutral-900">{t("title")}</h2>
        <p className="text-neutral-500 text-sm">{t("description")}</p>
      </div>

      {/* Filter Pills - Airbnb-style horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <HugeiconsIcon className="h-5 w-5 flex-shrink-0 text-neutral-500" icon={FilterIcon} />
        {filterButtons.map(({ key, label }) => (
          <button
            className={`flex-shrink-0 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
              filter === key
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
            }`}
            key={key}
            onClick={() => setFilter(key)}
            type="button"
          >
            {label} ({getStatusCount(key)})
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {bookings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard
              booking={booking}
              key={booking.id}
              onCancel={onCancelBooking}
              onRate={onRateBooking}
              onView={onViewBooking}
              role={role}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
          <p className="font-semibold text-neutral-900">{t("noBookings")}</p>
          <p className="mt-2 text-neutral-500 text-sm">{t("noBookingsDescription")}</p>
        </div>
      )}
    </div>
  );
}
