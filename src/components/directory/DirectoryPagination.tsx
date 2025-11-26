"use client";

/**
 * DirectoryPagination - Lia Design System
 *
 * Pagination controls for professionals directory.
 * Previous/Next buttons with page indicator.
 */

import { ArrowLeft01Icon, ArrowRight01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DirectoryPaginationProps = {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback for previous page */
  onPrevPage: () => void;
  /** Callback for next page */
  onNextPage: () => void;
  className?: string;
};

export function DirectoryPagination({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  className,
}: DirectoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-4 py-8", className)}>
      <Button
        className="gap-2"
        disabled={currentPage <= 1}
        onClick={onPrevPage}
        size="sm"
        variant="outline"
      >
        <ArrowLeft01Icon className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <span className="text-neutral-600 text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        className="gap-2"
        disabled={currentPage >= totalPages}
        onClick={onNextPage}
        size="sm"
        variant="outline"
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRight01Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
