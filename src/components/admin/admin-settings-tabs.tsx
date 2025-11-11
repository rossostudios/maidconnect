"use client";

import {
  Building02Icon,
  LockPasswordIcon,
  Settings01Icon,
  Shield01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function AdminSettingsTabs({ tabs, defaultTab }: Props) {
  return (
    <Tabs className="w-full" defaultValue={defaultTab || tabs[0]?.value}>
      {/* Tab Navigation */}
      <TabsList className="w-full justify-start">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon as keyof typeof iconMap] || Settings01Icon;
          return (
            <TabsTrigger className="gap-2" key={tab.value} value={tab.value}>
              <HugeiconsIcon className="h-4 w-4" icon={Icon} />
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
