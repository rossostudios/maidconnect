"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppRole } from "@/lib/auth";
import { getShortcutsByRole, isMac, type ShortcutCategory } from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { KeyboardBadge } from "./keyboard-badge";

type KeyboardShortcutsPanelProps = {
  open: boolean;
  onClose: () => void;
  role?: AppRole;
};

export function KeyboardShortcutsPanel({ open, onClose, role }: KeyboardShortcutsPanelProps) {
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
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm transition-opacity"
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
          "fixed top-0 right-0 z-60 h-full w-full max-w-md transform border-[#dcd6c7] border-l bg-[#fefcf9] shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-[#dcd6c7] border-b px-6 py-4">
          <h2 className="font-semibold text-[#2e2419] text-xl">Keyboard Shortcuts</h2>
          <button
            aria-label="Close shortcuts panel"
            className="rounded-lg p-2 text-[#7a6d62] transition-colors hover:bg-[#f5f0e8] hover:text-[#2e2419]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-[#dcd6c7] border-b px-6 py-4">
          <div className="relative">
            <svg
              aria-hidden="true"
              className="-translate-y-1/2 absolute top-1/2 left-3 h-5 w-5 text-[#7a6d62]"
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
              className="w-full rounded-lg border border-[#dcd6c7] bg-white py-2 pr-4 pl-10 text-[#2e2419] text-sm placeholder:text-[#7a6d62] focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
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
            <div className="py-12 text-center text-[#7a6d62] text-sm">No shortcuts found.</div>
          ) : (
            <div className="space-y-8 pb-4">
              {categories.map((category) => {
                const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);

                if (categoryShortcuts.length === 0) {
                  return null;
                }

                return (
                  <div key={category}>
                    <h3 className="mb-4 font-semibold text-[#7a6d62] text-xs uppercase tracking-wider">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-3">
                      {categoryShortcuts.map((shortcut) => {
                        const keys = isMacPlatform
                          ? shortcut.keys
                          : shortcut.keysWindows || shortcut.keys;

                        return (
                          <div
                            className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-[#dcd6c7]/50 transition-shadow hover:shadow-md"
                            key={shortcut.id}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#2e2419] text-sm">
                                {shortcut.description}
                              </p>
                              {shortcut.sequence && (
                                <p className="mt-1 text-[#7a6d62] text-xs">
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
        <div className="absolute right-0 bottom-0 left-0 border-[#dcd6c7] border-t bg-[#fefcf9] px-6 py-4">
          <p className="text-[#7a6d62] text-xs">
            Press{" "}
            <kbd className="rounded border border-[#dcd6c7] bg-white px-1.5 py-1 font-mono text-xs">
              ?
            </kbd>{" "}
            to toggle this panel
          </p>
        </div>
      </div>
    </>
  );
}
