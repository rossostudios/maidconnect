"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { geistSans } from "@/app/fonts";
import { LiaDataTable, LiaDataTableColumnHeader } from "@/components/admin/data-table";
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
    high: "bg-rausch-50 text-rausch-600 border border-rausch-200",
    medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    low: "bg-green-50 text-green-700 border border-green-200",
  };
  const baseStyle =
    configs[priority as keyof typeof configs] ||
    "bg-neutral-100 text-neutral-700 border border-neutral-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs tracking-wider",
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
    open: "bg-babu-50 text-babu-700 border border-babu-200",
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
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium text-xs tracking-wider",
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
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.dispute_type;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-200 bg-red-50">
            <HugeiconsIcon className="h-5 w-5 text-rausch-500" icon={Alert02Icon} />
          </div>
          <p className={cn("font-medium text-neutral-900 text-sm capitalize", geistSans.className)}>
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
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Opened By" />,
    cell: ({ row }) => {
      const opener = row.original.opener;
      return (
        <div className="min-w-0">
          <p className={cn("truncate font-medium text-neutral-900 text-sm", geistSans.className)}>
            {opener?.full_name || "Unknown"}
          </p>
          <p
            className={cn(
              "truncate font-normal text-neutral-700 text-xs tracking-tighter",
              geistSans.className
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
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Service" />,
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
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => getStatusBadge(row.original.status),
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => getPriorityBadge(row.original.priority),
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Date Opened" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistSans.className)}
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
            "inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-rausch-500 hover:bg-rausch-500 hover:text-white",
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
  isConnected?: boolean;
  addOptimisticDispute?: (dispute: Dispute) => void;
  updateOptimisticDispute?: (id: string, updates: Partial<Dispute>) => void;
};

/**
 * DisputesTable - Dispute management table with Lia design
 *
 * Features:
 * - Real-time dispute updates via Supabase Realtime (PostgreSQL CDC)
 * - Client-side filtering and sorting for instant UX
 * - URL state synchronization for shareable links
 * - Export to CSV/JSON
 * - Column visibility control
 * - Global search across all fields
 * - Optimistic UI support for instant feedback
 */
export function DisputesTable({ disputes, isLoading, isConnected = false }: Props) {
  return (
    <div>
      {/* Real-time connection status indicator */}
      {isConnected !== undefined && (
        <div className="mb-4 flex items-center justify-end">
          {isConnected ? (
            <span
              className={cn(
                "type-ui-xs flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-green-700",
                geistSans.className
              )}
            >
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live Updates
            </span>
          ) : (
            <span
              className={cn(
                "type-ui-xs flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-600",
                geistSans.className
              )}
            >
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
              Static
            </span>
          )}
        </div>
      )}

      <LiaDataTable
        columns={columns}
        data={disputes}
        emptyStateDescription="Try adjusting your search or filter to find what you're looking for."
        emptyStateIcon={Alert02Icon}
        emptyStateTitle="No disputes found"
        enableExport
        enableUrlSync
        exportFilename="casaora-disputes"
        isLoading={isLoading}
        pageSize={10}
      />
    </div>
  );
}
