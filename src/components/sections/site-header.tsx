import { DashboardButton } from "@/components/navigation/dashboard-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { AUTH_ROUTES, getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteNavigation } from "./site-navigation";

export async function SiteHeader() {
  const { user } = await getSession();

  return (
    <header className="bg-[#fbfaf9] py-4 text-[#211f1a]">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <Link className="flex items-center" href="/">
          <span className="font-semibold text-xl tracking-tight">MaidConnect</span>
        </Link>
        <SiteNavigation />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <DashboardButton href={getDashboardRouteForRole(user.role)} />
          ) : (
            <Button
              className="bg-[#211f1a] text-white hover:bg-[#2d2822]"
              href={AUTH_ROUTES.signIn}
              label="Login / Signup"
            />
          )}
        </div>
      </Container>
    </header>
  );
}
