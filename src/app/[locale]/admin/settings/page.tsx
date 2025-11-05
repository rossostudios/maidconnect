import { AdminProfileEditor } from "@/components/admin/admin-profile-editor";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function AdminSettingsPage() {
  const user = await requireUser({ allowedRoles: ["admin"] });
  const supabase = await createSupabaseServerClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("phone, city, country, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as {
    phone: string | null;
    city: string | null;
    country: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-[#171717]">Settings</h1>
        <p className="mt-2 text-[#737373]">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white p-8">
        <h2 className="mb-6 font-semibold text-[#171717] text-xl">Profile Information</h2>
        <AdminProfileEditor
          currentProfile={{
            full_name: profile?.full_name || "",
            email: user.email || "",
            phone: profile?.phone || "",
            city: profile?.city || "",
            country: profile?.country || "",
            avatar_url: profile?.avatar_url || null,
          }}
          userId={user.id}
        />
      </div>
    </section>
  );
}
