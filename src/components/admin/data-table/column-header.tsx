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
 * LiaDataTableColumnHeader - Sortable column header with Lia design
 *
 * Features:
 * - Click to sort (asc → desc → none)
 * - Visual sort indicators
 * - Hover states
 * - Keyboard accessible
 */
export function LiaDataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: Props<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "flex items-center font-medium text-xs tracking-wider",
          geistSans.className,
          className
        )}
      >
        {title}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  const getSortAnnouncement = (direction: typeof sorted) => {
    if (direction === "desc") {
      return "Sorted descending. Click to sort ascending.";
    }
    if (direction === "asc") {
      return "Sorted ascending. Click to remove sorting.";
    }
    return "Not sorted. Click to sort descending.";
  };

  return (
    <button
      aria-label={getSortAnnouncement(sorted)}
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-transparent bg-white font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
        geistSans.className,
        sorted && "bg-rausch-50 text-rausch-500",
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
          <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={ArrowDown01Icon} />
        )}
        {sorted === "asc" && (
          <HugeiconsIcon className="h-4 w-4 text-rausch-500" icon={ArrowUp01Icon} />
        )}
      </div>
    </button>
  );
}
