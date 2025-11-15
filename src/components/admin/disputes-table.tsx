"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { geistMono, geistSans } from "@/app/fonts";
import { PrecisionDataTable, PrecisionDataTableColumnHeader } from "@/components/admin/data-table";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type Dispute = {
  id: string;
  booking_id: string;
  opened_by: string;
  opened_by_role: string;
  dispute_type: string;
  status: string;
  priority: string;
  description: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    id: string;
    service_category: string;
    amount_estimated: number;
  } | null;
  opener: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  assignee: {
    id: string;
    full_name: string | null;
  } | null;
};

const getPriorityBadge = (priority: string) => {
  const configs = {
    urgent: "bg-red-50 text-red-700 border border-red-200",
    high: "bg-orange-50 text-orange-600 border border-orange-200",
    medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    low: "bg-green-50 text-green-700 border border-green-200",
  };
  const baseStyle =
    configs[priority as keyof typeof configs] ||
    "bg-neutral-100 text-neutral-700 border border-neutral-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        baseStyle,
        geistSans.className
      )}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const getStatusBadge = (status: string) => {
  const configs = {
    open: "bg-blue-50 text-blue-700 border border-blue-200",
    investigating: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    resolved: "bg-green-50 text-green-700 border border-green-200",
    closed: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  };
  const baseStyle =
    configs[status as keyof typeof configs] ||
    "bg-neutral-100 text-neutral-700 border border-neutral-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        baseStyle,
        geistSans.className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
    </span>
  );
};

const columns: ColumnDef<Dispute>[] = [
  {
    accessorKey: "dispute_type",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.dispute_type;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-neutral-200 bg-red-50">
            <HugeiconsIcon className="h-5 w-5 text-[#FF5200]" icon={Alert02Icon} />
          </div>
          <p
            className={cn("font-semibold text-neutral-900 text-sm capitalize", geistSans.className)}
          >
            {type.replace(/_/g, " ")}
          </p>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "opener.full_name",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Opened By" />,
    cell: ({ row }) => {
      const opener = row.original.opener;
      return (
        <div className="min-w-0">
          <p className={cn("truncate font-semibold text-neutral-900 text-sm", geistSans.className)}>
            {opener?.full_name || "Unknown"}
          </p>
          <p
            className={cn(
              "truncate font-normal text-neutral-700 text-xs tracking-tighter",
              geistMono.className
            )}
          >
            {opener?.email}
          </p>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "booking.service_category",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Service" />,
    cell: ({ row }) => {
      const booking = row.original.booking;
      return (
        <p className={cn("font-normal text-neutral-900 text-sm capitalize", geistSans.className)}>
          {booking?.service_category.replace(/_/g, " ") || "—"}
        </p>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => getStatusBadge(row.original.status),
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => getPriorityBadge(row.original.priority),
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <PrecisionDataTableColumnHeader column={column} title="Date Opened" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistMono.className)}
      >
        {new Date(row.original.created_at).toLocaleDateString()}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.created_at).getTime();
      const dateB = new Date(rowB.original.created_at).getTime();
      return dateA - dateB;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          className={cn(
            "inline-flex items-center border border-neutral-200 bg-white px-3 py-1.5 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-[#FF5200] hover:bg-[#FF5200] hover:text-white",
            geistSans.className
          )}
          href={`/admin/disputes/${row.original.id}`}
        >
          View
        </Link>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

type Props = {
  disputes: Dispute[];
  isLoading: boolean;
};

/**
 * DisputesTable - Dispute management table with Precision design
 *
 * Features:
 * - Client-side filtering and sorting for instant UX
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON
 * - Column visibility control
 * - Global search across all fields
 */
export function DisputesTable({ disputes, isLoading }: Props) {
  return (
    <PrecisionDataTable
      columns={columns}
      data={disputes}
      emptyStateIcon={Alert02Icon}
      emptyStateTitle="No disputes found"
      emptyStateDescription="Try adjusting your search or filter to find what you're looking for."
      enableExport
      enableUrlSync
      exportFilename="casaora-disputes"
      isLoading={isLoading}
      pageSize={10}
    />
  );
}
