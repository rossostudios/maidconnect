import { unstable_noStore } from "next/cache";
import { DisputeResolutionDashboard } from "@/components/admin/dispute-resolution-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AdminDisputesPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">Dispute Resolution</h1>
        <p className="mt-2 text-[#737373]">Manage and resolve booking disputes</p>
      </div>

      <DisputeResolutionDashboard />
    </section>
  );
}
