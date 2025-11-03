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

const navByRole: Record<
  string,
  Array<{
    href: string;
    label: string;
  }>
> = {
  professional: [
    { href: "/dashboard/pro/bookings", label: "Bookings" },
    { href: "/dashboard/pro/availability", label: "Availability" },
    { href: "/dashboard/pro/finances", label: "Finances" },
    { href: "/dashboard/pro/profile", label: "Profile" },
  ],
  customer: [
    { href: "/dashboard/customer/bookings", label: "Bookings" },
    { href: "/dashboard/customer/favorites", label: "Favorites" },
    { href: "/dashboard/customer/payments", label: "Payments" },
  ],
};

export default async function DashboardLayout({ children }: Props) {
  const user = await requireUser();
  const navLinks = navByRole[user.role] ?? navByRole.professional ?? [];
  const userRole =
    user.role === "customer" || user.role === "professional" ? user.role : "professional";

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf9] text-[var(--foreground)]">
      <div className="flex flex-1 flex-col">
        <header className="bg-[#fbfaf9] py-4">
          <Container className="flex items-center justify-between gap-4">
            <Link className="flex items-center" href="/">
              <span className="font-semibold text-[#211f1a] text-xl tracking-tight">
                Casaora
              </span>
            </Link>
            <DashboardNavigation navLinks={navLinks} userRole={userRole} />
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
