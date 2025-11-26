"use client";

/**
 * WorkflowTabs - Status-Based Booking Workflow Navigation
 *
 * Airbnb-style tab navigation for professional bookings that groups
 * bookings by workflow status with smart defaults.
 *
 * Key Features:
 * - Status-based tabs: Active, Completed, History
 * - Badge counts for each tab
 * - Smart default selection (shows most actionable items first)
 * - Animated transitions between tabs
 * - Mobile-responsive design
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 active states
 * - neutral color palette
 */

import { Calendar03Icon, CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

// ============================================================================
// Types
// ============================================================================

export type WorkflowTab = "active" | "completed" | "history";

export type TabDefinition = {
  id: WorkflowTab;
  label: string;
  description: string;
  icon: HugeIcon;
  statuses: string[];
};

export type WorkflowTabCounts = {
  active: number;
  completed: number;
  history: number;
};

// ============================================================================
// Tab Definitions
// ============================================================================

export const WORKFLOW_TABS: TabDefinition[] = [
  {
    id: "active",
    label: "Active",
    description: "In progress, confirmed, and pending bookings",
    icon: Clock01Icon,
    statuses: ["pending", "confirmed", "in_progress"],
  },
  {
    id: "completed",
    label: "Completed",
    description: "Recently completed bookings awaiting review",
    icon: CheckmarkCircle02Icon,
    statuses: ["completed"],
  },
  {
    id: "history",
    label: "History",
    description: "Past bookings and cancelled appointments",
    icon: Calendar03Icon,
    statuses: ["completed", "cancelled"],
  },
];

/**
 * Get the tab that contains the most actionable items
 */
export function getSmartDefaultTab(counts: WorkflowTabCounts): WorkflowTab {
  // If there are active bookings, show those first
  if (counts.active > 0) {
    return "active";
  }
  // If there are completed bookings to review, show those
  if (counts.completed > 0) {
    return "completed";
  }
  // Default to history
  return "history";
}

// ============================================================================
// Components
// ============================================================================

type WorkflowTabsProps = {
  /** Currently selected tab */
  value: WorkflowTab;
  /** Called when tab changes */
  onChange: (tab: WorkflowTab) => void;
  /** Booking counts per tab */
  counts: WorkflowTabCounts;
  /** Additional CSS classes */
  className?: string;
};

export function WorkflowTabs({ value, onChange, counts, className }: WorkflowTabsProps) {
  return (
    <div
      aria-label="Booking workflow tabs"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1.5",
        className
      )}
      role="tablist"
    >
      {WORKFLOW_TABS.map((tab) => (
        <WorkflowTabButton
          count={counts[tab.id]}
          isActive={value === tab.id}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          tab={tab}
        />
      ))}
    </div>
  );
}

type WorkflowTabButtonProps = {
  tab: TabDefinition;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

function WorkflowTabButton({ tab, count, isActive, onClick }: WorkflowTabButtonProps) {
  return (
    <button
      aria-controls={`panel-${tab.id}`}
      aria-selected={isActive}
      className={cn(
        "relative flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        isActive
          ? "bg-white text-neutral-900 shadow-sm"
          : "text-neutral-600 hover:bg-white/50 hover:text-neutral-900"
      )}
      id={`tab-${tab.id}`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      <HugeiconsIcon
        className={cn("h-4 w-4", isActive ? "text-rausch-500" : "text-neutral-400")}
        icon={tab.icon}
      />
      <span className={geistSans.className}>{tab.label}</span>
      {count > 0 && (
        <Badge
          className={cn(
            "ml-0.5",
            isActive
              ? "border-rausch-200 bg-rausch-50 text-rausch-700"
              : "border-neutral-200 bg-white text-neutral-500"
          )}
          size="sm"
          variant="outline"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
      {isActive && (
        <motion.div
          className="-bottom-1.5 absolute inset-x-0 mx-auto h-0.5 w-8 rounded-full bg-rausch-500"
          layoutId="workflow-tab-indicator"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
    </button>
  );
}

// ============================================================================
// Mobile-Optimized Variant
// ============================================================================

type WorkflowTabsMobileProps = WorkflowTabsProps & {
  /** Show count summary in header */
  showSummary?: boolean;
};

export function WorkflowTabsMobile({
  value,
  onChange,
  counts,
  showSummary = true,
  className,
}: WorkflowTabsMobileProps) {
  const totalActive = counts.active;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Summary Header (Mobile) */}
      {showSummary && totalActive > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
            {totalActive} active {totalActive === 1 ? "booking" : "bookings"}
          </span>
          <Badge className="border-rausch-200 bg-rausch-50 text-rausch-700" variant="outline">
            Needs attention
          </Badge>
        </div>
      )}

      {/* Scrollable Tabs */}
      <div
        aria-label="Booking workflow tabs"
        className="scrollbar-hide flex gap-2 overflow-x-auto pb-1"
        role="tablist"
      >
        {WORKFLOW_TABS.map((tab) => (
          <WorkflowTabPill
            count={counts[tab.id]}
            isActive={value === tab.id}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            tab={tab}
          />
        ))}
      </div>
    </div>
  );
}

type WorkflowTabPillProps = {
  tab: TabDefinition;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

function WorkflowTabPill({ tab, count, isActive, onClick }: WorkflowTabPillProps) {
  return (
    <button
      aria-selected={isActive}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-medium text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        isActive
          ? "border-rausch-200 bg-rausch-50 text-rausch-700"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-rausch-200 hover:bg-rausch-50/50"
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      <HugeiconsIcon
        className={cn("h-4 w-4", isActive ? "text-rausch-600" : "text-neutral-400")}
        icon={tab.icon}
      />
      <span className={geistSans.className}>{tab.label}</span>
      {count > 0 && (
        <span
          className={cn(
            "ml-0.5 min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center font-semibold text-xs",
            isActive ? "bg-rausch-200 text-rausch-800" : "bg-neutral-100 text-neutral-600"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Vertical Variant (for sidebar use)
// ============================================================================

type WorkflowTabsVerticalProps = WorkflowTabsProps;

export function WorkflowTabsVertical({
  value,
  onChange,
  counts,
  className,
}: WorkflowTabsVerticalProps) {
  return (
    <div
      aria-label="Booking workflow tabs"
      aria-orientation="vertical"
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-2",
        className
      )}
      role="tablist"
    >
      {WORKFLOW_TABS.map((tab) => (
        <WorkflowTabVerticalItem
          count={counts[tab.id]}
          isActive={value === tab.id}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          tab={tab}
        />
      ))}
    </div>
  );
}

function WorkflowTabVerticalItem({ tab, count, isActive, onClick }: WorkflowTabPillProps) {
  return (
    <button
      aria-selected={isActive}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        isActive
          ? "bg-rausch-50 text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      )}
      onClick={onClick}
      role="tab"
      type="button"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon
          className={cn("h-5 w-5", isActive ? "text-rausch-500" : "text-neutral-400")}
          icon={tab.icon}
        />
        <div>
          <p className={cn("font-medium text-sm", geistSans.className)}>{tab.label}</p>
          <p className="text-neutral-500 text-xs">{tab.description}</p>
        </div>
      </div>
      {count > 0 && (
        <Badge
          className={cn(
            isActive
              ? "border-rausch-200 bg-rausch-100 text-rausch-700"
              : "border-neutral-200 bg-neutral-100 text-neutral-600"
          )}
          size="sm"
          variant="outline"
        >
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </button>
  );
}
