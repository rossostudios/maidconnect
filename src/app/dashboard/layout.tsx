import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { requireUser } from "@/lib/auth";
import { DashboardNavigation } from "@/components/navigation/dashboard-navigation";

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
    { href: "/dashboard/pro", label: "Overview" },
    { href: "/dashboard/pro#bookings", label: "Bookings" },
    { href: "/dashboard/pro#addons", label: "Add-ons" },
    { href: "/dashboard/pro#messages", label: "Messages" },
    { href: "/dashboard/pro#finances", label: "Finances" },
    { href: "/dashboard/pro#documents", label: "Documents" },
    { href: "/support/account-suspended", label: "Support" },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview" },
    { href: "/dashboard/customer#addresses", label: "Addresses" },
    { href: "/dashboard/customer#bookings", label: "Bookings" },
    { href: "/dashboard/customer#favorites", label: "Favorites" },
    { href: "/dashboard/customer#messages", label: "Messages" },
    { href: "/dashboard/customer#payments", label: "Payments" },
    { href: "/support/account-suspended", label: "Support" },
  ],
};

export default async function DashboardLayout({ children }: Props) {
  const user = await requireUser();
  const navLinks = navByRole[user.role] ?? navByRole.professional;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(253,133,127,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-44 -z-10 h-[280px] bg-gradient-to-b from-white/70 via-white/40 to-transparent" />

        <header className="bg-[#fbfaf9] py-4">
          <Container className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold tracking-tight text-[#211f1a]">MaidConnect</span>
            </Link>
            <DashboardNavigation navLinks={navLinks} />
          </Container>
        </header>

        <main className="pb-16 pt-10">
          <Container className="max-w-5xl">
            <div className="space-y-8">{children}</div>
          </Container>
        </main>
      </div>
    </div>
  );
}
