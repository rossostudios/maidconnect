"use client";

/**
 * FilterModal - Lia Design System
 *
 * Airbnb-style centered filter modal for desktop.
 * Uses React Aria Dialog for accessibility.
 *
 * Features:
 * - Centered modal popup with backdrop
 * - Renders FilterContent inside modal body
 * - "Show X professionals" CTA button
 * - Clear all filters option
 */

import { Cancel01Icon } from "hugeicons-react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterContent, type FilterContentProps } from "./FilterContent";

export type FilterModalProps = {
  /** Filter state and setters from useProfessionals hook */
  filters: FilterContentProps["filters"];
  setFilter: FilterContentProps["setFilter"];
  /** Total number of results to show in CTA */
  totalResults: number;
  /** Callback to clear all filters */
  onClearAll: () => void;
  /** Whether modal is open (controlled) */
  isOpen?: boolean;
  /** Callback when modal open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Trigger element (defaults to Filters button) */
  trigger?: React.ReactNode;
  className?: string;
};

export function FilterModal({
  filters,
  setFilter,
  totalResults,
  onClearAll,
  isOpen,
  onOpenChange,
  trigger,
  className,
}: FilterModalProps) {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      {trigger}

      <ModalOverlay
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-neutral-900/60",
          // React Aria animation data attributes
          "data-[entering]:fade-in-0 data-[entering]:animate-in data-[entering]:duration-200",
          "data-[exiting]:fade-out-0 data-[exiting]:animate-out data-[exiting]:duration-150"
        )}
      >
        <Modal
          className={cn(
            "mx-4 w-full max-w-lg",
            // React Aria animation data attributes
            "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in data-[entering]:duration-200",
            "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out data-[exiting]:duration-150",
            className
          )}
        >
          <Dialog
            className={cn(
              "rounded-xl bg-white shadow-2xl dark:bg-rausch-950",
              "flex max-h-[85vh] flex-col",
              "outline-none"
            )}
          >
            {({ close }) => (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4 dark:border-rausch-800">
                  <button
                    aria-label="Close filters"
                    className={cn(
                      "-ml-2 rounded-full p-2",
                      "transition-colors hover:bg-neutral-100 dark:hover:bg-rausch-800",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500"
                    )}
                    onClick={close}
                    type="button"
                  >
                    <Cancel01Icon className="h-5 w-5 text-neutral-700 dark:text-rausch-100" />
                  </button>

                  <Heading
                    className="font-semibold text-base text-neutral-900 dark:text-rausch-50"
                    slot="title"
                  >
                    Filters
                  </Heading>

                  {/* Spacer for centering */}
                  <div className="w-9" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto dark:bg-rausch-950">
                  <FilterContent filters={filters} setFilter={setFilter} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-neutral-200 border-t px-6 py-4 dark:border-rausch-800">
                  <button
                    className={cn(
                      "font-semibold text-neutral-900 text-sm underline dark:text-rausch-50",
                      "transition-colors hover:text-neutral-700 dark:hover:text-rausch-200",
                      "rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-rausch-900"
                    )}
                    onClick={onClearAll}
                    type="button"
                  >
                    Clear all
                  </button>

                  <Button className="min-w-[160px]" onPress={close}>
                    Show {totalResults.toLocaleString()} professional
                    {totalResults !== 1 ? "s" : ""}
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
