"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import type { AppRole } from "@/lib/auth";
import { getShortcutsByRole, isMac, type ShortcutCategory } from "@/lib/keyboardShortcuts";
import { cn } from "@/lib/utils";
import { KeyboardBadge } from "./KeyboardBadge";

type KeyboardPanelProps = {
  open: boolean;
  onClose: () => void;
  role?: AppRole;
};

export function KeyboardPanel({ open, onClose, role }: KeyboardPanelProps) {
  const [search, setSearch] = useState("");
  const [isMacPlatform, setIsMacPlatform] = useState(false);

  // Detect platform on mount
  useEffect(() => {
    setIsMacPlatform(isMac());
  }, []);

  // Get shortcuts filtered by role
  const shortcuts = getShortcutsByRole(role);

  // Filter shortcuts by search query
  const filteredShortcuts = search
    ? shortcuts.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(search.toLowerCase()) ||
          shortcut.keys.join(" ").toLowerCase().includes(search.toLowerCase())
      )
    : shortcuts;

  // Group shortcuts by category
  const categories: ShortcutCategory[] = ["general", "navigation", "actions"];
  const categoryLabels: Record<ShortcutCategory, string> = {
    general: "General",
    navigation: "Navigation",
    actions: "Actions",
  };

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-60 bg-[#0f172a]/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onClose();
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-60 h-full w-full max-w-md transform border-[#e2e8f0] border-l bg-[#f8fafc] shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "transtone-x-0" : "transtone-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-[#e2e8f0] border-b px-6 py-4">
          <h2 className="font-semibold text-[#0f172a] text-xl">Keyboard Shortcuts</h2>
          <button
            aria-label="Close shortcuts panel"
            className="rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-[#f8fafc] hover:text-[#0f172a]"
            onClick={onClose}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          </button>
        </div>

        {/* Search */}
        <div className="border-[#e2e8f0] border-b px-6 py-4">
          <div className="relative">
            <svg
              aria-hidden="true"
              className="-transtone-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-[#94a3b8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <input
              className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] py-2 pr-4 pl-10 text-[#0f172a] text-sm placeholder:text-[#94a3b8] focus:border-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#64748b]/20"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shortcuts..."
              type="text"
              value={search}
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="h-[calc(100%-180px)] overflow-y-auto px-6 py-6">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center text-[#94a3b8] text-sm">No shortcuts found.</div>
          ) : (
            <div className="space-y-8 pb-4">
              {categories.map((category) => {
                const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);

                if (categoryShortcuts.length === 0) {
                  return null;
                }

                return (
                  <div key={category}>
                    <h3 className="mb-4 font-semibold text-[#94a3b8] text-xs uppercase tracking-wider">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-3">
                      {categoryShortcuts.map((shortcut) => {
                        const keys = isMacPlatform
                          ? shortcut.keys
                          : shortcut.keysWindows || shortcut.keys;

                        return (
                          <div
                            className="flex items-center justify-between gap-4 rounded-lg bg-[#f8fafc] px-4 py-3 shadow-sm ring-1 ring-[#e2e8f0]/50 transition-shadow hover:shadow-md"
                            key={shortcut.id}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#0f172a] text-sm">
                                {shortcut.description}
                              </p>
                              {shortcut.sequence && (
                                <p className="mt-1 text-[#94a3b8] text-xs">
                                  Press keys in sequence
                                </p>
                              )}
                            </div>
                            <KeyboardBadge keys={keys} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute right-0 bottom-0 left-0 border-[#e2e8f0] border-t bg-[#f8fafc] px-6 py-4">
          <p className="text-[#94a3b8] text-xs">
            Press{" "}
            <kbd className="rounded border border-[#e2e8f0] bg-[#f8fafc] px-1.5 py-1 font-mono text-xs">
              ?
            </kbd>{" "}
            to toggle this panel
          </p>
        </div>
      </div>
    </>
  );
}
