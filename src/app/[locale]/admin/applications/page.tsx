import type { Metadata } from "next";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";

export const metadata: Metadata = {
  title: "Applications | Admin Dashboard | Casaora",
  description: "Review professional applications and manage the vetting process",
};

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl text-neutral-900 tracking-tight sm:text-4xl">
          Applications
        </h1>
        <p className="text-lg text-neutral-600">
          Review and manage professional applications for Casaora
        </p>
      </div>

      {/* Main Content - Professional Vetting Dashboard */}
      <ProfessionalVettingDashboard />
    </div>
  );
}
