/**
 * CategoryMetricsTable - Service category analytics table with Lia design
 *
 * Features:
 * - LiaDataTable integration (sorting, filtering, export)
 * - Category, Fill Rate, Bookings, Avg Price columns
 * - Border-only badges for fill rate status (Lia design)
 * - Geist Mono for numeric data (Bloomberg aesthetic)
 * - Currency formatting for Colombian Pesos (COP)
 * - CSV/JSON export for reporting
 */

"use client";

import { CleaningBucketIcon } from "@hugeicons/core-free-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { geistMono, geistSans } from "@/app/fonts";
import type { CategoryMetrics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { LiaDataTableColumnHeader } from "./data-table/column-header";
import { LiaDataTable } from "./data-table/lia-data-table";

type Props = {
  data: CategoryMetrics[];
  isLoading?: boolean;
};

/**
 * Get fill rate badge with border-only design (Lia aesthetic)
 * Uses semantic colors: green (≥70%), yellow (50-69%), red (<50%)
 */
function getFillRateBadge(fillRate: number) {
  let badgeClass = "border-yellow-600 text-yellow-700";

  if (fillRate >= 70) {
    badgeClass = "border-green-600 text-green-700";
  } else if (fillRate < 50) {
    badgeClass = "border-red-600 text-red-700";
  }

  return (
    <span
      className={cn(
        "inline-flex border-2 px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        badgeClass,
        geistSans.className
      )}
    >
      {fillRate.toFixed(1)}%
    </span>
  );
}

/**
 * Format category name for display (e.g., "deep_cleaning" → "Deep Cleaning")
 */
function formatCategoryName(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Column definitions for category metrics table
 */
const columns: ColumnDef<CategoryMetrics>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => (
      <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
        {formatCategoryName(row.original.category)}
      </p>
    ),
    enableSorting: true,
    enableColumnFilter: true,
  },
  {
    accessorKey: "fillRate",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Fill Rate" />,
    cell: ({ row }) => getFillRateBadge(row.original.fillRate),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.fillRate - rowB.original.fillRate,
  },
  {
    accessorKey: "bookingCount",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Bookings" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistMono.className)}
      >
        {row.original.bookingCount}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.bookingCount - rowB.original.bookingCount,
  },
  {
    accessorKey: "avgPrice",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Avg. Price" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistMono.className)}
      >
        {row.original.avgPrice > 0 ? `$${(row.original.avgPrice / 100).toFixed(0)} COP` : "—"}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.avgPrice - rowB.original.avgPrice,
  },
];

export function CategoryMetricsTable({ data, isLoading = false }: Props) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      {/* Section Header */}
      <h2
        className={cn(
          "mb-6 font-semibold text-neutral-900 text-xl tracking-tight",
          geistSans.className
        )}
      >
        Metrics by Service Category
      </h2>

      {/* Table */}
      <LiaDataTable
        columns={columns}
        data={data}
        emptyStateDescription="Category metrics will appear here once bookings are created."
        emptyStateIcon={CleaningBucketIcon}
        emptyStateTitle="No category data available"
        enableExport
        exportFilename="casaora-category-metrics"
        isLoading={isLoading}
        pageSize={10}
      />
    </div>
  );
}
