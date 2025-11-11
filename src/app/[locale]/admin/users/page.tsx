import { unstable_noStore } from "next/cache";
import { UserManagementDashboard } from "@/components/admin/user-management-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#116611616]">User Management</h1>
        <p className="mt-2 text-[#AA88AAAAC]">Manage users, roles, and account status</p>
      </div>

      <UserManagementDashboard />
    </section>
  );
}
