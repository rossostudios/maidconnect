/**
 * RecentBookingsTable - High-Density Data Table
 *
 * Displays recent bookings with:
 * - Client (Avatar + Name)
 * - Service Type
 * - Date
 * - Amount
 * - Status badge
 *
 * Features: Search input, Filter button, Sort button
 * Horizontal scroll on mobile.
 *
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { FilterIcon, Search01Icon, SortingAZ01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { type Currency, formatFromMinorUnits } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

export type BookingStatus = "completed" | "pending" | "cancelled";

export type RecentBooking = {
  id: string;
  client: {
    name: string;
    avatar?: string;
  };
  serviceType: string;
  date: string;
  amount: number;
  status: BookingStatus;
};

type RecentBookingsTableProps = {
  bookings: RecentBooking[];
  currencyCode?: Currency;
  className?: string;
};

// ========================================
// Mock Data (Development)
// ========================================

export const MOCK_RECENT_BOOKINGS: RecentBooking[] = [
  {
    id: "1",
    client: { name: "Maria Garcia" },
    serviceType: "Cleaning",
    date: "2025-11-27",
    amount: 8_500_000,
    status: "completed",
  },
  {
    id: "2",
    client: { name: "Carlos Rodriguez" },
    serviceType: "Nanny",
    date: "2025-11-26",
    amount: 12_000_000,
    status: "completed",
  },
  {
    id: "3",
    client: { name: "Ana Martinez" },
    serviceType: "Cooking",
    date: "2025-11-25",
    amount: 6_500_000,
    status: "pending",
  },
  {
    id: "4",
    client: { name: "Luis Hernandez" },
    serviceType: "Errands",
    date: "2025-11-24",
    amount: 4_500_000,
    status: "completed",
  },
  {
    id: "5",
    client: { name: "Sofia Lopez" },
    serviceType: "Cleaning",
    date: "2025-11-23",
    amount: 8_500_000,
    status: "cancelled",
  },
];

// ========================================
// Utilities
// ========================================

function getStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-stone-500/10 text-stone-500 border-stone-500/20";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ========================================
// Components
// ========================================

export function RecentBookingsTable({
  bookings,
  currencyCode = "COP",
  className,
}: RecentBookingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter bookings by search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookings;
    }
    const query = searchQuery.toLowerCase();
    return bookings.filter(
      (b) =>
        b.client.name.toLowerCase().includes(query) || b.serviceType.toLowerCase().includes(query)
    );
  }, [bookings, searchQuery]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-neutral-200 border-b p-5 sm:flex-row sm:items-center sm:justify-between dark:border-border">
        <h3
          className={cn(
            "font-semibold text-sm",
            "text-neutral-900 dark:text-foreground",
            geistSans.className
          )}
        >
          Recent Bookings
        </h3>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <HugeiconsIcon
              className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-neutral-500 dark:text-muted-foreground"
              icon={Search01Icon}
            />
            <input
              className={cn(
                "h-9 w-full rounded-lg border pr-3 pl-9 text-sm",
                "border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-500",
                "dark:border-border dark:bg-muted dark:text-foreground dark:placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-rausch-500/50",
                "sm:w-48",
                geistSans.className
              )}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              type="text"
              value={searchQuery}
            />
          </div>

          {/* Filter Button */}
          <button
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm",
              "border-neutral-200 bg-white text-neutral-700",
              "dark:border-border dark:bg-muted dark:text-muted-foreground",
              "hover:bg-neutral-50 dark:hover:bg-muted/80",
              "transition-colors",
              geistSans.className
            )}
            title="Filter"
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={FilterIcon} />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Sort Button */}
          <button
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm",
              "border-neutral-200 bg-white text-neutral-700",
              "dark:border-border dark:bg-muted dark:text-muted-foreground",
              "hover:bg-neutral-50 dark:hover:bg-muted/80",
              "transition-colors",
              geistSans.className
            )}
            title="Sort"
            type="button"
          >
            <HugeiconsIcon className="h-4 w-4" icon={SortingAZ01Icon} />
            <span className="hidden sm:inline">Sort</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-neutral-200 border-b dark:border-border">
              <th
                className={cn(
                  "px-5 py-3 text-left font-medium text-xs uppercase tracking-wide",
                  "text-neutral-500 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                Client
              </th>
              <th
                className={cn(
                  "px-5 py-3 text-left font-medium text-xs uppercase tracking-wide",
                  "text-neutral-500 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                Service Type
              </th>
              <th
                className={cn(
                  "hidden px-5 py-3 text-left font-medium text-xs uppercase tracking-wide md:table-cell",
                  "text-neutral-500 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                Date
              </th>
              <th
                className={cn(
                  "hidden px-5 py-3 text-left font-medium text-xs uppercase tracking-wide md:table-cell",
                  "text-neutral-500 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                Amount
              </th>
              <th
                className={cn(
                  "px-5 py-3 text-left font-medium text-xs uppercase tracking-wide",
                  "text-neutral-500 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr
                  className={cn(
                    "border-neutral-200/50 border-b dark:border-border/30",
                    "hover:bg-neutral-50 dark:hover:bg-muted/30",
                    "transition-colors"
                  )}
                  key={booking.id}
                >
                  {/* Client */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {booking.client.avatar ? (
                        <Image
                          alt={booking.client.name}
                          className="h-8 w-8 rounded-full object-cover"
                          height={32}
                          src={booking.client.avatar}
                          width={32}
                        />
                      ) : (
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full font-medium text-xs",
                            "bg-rausch-500/20 text-rausch-400"
                          )}
                        >
                          {getInitials(booking.client.name)}
                        </div>
                      )}
                      <span
                        className={cn(
                          "font-medium text-sm",
                          "text-neutral-900 dark:text-foreground",
                          geistSans.className
                        )}
                      >
                        {booking.client.name}
                      </span>
                    </div>
                  </td>

                  {/* Service Type */}
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "text-sm",
                        "text-neutral-700 dark:text-muted-foreground",
                        geistSans.className
                      )}
                    >
                      {booking.serviceType}
                    </span>
                  </td>

                  {/* Date - Hidden on mobile */}
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span
                      className={cn(
                        "text-sm",
                        "text-neutral-700 dark:text-muted-foreground",
                        geistSans.className
                      )}
                    >
                      {formatDate(booking.date)}
                    </span>
                  </td>

                  {/* Amount - Hidden on mobile */}
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        "text-neutral-900 dark:text-foreground",
                        geistSans.className
                      )}
                    >
                      {formatFromMinorUnits(booking.amount, currencyCode)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 font-medium text-xs capitalize",
                        getStatusBadgeClass(booking.status),
                        geistSans.className
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8 text-center" colSpan={5}>
                  <p className="text-sm text-neutral-500 dark:text-muted-foreground">
                    {searchQuery ? "No bookings match your search" : "No recent bookings"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ========================================
// Skeleton
// ========================================

export function RecentBookingsTableSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
    >
      <div className="flex items-center justify-between border-neutral-200 border-b p-5 dark:border-border">
        <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-48 rounded-lg bg-neutral-200 dark:bg-muted" />
          <div className="h-9 w-20 rounded-lg bg-neutral-200 dark:bg-muted" />
          <div className="h-9 w-16 rounded-lg bg-neutral-200 dark:bg-muted" />
        </div>
      </div>
      <div className="p-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="flex items-center gap-4 py-3" key={i}>
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-muted" />
            <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-muted" />
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-muted" />
            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-muted" />
            <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-muted" />
            <div className="h-5 w-16 rounded-full bg-neutral-200 dark:bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
