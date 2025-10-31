"use client";

import { useState } from "react";
import { useKeyboardShortcutsContext } from "@/components/providers/keyboard-shortcuts-provider";
import { cn } from "@/lib/utils";

type KeyboardShortcutsButtonProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function KeyboardShortcutsButton({
  variant = "light",
  className,
}: KeyboardShortcutsButtonProps) {
  const { openShortcutsPanel } = useKeyboardShortcutsContext();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        aria-label="View keyboard shortcuts"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200",
          variant === "light" &&
            "border-[#dcd6c7] bg-white text-[#5d574b] hover:border-[#ff5d46] hover:bg-[#fff5f3] hover:text-[#ff5d46]",
          variant === "dark" &&
            "border-[#26231f] bg-transparent text-[#f3ece1] hover:border-[#ff5d46] hover:bg-[#ff5d46]/10 hover:text-[#ff5d46]",
          className
        )}
        onClick={openShortcutsPanel}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
      >
        <span className="font-semibold text-base leading-none">?</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={cn(
            "-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-xs shadow-lg",
            variant === "light" && "bg-[#2e2419] text-white",
            variant === "dark" && "bg-white text-[#2e2419]"
          )}
        >
          Keyboard shortcuts
          {/* Arrow */}
          <div
            className={cn(
              "-translate-x-1/2 absolute top-full left-1/2 h-0 w-0 border-4 border-transparent",
              variant === "light" && "border-t-[#2e2419]",
              variant === "dark" && "border-t-white"
            )}
          />
        </div>
      )}
    </div>
  );
}
