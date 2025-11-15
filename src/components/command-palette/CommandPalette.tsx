/**
 * Unified Command Palette
 *
 * A single, beautiful Command K experience that unifies:
 * - Navigation commands (Go to...)
 * - Help article search
 * - Professional search
 * - Changelog & roadmap items
 * - Recent items and quick actions
 *
 * Inspired by Linear, Vercel, and GitHub command palettes
 */

"use client";

import {
  BookmarkAdd01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  HelpCircleIcon,
  Home01Icon,
  Loading03Icon,
  LocationAdd01Icon,
  Notification03Icon,
  Search01Icon,
  TaskDaily01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Command } from "cmdk";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useRecentItems } from "@/hooks/useRecent";
import { useRouter } from "@/i18n/routing";
import type { AppRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon?: unknown; // HugeIcons icon object
  action: () => void;
  category: string;
  roles?: AppRole[];
  keywords?: string[];
};

type SearchResult = {
  id: string;
  type: "help_article" | "changelog" | "roadmap" | "city_page" | "professional";
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
};

type UnifiedCommandPaletteProps = {
  role?: AppRole;
  dashboardPath?: string;
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
};

export function UnifiedCommandPalette({
  role,
  dashboardPath,
  externalOpen,
  onExternalOpenChange,
}: UnifiedCommandPaletteProps) {
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { recentItems, addRecentItem } = useRecentItems();

  // Sync external open state with internal state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setOpen(externalOpen);
    }
  }, [externalOpen]);

  // Handle internal state changes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      onExternalOpenChange?.(newOpen);
    },
    [onExternalOpenChange]
  );

  // Navigate helper - now tracks recent items
  const navigate = useCallback(
    (path: string, itemTitle?: string, itemDescription?: string) => {
      // Track this navigation in recent items
      if (itemTitle) {
        addRecentItem({
          id: path,
          title: itemTitle,
          description: itemDescription,
          url: path,
          type: "page",
        });
      }

      router.push(path);
      handleOpenChange(false);
    },
    [router, addRecentItem, handleOpenChange]
  );

  // Search effect - fetch results from APIs when user types
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results: SearchResult[] = [];

      try {
        // Search Sanity content (help articles, changelog, roadmap, city pages)
        const sanityParams = new URLSearchParams({
          q: debouncedSearch,
          locale,
          type: "all",
          limit: "10",
        });
        const sanityResponse = await fetch(`/api/search?${sanityParams.toString()}`);
        if (sanityResponse.ok) {
          const sanityData = await sanityResponse.json();
          if (sanityData.success && sanityData.data) {
            results.push(...sanityData.data);
          }
        }

        // Search professionals
        const profParams = new URLSearchParams({
          q: debouncedSearch,
          limit: "5",
        });
        const profResponse = await fetch(`/api/professionals/search?${profParams.toString()}`);
        if (profResponse.ok) {
          const profData = await profResponse.json();
          if (profData.results) {
            // Transform professional results to match SearchResult type
            results.push(
              ...profData.results.map((prof: any) => ({
                id: prof.id,
                type: "professional" as const,
                title: prof.name,
                description: prof.service || prof.location,
                url: `/${locale}/professionals/${prof.id}`,
                metadata: {
                  location: prof.location,
                  service: prof.service,
                  photoUrl: prof.photoUrl,
                  rating: prof.rating,
                  reviewCount: prof.reviewCount,
                },
              }))
            );
          }
        }

        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch, locale]);

  // Define all navigation commands
  const allCommands: CommandItem[] = [
    // Navigation - Dashboard
    {
      id: "goto-dashboard",
      label: "Go to Dashboard",
      description: "View your dashboard home",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      keywords: ["home", "dashboard", "main"],
      action: () => {
        if (dashboardPath) {
          navigate(dashboardPath, "Dashboard", "View your dashboard home");
        }
      },
    },
    // Navigation - Home
    {
      id: "goto-home",
      label: "Go to Home",
      description: "Return to the homepage",
      icon: Home01Icon,
      category: "Navigation",
      keywords: ["home", "main", "landing"],
      action: () => navigate("/", "Home", "Return to the homepage"),
    },
    // Navigation - Bookings
    {
      id: "goto-bookings",
      label: "Go to Bookings",
      description: "Manage your bookings",
      icon: BookmarkAdd01Icon,
      category: "Navigation",
      keywords: ["bookings", "appointments", "reservations"],
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/bookings");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/bookings");
        }
      },
    },
    // Navigation - Profile (professional only)
    {
      id: "goto-profile",
      label: "Go to Profile",
      description: "Edit your professional profile",
      icon: UserIcon,
      category: "Navigation",
      roles: ["professional"],
      keywords: ["profile", "edit", "settings"],
      action: () => navigate("/dashboard/pro/profile"),
    },
    // Navigation - Favorites (customer only)
    {
      id: "goto-favorites",
      label: "Go to Favorites",
      description: "View your favorite professionals",
      icon: BookmarkAdd01Icon,
      category: "Navigation",
      roles: ["customer"],
      keywords: ["favorites", "saved", "bookmarked"],
      action: () => navigate("/dashboard/customer/favorites"),
    },
    // Navigation - Payments/Finances
    {
      id: "goto-payments",
      label: role === "professional" ? "Go to Finances" : "Go to Payments",
      description:
        role === "professional" ? "View your earnings and payouts" : "View your payment history",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      keywords: ["payments", "finances", "money", "earnings"],
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/payments");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/finances");
        }
      },
    },
    // Navigation - Availability (professional only)
    {
      id: "goto-availability",
      label: "Go to Availability",
      description: "Manage your availability calendar",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["professional"],
      keywords: ["availability", "calendar", "schedule"],
      action: () => navigate("/dashboard/pro/availability"),
    },
    // Navigation - Portfolio (professional only)
    {
      id: "goto-portfolio",
      label: "Go to Portfolio",
      description: "Manage your work portfolio",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["professional"],
      keywords: ["portfolio", "gallery", "work", "photos"],
      action: () => navigate("/dashboard/pro/portfolio"),
    },
    // Navigation - Lead Queue (professional only)
    {
      id: "goto-leads",
      label: "Go to Lead Queue",
      description: "View pending booking requests",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["professional"],
      keywords: ["leads", "requests", "queue"],
      action: () => navigate("/dashboard/pro/leads"),
    },
    // Navigation - Documents (professional only)
    {
      id: "goto-documents",
      label: "Go to Documents",
      description: "Manage verification documents",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["professional"],
      keywords: ["documents", "verification", "files"],
      action: () => navigate("/dashboard/pro/documents"),
    },
    // Navigation - Addresses (customer only)
    {
      id: "goto-addresses",
      label: "Go to Addresses",
      description: "Manage your service addresses",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["customer"],
      keywords: ["addresses", "locations"],
      action: () => navigate("/dashboard/customer/addresses"),
    },
    // Navigation - Recurring Plans (customer only)
    {
      id: "goto-recurring-plans",
      label: "Go to Recurring Plans",
      description: "Manage your recurring service plans",
      icon: DashboardSquare01Icon,
      category: "Navigation",
      roles: ["customer"],
      keywords: ["recurring", "plans", "subscriptions"],
      action: () => navigate("/dashboard/customer/recurring-plans"),
    },
    // Actions - Find Professional (customer only)
    {
      id: "find-professional",
      label: "Find a Professional",
      description: "Search and book a professional",
      icon: Search01Icon,
      category: "Actions",
      roles: ["customer"],
      keywords: ["find", "search", "book", "hire"],
      action: () => navigate("/professionals"),
    },
    // Actions - View Professionals (guest)
    {
      id: "view-professionals",
      label: "Browse Professionals",
      description: "Explore our professional network",
      icon: Search01Icon,
      category: "Actions",
      keywords: ["browse", "professionals", "explore"],
      action: () => navigate("/professionals"),
    },
    // Settings
    {
      id: "goto-settings",
      label: "Go to Settings",
      description: "Manage your account settings",
      icon: DashboardSquare01Icon,
      category: "Settings",
      keywords: ["settings", "preferences", "account"],
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/settings");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/settings");
        }
      },
    },
  ];

  // Filter commands by role
  const commands = allCommands.filter((cmd) => {
    if (!cmd.roles) {
      return true;
    }
    if (!role) {
      return false;
    }
    return cmd.roles.includes(role);
  });

  // Group commands by category
  const categories = Array.from(new Set(commands.map((cmd) => cmd.category)));

  // Handle Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleOpenChange]);

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Command.Dialog
      className="-translate-x-1/2 fixed top-[20%] left-1/2 z-[100] w-full max-w-2xl overflow-hidden border border-neutral-200/60 bg-[neutral-50] shadow-[0_24px_60px_rgba(22,22,22,0.20)] dark:border-neutral-700/60"
      onOpenChange={handleOpenChange}
      open={open}
      shouldFilter
    >
      {/* Visually hidden title for accessibility */}
      <span className="sr-only">Command Palette</span>

      {/* Search Input */}
      <div className="flex items-center border-neutral-200/60 border-b px-4 dark:border-neutral-700/60">
        <HugeiconsIcon
          aria-hidden="true"
          className="mr-3 h-5 w-5 flex-shrink-0 text-[neutral-400]"
          icon={Search01Icon}
        />
        <Command.Input
          className="h-14 w-full bg-transparent font-medium text-[neutral-900] text-base placeholder:text-[neutral-400] focus:outline-none"
          onValueChange={setSearch}
          placeholder="Search for commands, help articles, professionals..."
          value={search}
        />
        <button
          aria-label="Close command palette"
          className="ml-2 flex-shrink-0 p-2 text-[neutral-400] transition-colors hover:bg-[neutral-50] hover:text-[neutral-900]"
          onClick={() => handleOpenChange(false)}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
        </button>
      </div>

      {/* Command List */}
      <Command.List className="max-h-[400px] overflow-y-auto p-2">
        {/* Empty State */}
        <Command.Empty className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-3 bg-[neutral-50] p-3">
            <HugeiconsIcon className="h-6 w-6 text-[neutral-400]" icon={Search01Icon} />
          </div>
          <p className="mb-1 font-semibold text-[neutral-900] text-sm">No results found</p>
          <p className="text-[neutral-400] text-xs">Try searching for something else</p>
        </Command.Empty>

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center px-4 py-8">
            <HugeiconsIcon
              className="h-5 w-5 animate-spin text-[neutral-500]"
              icon={Loading03Icon}
            />
            <span className="ml-2 text-[neutral-400] text-sm">Searching...</span>
          </div>
        )}

        {/* Recent Items - Show when search is empty */}
        {!(isSearching || search) && recentItems.length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Recent"
          >
            {recentItems.map((item) => (
              <Command.Item
                className={cn(
                  "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                  "text-[neutral-900]",
                  "hover:bg-[neutral-50]",
                  "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                )}
                key={item.id}
                onSelect={() => navigate(item.url, item.title, item.description)}
                value={`${item.title} ${item.description || ""}`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                  <HugeiconsIcon className="h-4 w-4" icon={DashboardSquare01Icon as never} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold">{item.title}</span>
                  {item.description && (
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {item.description}
                    </span>
                  )}
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* Command Groups */}
        {!isSearching &&
          categories.map((category) => (
            <Command.Group
              className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              heading={category}
              key={category}
            >
              {commands
                .filter((cmd) => cmd.category === category)
                .map((cmd) => (
                  <Command.Item
                    className={cn(
                      "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                      "text-[neutral-900]",
                      "hover:bg-[neutral-50]",
                      "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                    )}
                    key={cmd.id}
                    onSelect={() => {
                      cmd.action();
                    }}
                    value={`${cmd.label} ${cmd.description || ""} ${cmd.keywords?.join(" ") || ""}`}
                  >
                    {cmd.icon !== undefined && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                        <HugeiconsIcon className="h-4 w-4" icon={cmd.icon as never} />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate font-semibold">{cmd.label}</span>
                      {cmd.description && (
                        <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                          {cmd.description}
                        </span>
                      )}
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>
          ))}

        {/* Search Results - Help Articles */}
        {!isSearching && searchResults.filter((r) => r.type === "help_article").length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Help Articles"
          >
            {searchResults
              .filter((r) => r.type === "help_article")
              .map((result) => (
                <Command.Item
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    "text-[neutral-900]",
                    "hover:bg-[neutral-50]",
                    "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                  )}
                  key={result.id}
                  onSelect={() => navigate(result.url, result.title, result.description)}
                  value={`${result.title} ${result.description}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                    <HugeiconsIcon className="h-4 w-4" icon={HelpCircleIcon as never} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{result.title}</span>
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {result.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
          </Command.Group>
        )}

        {/* Search Results - Professionals */}
        {!isSearching && searchResults.filter((r) => r.type === "professional").length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Professionals"
          >
            {searchResults
              .filter((r) => r.type === "professional")
              .map((result) => (
                <Command.Item
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    "text-[neutral-900]",
                    "hover:bg-[neutral-50]",
                    "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                  )}
                  key={result.id}
                  onSelect={() => navigate(result.url, result.title, result.description)}
                  value={`${result.title} ${result.description}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                    <HugeiconsIcon className="h-4 w-4" icon={UserIcon as never} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{result.title}</span>
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {result.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
          </Command.Group>
        )}

        {/* Search Results - Changelog */}
        {!isSearching && searchResults.filter((r) => r.type === "changelog").length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Changelog"
          >
            {searchResults
              .filter((r) => r.type === "changelog")
              .map((result) => (
                <Command.Item
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    "text-[neutral-900]",
                    "hover:bg-[neutral-50]",
                    "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                  )}
                  key={result.id}
                  onSelect={() => navigate(result.url, result.title, result.description)}
                  value={`${result.title} ${result.description}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                    <HugeiconsIcon className="h-4 w-4" icon={Notification03Icon as never} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{result.title}</span>
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {result.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
          </Command.Group>
        )}

        {/* Search Results - Roadmap */}
        {!isSearching && searchResults.filter((r) => r.type === "roadmap").length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Roadmap"
          >
            {searchResults
              .filter((r) => r.type === "roadmap")
              .map((result) => (
                <Command.Item
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    "text-[neutral-900]",
                    "hover:bg-[neutral-50]",
                    "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                  )}
                  key={result.id}
                  onSelect={() => navigate(result.url, result.title, result.description)}
                  value={`${result.title} ${result.description}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                    <HugeiconsIcon className="h-4 w-4" icon={TaskDaily01Icon as never} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{result.title}</span>
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {result.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
          </Command.Group>
        )}

        {/* Search Results - City Pages */}
        {!isSearching && searchResults.filter((r) => r.type === "city_page").length > 0 && (
          <Command.Group
            className="[&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[neutral-400] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            heading="Cities"
          >
            {searchResults
              .filter((r) => r.type === "city_page")
              .map((result) => (
                <Command.Item
                  className={cn(
                    "group relative mb-1 flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-all",
                    "text-[neutral-900]",
                    "hover:bg-[neutral-50]",
                    "aria-selected:bg-[neutral-900] aria-selected:text-[neutral-50] aria-selected:shadow-sm"
                  )}
                  key={result.id}
                  onSelect={() => navigate(result.url, result.title, result.description)}
                  value={`${result.title} ${result.description}`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[neutral-50] text-[neutral-500] transition-colors group-hover:bg-white group-aria-selected:bg-white/20 group-aria-selected:text-[neutral-50]">
                    <HugeiconsIcon className="h-4 w-4" icon={LocationAdd01Icon as never} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-semibold">{result.title}</span>
                    <span className="truncate text-[neutral-400] text-xs group-aria-selected:text-[neutral-50]/80">
                      {result.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
          </Command.Group>
        )}
      </Command.List>

      {/* Footer */}
      <div className="flex items-center gap-4 border-neutral-200/60 border-t bg-[neutral-50] px-4 py-3 text-[neutral-400] text-xs dark:border-neutral-700/60">
        <div className="flex items-center gap-1.5">
          <kbd className="border border-neutral-200/60 bg-white px-2 py-1 font-mono text-[10px] text-[neutral-500] shadow-sm dark:border-neutral-700/60">
            ↑↓
          </kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="border border-neutral-200/60 bg-white px-2 py-1 font-mono text-[10px] text-[neutral-500] shadow-sm dark:border-neutral-700/60">
            ↵
          </kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-1.5">
          <kbd className="border border-neutral-200/60 bg-white px-2 py-1 font-mono text-[10px] text-[neutral-500] shadow-sm dark:border-neutral-700/60">
            Esc
          </kbd>
          <span>Close</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <kbd className="border border-neutral-200/60 bg-white px-2 py-1 font-mono text-[10px] text-[neutral-500] shadow-sm dark:border-neutral-700/60">
            ⌘K
          </kbd>
          <span>to open</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
