import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SiteHeaderClient } from "./SiteHeaderClient";
import { StickyHeaderWrapper } from "./StickyHeaderWrapper";

/**
 * SiteHeader - Lia Design System
 *
 * Professional header following Precision principles:
 * - Clean borders (no shadows)
 * - White background (or transparent over hero)
 * - Geist Sans typography for logo (sharp, professional)
 * - Orange accent on hover
 * - Scroll-aware: transitions from transparent to frosted glass on scroll
 */
type SiteHeaderProps = {
  overlay?: boolean;
};

export async function SiteHeader({ overlay }: SiteHeaderProps) {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <StickyHeaderWrapper overlay={overlay}>
      <Container
        className={cn(
          "grid grid-cols-[auto_1fr_auto] items-center gap-8",
          overlay ? "px-4 sm:px-6" : ""
        )}
      >
        {/* Left: Logo */}
        <Link
          className={cn(
            "flex items-center gap-3 no-underline",
            // Refined spring transition
            "transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
            // Subtle hover lift effect
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
          href="/"
        >
          <span
            className={cn(
              "font-[family-name:var(--font-geist-sans)] font-semibold uppercase tracking-tight lg:text-2xl",
              // Consistent dark text (glass pill is always visible)
              "text-neutral-900"
            )}
          >
            CASAORA®
          </span>
        </Link>

        {/* Center & Right: Navigation */}
        <SiteHeaderClient
          dashboardHref={dashboardHref}
          isAuthenticated={!!user}
          overlay={overlay}
        />
      </Container>
    </StickyHeaderWrapper>
  );
}
