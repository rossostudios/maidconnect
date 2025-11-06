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
    <div className="flex min-h-screen flex-col bg-[#fbf9f7]">
      {/* Header with logo and navigation */}
      <header className="border-[#ebe5d8] border-b bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link
              className="type-serif-sm text-gray-900 uppercase tracking-[0.08em] lg:text-[26px]"
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
                      isActive ? "text-gray-900" : "text-[#7d7566] hover:text-gray-900"
                    }`}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                className="font-medium text-[#7d7566] text-sm transition hover:text-gray-900"
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
                <h1 className="font-semibold text-4xl text-gray-900">{title}</h1>
                {description && <p className="mt-2 text-base text-gray-600">{description}</p>}
              </div>
            )}
            {children}
          </Container>
        )}
      </main>
    </div>
  );
}
