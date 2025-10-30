import { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import Link from "next/link";

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
  fullWidth = false
}: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf9]">
      {/* Header with logo and navigation */}
      <header className="border-b border-[#ebe5d8] bg-white">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight text-[#211f1a]">
              MaidConnect
            </Link>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition ${
                      isActive
                        ? "text-[#211f1a]"
                        : "text-[#7d7566] hover:text-[#211f1a]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-[#7d7566] transition hover:text-[#211f1a]"
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
                <h1 className="text-4xl font-semibold text-[#211f1a]">{title}</h1>
                {description && (
                  <p className="mt-2 text-base text-[#5d574b]">{description}</p>
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
