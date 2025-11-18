"use client";

import {
  ArrowDown01Icon,
  ClipboardIcon,
  FileIcon,
  Home01Icon,
  Logout01Icon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { geistSans } from "@/app/fonts";
import { LiaTooltip } from "@/components/ui/lia-tooltip";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type NavItem = {
  href: string;
  label: string;
  description?: string;
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
};

const categories: CategorySection[] = [
  {
    id: "overview",
    icon: Home01Icon,
    label: "Dashboard",
    description: "Platform Insights",
    items: [
      { href: "/admin", label: "Overview", description: "Key Performance Indicators" },
      { href: "/admin/analytics", label: "Analytics", description: "Detailed Performance Data" },
    ],
  },
  {
    id: "users",
    icon: UserGroupIcon,
    label: "Community",
    description: "Member Management",
    items: [
      { href: "/admin/users", label: "User Directory", description: "Comprehensive member list" },
      { href: "/admin/applications", label: "Applications", description: "Professional verification requests" },
      { href: "/admin/moderation", label: "Safety & Moderation", description: "Content review & safety tools" },
    ],
  },
  {
    id: "operations",
    icon: ClipboardIcon,
    label: "Operations",
    description: "System Operations",
    items: [
      { href: "/admin/bulk-operations", label: "Bulk Actions", description: "Batch processing tools" },
      { href: "/admin/disputes", label: "Resolution Center", description: "Dispute management" },
      { href: "/admin/audit-logs", label: "Audit Trail", description: "System activity logs" },
    ],
  },
  {
    id: "content",
    icon: FileIcon,
    label: "Configuration",
    description: "Platform Configuration",
    items: [
      { href: "/admin/content", label: "Content Management", description: "Editorial & static content" },
      { href: "/admin/pricing", label: "Monetization", description: "Pricing & revenue settings" },
      { href: "/admin/feedback", label: "User Feedback", description: "Community suggestions" },
      { href: "/admin/roadmap", label: "Product Roadmap", description: "Future development plans" },
    ],
  },
];

/**
 * LiaDoubleSidebar - Lia Design System
 *
 * Context-aware double sidebar:
 * - Left icon rail controls right sidebar content
 * - Right sidebar shows items for selected category
 * - Anthropic-inspired with thoughtful rounded corners
 * - Geist fonts with precise typography
 * - Neutral palette with electric orange accents
 */
export function LiaDoubleSidebar({ userEmail, userName, userAvatarUrl }: Props) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Determine active category based on current pathname
  const activeCategory = useMemo(() => {
    // Check each category's items to see if any match the current path
    for (const category of categories) {
      const hasActiveItem = category.items.some((item) => {
        if (item.href === "/admin") {
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
  }, [pathname]);

  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  // Update selected category when pathname changes
  useMemo(() => {
    setSelectedCategory(activeCategory);
  }, [activeCategory]);

  const accountName = userName || "Admin User";
  const firstName = accountName.split(" ")[0] || accountName;
  const accountEmail = userEmail || "admin@casaora.com";
  const accountRole = "Administrator";
  const userInitials =
    accountName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

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
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Get items for selected category
  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
  const categoryItems = selectedCategoryData?.items || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return categoryItems;

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
          href="/admin"
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

        {/* Settings Icon */}
        <LiaTooltip content="Settings">
          <button
            className={cn(
              "flex h-14 w-full items-center justify-center border-neutral-200 border-t transition-colors",
              selectedCategory === "settings" ? "bg-orange-50" : "bg-white hover:bg-neutral-50"
            )}
            onClick={() => setSelectedCategory("settings")}
            type="button"
          >
            <HugeiconsIcon
              className={cn(
                "h-5 w-5 transition-colors",
                selectedCategory === "settings"
                  ? "text-orange-500"
                  : "text-neutral-400 hover:text-neutral-700"
              )}
              icon={Settings01Icon}
            />
          </button>
        </LiaTooltip>
      </div>

      {/* Right Expanded Sidebar - 240px */}
      <div className="flex w-60 flex-col border-neutral-200 border-r bg-white">
        {/* Category Header */}
        <div className="flex items-center gap-2.5 border-neutral-200 border-b bg-white px-4 py-3">
          {selectedCategoryData && (
            <>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
                <HugeiconsIcon
                  className="h-4.5 w-4.5 text-orange-500"
                  icon={selectedCategoryData.icon}
                />
              </div>
              <h2
                className={cn(
                  "min-w-0 flex-1 font-semibold text-orange-500 text-sm",
                  geistSans.className
                )}
              >
                {selectedCategoryData.label}
              </h2>
            </>
          )}
        </div>

        {/* Search */}
        <div className="border-neutral-200 border-b bg-white px-3 py-2">
          <div className="relative">
            <HugeiconsIcon
              className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-neutral-400"
              icon={Search01Icon}
            />
            <input
              className={cn(
                "w-full rounded-lg border border-neutral-200 bg-white py-1.5 pr-3 pl-9 text-neutral-900 text-sm placeholder-neutral-400 transition-colors focus:border-orange-500 focus:outline-none",
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
          {selectedCategory === "settings" ? (
            <div className="space-y-0.5">
              <Link
                className={cn(
                  "group flex items-start justify-between px-3 py-2.5 transition-all",
                  geistSans.className,
                  pathname === "/admin/settings"
                    ? "bg-orange-50 text-orange-600"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                )}
                href="/admin/settings"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium text-sm">Admin Settings</span>
                  <span className="text-neutral-500 text-xs">System configuration</span>
                </div>
              </Link>
            </div>
          ) : (
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
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.description && (
                        <span className="text-neutral-500 text-xs">{item.description}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {filteredItems.length === 0 && selectedCategory !== "settings" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon className="mb-3 h-8 w-8 text-neutral-300" icon={Search01Icon} />
              <p className="font-medium text-neutral-500 text-sm">No results found</p>
              <p className="mt-1 text-neutral-400 text-xs">Try a different search term</p>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="border-neutral-200 border-t bg-white p-2">
          <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <button
              aria-controls="admin-profile-menu"
              aria-expanded={showProfileMenu}
              className="flex w-full items-center gap-2.5 p-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              type="button"
            >
              {/* Avatar */}
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 font-semibold text-neutral-900 text-xs">
                    {userInitials}
                  </div>
                )}
                <span className="-bottom-0.5 -right-0.5 absolute h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <p
                  className={cn(
                    "truncate font-semibold text-neutral-900 text-sm leading-none",
                    geistSans.className
                  )}
                >
                  {firstName}
                </p>
                <p className="truncate text-neutral-500 text-xs leading-none">{accountEmail}</p>
              </div>

              {/* Chevron */}
              <HugeiconsIcon
                className={cn(
                  "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform",
                  showProfileMenu && "rotate-180"
                )}
                icon={ArrowDown01Icon}
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className={cn(
                "overflow-hidden transition-[max-height,opacity] duration-200",
                showProfileMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
              id="admin-profile-menu"
            >
              <div className="border-neutral-200 border-t bg-neutral-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "font-semibold text-neutral-500 text-xs tracking-wider",
                      geistSans.className
                    )}
                  >
                    Role
                  </span>
                  <span
                    className={cn(
                      "rounded-full border border-neutral-900 bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs tracking-wider",
                      geistSans.className
                    )}
                  >
                    {accountRole}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Link
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 font-medium text-neutral-900 text-xs transition-colors hover:bg-neutral-50"
                    href="/admin/settings"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setSelectedCategory("settings");
                    }}
                  >
                    <span>Settings</span>
                    <HugeiconsIcon className="h-3.5 w-3.5 text-neutral-400" icon={Settings01Icon} />
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
      </div>
    </div>
  );
}
