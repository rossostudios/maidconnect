/**
 * ProSpaceLayout - Reusable Professional Dashboard Page Layout
 *
 * A consistent layout wrapper for all Pro dashboard pages (Dashboard, Wallet, Messages, etc.)
 * Enforces the same:
 * - Padding (p-6 on desktop, p-4 on mobile)
 * - Background colors (neutral-50/background)
 * - Typography (Geist Sans)
 * - Header structure (title + actions)
 * - Max width constraints
 *
 * Usage:
 * ```tsx
 * <ProSpaceLayout
 *   title="My Earnings"
 *   subtitle="Track your income and payouts"
 *   actions={<Button>Withdraw</Button>}
 * >
 *   <YourPageContent />
 * </ProSpaceLayout>
 * ```
 *
 * Following Lia Design System with Casaora Dark Mode palette.
 */

"use client";

import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

// ========================================
// Types
// ========================================

type ProSpaceLayoutProps = {
  /** Page title (e.g., "My Earnings", "Messages") */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Action buttons to display in the header (right side) */
  actions?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Additional className for the outer container */
  className?: string;
  /** Show the Safety Center button in header (default: true) */
  showSafetyButton?: boolean;
  /** Custom max-width constraint (default: max-w-7xl) */
  maxWidth?: "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-full";
  /** Background style (default: neutral) */
  background?: "neutral" | "white" | "transparent";
};

// ========================================
// Component
// ========================================

export function ProSpaceLayout({
  title,
  subtitle,
  actions,
  children,
  className,
  showSafetyButton = true,
  maxWidth = "max-w-7xl",
  background = "neutral",
}: ProSpaceLayoutProps) {
  const router = useRouter();

  const handleSafetyCenter = () => {
    router.push("/dashboard/pro/settings?tab=safety");
  };

  const backgroundClasses = {
    neutral: "bg-neutral-50 dark:bg-background",
    white: "bg-white dark:bg-background",
    transparent: "bg-transparent",
  };

  return (
    <div className={cn("min-h-screen", backgroundClasses[background], className)}>
      <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:px-8", maxWidth)}>
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Title + Subtitle */}
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "font-semibold text-2xl tracking-tight",
                "text-neutral-900 dark:text-foreground",
                geistSans.className
              )}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "mt-1 text-sm",
                  "text-neutral-600 dark:text-muted-foreground",
                  geistSans.className
                )}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
            {/* Safety Center Button (optional) */}
            {showSafetyButton && (
              <button
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm",
                  "border-amber-500/30 bg-amber-500/10 text-amber-600",
                  "dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
                  "hover:bg-amber-500/20",
                  "transition-colors",
                  geistSans.className
                )}
                onClick={handleSafetyCenter}
                title="Safety Center - Get help or report an issue"
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4" icon={HelpCircleIcon} />
                <span className="hidden sm:inline">Safety</span>
              </button>
            )}

            {/* Custom Actions */}
            {actions}
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

// ========================================
// Sub-Components for Consistency
// ========================================

/**
 * ProSpaceCard - Consistent card styling for Pro pages
 */
type ProSpaceCardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function ProSpaceCard({ title, children, className, actions }: ProSpaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        "border-neutral-200 bg-white",
        "dark:border-border dark:bg-background",
        className
      )}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3
              className={cn(
                "font-semibold text-sm",
                "text-neutral-900 dark:text-foreground",
                geistSans.className
              )}
            >
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * ProSpaceSection - Section divider with title
 */
type ProSpaceSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ProSpaceSection({ title, description, children, className }: ProSpaceSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2
          className={cn(
            "font-semibold text-lg",
            "text-neutral-900 dark:text-foreground",
            geistSans.className
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-0.5 text-sm",
              "text-neutral-600 dark:text-muted-foreground",
              geistSans.className
            )}
          >
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * ProSpaceEmptyState - Consistent empty state styling
 */
type ProSpaceEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ProSpaceEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: ProSpaceEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-muted">
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-medium text-base",
          "text-neutral-700 dark:text-foreground",
          geistSans.className
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-neutral-500 text-sm dark:text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * ProSpaceGrid - Responsive grid for cards
 */
type ProSpaceGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

export function ProSpaceGrid({ children, columns = 3, className }: ProSpaceGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={cn("grid gap-4", gridClasses[columns], className)}>{children}</div>;
}

/**
 * ProSpaceStat - Small stat display for quick metrics
 */
type ProSpaceStatProps = {
  label: string;
  value: string | number;
  trend?: number;
  className?: string;
};

export function ProSpaceStat({ label, value, trend, className }: ProSpaceStatProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className={cn("text-center", className)}>
      <p
        className={cn(
          "font-bold text-2xl",
          "text-neutral-900 dark:text-foreground",
          geistSans.className
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-neutral-500 text-xs dark:text-muted-foreground">{label}</p>
      {trend !== undefined && (
        <p
          className={cn("mt-1 font-medium text-xs", isPositive ? "text-green-500" : "text-red-500")}
        >
          {isPositive ? "+" : ""}
          {trend}%
        </p>
      )}
    </div>
  );
}
