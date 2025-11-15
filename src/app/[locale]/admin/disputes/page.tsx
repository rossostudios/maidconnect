import { unstable_noStore } from "next/cache";
import { DisputeResolutionDashboard } from "@/components/admin/dispute-resolution-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AdminDisputesPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-3xl text-neutral-900 tracking-tight">Dispute Resolution</h1>
        <p className="mt-2 text-neutral-600">
          Review and resolve booking disputes between users and professionals
        </p>
      </div>

      {/* Dashboard Content */}
      <DisputeResolutionDashboard />
    </div>
  );
}
