import Link from "next/link";
import { ReactNode } from "react";
import { Container } from "@/components/ui/container";

type NavLink = {
  href: string;
  label: string;
};

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  navLinks: NavLink[];
  currentPath: string;
  dashboardHref: string;
  fullWidth?: boolean;
};

export function DashboardLayout({
  children,
  title,
  description,
  navLinks,
  currentPath,
  dashboardHref,
  fullWidth = false,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf9]">
      {/* Header with logo and navigation */}
      <header className="border-[#ebe5d8] border-b bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link className="font-semibold text-[#211f1a] text-xl tracking-tight" href="/">
              MaidConnect
            </Link>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    className={`font-medium text-sm transition ${
                      isActive ? "text-[#211f1a]" : "text-[#7d7566] hover:text-[#211f1a]"
                    }`}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                className="font-medium text-[#7d7566] text-sm transition hover:text-[#211f1a]"
                href={dashboardHref}
              >
                ← Dashboard
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {fullWidth ? (
          <>{children}</>
        ) : (
          <Container className="py-12">
            {title && (
              <div className="mb-8">
                <h1 className="font-semibold text-4xl text-[#211f1a]">{title}</h1>
                {description && <p className="mt-2 text-[#5d574b] text-base">{description}</p>}
              </div>
            )}
            {children}
          </Container>
        )}
      </main>
    </div>
  );
}
