"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Table } from "@tanstack/react-table";
import { geistMono, geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props<TData> = {
  table: Table<TData>;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
};

/**
 * PrecisionDataTablePagination - Pagination controls with Lia design
 *
 * Features:
 * - First/Previous/Next/Last navigation
 * - Page size selector
 * - Row count display
 * - Keyboard accessible
 */
export function PrecisionDataTablePagination<TData>({
  table,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
}: Props<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = table.getState().pagination.pageIndex * pageSize + 1;
  const endRow = Math.min(startRow + pageSize - 1, totalRows);

  return (
    <div className="flex items-center justify-between border-neutral-200 border-t bg-white px-6 py-4">
      {/* Left: Row count */}
      <div className="flex items-center gap-6">
        <p
          className={cn(
            "font-normal text-neutral-700 text-xs uppercase tracking-wider",
            geistSans.className
          )}
        >
          Showing{" "}
          <span className={cn("font-semibold text-neutral-900", geistMono.className)}>
            {totalRows === 0 ? 0 : startRow}
          </span>{" "}
          to{" "}
          <span className={cn("font-semibold text-neutral-900", geistMono.className)}>
            {endRow}
          </span>{" "}
          of{" "}
          <span className={cn("font-semibold text-neutral-900", geistMono.className)}>
            {totalRows}
          </span>
        </p>

        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <label
              className={cn(
                "font-normal text-neutral-700 text-xs uppercase tracking-wider",
                geistSans.className
              )}
              htmlFor="page-size"
            >
              Per page:
            </label>
            <select
              className={cn(
                "border border-neutral-200 bg-white px-2 py-1 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-neutral-300 hover:bg-neutral-50 focus:border-[#FF5200] focus:outline-none focus:ring-2 focus:ring-[#FF5200]/25",
                geistMono.className
              )}
              id="page-size"
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          aria-label="Go to first page"
          className={cn(
            "border border-neutral-200 bg-white p-2 text-neutral-900 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white",
            geistSans.className
          )}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
        </button>

        {/* Previous page */}
        <button
          aria-label="Go to previous page"
          className={cn(
            "border border-neutral-200 bg-white p-2 text-neutral-900 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white",
            geistSans.className
          )}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
        </button>

        {/* Page indicator */}
        <div
          className={cn(
            "flex min-w-24 items-center justify-center border border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-xs tracking-tighter",
            geistMono.className
          )}
        >
          {currentPage} / {totalPages || 1}
        </div>

        {/* Next page */}
        <button
          aria-label="Go to next page"
          className={cn(
            "border border-neutral-200 bg-white p-2 text-neutral-900 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white",
            geistSans.className
          )}
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
        </button>

        {/* Last page */}
        <button
          aria-label="Go to last page"
          className={cn(
            "border border-neutral-200 bg-white p-2 text-neutral-900 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white",
            geistSans.className
          )}
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
        </button>
      </div>
    </div>
  );
}
