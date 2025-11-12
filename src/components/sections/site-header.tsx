import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="sticky top-0 z-50 bg-stone-50 py-4 shadow-sm">
      <Container className="flex items-center justify-between gap-8 text-stone-900">
        <Link className="flex items-center gap-2 transition-opacity hover:opacity-80" href="/">
          <span className="font-semibold text-xl uppercase tracking-wider lg:text-2xl">
            CASAORA
          </span>
        </Link>

        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />
      </Container>
    </header>
  );
}
