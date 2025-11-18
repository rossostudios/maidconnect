import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function ProProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.profile" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional profile
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("full_name, bio, languages, phone_number, avatar_url, primary_services")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile data:", error);
  }

  // Fetch user email
  const { data: userData } = await supabase.auth.admin.getUserById(user.id);
  const email = userData?.user?.email || "";

  const profile = {
    full_name: profileData?.full_name || "",
    email,
    bio: profileData?.bio || "",
    languages: (profileData?.languages as string[]) || [],
    phone_number: profileData?.phone_number || "",
    avatar_url: profileData?.avatar_url || "",
    primary_services: (profileData?.primary_services as string[]) || [],
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border border-neutral-200 bg-white p-8">
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Profile Editor */}
      <div className="border border-neutral-200 bg-white p-8">
        <ProfileEditor profile={profile} />
      </div>
    </section>
  );
}
