import { unstable_noStore } from "next/cache";
import { AdminProfileEditor } from "@/components/admin/admin-profile-editor";
import { BackgroundCheckProviderSettings } from "@/components/admin/background-check-provider-settings";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function AdminSettingsPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

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

  // Fetch background check provider settings
  const { data: bgCheckSettings } = await supabase
    .from("platform_settings")
    .select("setting_value")
    .eq("setting_key", "background_check_provider")
    .maybeSingle();

  const backgroundCheckSettings = bgCheckSettings?.setting_value || {
    provider: "checkr",
    enabled: true,
    auto_initiate: false,
  };

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

      {/* Background Check Provider Settings */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white p-8">
        <h2 className="mb-2 font-semibold text-[#171717] text-xl">Background Check Provider</h2>
        <p className="mb-6 text-[#737373] text-sm">
          Configure which provider to use for professional background checks
        </p>
        <BackgroundCheckProviderSettings initialSettings={backgroundCheckSettings as any} />
      </div>
    </section>
  );
}
