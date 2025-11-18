"use client";

import {
  Building02Icon,
  LockPasswordIcon,
  Settings01Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { LiaTabsUnderline } from "@/components/ui/lia-tabs";

type Tab = {
  value: string;
  label: string;
  icon: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
};

const iconMap = {
  user: UserIcon,
  lock: LockPasswordIcon,
  building: Building02Icon,
  settings: Settings01Icon,
  shield: Shield01Icon,
};

/**
 * AdminSettingsTabs - Settings page navigation with Anthropic design
 *
 * Features:
 * - Refined underline variant for page-level navigation
 * - Smooth spring animations on tab changes
 * - Warm orange accents on active state
 * - Controlled state management
 * - Clean content transitions
 */
export function AdminSettingsTabs({ tabs, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "");

  // Map tabs to LiaTabs format
  const liaTabs = tabs.map((tab) => ({
    id: tab.value,
    label: tab.label,
    icon: iconMap[tab.icon as keyof typeof iconMap] || Settings01Icon,
  }));

  // Find active content
  const activeContent = tabs.find((tab) => tab.value === activeTab)?.content;

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <LiaTabsUnderline activeTab={activeTab} onChange={setActiveTab} tabs={liaTabs} />

      {/* Tab Content */}
      <div className="fade-in-0 slide-in-from-bottom-2 animate-in duration-300">
        {activeContent}
      </div>
    </div>
  );
}
