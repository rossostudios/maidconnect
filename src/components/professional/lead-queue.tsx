/**
 * Lead Queue Component
 *
 * Displays pending booking requests for professionals
 * Sprint 2: Professional Inbox Improvements
 */

"use client";

import { Calendar03Icon, Clock01Icon, LocationIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

type BookingLead = {
  id: string;
  service_name: string;
  service_category: string | null;
  scheduled_start: string;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_estimated: number;
  currency: string;
  status: string;
  special_instructions: string | null;
  address: string | null;
  created_at: string;
  customer: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

type LeadQueueProps = {
  initialBookings: BookingLead[];
  professionalId: string;
};

export function LeadQueue({ initialBookings, professionalId: _professionalId }: LeadQueueProps) {
  const [bookings, setBookings] = useState<BookingLead[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") {
      return true;
    }
    if (filter === "pending") {
      return booking.status === "pending" || booking.status === "pending_payment";
    }
    if (filter === "confirmed") {
      return booking.status === "confirmed";
    }
    return true;
  });

  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "pending_payment"
  ).length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  const handleAccept = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to accept booking");
      }

      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" } : b)));

      toast.success("Booking accepted! The customer has been notified.");
    } catch (error) {
      console.error("Failed to accept booking:", error);
      toast.error("Failed to accept booking. Please try again.");
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/decline`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to decline booking");
      }

      setBookings(bookings.filter((b) => b.id !== bookingId));
      toast.success("Booking declined");
    } catch (error) {
      console.error("Failed to decline booking:", error);
      toast.error("Failed to decline booking. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-[#ebe5d8] border-b">
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "all"
              ? "border-[var(--red)] text-[var(--red)]"
              : "border-transparent text-[#7d7566] hover:text-[var(--foreground)]"
          }`}
          onClick={() => setFilter("all")}
        >
          All ({bookings.length})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "pending"
              ? "border-[var(--red)] text-[var(--red)]"
              : "border-transparent text-[#7d7566] hover:text-[var(--foreground)]"
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`border-b-2 px-6 py-3 font-medium text-sm transition ${
            filter === "confirmed"
              ? "border-[var(--red)] text-[var(--red)]"
              : "border-transparent text-[#7d7566] hover:text-[var(--foreground)]"
          }`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed ({confirmedCount})
        </button>
      </div>

      {/* Lead Cards */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ebe5d8]">
            <HugeiconsIcon className="h-8 w-8 text-[#7d7566]" icon={Calendar03Icon} />
          </div>
          <h3 className="font-semibold text-[var(--foreground)] text-xl">
            {filter === "pending"
              ? "No pending requests"
              : filter === "confirmed"
                ? "No confirmed bookings"
                : "No booking requests"}
          </h3>
          <p className="mt-2 text-[#7d7566]">
            {filter === "pending"
              ? "You're all caught up! New requests will appear here."
              : filter === "confirmed"
                ? "Confirmed bookings will show here."
                : "Booking requests will appear here when customers request your services."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => (
            <LeadCard
              booking={booking}
              key={booking.id}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type LeadCardProps = {
  booking: BookingLead;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
};

function LeadCard({ booking, onAccept, onDecline }: LeadCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isPending = booking.status === "pending" || booking.status === "pending_payment";

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept(booking.id);
    setIsProcessing(false);
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this booking request?")) {
      return;
    }

    setIsProcessing(true);
    await onDecline(booking.id);
    setIsProcessing(false);
  };

  return (
    <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-6">
        {/* Customer Avatar */}
        <div className="flex-shrink-0">
          {booking.customer?.avatar_url ? (
            <Image
              alt={booking.customer.full_name}
              className="h-16 w-16 rounded-full object-cover"
              height={64}
              src={booking.customer.avatar_url}
              width={64}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--red)] font-bold text-white text-xl">
              {booking.customer?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 font-bold text-[var(--foreground)] text-xl">
                {booking.service_name}
              </h3>
              <div className="flex items-center gap-2 text-[#7d7566] text-sm">
                <HugeiconsIcon className="h-4 w-4" icon={UserIcon} />
                <span>{booking.customer?.full_name || "Unknown Customer"}</span>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`inline-flex rounded-full px-3 py-1 font-semibold text-xs ${
                isPending
                  ? "bg-yellow-100 text-yellow-700"
                  : booking.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {isPending
                ? "Pending Response"
                : booking.status === "confirmed"
                  ? "Confirmed"
                  : booking.status}
            </span>
          </div>

          {/* Booking Info Grid */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon className="h-5 w-5 text-[var(--red)]" icon={Calendar03Icon} />
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {new Date(booking.scheduled_start).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-[#7d7566] text-xs">
                  {new Date(booking.scheduled_start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {booking.duration_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon className="h-5 w-5 text-[var(--red)]" icon={Clock01Icon} />
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {booking.duration_minutes} minutes
                  </p>
                  <p className="text-[#7d7566] text-xs">Duration</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-xs">
                $
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {formatCurrency(booking.amount_estimated, { currency: booking.currency as any })}
                </p>
                <p className="text-[#7d7566] text-xs">Estimated</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {booking.address && (
            <div className="mb-4 flex items-start gap-2 text-sm">
              <HugeiconsIcon
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7d7566]"
                icon={LocationIcon}
              />
              <p className="text-[#7d7566]">{booking.address}</p>
            </div>
          )}

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="mb-4 rounded-lg bg-[#fbfafa] p-4">
              <p className="mb-1 font-medium text-[var(--foreground)] text-sm">
                Special Instructions:
              </p>
              <p className="text-[#7d7566] text-sm">{booking.special_instructions}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-[#9d9383] text-xs">
            <span>
              Requested {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
            </span>
            <span>ID: {booking.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="mt-6 flex gap-3 border-[#ebe5d8] border-t pt-6">
          <button
            className="flex-1 rounded-lg border-2 border-[#e5dfd4] bg-white px-6 py-3 font-semibold text-[var(--foreground)] transition hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isProcessing}
            onClick={handleDecline}
          >
            {isProcessing ? "Processing..." : "Decline"}
          </button>
          <button
            className="flex-1 rounded-lg bg-[var(--red)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isProcessing}
            onClick={handleAccept}
          >
            {isProcessing ? "Processing..." : "Accept Booking"}
          </button>
        </div>
      )}

      {booking.status === "confirmed" && (
        <div className="mt-6 border-[#ebe5d8] border-t pt-6">
          <button className="w-full rounded-lg border border-[#e5dfd4] px-6 py-3 font-semibold text-[var(--foreground)] transition hover:border-[var(--red)] hover:text-[var(--red)]">
            View Booking Details
          </button>
        </div>
      )}
    </div>
  );
}
