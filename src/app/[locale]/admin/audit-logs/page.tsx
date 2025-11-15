import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { AuditLogsDashboard } from "@/components/admin/audit-logs-dashboard";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AuditLogsPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-8">
      {/* Page Header - Lia Design */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          Audit Logs
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          Complete history of administrative actions and system changes
        </p>
      </div>

      {/* Dashboard Content */}
      <AuditLogsDashboard />
    </div>
  );
}
