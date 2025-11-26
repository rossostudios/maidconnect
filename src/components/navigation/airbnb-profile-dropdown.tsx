"use client";

/**
 * Airbnb Profile Dropdown Component
 *
 * Header avatar dropdown with user info, navigation shortcuts, and sign out.
 * Inspired by Airbnb's profile menu design.
 *
 * Lia Design System: rounded-lg, rausch accent, Geist typography.
 */

import {
  HelpCircleIcon,
  LanguageSquareIcon,
  Loading03Icon,
  Location01Icon,
  Logout01Icon,
  Settings02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale } from "@/i18n";
import { usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import type { HugeIcon } from "@/types/icons";

export type ProfileDropdownUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: "professional" | "customer" | "admin";
};

export type AirbnbProfileDropdownProps = {
  user: ProfileDropdownUser;
  /** Country code for professionals (e.g., "CO") */
  countryCode?: string;
  /** Show country switcher (Pro only) */
  showCountrySwitcher?: boolean;
  /** Base path for settings links */
  settingsBasePath?: string;
  /** Additional menu items for specific dashboards */
  additionalItems?: Array<{
    href: string;
    label: string;
    icon: HugeIcon;
  }>;
  /** Additional CSS classes */
  className?: string;
};

const COUNTRIES: Record<string, { name: string; flag: string }> = {
  CO: { name: "Colombia", flag: "🇨🇴" },
  PY: { name: "Paraguay", flag: "🇵🇾" },
  UY: { name: "Uruguay", flag: "🇺🇾" },
  AR: { name: "Argentina", flag: "🇦🇷" },
};

const ROLE_LABELS: Record<ProfileDropdownUser["role"], string> = {
  professional: "Professional",
  customer: "Customer",
  admin: "Administrator",
};

const ROLE_COLORS: Record<ProfileDropdownUser["role"], string> = {
  professional:
    "bg-babu-50 dark:bg-babu-900/20 text-babu-700 dark:text-babu-300 border-babu-200 dark:border-babu-800",
  customer:
    "bg-rausch-50 dark:bg-rausch-900/20 text-rausch-700 dark:text-rausch-300 border-rausch-200 dark:border-rausch-800",
  admin: "bg-muted text-muted-foreground border-border",
};

export function AirbnbProfileDropdown({
  user,
  countryCode,
  showCountrySwitcher = false,
  settingsBasePath = "/dashboard/account",
  additionalItems,
  className,
}: AirbnbProfileDropdownProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isLoading = isPending || isSigningOut;

  const handleSignOut = () => {
    setIsSigningOut(true);
    startTransition(async () => {
      try {
        await signOutAction();
      } catch {
        setIsSigningOut(false);
      }
    });
  };

  const switchLanguage = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const country = countryCode ? COUNTRIES[countryCode] : null;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open profile menu"
          className={cn(
            "flex items-center gap-2 rounded-full p-1 transition-colors",
            "hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
            className
          )}
          type="button"
        >
          {user.avatarUrl ? (
            <Image
              alt={user.name}
              className="rounded-full object-cover ring-2 ring-background"
              height={36}
              src={user.avatarUrl}
              width={36}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rausch-500 text-white ring-2 ring-rausch-100">
              <span className="font-semibold text-sm">{initials}</span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Section */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <Image
                alt={user.name}
                className="rounded-full object-cover ring-2 ring-background"
                height={44}
                src={user.avatarUrl}
                width={44}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rausch-500 text-white">
                <span className="font-semibold text-base">{initials}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground text-sm">{user.name}</p>
              <p className="truncate text-muted-foreground text-xs">{user.email}</p>
            </div>
          </div>
          {/* Role Badge */}
          <div className="mt-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-xs",
                ROLE_COLORS[user.role]
              )}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Main Links */}
        <DropdownMenuItem>
          <Link className="flex w-full items-center gap-3" href={`${settingsBasePath}/profile`}>
            <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={UserCircleIcon} />
            <span>Your Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link className="flex w-full items-center gap-3" href={`${settingsBasePath}/settings`}>
            <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Settings02Icon} />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>

        {/* Additional Dashboard-Specific Items */}
        {additionalItems && additionalItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {additionalItems.map((item) => (
              <DropdownMenuItem key={item.href}>
                <Link className="flex w-full items-center gap-3" href={item.href}>
                  <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuItem>
          <Link className="flex w-full items-center gap-3" href={`/${locale}/help`}>
            <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={HelpCircleIcon} />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Country Switcher (Pro only) */}
        {showCountrySwitcher && country && (
          <DropdownMenuLabel className="flex items-center gap-3 font-normal text-muted-foreground text-xs">
            <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
            <span>
              {country.flag} {country.name}
            </span>
          </DropdownMenuLabel>
        )}

        {/* Language Switcher */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-3 px-2">
            <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={LanguageSquareIcon} />
            <div className="flex flex-1 gap-1">
              <button
                className={cn(
                  "flex-1 rounded px-3 py-1 font-medium text-xs transition-colors",
                  locale === "en"
                    ? "bg-rausch-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => switchLanguage("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={cn(
                  "flex-1 rounded px-3 py-1 font-medium text-xs transition-colors",
                  locale === "es"
                    ? "bg-rausch-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => switchLanguage("es")}
                type="button"
              >
                ES
              </button>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          className={cn(
            "flex cursor-pointer items-center gap-3 text-rausch-600",
            isLoading && "cursor-wait opacity-50"
          )}
          onSelect={handleSignOut}
        >
          {isLoading ? (
            <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
          ) : (
            <HugeiconsIcon className="h-4 w-4" icon={Logout01Icon} />
          )}
          <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
