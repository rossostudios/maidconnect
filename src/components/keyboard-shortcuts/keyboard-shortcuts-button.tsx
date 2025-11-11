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
          "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 active:scale-95",
          variant === "light" &&
            "border-[#64748b] bg-[#f8fafc] text-[#64748b] hover:bg-[#64748b] hover:text-[#f8fafc]",
          variant === "dark" &&
            "border-[#64748b] bg-[#64748b]/10 text-[#64748b] hover:bg-[#64748b] hover:text-[#f8fafc]",
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
            variant === "light" && "bg-[#0f172a] text-[#f8fafc]",
            variant === "dark" && "bg-[#f8fafc] text-[#0f172a]"
          )}
        >
          Keyboard shortcuts
          {/* Arrow */}
          <div
            className={cn(
              "-translate-x-1/2 absolute top-full left-1/2 h-0 w-0 border-4 border-transparent",
              variant === "light" && "border-t-[#0f172a]",
              variant === "dark" && "border-t-white"
            )}
          />
        </div>
      )}
    </div>
  );
}
