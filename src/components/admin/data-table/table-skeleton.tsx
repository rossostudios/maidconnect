"use client";

import { cn } from "@/lib/utils";

type Props = {
  columns: number;
  rows?: number;
  showHeader?: boolean;
};

/**
 * PrecisionDataTableSkeleton - Loading skeleton for tables
 *
 * Features:
 * - Configurable column/row count
 * - Pulse animation
 * - Precision design aesthetic
 */
export function PrecisionDataTableSkeleton({ columns, rows = 10, showHeader = true }: Props) {
  return (
    <div className="w-full overflow-x-auto border-neutral-200 border-t bg-white">
      <table className="w-full">
        {/* Header skeleton */}
        {showHeader && (
          <thead>
            <tr className="border-neutral-200 border-b bg-neutral-50">
              {Array.from({ length: columns }).map((_, i) => (
                <th className="px-6 py-4 text-left" key={i}>
                  <div className="h-4 w-24 animate-pulse bg-neutral-200" />
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body skeleton */}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              className={cn(
                "border-neutral-200 border-b transition-colors hover:bg-neutral-50",
                rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
              )}
              key={rowIndex}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td className="px-6 py-4" key={colIndex}>
                  <div
                    className={cn(
                      "h-4 animate-pulse bg-neutral-200",
                      // Vary widths for more realistic loading state
                      colIndex === 0 ? "w-32" : colIndex === 1 ? "w-48" : "w-24"
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
