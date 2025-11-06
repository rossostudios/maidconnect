import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="sticky top-0 z-50 border-[var(--border)] border-b bg-white py-4 text-[var(--foreground)] shadow-sm">
      <Container className="flex items-center justify-between gap-8">
        {/* Logo */}
        <Link className="flex items-center gap-2 transition-opacity hover:opacity-80" href="/">
          <span className="type-serif-sm text-[var(--foreground)] uppercase tracking-[0.08em] lg:text-[28px]">
            CASAORA
          </span>
        </Link>

        {/* Navigation */}
        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />
      </Container>
    </header>
  );
}
