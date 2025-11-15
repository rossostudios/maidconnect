"use client";

import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Header,
  type SortingState,
  type Table,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Link } from "@/i18n/routing";

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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DisputesTableInstance = Table<Dispute>;
type DisputeHeader = Header<Dispute, unknown>;

const getPriorityConfig = (priority: string) => {
  const configs = {
    urgent: {
      bg: "bg-[#E85D48]/10",
      text: "text-neutral-800",
      border: "border-neutral-300",
      label: "Urgent",
    },
    high: {
      bg: "bg-neutral-100",
      text: "text-neutral-800",
      border: "border-neutral-200",
      label: "High",
    },
    medium: {
      bg: "bg-neutral-100",
      text: "text-neutral-600",
      border: "border-neutral-300",
      label: "Medium",
    },
    low: {
      bg: "bg-neutral-100",
      text: "text-neutral-700",
      border: "border-neutral-200",
      label: "Low",
    },
  };
  return (
    configs[priority as keyof typeof configs] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      label: priority,
    }
  );
};

const getStatusConfig = (status: string) => {
  const configs = {
    open: {
      bg: "bg-neutral-50",
      text: "text-neutral-600",
      border: "border-neutral-200",
      label: "Open",
    },
    investigating: {
      bg: "bg-neutral-100",
      text: "text-neutral-600",
      border: "border-neutral-300",
      label: "Investigating",
    },
    resolved: {
      bg: "bg-neutral-100",
      text: "text-neutral-700",
      border: "border-neutral-200",
      label: "Resolved",
    },
    closed: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      label: "Closed",
    },
  };
  return (
    configs[status as keyof typeof configs] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      label: status,
    }
  );
};

const columns: ColumnDef<Dispute>[] = [
  {
    accessorKey: "dispute_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.dispute_type;
      return (
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <div className="-full flex h-8 w-8 items-center justify-center border border-[#E5E5E5] bg-[#E85D48]/10">
              <HugeiconsIcon className="h-4 w-4 text-[#E85D48]" icon={Alert02Icon} />
            </div>
          </div>
          <p className="font-medium text-[#171717] text-sm capitalize">{type.replace(/_/g, " ")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "opener.full_name",
    header: "Opened By",
    cell: ({ row }) => {
      const opener = row.original.opener;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium text-[#171717] text-sm">
            {opener?.full_name || "Unknown"}
          </p>
          <p className="truncate text-[#737373] text-xs">{opener?.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "booking.service_category",
    header: "Service",
    cell: ({ row }) => {
      const booking = row.original.booking;
      return (
        <p className="text-[#171717] text-sm capitalize">
          {booking?.service_category.replace(/_/g, " ") || "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const config = getStatusConfig(row.original.status);
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 font-medium text-xs ${config.bg} ${config.text} border ${config.border}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const config = getPriorityConfig(row.original.priority);
      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 font-medium text-xs ${config.bg} ${config.text} border ${config.border}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Opened",
    cell: ({ row }) => (
      <p className="text-[#737373] text-sm">
        {new Date(row.original.created_at).toLocaleDateString()}
      </p>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Link
          className="inline-flex items-center bg-[#171717] px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-[#404040]"
          href={`/admin/disputes/${row.original.id}`}
        >
          View
        </Link>
      </div>
    ),
  },
];

type Props = {
  disputes: Dispute[];
  isLoading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
};

export function DisputesTable({ disputes, isLoading, pagination, onPageChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: disputes,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="-full mx-auto h-8 w-8 animate-spin border-4 border-[#E5E5E5] border-t-[#E85D48]" />
            <p className="text-[#737373] text-sm">Loading disputes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-2 text-center">
            <HugeiconsIcon className="mx-auto h-12 w-12 text-[#A3A3A3]" icon={Alert02Icon} />
            <p className="font-medium text-[#171717] text-sm">No disputes found</p>
            <p className="text-[#737373] text-xs">Try adjusting your filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <DisputesTableHeader table={table} />
            <tbody className="divide-y divide-[#E5E5E5] bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr className="transition-colors hover:bg-[#F5F5F5]" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="whitespace-nowrap px-6 py-4" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border border-[#E5E5E5] bg-white px-6 py-4">
          <div className="text-[#737373] text-sm">
            Showing{" "}
            <span className="font-medium text-[#171717]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-[#171717]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-[#171717]">{pagination.total}</span> disputes
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
              type="button"
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              Previous
            </button>
            <span className="px-3 font-medium text-[#171717] text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="inline-flex items-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              type="button"
            >
              Next
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DisputesTableHeader({ table }: { table: DisputesTableInstance }) {
  return (
    <thead className="border-[#E5E5E5] border-b bg-[#F5F5F5]">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              className="px-6 py-3 text-left font-semibold text-[#171717] text-xs uppercase tracking-wider"
              key={header.id}
            >
              {header.isPlaceholder ? null : <SortableHeaderContent header={header} />}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

function SortableHeaderContent({ header }: { header: DisputeHeader }) {
  const canSort = header.column.getCanSort();
  const label = flexRender(header.column.columnDef.header, header.getContext());

  if (!canSort) {
    return <div>{label}</div>;
  }

  return (
    <button
      className="flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#E85D48]"
      onClick={header.column.getToggleSortingHandler()}
      type="button"
    >
      {label}
      <span className="text-[#A3A3A3]">
        <SortIndicator state={header.column.getIsSorted()} />
      </span>
    </button>
  );
}

function SortIndicator({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") {
    return <HugeiconsIcon className="h-3 w-3" icon={ArrowUp01Icon} />;
  }

  if (state === "desc") {
    return <HugeiconsIcon className="h-3 w-3" icon={ArrowDown01Icon} />;
  }

  return <div className="h-3 w-3" />;
}
