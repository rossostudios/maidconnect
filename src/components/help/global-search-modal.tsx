"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HelpSearchBar } from "./search-bar";

/**
 * Global Search Modal
 *
 * Opens with CMD+K (Mac) or Ctrl+K (Windows/Linux)
 * Provides quick access to help center search from anywhere in the app
 */
export function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (SSR safety)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for CMD+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // ESC to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Don't render on server or when closed
  if (!(mounted && isOpen)) {
    return null;
  }

  return createPortal(
    <div className="fade-in fixed inset-0 z-[100] flex animate-in items-start justify-center pt-[20vh] duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(false);
          }
        }}
        role="button"
        tabIndex={-1}
      >
        <span className="sr-only">Close search modal</span>
      </div>

      {/* Modal */}
      <div className="zoom-in-95 relative mx-4 w-full max-w-2xl animate-in duration-200">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="p-4">
            <HelpSearchBar
              autoFocus
              onClose={() => setIsOpen(false)}
              placeholder="Search help articles... (ESC to close)"
            />
          </div>

          {/* Keyboard hint */}
          <div className="flex items-center justify-center gap-2 border-gray-200 border-t bg-gray-50 px-4 py-2 text-gray-600 text-xs">
            <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
              ↑
            </kbd>
            <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
              ↓
            </kbd>
            <span>to navigate</span>
            <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
              ↵
            </kbd>
            <span>to select</span>
            <kbd className="rounded border border-gray-300 bg-white px-2 py-1 font-mono text-xs">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
