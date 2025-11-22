"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  overlay?: boolean;
};

/**
 * StickyHeaderWrapper - Floating Glass Pill Header
 *
 * Design: Modern Floating Glass Pill
 * - Always-visible glass morphism effect for readability
 * - Smooth spring-like transitions (custom cubic-bezier)
 * - Progressive shadow that intensifies on scroll
 * - Warm-tinted backdrop blur for premium feel
 * - Page load animation for polished entrance
 *
 * The glass pill is always visible in overlay mode, ensuring
 * text is readable regardless of background content.
 */
export function StickyHeaderWrapper({ children, overlay }: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger mount animation
    setIsMounted(true);

    const handleScroll = () => {
      // Track scroll for subtle shadow intensification
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!overlay) {
    // Non-overlay mode: standard sticky header with white background
    return (
      <header className="group sticky top-0 z-50 w-full border-neutral-200 border-b bg-white py-4">
        {children}
      </header>
    );
  }

  // Overlay mode: floating glass pill header (always visible)
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        // Padding around the floating pill
        "px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 lg:px-6 lg:pt-6 lg:pb-6",
        // Page load animation
        "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isMounted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
    >
      <div
        className={cn(
          "group relative",
          // Centered container with max width
          "mx-auto max-w-5xl",
          // Refined rounded corners (Lia Design System)
          "rounded-[20px]",
          // Warm-tinted glass morphism - always visible
          "bg-white/[0.92] backdrop-blur-2xl backdrop-saturate-[1.8]",
          // Subtle warm border with glow effect
          "border border-neutral-200/40",
          "ring-1 ring-white/50 ring-inset",
          // Vertical padding
          "py-3",
          // Shadow system - intensifies on scroll for depth feedback
          "transition-shadow duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isScrolled
            ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_12px_32px_-4px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
            : "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
        )}
      >
        {/* Subtle gradient overlay for depth */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px] opacity-40"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Content */}
        <div className="relative">{children}</div>
      </div>
    </header>
  );
}
