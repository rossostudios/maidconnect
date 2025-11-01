import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { DashboardFooter } from "@/components/navigation/dashboard-footer";
import { DashboardNavigation } from "@/components/navigation/dashboard-navigation";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";

type Props = {
  children: ReactNode;
};

const adminNavLinks = [
  { href: "/admin", label: "Vetting Queue" },
  { href: "/admin/changelog", label: "Changelog" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/roadmap", label: "Roadmap" },
];

export default async function AdminLayout({ children }: Props) {
  // Require admin role
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf9] text-[var(--foreground)]">
      <div className="flex flex-1 flex-col">
        <header className="bg-[#fbfaf9] py-4">
          <Container className="flex items-center justify-between gap-4">
            <Link className="flex items-center" href="/">
              <span className="font-semibold text-[#211f1a] text-xl tracking-tight">
                MaidConnect
              </span>
            </Link>
            <DashboardNavigation navLinks={adminNavLinks} userRole="professional" />
          </Container>
        </header>

        <main className="flex-1 bg-[#fbfaf9] pt-10 pb-16">
          <Container className="max-w-5xl">
            <Breadcrumbs />
            <div className="space-y-8">{children}</div>
          </Container>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
