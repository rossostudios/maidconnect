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
    <header className="border-b border-[#e5dfd4] bg-[#fbfaf9] py-4 text-[#211f1a]">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <Link href="/" className="flex items-center">
          <span className="text-sm font-semibold tracking-tight">MaidConnect</span>
        </Link>
        <nav className="order-3 flex w-full justify-between gap-4 text-sm font-medium text-[#211f1a] sm:order-none sm:w-auto sm:justify-end">
          <div className="flex w-full items-center justify-between gap-4 overflow-x-auto sm:w-auto sm:overflow-visible">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-[#211f1a] transition hover:text-[#5d574b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd857f]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button
              href={getDashboardRouteForRole(user.role)}
              label="Dashboard"
              variant="secondary"
              className="border-[#211f1a] text-[#211f1a]"
            />
          ) : (
            <Button
              href={AUTH_ROUTES.signIn}
              label="Login / Signup"
              variant="secondary"
              className="border-[#211f1a] text-[#211f1a]"
            />
          )}
        </div>
      </Container>
    </header>
  );
}
