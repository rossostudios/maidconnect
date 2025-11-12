"use client";

import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getBookings } from "@/app/actions/bookings";
import type { BookingStatus, BookingWithDetails } from "@/types";
import { BookingCard } from "./BookingCard";

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
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[#64748b] border-t-2 border-b-2" />
          <p className="text-[#94a3b8]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border-2 border-[#64748b]/30 bg-[#64748b]/10 p-6">
        <p className="font-semibold text-[#64748b]">{t("error")}</p>
        <p className="mt-2 text-[#64748b] text-sm">{error}</p>
        <button
          className="mt-4 rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
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
        <h2 className="font-bold text-2xl text-[#0f172a]">{t("title")}</h2>
        <p className="text-[#94a3b8] text-sm">{t("description")}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <HugeiconsIcon className="h-5 w-5 flex-shrink-0 text-[#94a3b8]" icon={FilterIcon} />
        {filterButtons.map(({ key, label }) => (
          <button
            className={`flex-shrink-0 rounded-lg px-4 py-2 font-medium text-sm transition ${
              filter === key
                ? "bg-[#64748b] text-[#f8fafc]"
                : "bg-[#f8fafc] text-[#94a3b8] hover:bg-[#e2e8f0]"
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
        <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-12 text-center">
          <p className="font-semibold text-[#0f172a]">{t("noBookings")}</p>
          <p className="mt-2 text-[#94a3b8] text-sm">{t("noBookingsDescription")}</p>
        </div>
      )}
    </div>
  );
}
