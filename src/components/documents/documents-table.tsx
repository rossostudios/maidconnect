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
            <p className="font-medium text-[#0f172a]">
              {labels[info.getValue()] ?? info.getValue()}
            </p>
            {info.row.original.metadata?.note && (
              <p className="mt-1 text-[#94a3b8] text-sm">{info.row.original.metadata.note}</p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.metadata?.originalName, {
        id: "filename",
        header: "File Name",
        cell: (info) => <span className="text-[#0f172a]">{info.getValue() ?? "Unnamed file"}</span>,
      }),
      columnHelper.accessor((row) => row.metadata?.size, {
        id: "size",
        header: "Size",
        cell: (info) => <span className="text-[#94a3b8]">{formatFileSize(info.getValue())}</span>,
      }),
      columnHelper.accessor("uploaded_at", {
        header: "Uploaded",
        cell: (info) => (
          <span className="text-[#94a3b8]">
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
            <span className="inline-flex items-center rounded-full bg-[#e2e8f0] px-2.5 py-1 font-medium text-[#0f172a] text-xs">
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
            return <span className="text-[#64748b] text-sm">URL unavailable</span>;
          }
          return (
            <a
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-1.5 font-semibold text-[#64748b] text-sm transition hover:border-[#64748b] hover:bg-[#f8fafc]"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2e8f0]">
              <svg
                aria-hidden="true"
                className="h-6 w-6 text-[#94a3b8]"
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
          <h3 className="font-semibold text-[#0f172a] text-base">No documents uploaded</h3>
          <p className="mt-1 text-[#94a3b8] text-sm">
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
            className="w-full rounded-lg border border-[#e2e8f0] px-4 py-2 pl-10 text-[#0f172a] text-sm placeholder-[#94a3b8] focus:border-[#64748b] focus:outline-none focus:ring-1 focus:ring-[#64748b]"
            onChange={(e) => table.getColumn("document_type")?.setFilterValue(e.target.value)}
            placeholder="Search documents..."
            type="text"
            value={(table.getColumn("document_type")?.getFilterValue() as string) ?? ""}
          />
          <svg
            aria-hidden="true"
            className="absolute top-2.5 left-3 h-5 w-5 text-[#94a3b8]"
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
        <div className="text-[#94a3b8] text-sm">
          {table.getFilteredRowModel().rows.length} document
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table - Horizontally scrollable on mobile */}
      <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#f8fafc]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="px-6 py-4 text-left font-semibold text-[#94a3b8] text-xs uppercase tracking-[0.2em]"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className="flex w-full cursor-pointer select-none items-center gap-2 text-left hover:text-[#64748b]"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-[#94a3b8]">
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
            <tbody className="divide-y divide-[#e2e8f0] bg-[#f8fafc]">
              {table.getRowModel().rows.map((row) => (
                <tr className="transition hover:bg-[#f8fafc]" key={row.id}>
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
          <div className="text-[#94a3b8] text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-semibold text-[#0f172a] text-sm transition hover:border-[#64748b] hover:text-[#64748b] disabled:opacity-50"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 font-semibold text-[#0f172a] text-sm transition hover:border-[#64748b] hover:text-[#64748b] disabled:opacity-50"
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
