"use client";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  LegalDocumentIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

type AuditLog = {
  id: string;
  action_type: string;
  details: any;
  notes: string | null;
  created_at: string;
  admin: { full_name: string | null };
  target_user: { full_name: string | null; email: string } | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const getActionBadgeConfig = (action: string) => {
  if (action.includes("approve")) {
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    };
  }
  if (action.includes("reject") || action.includes("ban")) {
    return {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    };
  }
  if (action.includes("suspend")) {
    return {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    };
  }
  return {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  };
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Date & Time",
    cell: ({ row }) => (
      <p className="text-[#737373] text-sm">
        {new Date(row.original.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    ),
  },
  {
    accessorKey: "action_type",
    header: "Action",
    cell: ({ row }) => {
      const action = row.original.action_type;
      const config = getActionBadgeConfig(action);
      return (
        <span
          className={`inline-flex items-center rounded-lg px-2.5 py-1 font-medium text-xs ${config.bg} ${config.text} border ${config.border}`}
        >
          {action.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "admin",
    header: "Admin",
    cell: ({ row }) => (
      <p className="font-medium text-[#171717] text-sm">
        {row.original.admin.full_name || "Admin"}
      </p>
    ),
  },
  {
    accessorKey: "target_user",
    header: "Target User",
    cell: ({ row }) => {
      const target = row.original.target_user;
      return (
        <div>
          <p className="font-medium text-[#171717] text-sm">
            {target ? target.full_name || "Unnamed User" : "—"}
          </p>
          {target && <p className="text-[#737373] text-xs">{target.email}</p>}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <p className="max-w-md truncate text-[#737373] text-sm">{row.original.notes || "—"}</p>
    ),
  },
];

type Props = {
  logs: AuditLog[];
  isLoading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
};

export function AuditLogsTable({ logs, isLoading, pagination, onPageChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: logs,
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
      <div className="rounded-lg border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#E63946]" />
            <p className="text-[#737373] text-sm">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-[#E5E5E5] bg-white">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-2 text-center">
            <HugeiconsIcon className="mx-auto h-12 w-12 text-[#A3A3A3]" icon={LegalDocumentIcon} />
            <p className="font-medium text-[#171717] text-sm">No audit logs found</p>
            <p className="text-[#737373] text-xs">Try adjusting your filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-[#E5E5E5] border-b bg-[#F5F5F5]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="px-6 py-3 text-left font-semibold text-[#171717] text-xs uppercase tracking-wider"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex cursor-pointer select-none items-center gap-2 transition-colors hover:text-[#E63946]"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-[#A3A3A3]">
                              {header.column.getIsSorted() === "asc" ? (
                                <HugeiconsIcon className="h-3 w-3" icon={ArrowUp01Icon} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <HugeiconsIcon className="h-3 w-3" icon={ArrowDown01Icon} />
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
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
        <div className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-6 py-4">
          <div className="text-[#737373] text-sm">
            Showing{" "}
            <span className="font-medium text-[#171717]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-[#171717]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-medium text-[#171717]">{pagination.total}</span> logs
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              Previous
            </button>
            <span className="px-3 font-medium text-[#171717] text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
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
