import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./SiteHeaderClient";

/**
 * SiteHeader - Swiss Design System
 *
 * Minimal header following Swiss principles:
 * - Clean borders (no shadows)
 * - White background
 * - Satoshi typography for logo
 * - Orange accent on hover
 */
export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="sticky top-0 z-50 border-neutral-200 border-b bg-white py-4">
      <Container className="flex items-center justify-between gap-8 text-neutral-900">
        <Link className="transition-opacity hover:opacity-80" href="/">
          <span
            className="font-bold text-xl tracking-tight lg:text-2xl"
            style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
          >
            CASAORA
          </span>
        </Link>

        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />
      </Container>
    </header>
  );
}
