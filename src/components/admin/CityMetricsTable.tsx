/**
 * CityMetricsTable - City-level analytics table with Lia design
 *
 * Features:
 * - LiaDataTable integration (sorting, filtering, export)
 * - City, Fill Rate, Avg TTFB, Bookings, Professionals columns
 * - Border-only badges for fill rate status (Lia design)
 * - Geist Mono for numeric data (Bloomberg aesthetic)
 * - Currency formatting for Colombian Pesos (COP)
 * - CSV/JSON export for reporting
 */

"use client";

import { Location04Icon } from "@hugeicons/core-free-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { geistSans } from "@/app/fonts";
import type { CityMetrics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { LiaDataTableColumnHeader } from "./data-table/column-header";
import { LiaDataTable } from "./data-table/lia-data-table";

type Props = {
  data: CityMetrics[];
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
        "inline-flex rounded-full border-2 px-2.5 py-1 font-semibold text-xs uppercase tracking-wider",
        badgeClass,
        geistSans.className
      )}
    >
      {fillRate.toFixed(1)}%
    </span>
  );
}

/**
 * Column definitions for city metrics table
 */
const columns: ColumnDef<CityMetrics>[] = [
  {
    accessorKey: "city",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="City" />,
    cell: ({ row }) => (
      <p className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
        {row.original.city}
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
    accessorKey: "avgTimeToFirstBooking",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Avg. TTFB" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistSans.className)}
      >
        {row.original.avgTimeToFirstBooking > 0
          ? `${row.original.avgTimeToFirstBooking.toFixed(1)} days`
          : "—"}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      rowA.original.avgTimeToFirstBooking - rowB.original.avgTimeToFirstBooking,
  },
  {
    accessorKey: "bookingCount",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Bookings" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistSans.className)}
      >
        {row.original.bookingCount}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.bookingCount - rowB.original.bookingCount,
  },
  {
    accessorKey: "professionalCount",
    header: ({ column }) => <LiaDataTableColumnHeader column={column} title="Professionals" />,
    cell: ({ row }) => (
      <p
        className={cn("font-normal text-neutral-700 text-sm tracking-tighter", geistSans.className)}
      >
        {row.original.professionalCount}
      </p>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) => rowA.original.professionalCount - rowB.original.professionalCount,
  },
];

export function CityMetricsTable({ data, isLoading = false }: Props) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      {/* Section Header */}
      <h2
        className={cn(
          "mb-6 font-semibold text-neutral-900 text-xl tracking-tight",
          geistSans.className
        )}
      >
        Metrics by City
      </h2>

      {/* Table */}
      <LiaDataTable
        columns={columns}
        data={data}
        emptyStateDescription="City metrics will appear here once bookings are created."
        emptyStateIcon={Location04Icon}
        emptyStateTitle="No city data available"
        enableExport
        exportFilename="casaora-city-metrics"
        isLoading={isLoading}
        pageSize={10}
      />
    </div>
  );
}
