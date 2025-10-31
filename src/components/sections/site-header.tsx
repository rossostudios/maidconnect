import { DashboardButton } from "@/components/navigation/dashboard-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES, getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const { user } = await getSession();
  const dashboardHref = user ? getDashboardRouteForRole(user.role) : undefined;

  return (
    <header className="bg-[#fbfaf9] py-4 text-[#211f1a]">
      <Container className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <span className="font-semibold text-xl tracking-tight">MaidConnect</span>
          <span className="rounded-full bg-[#ff5d46] px-2 py-0.5 font-bold text-[10px] text-white uppercase tracking-wide">
            Beta
          </span>
        </Link>

        {/* Desktop & Mobile Navigation */}
        <SiteHeaderClient dashboardHref={dashboardHref} isAuthenticated={!!user} />

        {/* Desktop Auth Buttons - Hidden on mobile */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <DashboardButton href={getDashboardRouteForRole(user.role)} />
          ) : (
            <Button
              className="bg-[#211f1a] text-white hover:bg-[#2d2822]"
              href={AUTH_ROUTES.signIn}
              kbd="L"
              label="Login / Signup"
            />
          )}
        </div>

        {/* Mobile Language Switcher - Show on mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
        </div>
      </Container>
    </header>
  );
}
