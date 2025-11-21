"use client";

import {
  DollarCircleIcon,
  Home09Icon,
  Logout01Icon,
  Search01Icon,
  Settings02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { geistSans } from "@/app/fonts";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { LiaTooltip } from "@/components/ui/lia-tooltip";
import { Link, usePathname } from "@/i18n/routing";
import { useMarket } from "@/lib/contexts/MarketContext";
import { COUNTRIES, type CountryCode } from "@/lib/shared/config/territories";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type NavItem = {
  href: string;
  label: string;
  description?: string;
  badge?: number;
};

type CategorySection = {
  id: string;
  icon: HugeIcon;
  label: string;
  description: string;
  items: NavItem[];
};

type Props = {
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  pendingLeadsCount?: number;
  countryCode?: string;
};

const createCategories = (_pendingLeadsCount = 0): CategorySection[] => [
  {
    id: "overview",
    icon: Home09Icon,
    label: "Overview",
    description: "Your dashboard",
    items: [
      { href: "/dashboard/pro", label: "Dashboard", description: "Overview & stats" },
      { href: "/dashboard/pro/bookings", label: "Bookings", description: "Your assignments" },
    ],
  },
  {
    id: "business",
    icon: DollarCircleIcon,
    label: "Business",
    description: "Manage your services",
    items: [
      {
        href: "/dashboard/pro/finances",
        label: "Finances",
        description: "Earnings & payouts",
      },
      {
        href: "/dashboard/pro/availability",
        label: "Availability",
        description: "Your schedule",
      },
      {
        href: "/dashboard/pro/portfolio",
        label: "Portfolio",
        description: "Showcase work",
      },
    ],
  },
  {
    id: "profile",
    icon: UserIcon,
    label: "Profile",
    description: "Account & settings",
    items: [
      {
        href: "/dashboard/pro/profile",
        label: "My Profile",
        description: "Public profile",
      },
      {
        href: "/dashboard/pro/documents",
        label: "Documents",
        description: "Verification",
      },
      {
        href: "/dashboard/pro/onboarding",
        label: "Settings",
        description: "Account settings",
      },
    ],
  },
];

/**
 * LiaProDoubleSidebar - Lia Design System
 *
 * Context-aware double sidebar for professional dashboard:
 * - Left icon rail controls right sidebar content
 * - Right sidebar shows items for selected category
 * - Anthropic-inspired with thoughtful rounded corners
 * - Geist fonts with precise typography
 * - Neutral palette with electric orange accents
 */
export function LiaProDoubleSidebar({
  userEmail,
  userName,
  userAvatarUrl,
  pendingLeadsCount = 0,
  countryCode,
}: Props) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [_showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { country } = useMarket();

  const categories = useMemo(() => createCategories(pendingLeadsCount), [pendingLeadsCount]);

  // Determine active category based on current pathname
  const activeCategory = useMemo(() => {
    // Check each category's items to see if any match the current path
    for (const category of categories) {
      const hasActiveItem = category.items.some((item) => {
        if (item.href === "/dashboard/pro") {
          return pathname === item.href;
        }
        return pathname.startsWith(item.href);
      });
      if (hasActiveItem) {
        return category.id;
      }
    }
    // Default to first category if no match
    return categories[0]?.id || "overview";
  }, [pathname, categories]);

  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  // Update selected category when pathname changes
  useMemo(() => {
    setSelectedCategory(activeCategory);
  }, [activeCategory]);

  const accountName = userName || "Professional";
  const firstName = accountName.split(" ")[0] || accountName;
  const accountEmail = userEmail || "";
  const userInitials =
    accountName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PR";
  const workingCountry = (countryCode as CountryCode | undefined) || country;
  const workingConfig = COUNTRIES[workingCountry] || COUNTRIES.CO;
  const countryFlag =
    {
      CO: "🇨🇴",
      PY: "🇵🇾",
      UY: "🇺🇾",
      AR: "🇦🇷",
    }[workingCountry] || "🌍";

  const handleSignOut = () => {
    setIsSigningOut(true);
    setShowProfileMenu(false);
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (_error) {
        setIsSigningOut(false);
      }
    });
  };

  const isLoading = isPending || isSigningOut;

  const isActive = (href: string) => {
    if (href === "/dashboard/pro") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Get items for selected category
  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
  const categoryItems = selectedCategoryData?.items || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryItems;
    }

    return categoryItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, categoryItems]);

  return (
    <div className="flex h-full">
      {/* Left Icon Sidebar - 64px */}
      <div className="flex w-16 flex-col border-neutral-200 border-r bg-white">
        {/* Logo Icon */}
        <Link
          className="flex h-16 items-center justify-center border-neutral-200 border-b bg-white transition-colors hover:bg-neutral-50"
          href="/"
        >
          <Image alt="Casaora" height={32} src="/isologo.svg" width={32} />
        </Link>

        {/* Category Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            const hasActiveItem = category.items.some((item) => isActive(item.href));

            return (
              <LiaTooltip content={category.label} key={category.id}>
                <button
                  className={cn(
                    "group relative flex h-14 w-full items-center justify-center transition-all",
                    isSelected || hasActiveItem ? "bg-orange-50" : "bg-white hover:bg-neutral-50"
                  )}
                  onClick={() => setSelectedCategory(category.id)}
                  type="button"
                >
                  {/* Active indicator */}
                  <span
                    className={cn(
                      "absolute top-0 left-0 h-full w-1 transition-all",
                      isSelected || hasActiveItem ? "bg-orange-500" : "bg-transparent"
                    )}
                  />

                  <HugeiconsIcon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected || hasActiveItem
                        ? "text-orange-500"
                        : "text-neutral-400 group-hover:text-neutral-700"
                    )}
                    icon={category.icon}
                  />
                </button>
              </LiaTooltip>
            );
          })}
        </nav>
      </div>

      {/* Right Expanded Sidebar - 240px */}
      <div className="flex w-60 flex-col border-neutral-200 border-r bg-white">
        {/* Category Header */}
        <div className="border-neutral-200 border-b bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            {selectedCategoryData && (
              <>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
                  <HugeiconsIcon
                    className="h-5 w-5 text-orange-500"
                    icon={selectedCategoryData.icon}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2
                    className={cn(
                      "font-semibold text-neutral-900 text-sm leading-none",
                      geistSans.className
                    )}
                  >
                    {selectedCategoryData.label}
                  </h2>
                  <p className="text-neutral-500 text-xs leading-none">
                    {selectedCategoryData.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="border-neutral-200 border-b bg-white p-3">
          <div className="relative">
            <HugeiconsIcon
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-neutral-400"
              icon={Search01Icon}
            />
            <input
              className={cn(
                "w-full rounded-lg border border-neutral-200 bg-white py-2 pr-3 pl-9 text-neutral-900 text-sm placeholder-neutral-400 transition-colors focus:border-orange-500 focus:outline-none",
                geistSans.className
              )}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              type="text"
              value={searchQuery}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-0.5">
            {filteredItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  className={cn(
                    "group flex items-start justify-between px-3 py-2.5 transition-all",
                    geistSans.className,
                    active
                      ? "bg-orange-50 text-orange-600"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 font-semibold text-white text-xs">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-neutral-500 text-xs">{item.description}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search01Icon className="mb-3 h-8 w-8 text-neutral-300" />
              <p className="font-medium text-neutral-500 text-sm">No results found</p>
              <p className="mt-1 text-neutral-400 text-xs">Try a different search term</p>
            </div>
          )}
        </nav>
        {/* Footer controls */}
        <div className="space-y-3 border-neutral-200 border-t bg-white p-3">
          <LanguageSwitcher />

          <div className="space-y-1.5">
            <p className="font-semibold text-neutral-600 text-xs uppercase tracking-wide">
              País de trabajo
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-900 text-sm">
              <span>{countryFlag}</span>
              <span>{workingConfig.nameEs}</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="flex w-full items-center gap-2.5 p-3 text-left">
              <div className="relative flex-shrink-0">
                {userAvatarUrl ? (
                  <Image
                    alt={accountName}
                    className="h-10 w-10 rounded-lg border border-neutral-200 object-cover"
                    height={40}
                    src={userAvatarUrl}
                    width={40}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 font-semibold text-orange-600 text-xs">
                    {userInitials}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-semibold text-neutral-900 text-sm",
                    geistSans.className
                  )}
                >
                  {firstName}
                </p>
                {accountEmail && (
                  <p className="truncate text-neutral-500 text-xs">{accountEmail}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5 border-neutral-200 border-t bg-neutral-50 p-3">
              <Link
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-900 text-xs transition-colors hover:bg-neutral-50"
                href="/dashboard/pro/onboarding"
                onClick={() => {
                  setSelectedCategory("profile");
                }}
              >
                <span>Settings</span>
                <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={Settings02Icon} />
              </Link>

              <button
                className={cn(
                  "flex w-full items-center justify-between rounded-lg bg-orange-500 px-3 py-2 font-medium text-white text-xs transition-colors hover:bg-orange-600",
                  isLoading && "cursor-wait opacity-70"
                )}
                disabled={isLoading}
                onClick={handleSignOut}
                type="button"
              >
                <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
                <HugeiconsIcon className="h-3.5 w-3.5 text-white" icon={Logout01Icon} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
