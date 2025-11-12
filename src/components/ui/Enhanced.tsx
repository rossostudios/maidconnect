/**
 * Enhanced Data Table Component
 *
 * Features:
 * - New color palette (Orange, Silver, Grey, Stone, Midnight)
 * - Alternating row backgrounds for better scannability
 * - Hover states
 * - Sticky header
 * - Row actions on hover
 * - Empty state handling
 * - Loading state
 */

"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  /** Column key (must match data object keys) */
  key: keyof T | string;
  /** Column header label */
  label: string;
  /** Custom render function */
  render?: (value: any, row: T) => ReactNode;
  /** Column width class (e.g., "w-1/4") */
  width?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Make column sortable */
  sortable?: boolean;
};

export type DataTableProps<T> = {
  /** Array of data objects */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Enable alternating row backgrounds */
  striped?: boolean;
  /** Enable hover states */
  hoverable?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Custom row className */
  rowClassName?: (row: T) => string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Row actions (shown on hover) */
  rowActions?: (row: T) => ReactNode;
  /** Custom className for table */
  className?: string;
  /** Table caption for accessibility */
  caption?: string;
};

export function DataTableEnhanced<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available",
  striped = true,
  hoverable = true,
  stickyHeader = false,
  rowClassName,
  onRowClick,
  rowActions,
  className,
  caption,
}: DataTableProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[neutral-200] bg-[neutral-50]">
        <div className="space-y-3 p-8">
          {[...new Array(5)].map((_, i) => (
            <div className="flex animate-pulse gap-4" key={i}>
              <div className="h-4 flex-1 rounded bg-[neutral-200]" />
              <div className="h-4 flex-1 rounded bg-[neutral-200]" />
              <div className="h-4 flex-1 rounded bg-[neutral-200]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-[neutral-200] bg-[neutral-50] p-12 text-center">
        <p className="text-[neutral-400] text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[neutral-200] bg-[neutral-50]",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead
            className={cn(
              "border-[neutral-200] border-b bg-[neutral-50]",
              stickyHeader && "sticky top-0 z-10"
            )}
          >
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    "px-6 py-4 font-semibold text-[neutral-900] text-sm uppercase tracking-wide",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.align !== "center" && column.align !== "right" && "text-left",
                    column.width
                  )}
                  key={String(column.key)}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
              {rowActions && (
                <th className="px-6 py-4 text-right" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[neutral-200]">
            {data.map((row, rowIndex) => (
              <tr
                className={cn(
                  "transition-colors duration-150",
                  striped && rowIndex % 2 === 1 && "bg-[neutral-50]/30",
                  hoverable && "hover:bg-[neutral-50] hover:shadow-sm",
                  onRowClick && "cursor-pointer",
                  "group",
                  rowClassName?.(row)
                )}
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = row[column.key as keyof T];
                  return (
                    <td
                      className={cn(
                        "px-6 py-4 text-[neutral-900] text-sm",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                      key={String(column.key)}
                    >
                      {column.render ? column.render(value, row) : String(value ?? "—")}
                    </td>
                  );
                })}
                {rowActions && (
                  <td className="px-6 py-4 text-right">
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      {rowActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Quick action button component for row actions
export function TableActionButton({
  onClick,
  children,
  variant = "default",
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "danger";
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-sm transition-all",
        variant === "default" &&
          "border border-[neutral-200] text-[neutral-900] hover:border-[neutral-500] hover:text-[neutral-500]",
        variant === "danger" &&
          "border border-[neutral-500] text-[neutral-500] hover:bg-[neutral-500] hover:text-[neutral-50]",
        className
      )}
      onClick={(e) => {
        e.stopPropagation(); // Prevent row click
        onClick();
      }}
    >
      {children}
    </button>
  );
}
