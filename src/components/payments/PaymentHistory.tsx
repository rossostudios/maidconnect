"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCOP as formatCOPUtil } from "@/lib/utils/format";

type Booking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  service_name: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
  professional: { full_name: string | null } | null;
};

type Props = {
  bookings: Booking[];
};

const columnHelper = createColumnHelper<Booking>();

function formatCurrency(amount: number | null) {
  if (!amount) {
    return "—";
  }
  return formatCOPUtil(amount);
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { variant: any; label: string }> = {
    completed: { variant: "success", label: "Paid" },
    confirmed: { variant: "info", label: "Authorized" },
    pending: { variant: "warning", label: "Pending" },
    cancelled: { variant: "secondary", label: "Cancelled" },
    declined: { variant: "danger", label: "Declined" },
  };

  const config = statusConfig[status] || { variant: "default", label: status };

  return (
    <Badge size="sm" variant={config.variant}>
      {config.label}
    </Badge>
  );
}

export function PaymentHistoryTable({ bookings }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: (info) => (
          <div>
            <p className="font-medium text-neutral-900">
              {format(new Date(info.getValue()), "MMM dd, yyyy")}
            </p>
            <p className="text-neutral-600 text-sm">
              {format(new Date(info.getValue()), "h:mm a")}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("service_name", {
        header: "Service",
        cell: (info) => (
          <div>
            <p className="font-medium text-neutral-900">{info.getValue() || "—"}</p>
            <p className="text-neutral-600 text-sm">
              {info.row.original.professional?.full_name || "Unknown professional"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("amount_authorized", {
        header: "Amount",
        cell: (info) => (
          <div>
            <p className="font-medium text-neutral-900">
              {formatCurrency(info.row.original.amount_captured || info.getValue())}
            </p>
            {info.row.original.amount_captured &&
              info.getValue() !== info.row.original.amount_captured && (
                <p className="text-neutral-600 text-sm">Auth: {formatCurrency(info.getValue())}</p>
              )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue()),
      }),
      columnHelper.accessor("stripe_payment_intent_id", {
        header: "Transaction ID",
        cell: (info) => {
          const id = info.getValue();
          if (!id) {
            return <span className="text-neutral-500">—</span>;
          }
          return (
            <span className="font-mono text-neutral-500 text-xs">{id.substring(0, 20)}...</span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: bookings,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center bg-neutral-100">
              <svg
                className="h-6 w-6 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Credit card icon</title>
                <path
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
          <h3 className="font-semibold text-base text-neutral-900">No payment history</h3>
          <p className="mt-1 text-neutral-600 text-sm">
            Your payment history will appear here after you make your first booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table - Horizontally scrollable on mobile */}
      <div className="overflow-hidden border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="px-6 py-4 text-left font-semibold text-neutral-600 text-xs uppercase tracking-wider"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="flex w-full cursor-pointer select-none items-center gap-2 text-left hover:text-neutral-900"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-neutral-400">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        </button>
                      ) : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr className="transition hover:bg-neutral-50" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="px-6 py-4" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Touch-friendly on mobile */}
      {table.getPageCount() > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-neutral-600 text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "border px-4 py-2.5 font-semibold text-sm transition",
                "border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              Previous
            </button>
            <button
              className={cn(
                "border px-4 py-2.5 font-semibold text-sm transition",
                "border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-900",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
