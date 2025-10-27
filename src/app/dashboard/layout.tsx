import Link from "next/link";
import { ReactNode } from "react";
import { Container } from "@/components/ui/container";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(253,133,127,0.18),_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-44 -z-10 h-[280px] bg-gradient-to-b from-white/70 via-white/40 to-transparent" />

        <header className="border-b border-[#ebe6de] bg-white/85 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
          <Container className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#211f1a] text-sm font-semibold text-white">
                MC
              </span>
              <span className="text-sm font-semibold tracking-tight text-[#211f1a]">Maidconnect</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-[#524d43]">
              <Link href="/dashboard/pro" className="transition hover:text-[#fd857f]">
                Professional
              </Link>
              <Link href="/dashboard/customer" className="transition hover:text-[#fd857f]">
                Customer
              </Link>
              <Link href="/support/account-suspended" className="transition hover:text-[#fd857f]">
                Support
              </Link>
            </nav>
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
