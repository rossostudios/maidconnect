import type { Metadata } from "next";
import { geistSans } from "@/app/fonts";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Applications | Admin Dashboard | Casaora",
  description: "Review professional applications and manage the vetting process",
};

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className={cn("font-semibold text-3xl text-neutral-900 tracking-tight", geistSans.className)}>
          Applications
        </h1>
        <p className={cn("text-neutral-600 text-base", geistSans.className)}>
          Review and manage professional applications for Casaora
        </p>
      </div>

      {/* Main Content - Professional Vetting Dashboard */}
      <ProfessionalVettingDashboard />
    </div>
  );
}
