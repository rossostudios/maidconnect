import { cn } from "@/lib/utils";

type Props = {
  columns: number;
  rows?: number;
  showHeader?: boolean;
};

const getSkeletonWidth = (colIndex: number) => {
  if (colIndex === 0) {
    return "w-32";
  }
  if (colIndex === 1) {
    return "w-48";
  }
  return "w-24";
};

/**
 * LiaDataTableSkeleton - Loading skeleton for tables
 *
 * Features:
 * - Configurable column/row count
 * - Pulse animation
 * - Lia design aesthetic
 */
export function LiaDataTableSkeleton({
  columns: columnCount,
  rows = 10,
  showHeader = true,
}: Props) {
  return (
    <div className="w-full overflow-x-auto border-neutral-200 border-t bg-white">
      <table className="w-full">
        {/* Header skeleton */}
        {showHeader && (
          <thead>
            <tr className="border-neutral-200 border-b bg-neutral-50">
              {Array.from({ length: columnCount }).map((_, i) => (
                <th className="px-6 py-4 text-left" key={i}>
                  <div className="h-4 w-24 animate-pulse bg-neutral-200" />
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body skeleton */}
        <tbody>
          {Array.from({ length: rows }).map((_row, rowIndex) => (
            <tr
              className={cn(
                "border-neutral-200 border-b transition-colors hover:bg-neutral-50",
                rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
              )}
              key={rowIndex}
            >
              {Array.from({ length: columnCount }).map((_col, colIndex) => (
                <td className="px-6 py-4" key={colIndex}>
                  <div
                    className={cn(
                      "h-4 animate-pulse bg-neutral-200",
                      // Vary widths for more realistic loading state
                      getSkeletonWidth(colIndex)
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
