"use client";

/**
 * GlobeButton - Header button that opens preferences modal
 *
 * Displays a globe icon with current language code (like Airbnb).
 * Opens PreferencesModal on click for language, region, and currency selection.
 */

import { GlobalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PreferencesModal } from "./PreferencesModal";

type Props = {
  className?: string;
};

export function GlobeButton({ className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();

  return (
    <>
      <button
        aria-label="Open language, region, and currency preferences"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-2",
          "font-medium text-neutral-700 text-sm",
          // Lia Design System - spring transition
          "transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "hover:bg-neutral-100 hover:text-neutral-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          className
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <HugeiconsIcon className="h-5 w-5" icon={GlobalIcon} strokeWidth={1.5} />
        <span className="uppercase">{locale}</span>
      </button>

      <PreferencesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
