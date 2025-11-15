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
    <div className="flex min-h-screen flex-col bg-neutral-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header with logo and navigation - Precision: Sharp edges, neutral palette */}
      <header className="border-neutral-200 border-b bg-neutral-50">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link
              className="font-[family-name:var(--font-geist-sans)] font-bold text-[24px] text-neutral-900 uppercase leading-[24px] tracking-[0.08em]"
              href="/"
            >
              CASAORA
            </Link>

            {/* Navigation tabs - Precision: Geist Sans, neutral-700 for inactive */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    className={`font-medium text-sm transition-colors ${
                      isActive ? "text-neutral-900" : "text-neutral-700 hover:text-neutral-900"
                    }`}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                className="font-medium text-neutral-700 text-sm transition-colors hover:text-neutral-900"
                href={dashboardHref}
              >
                ← Dashboard
              </Link>
            </nav>
          </div>
        </Container>
      </header>

      {/* Main content - Precision: Neutral backgrounds */}
      <main className="flex-1">
        {fullWidth ? (
          children
        ) : (
          <Container className="py-12">
            {title && (
              <div className="mb-8">
                <h1 className="font-bold text-[48px] text-neutral-900 leading-[48px]">{title}</h1>
                {description && (
                  <p className="mt-2 text-base text-neutral-700 leading-[24px]">{description}</p>
                )}
              </div>
            )}
            {children}
          </Container>
        )}
      </main>
    </div>
  );
}
