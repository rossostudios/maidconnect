import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SiteHeaderClient } from "./SiteHeaderClient";

/**
 * SiteHeader - Lia Design System
 *
 * Professional header following Precision principles:
 * - Clean borders (no shadows)
 * - White background
 * - Geist Sans typography for logo (sharp, professional)
 * - Orange accent on hover
 */
type SiteHeaderProps = {
  overlay?: boolean;
};

export async function SiteHeader({ overlay }: SiteHeaderProps) {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header
      className={cn(
        "top-0 z-50 w-full",
        overlay
          ? "absolute bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-transparent py-4"
          : "sticky border-neutral-200 border-b bg-white py-4"
      )}
    >
      <Container
        className={
          overlay
            ? "grid grid-cols-[auto_1fr_auto] items-center gap-8 text-white"
            : "grid grid-cols-[auto_1fr_auto] items-center gap-8 text-neutral-900"
        }
      >
        {/* Left: Logo */}
        <Link
          className="flex items-center gap-3 no-underline transition-all duration-200 hover:scale-[1.02]"
          href="/"
        >
          <span
            className={cn(
              "font-[family-name:var(--font-geist-sans)] font-semibold uppercase tracking-tight lg:text-2xl",
              overlay ? "text-white" : "text-neutral-900"
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
    </header>
  );
}
