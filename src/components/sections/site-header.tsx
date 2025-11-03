import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="bg-[#fbfaf9] py-4 text-[#211f1a]">
      <Container className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <img alt="MaidConnect" className="h-6 w-auto" src="/maidconnect logo.svg" />
          <span className="rounded-full bg-[#ff5d46] px-2 py-0.5 font-bold text-[10px] text-white uppercase tracking-wide">
            Beta
          </span>
        </Link>

        {/* Hamburger Menu for All Screen Sizes */}
        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />
      </Container>
    </header>
  );
}
