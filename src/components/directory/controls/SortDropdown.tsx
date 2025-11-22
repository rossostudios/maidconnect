"use client";

/**
 * SortDropdown - Lia Design System
 *
 * Dropdown for selecting sort order.
 */

import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SORT_OPTIONS, type SortOption } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn("justify-between gap-2", className)}
          role="combobox"
          variant="outline"
        >
          <span className="text-sm">
            <span className="hidden sm:inline">Sort: </span>
            {selectedOption?.label || "Sort"}
          </span>
          <HugeiconsIcon
            className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
            icon={ArrowDown01Icon}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-1">
        <div className="space-y-0.5">
          {SORT_OPTIONS.map((option) => (
            <button
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                value === option.value
                  ? "bg-orange-50 text-orange-600"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              type="button"
            >
              {option.label}
              {value === option.value && <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
