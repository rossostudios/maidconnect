"use client";

import { ChartLineData01Icon, CreditCardIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

// ========================================
// Types
// ========================================

export type FinancesTab = "overview" | "transactions" | "settings";

type FinancesTabConfig = {
  id: FinancesTab;
  labelKey: string;
  icon: HugeIcon;
};

type FinancesTabsProps = {
  /** Active tab ID (controlled) */
  activeTab?: FinancesTab;
  /** Callback when tab changes */
  onTabChange?: (tab: FinancesTab) => void;
  /** Additional className */
  className?: string;
};

// ========================================
// Tab Configuration
// ========================================

const TABS: FinancesTabConfig[] = [
  { id: "overview", labelKey: "tabs.overview", icon: ChartLineData01Icon },
  { id: "transactions", labelKey: "tabs.transactions", icon: CreditCardIcon },
  { id: "settings", labelKey: "tabs.settings", icon: Settings02Icon },
];

// ========================================
// FinancesTabs Component
// ========================================

/**
 * FinancesTabs - Underline-style tab navigation for finances page
 *
 * Features:
 * - URL-based state via searchParams for deep linking
 * - Animated underline indicator
 * - Mobile horizontal scroll
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <FinancesTabs />
 * ```
 */
export function FinancesTabs({
  activeTab: controlledActiveTab,
  onTabChange,
  className,
}: FinancesTabsProps) {
  const t = useTranslations("dashboard.pro.finances");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active tab from URL or controlled prop
  const urlTab = searchParams.get("tab") as FinancesTab | null;
  const activeTab = controlledActiveTab ?? urlTab ?? "overview";

  const activeIndex = useMemo(() => TABS.findIndex((tab) => tab.id === activeTab), [activeTab]);

  // Handle tab click with URL update
  const handleTabClick = useCallback(
    (tabId: FinancesTab) => {
      // Update URL with new tab
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === "overview") {
        params.delete("tab"); // Default tab doesn't need URL param
      } else {
        params.set("tab", tabId);
      }

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      router.push(url, { scroll: false });
      onTabChange?.(tabId);
    },
    [pathname, router, searchParams, onTabChange]
  );

  return (
    <div className={cn("relative", className)}>
      {/* Tab List - Horizontal scroll on mobile */}
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:overflow-visible md:px-0">
        <div className="flex items-center gap-8 border-neutral-200 border-b" role="tablist">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                aria-selected={isActive}
                className={cn(
                  // Base styles
                  "relative flex items-center gap-2 whitespace-nowrap px-1 py-4 transition-all duration-200",
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
                role="tab"
                type="button"
              >
                <HugeiconsIcon
                  className={cn("h-5 w-5 transition-all duration-200", isActive && "scale-110")}
                  icon={tab.icon}
                />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Bottom Border */}
      {activeIndex !== -1 && (
        <motion.div
          animate={{
            left: `calc(${activeIndex} * (100% / ${TABS.length}))`,
          }}
          className="absolute bottom-0 h-0.5 rounded-full bg-rausch-500"
          initial={false}
          layoutId="finances-tab-indicator"
          style={{
            width: `calc(100% / ${TABS.length})`,
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

// ========================================
// Tab Panel Wrapper
// ========================================

type FinancesTabPanelProps = {
  /** Tab ID this panel belongs to */
  tabId: FinancesTab;
  /** Current active tab */
  activeTab: FinancesTab;
  /** Panel content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
};

/**
 * FinancesTabPanel - Wrapper for tab content with proper ARIA attributes
 */
export function FinancesTabPanel({ tabId, activeTab, children, className }: FinancesTabPanelProps) {
  const isActive = tabId === activeTab;

  if (!isActive) {
    return null;
  }

  return (
    <div
      aria-labelledby={`finances-tab-${tabId}`}
      className={cn("pt-6", className)}
      id={`finances-panel-${tabId}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

// ========================================
// Hook for Tab State
// ========================================

/**
 * useFinancesTab - Hook for reading active finances tab from URL
 */
export function useFinancesTab(): FinancesTab {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") as FinancesTab | null;
  return tab ?? "overview";
}
