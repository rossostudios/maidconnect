import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AUTH_ROUTES, getDashboardRouteForRole, getSession } from "@/lib/auth";
import { SiteNavigation } from "./site-navigation";

export async function SiteHeader() {
  const { user } = await getSession();

  return (
    <header className="bg-[#fbfaf9] py-4 text-[#211f1a]">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold tracking-tight">MaidConnect</span>
        </Link>
        <SiteNavigation />
        <div className="flex items-center gap-3">
          {user ? (
            <Button
              href={getDashboardRouteForRole(user.role)}
              label="Dashboard"
              className="bg-[#211f1a] text-white hover:bg-[#2d2822]"
            />
          ) : (
            <Button
              href={AUTH_ROUTES.signIn}
              label="Login / Signup"
              className="bg-[#211f1a] text-white hover:bg-[#2d2822]"
            />
          )}
        </div>
      </Container>
    </header>
  );
}
