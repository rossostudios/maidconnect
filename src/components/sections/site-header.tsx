import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="bg-[var(--background)] py-4 text-[var(--foreground)] backdrop-blur-[2px] transition-colors duration-300 dark:bg-black/50 dark:text-white">
      <Container className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <span className="font-[family-name:var(--font-cinzel)] font-semibold text-2xl text-[var(--foreground)] tracking-[0.15em] dark:text-white">
            CASAORA
          </span>
        </Link>

        {/* Hamburger Menu for All Screen Sizes */}
        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />
      </Container>
    </header>
  );
}
