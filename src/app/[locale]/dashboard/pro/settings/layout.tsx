"use client";

/**
 * Pro Settings Layout
 *
 * Layout with tabs for professional settings pages.
 * Uses React Aria Tabs for accessible navigation.
 *
 * Tabs:
 * - Profile: Visibility, vanity URL, earnings badge
 * - Verification: Trust profile, credentials, background check
 */

import { ShieldKeyIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils/core";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: typeof UserIcon;
};

export default function ProSettingsLayout({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("dashboard.pro.settings");

  const basePath = `/${locale}/dashboard/pro/settings`;

  const tabs: Tab[] = [
    {
      id: "profile",
      label: "Profile",
      href: `${basePath}/profile`,
      icon: UserIcon,
    },
    {
      id: "verification",
      label: t("verification.title"),
      href: `${basePath}/verification`,
      icon: ShieldKeyIcon,
    },
  ];

  // Determine active tab from pathname
  const activeTab = tabs.find((tab) => pathname.includes(tab.id))?.id ?? "profile";

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <nav
        aria-label="Settings sections"
        className="flex gap-1 border-neutral-200 border-b dark:border-neutral-800"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              aria-selected={isActive}
              className={cn(
                "flex items-center gap-2 px-4 py-3 transition-colors",
                "-mb-px border-b-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
                isActive
                  ? "border-rausch-500 text-rausch-600 dark:text-rausch-400"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                geistSans.className
              )}
              href={tab.href}
              key={tab.id}
              role="tab"
            >
              <HugeiconsIcon
                className={cn("h-4 w-4", isActive ? "text-rausch-500" : "text-neutral-400")}
                icon={tab.icon}
              />
              <span className="font-medium text-sm">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tab Content */}
      <div role="tabpanel">{children}</div>
    </div>
  );
}
