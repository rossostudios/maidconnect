import { AuditLogsDashboard } from "@/components/admin/audit-logs-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AuditLogsPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">Audit Logs</h1>
        <p className="mt-2 text-[#737373]">Track all administrative actions and changes</p>
      </div>

      <AuditLogsDashboard />
    </section>
  );
}
