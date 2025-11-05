import { UserManagementDashboard } from "@/components/admin/user-management-dashboard";
import { requireUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">User Management</h1>
        <p className="mt-2 text-[#737373]">Manage users, roles, and account status</p>
      </div>

      <UserManagementDashboard />
    </section>
  );
}
