"use client";

import { useKeyboardShortcutsContext } from "@/components/providers/keyboard-shortcuts-provider";

type KeyboardShortcutsButtonProps = {
  className?: string;
};

export function KeyboardShortcutsButton({ className }: KeyboardShortcutsButtonProps) {
  const { openShortcutsPanel } = useKeyboardShortcutsContext();

  return (
    <button
      aria-label="View keyboard shortcuts"
      className={className || "text-neutral-600 underline transition hover:text-neutral-900"}
      onClick={openShortcutsPanel}
      type="button"
    >
      Keyboard Shortcuts
    </button>
  );
}
