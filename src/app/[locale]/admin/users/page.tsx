import { unstable_noStore } from "next/cache";
import { geistSans } from "@/app/fonts";
import { UserManagementDashboard } from "@/components/admin/user-management-dashboard";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  unstable_noStore();
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-8">
      {/* Page Header - Precision Design */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          User Management
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          Manage user accounts, roles, and platform access
        </p>
      </div>

      {/* Dashboard Content */}
      <UserManagementDashboard />
    </div>
  );
}
