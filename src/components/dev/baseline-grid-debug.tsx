"use client";

import { useEffect, useState } from "react";

/**
 * Baseline Grid Debugger
 *
 * Displays a visual overlay showing the 24px baseline grid for Swiss Grid System development.
 * Inspired by Josef Müller-Brockmann's grid principles.
 *
 * Usage:
 * - Add <BaselineGridDebug /> to your root layout (only renders in development)
 * - Toggle with Ctrl+Shift+G (Windows/Linux) or Cmd+Shift+G (Mac)
 * - Red horizontal lines show the baseline grid (24px intervals)
 *
 * Typography should align to these lines for perfect vertical rhythm.
 */
export function BaselineGridDebug() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Ctrl+Shift+G or Cmd+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Baseline Grid Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent 23px,
            rgba(255, 0, 0, 0.15) 23px,
            rgba(255, 0, 0, 0.15) 24px
          )`,
        }}
      />

      {/* Info Badge */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[10000] bg-neutral-900/90 px-4 py-2 text-white text-xs shadow-lg">
        <div className="font-semibold">Swiss Baseline Grid (24px)</div>
        <div className="text-neutral-300">Press Cmd/Ctrl + Shift + G to toggle</div>
      </div>
    </>
  );
}
