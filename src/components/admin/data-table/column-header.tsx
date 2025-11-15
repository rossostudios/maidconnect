"use client";

import { ArrowDown01Icon, ArrowUp01Icon, SortingAZ01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Column } from "@tanstack/react-table";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
};

/**
 * PrecisionDataTableColumnHeader - Sortable column header with Precision design
 *
 * Features:
 * - Click to sort (asc → desc → none)
 * - Visual sort indicators
 * - Hover states
 * - Keyboard accessible
 */
export function PrecisionDataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: Props<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "flex items-center font-semibold text-xs uppercase tracking-wider",
          geistSans.className,
          className
        )}
      >
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <button
      aria-label={
        sorted === "desc"
          ? "Sorted descending. Click to sort ascending."
          : sorted === "asc"
            ? "Sorted ascending. Click to remove sorting."
            : "Not sorted. Click to sort descending."
      }
      className={cn(
        "group flex items-center gap-2 border border-transparent bg-white font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
        geistSans.className,
        sorted && "bg-orange-50 text-[#FF5200]",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      type="button"
    >
      <span>{title}</span>

      {/* Sort icon */}
      <div className="relative h-4 w-4 flex-shrink-0">
        {!sorted && (
          <HugeiconsIcon
            className="h-4 w-4 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100"
            icon={SortingAZ01Icon}
          />
        )}
        {sorted === "desc" && (
          <HugeiconsIcon className="h-4 w-4 text-[#FF5200]" icon={ArrowDown01Icon} />
        )}
        {sorted === "asc" && (
          <HugeiconsIcon className="h-4 w-4 text-[#FF5200]" icon={ArrowUp01Icon} />
        )}
      </div>
    </button>
  );
}
