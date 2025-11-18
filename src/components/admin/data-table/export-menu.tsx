"use client";

import { Download04Icon, File01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { Backdrop } from "@/components/ui/backdrop";
import { cn } from "@/lib/utils";

type ExportFormat = "csv" | "json";

type Props = {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
};

/**
 * LiaDataTableExportMenu - Export data menu
 *
 * Features:
 * - CSV export
 * - JSON export
 * - Dropdown menu
 */
export function LiaDataTableExportMenu({ onExport, disabled = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        aria-label="Export data"
        className={cn(
          "flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-200 disabled:hover:bg-white",
          geistSans.className
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={Download04Icon} />
        <span>Export</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <Backdrop aria-label="Close export menu" onClose={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="py-1">
              {/* CSV option */}
              <button
                className={cn(
                  "flex w-full items-center gap-3 border border-transparent bg-white px-4 py-2.5 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
                  geistSans.className
                )}
                onClick={() => handleExport("csv")}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={File01Icon} />
                <div className="flex-1 text-left">
                  <div className="font-medium">CSV</div>
                  <div className="font-normal text-[10px] text-neutral-600">Excel compatible</div>
                </div>
              </button>

              {/* JSON option */}
              <button
                className={cn(
                  "flex w-full items-center gap-3 border border-transparent bg-white px-4 py-2.5 font-medium text-neutral-900 text-xs tracking-wider transition-all hover:border-neutral-200 hover:bg-neutral-50",
                  geistSans.className
                )}
                onClick={() => handleExport("json")}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={File01Icon} />
                <div className="flex-1 text-left">
                  <div className="font-medium">JSON</div>
                  <div className="font-normal text-[10px] text-neutral-600">Developer friendly</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
