import { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

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
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      {/* Header with logo and navigation */}
      <header className="border-[#e2e8f0] border-b bg-[#f8fafc]">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link
              className="type-serif-sm text-[#0f172a] uppercase tracking-[0.08em] lg:text-[26px]"
              href="/"
            >
              CASAORA
            </Link>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    className={`font-medium text-sm transition ${
                      isActive ? "text-[#0f172a]" : "text-[#94a3b8] hover:text-[#0f172a]"
                    }`}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                className="font-medium text-[#94a3b8] text-sm transition hover:text-[#0f172a]"
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
          children
        ) : (
          <Container className="py-12">
            {title && (
              <div className="mb-8">
                <h1 className="font-semibold text-4xl text-[#0f172a]">{title}</h1>
                {description && <p className="mt-2 text-[#94a3b8] text-base">{description}</p>}
              </div>
            )}
            {children}
          </Container>
        )}
      </main>
    </div>
  );
}
