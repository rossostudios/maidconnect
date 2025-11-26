"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

/**
 * LiaTabs - Anthropic-Inspired Tab Navigation
 *
 * Refined minimalism with warmth:
 * - Sliding indicator with smooth spring physics
 * - Refined typography on 24px baseline grid
 * - Warm neutral palette with orange accents
 * - Tactile hover states with subtle scaling
 * - 4px grid precision spacing
 * - Geist Sans for clean readability
 *
 * Design Philosophy:
 * Premium refinement through restraint. Every detail matters:
 * subtle motion, precise spacing, warm colors, tactile feedback.
 */

export type Tab = {
  id: string;
  label: string;
  icon: HugeIcon;
};

type LiaTabsProps = {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "bordered";
};

/**
 * LiaTabs Component
 *
 * @example
 * ```tsx
 * import { UserIcon, LockIcon, BuildingIcon } from "@hugeicons/core-free-icons";
 *
 * const tabs = [
 *   { id: "profile", label: "Profile", icon: UserIcon },
 *   { id: "security", label: "Security", icon: LockIcon },
 *   { id: "platform", label: "Platform", icon: BuildingIcon },
 * ];
 *
 * <LiaTabs tabs={tabs} activeTab="profile" onChange={setActiveTab} />
 * ```
 */
export function LiaTabs({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  variant = "default",
}: LiaTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id ?? "");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 p-1",
        variant === "bordered" && "rounded-lg border border-neutral-200 bg-white"
      )}
    >
      {/* Animated Background Indicator */}
      {activeIndex !== -1 && (
        <motion.div
          animate={{
            x: `calc(${activeIndex} * (100% / ${tabs.length}) + ${activeIndex * 4}px)`,
            width: `calc(100% / ${tabs.length} - 4px)`,
          }}
          className="absolute inset-y-1 rounded-lg border border-rausch-200/50 bg-rausch-50"
          initial={false}
          layoutId="activeTabIndicator"
          style={{
            zIndex: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8,
          }}
        />
      )}

      {/* Tab Buttons */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            className={cn(
              // Base styles
              "relative z-10 flex items-center gap-2 rounded-lg px-6 py-3 transition-all duration-200",
              // Typography
              "font-medium text-sm tracking-tight",
              geistSans.className,
              // States
              isActive
                ? "text-rausch-600"
                : "text-neutral-500 hover:scale-[1.02] hover:text-neutral-700",
              // Focus
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500/20 focus-visible:ring-offset-2"
            )}
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            type="button"
          >
            <HugeiconsIcon
              className={cn("h-5 w-5 transition-all duration-200", isActive && "scale-110")}
              icon={Icon}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * LiaTabsUnderline - Alternative variant with bottom underline
 *
 * More editorial, less contained. Perfect for page-level navigation.
 */
export function LiaTabsUnderline({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
}: Omit<LiaTabsProps, "variant">) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id ?? "");
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className="relative">
      {/* Tab Buttons */}
      <div className="flex items-center gap-8 border-neutral-200 border-b">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              className={cn(
                // Base styles
                "relative flex items-center gap-2 px-1 py-4 transition-all duration-200",
                // Typography
                "font-medium text-sm tracking-tight",
                geistSans.className,
                // States
                isActive ? "text-rausch-600" : "text-neutral-500 hover:text-neutral-700",
                // Focus
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500/20 focus-visible:ring-offset-2"
              )}
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              type="button"
            >
              <HugeiconsIcon
                className={cn("h-5 w-5 transition-all duration-200", isActive && "scale-110")}
                icon={Icon}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Bottom Border */}
      {activeIndex !== -1 && (
        <motion.div
          animate={{
            x: `calc(${activeIndex} * (100% / ${tabs.length}) + ${activeIndex * 32}px)`,
            width: tabs[activeIndex] ? "auto" : 0,
          }}
          className="absolute bottom-0 h-0.5 rounded-full bg-rausch-500"
          initial={false}
          layoutId="activeTabUnderline"
          style={{
            left: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8,
          }}
        />
      )}
    </div>
  );
}
