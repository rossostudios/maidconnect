import type { Metadata } from "next";
import { geistSans } from "@/app/fonts";
import { AmbassadorReviewDashboard } from "@/components/admin/ambassador-review-dashboard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ambassador Applications | Admin Dashboard | Casaora",
  description: "Review and manage ambassador program applications",
};

export default function AmbassadorApplicationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 tracking-tight",
            geistSans.className
          )}
        >
          Ambassador Applications
        </h1>
        <p className={cn("text-base text-neutral-600", geistSans.className)}>
          Review and manage ambassador program applications for Casaora
        </p>
      </div>

      {/* Main Content - Ambassador Review Dashboard */}
      <AmbassadorReviewDashboard />
    </div>
  );
}
