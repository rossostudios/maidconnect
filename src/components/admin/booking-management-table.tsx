"use client";

import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { geistSans } from "@/app/fonts";
import { LiaDataTable, LiaDataTableColumnHeader } from "@/components/admin/data-table";
import { Link } from "@/i18n/routing";
import type { CombinedBooking } from "@/lib/admin/booking-management-service";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "confirmed":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "in_progress":
      return "bg-green-50 text-green-700 border border-green-200";
    case "completed":
      return "bg-neutral-100 text-neutral-700 border border-neutral-200";
    case "cancelled":
    case "declined":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-neutral-50 text-neutral-600 border border-neutral-200";
  }
};

const getCountryFlag = (countryCode: string) => {
  const flags: Record<string, string> = {
    CO: "🇨🇴",
    PY: "🇵🇾",
    UY: "🇺🇾",
    AR: "🇦🇷",
  };
  return flags[countryCode] || "🌍";
};

const columns: ColumnDef<CombinedBooking>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Booking ID" />,
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <Link
          className="font-medium text-orange-600 text-sm hover:text-orange-700"
          href={`/admin/bookings/${booking.id}`}
        >
          {booking.id.slice(0, 8)}...
        </Link>
      );
    },
  },
  {
    accessorKey: "customer",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const customer = row.original.customer;

      if (!customer) {
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
              <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserCircleIcon} />
            </div>
            <span className={cn("text-neutral-500 text-sm", geistSans.className)}>
              Guest
            </span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {customer.avatar_url ? (
              <Image
                alt={customer.full_name || "Customer"}
                className="h-8 w-8 rounded-full border border-neutral-200 object-cover"
                height={32}
                src={customer.avatar_url}
                width={32}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserCircleIcon} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}>
              {customer.full_name || "Unknown"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "professional",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Professional" />,
    cell: ({ row }) => {
      const professional = row.original.professional;

      return (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {professional.avatar_url ? (
              <Image
                alt={professional.full_name || "Professional"}
                className="h-8 w-8 rounded-full border border-neutral-200 object-cover"
                height={32}
                src={professional.avatar_url}
                width={32}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                <HugeiconsIcon className="h-4 w-4 text-neutral-500" icon={UserCircleIcon} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}>
              {professional.full_name || "Unknown"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "service_name",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Service" />,
    cell: ({ row }) => {
      const serviceName = row.getValue("service_name") as string | null;
      return (
        <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
          {serviceName || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs capitalize",
            geistSans.className,
            getStatusBadgeColor(status)
          )}
        >
          {status.replace("_", " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "scheduled_start",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Scheduled" />,
    cell: ({ row }) => {
      const scheduledStart = row.getValue("scheduled_start") as string | null;
      if (!scheduledStart) {
        return (
          <span className={cn("text-neutral-500 text-sm", geistSans.className)}>
            Not scheduled
          </span>
        );
      }
      return (
        <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
          {formatDate(scheduledStart, "PPp")}
        </span>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number | null;
      const currency = row.original.currency || "COP";

      if (amount === null) {
        return (
          <span className={cn("text-neutral-500 text-sm", geistSans.className)}>
            N/A
          </span>
        );
      }

      return (
        <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
          {formatCurrency(amount, currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "country_code",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Country" />,
    cell: ({ row }) => {
      const countryCode = row.getValue("country_code") as string;
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-base">{getCountryFlag(countryCode)}</span>
          <span className={cn("text-neutral-900 text-sm", geistSans.className)}>
            {countryCode}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string;
      return (
        <span className={cn("text-neutral-600 text-sm", geistSans.className)}>
          {formatDate(createdAt, "PP")}
        </span>
      );
    },
  },
];

export function BookingManagementTable({
  bookings,
  isLoading,
}: {
  bookings: CombinedBooking[];
  isLoading: boolean;
}) {
  return (
    <LiaDataTable
      columns={columns}
      data={bookings}
      filterColumn="service_name"
      filterPlaceholder="Search by service..."
      isLoading={isLoading}
      noDataMessage="No bookings found"
    />
  );
}
