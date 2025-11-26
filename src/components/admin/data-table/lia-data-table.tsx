"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";
import { LiaDataTableExportMenu } from "./export-menu";
import { useTableExport } from "./hooks/use-table-export";
import { useTableState } from "./hooks/use-table-state";
import { LiaDataTablePagination } from "./pagination";
import { LiaDataTableEmptyState } from "./table-empty-state";
import { LiaDataTableSkeleton } from "./table-skeleton";

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  enableUrlSync?: boolean;
  enableExport?: boolean;
  enableRowSelection?: boolean;
  isLoading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: HugeIcon;
  emptyStateAction?: React.ReactNode;
  exportFilename?: string;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  className?: string;
};

/**
 * LiaDataTable - Universal data table component with Lia design
 *
 * Features:
 * - Built on TanStack Table v8
 * - URL state persistence (filters, sorting, pagination)
 * - Column visibility toggles
 * - Bulk row selection
 * - Export to CSV/JSON
 * - Keyboard navigation
 * - Loading skeletons
 * - Empty states
 * - Responsive design
 *
 * Design:
 * - Anthropic-inspired Lia Design System
 * - Thoughtful rounded corners (rounded-lg for containers)
 * - Refined typography (font-medium, no uppercase)
 * - Warm neutrals + semantic orange accents
 * - Professional precision with approachable warmth
 */
export function LiaDataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  enableUrlSync = true,
  enableExport = true,
  enableRowSelection = false,
  isLoading = false,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
  emptyStateAction,
  exportFilename = "data",
  onRowSelectionChange,
  className,
}: Props<TData, TValue>) {
  // Table state management
  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    hasFilters,
  } = useTableState({ pageSize, enableUrlSync });

  // Row selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Export functionality
  const { exportData, canExport } = useTableExport({ table, filename: exportFilename });

  // Notify parent of selection changes
  useEffect(() => {
    if (!(onRowSelectionChange && enableRowSelection)) {
      return;
    }

    const selectionCount = Object.keys(rowSelection).length;
    if (selectionCount === 0) {
      onRowSelectionChange([]);
      return;
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
    onRowSelectionChange(selectedRows);
  }, [enableRowSelection, onRowSelectionChange, rowSelection, table]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-lg border border-neutral-200 bg-white",
          className
        )}
      >
        <LiaDataTableSkeleton columns={columns.length} rows={pageSize} />
        <div className="border-neutral-200 border-t px-6 py-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    );
  }

  // Empty state
  const isEmpty = table.getFilteredRowModel().rows.length === 0;

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white",
        className
      )}
    >
      {/* Table toolbar */}
      <div className="flex items-center justify-between border-neutral-200 border-b bg-neutral-50 px-6 py-4">
        {/* Left: Search/filters info */}
        <div className="flex items-center gap-4">
          {hasFilters && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-normal text-neutral-700 text-xs tracking-wider",
                  geistSans.className
                )}
              >
                Filters active:
              </span>
              <button
                className={cn(
                  "rounded-lg border border-neutral-200 bg-white px-3 py-1 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-neutral-300 hover:bg-neutral-50",
                  geistSans.className
                )}
                onClick={resetFilters}
                type="button"
              >
                Clear
              </button>
            </div>
          )}

          {/* Row selection count */}
          {enableRowSelection && Object.keys(rowSelection).length > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border-l-2 border-l-rausch-500 bg-rausch-50 px-3 py-1 font-medium text-rausch-500 text-xs tracking-wider",
                geistSans.className
              )}
            >
              {Object.keys(rowSelection).length} selected
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Export menu */}
          {enableExport && <LiaDataTableExportMenu disabled={!canExport} onExport={exportData} />}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="border-neutral-200 border-b bg-neutral-50" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="px-6 py-4 text-left align-middle"
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {!isEmpty &&
              table.getRowModel().rows.map((row, index) => (
                <tr
                  className={cn(
                    "border-neutral-200 border-b transition-colors hover:bg-rausch-50/30",
                    index % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                    row.getIsSelected() && "bg-rausch-50"
                  )}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className="px-6 py-4 align-middle" key={cell.id}>
                      <div
                        className={cn("font-normal text-neutral-900 text-sm", geistSans.className)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <LiaDataTableEmptyState
          action={emptyStateAction}
          description={emptyStateDescription}
          hasFilters={hasFilters}
          icon={emptyStateIcon}
          onResetFilters={resetFilters}
          title={emptyStateTitle}
        />
      )}

      {/* Pagination */}
      {!isEmpty && <LiaDataTablePagination table={table} />}
    </div>
  );
}
