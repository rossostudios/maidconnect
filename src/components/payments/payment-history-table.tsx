"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";

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
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: "bg-green-50", text: "text-green-700", label: "Paid" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-700", label: "Authorized" },
    pending: { bg: "bg-orange-50", text: "text-orange-700", label: "Pending" },
    cancelled: { bg: "bg-gray-50", text: "text-gray-700", label: "Cancelled" },
    declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  };

  const style = styles[status] || { bg: "bg-gray-50", text: "text-gray-700", label: status };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
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
            <p className="font-medium text-[#211f1a]">
              {format(new Date(info.getValue()), "MMM dd, yyyy")}
            </p>
            <p className="text-sm text-[#7d7566]">
              {format(new Date(info.getValue()), "h:mm a")}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("service_name", {
        header: "Service",
        cell: (info) => (
          <div>
            <p className="font-medium text-[#211f1a]">{info.getValue() || "—"}</p>
            <p className="text-sm text-[#7d7566]">
              {info.row.original.professional?.full_name || "Unknown professional"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("amount_authorized", {
        header: "Amount",
        cell: (info) => (
          <div>
            <p className="font-medium text-[#211f1a]">
              {formatCurrency(info.row.original.amount_captured || info.getValue())}
            </p>
            {info.row.original.amount_captured && info.getValue() !== info.row.original.amount_captured && (
              <p className="text-sm text-[#7d7566]">
                Auth: {formatCurrency(info.getValue())}
              </p>
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
          if (!id) return <span className="text-[#7d7566]">—</span>;
          return (
            <span className="font-mono text-xs text-[#7d7566]">
              {id.substring(0, 20)}...
            </span>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebe5d8]">
              <svg className="h-6 w-6 text-[#7d7566]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-base font-semibold text-[#211f1a]">No payment history</h3>
          <p className="mt-1 text-sm text-[#5d574b]">
            Your payment history will appear here after you make your first booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[#ebe5d8]">
        <table className="w-full">
          <thead className="bg-[#fbfaf9]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex cursor-pointer select-none items-center gap-2 hover:text-[#ff5d46]"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-[#d4c9b8]">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? "↕"}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#ebe5d8] bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-[#fbfaf9]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#7d7566]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
