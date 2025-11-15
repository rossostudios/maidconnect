import { unstable_noStore } from "next/cache";
import { AuditLogsDashboard } from "@/components/admin/audit-logs-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AuditLogsPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-3xl text-neutral-900 tracking-tight">Audit Logs</h1>
        <p className="mt-2 text-neutral-600">
          Complete history of administrative actions and system changes
        </p>
      </div>

      {/* Dashboard Content */}
      <AuditLogsDashboard />
    </div>
  );
}
