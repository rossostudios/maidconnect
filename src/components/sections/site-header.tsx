import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { AUTH_ROUTES, getDashboardRouteForRole, getSession } from "@/lib/auth";

const links = [
  { href: "/professionals", label: "Professionals" },
  { href: "#services", label: "Services" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#testimonials", label: "Stories" },
  { href: "#capabilities", label: "Platform" },
];

export async function SiteHeader() {
  const { user } = await getSession();

  return (
    <header className="border-b border-[#1b1916] bg-[#11100e] py-4 text-white">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#11100e]">
            MC
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Maidconnect
          </span>
        </Link>
        <nav className="order-3 flex w-full justify-between gap-4 text-sm font-medium text-[#d0cbc2] sm:order-none sm:w-auto sm:justify-end">
          <div className="flex w-full items-center justify-between gap-4 overflow-x-auto sm:w-auto sm:overflow-visible">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap transition hover:text-[#fd857f]">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button href={getDashboardRouteForRole(user.role)} label="Dashboard" variant="secondary" />
          ) : (
            <Button href={AUTH_ROUTES.signIn} label="Login / Signup" variant="secondary" />
          )}
        </div>
      </Container>
    </header>
  );
}
