"use client";

import {
  type ColumnFiltersState,
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

import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

type Document = {
  id: string;
  document_type: string;
  storage_path: string;
  uploaded_at: string;
  metadata: {
    originalName?: string;
    size?: number;
    mimeType?: string;
    note?: string | null;
  } | null;
  signedUrl?: string | null;
};

type Props = {
  documents: Document[];
  labels: Record<string, string>;
};

const columnHelper = createColumnHelper<Document>();

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "—";
  }
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function DocumentsTable({ documents, labels }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("document_type", {
        header: "Document Type",
        cell: (info) => (
          <div>
            <p className={cn("font-medium text-neutral-900", geistSans.className)}>
              {labels[info.getValue()] ?? info.getValue()}
            </p>
            {info.row.original.metadata?.note && (
              <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
                {info.row.original.metadata.note}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.metadata?.originalName, {
        id: "filename",
        header: "File Name",
        cell: (info) => (
          <span className={cn("text-neutral-900", geistSans.className)}>
            {info.getValue() ?? "Unnamed file"}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.metadata?.size, {
        id: "size",
        header: "Size",
        cell: (info) => (
          <span className={cn("text-neutral-700", geistSans.className)}>
            {formatFileSize(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("uploaded_at", {
        header: "Uploaded",
        cell: (info) => (
          <span className={cn("text-neutral-700", geistSans.className)}>
            {format(new Date(info.getValue()), "MMM dd, yyyy")}
          </span>
        ),
      }),
      columnHelper.accessor("metadata", {
        id: "mimeType",
        header: "Type",
        cell: (info) => {
          const mimeType = info.getValue()?.mimeType || "";
          const extension = mimeType.split("/")[1]?.toUpperCase() || "—";
          return (
            <span
              className={cn(
                "inline-flex items-center bg-neutral-200 px-2.5 py-1 font-medium text-neutral-900 text-xs",
                geistSans.className
              )}
            >
              {extension}
            </span>
          );
        },
      }),
      columnHelper.accessor("signedUrl", {
        header: "Actions",
        cell: (info) => {
          const url = info.getValue();
          if (!url) {
            return (
              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                URL unavailable
              </span>
            );
          }
          return (
            <a
              className={cn(
                "inline-flex items-center gap-1.5 border border-neutral-200 px-3 py-1.5 font-semibold text-neutral-700 text-sm transition hover:border-[#FF5200] hover:bg-neutral-50",
                geistSans.className
              )}
              href={url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Download
            </a>
          );
        },
        enableSorting: false,
      }),
    ],
    [labels]
  );

  const table = useReactTable({
    data: documents,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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

  if (documents.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center bg-neutral-200">
              <svg
                aria-hidden="true"
                className="h-6 w-6 text-neutral-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
          <h3 className={cn("font-semibold text-base text-neutral-900", geistSans.className)}>
            No documents uploaded
          </h3>
          <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
            Upload your verification documents to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            className={cn(
              "w-full border border-neutral-200 px-4 py-2 pl-10 text-neutral-900 text-sm placeholder-neutral-700 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900",
              geistSans.className
            )}
            onChange={(e) => table.getColumn("document_type")?.setFilterValue(e.target.value)}
            placeholder="Search documents..."
            type="text"
            value={(table.getColumn("document_type")?.getFilterValue() as string) ?? ""}
          />
          <svg
            aria-hidden="true"
            className="absolute top-2.5 left-3 h-5 w-5 text-neutral-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <div className={cn("text-neutral-700 text-sm", geistSans.className)}>
          {table.getFilteredRowModel().rows.length} document
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table - Horizontally scrollable on mobile */}
      <div className="overflow-hidden border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-neutral-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className={cn(
                        "px-6 py-4 text-left font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]",
                        geistSans.className
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="flex w-full cursor-pointer select-none items-center gap-2 text-left hover:text-neutral-900"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-neutral-700">
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
          <div className={cn("text-neutral-700 text-sm", geistSans.className)}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "border border-neutral-200 px-4 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-[#FF5200] hover:text-[#FF5200] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-600",
                geistSans.className
              )}
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              Previous
            </button>
            <button
              className={cn(
                "border border-neutral-200 px-4 py-2.5 font-semibold text-neutral-900 text-sm transition hover:border-[#FF5200] hover:text-[#FF5200] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-600",
                geistSans.className
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
