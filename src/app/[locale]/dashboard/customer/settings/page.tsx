import { getTranslations } from "next-intl/server";
import { SavedAddressesManager } from "@/components/addresses/saved-addresses-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerSettingsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.settings",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  const [{ data: profileData }, { data: customerData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("phone, city, country, full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("property_preferences, saved_addresses")
      .eq("profile_id", user.id)
      .maybeSingle(),
  ]);

  const profile =
    (profileData as {
      phone: string | null;
      city: string | null;
      country: string | null;
      full_name: string | null;
    } | null) ?? null;

  const customerProfile =
    (customerData as {
      property_preferences: Record<string, unknown> | null;
      saved_addresses: unknown;
    } | null) ?? null;

  const savedAddresses = (customerProfile?.saved_addresses as any[]) || [];
  const propertyType =
    (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-[#211f1a]">{t("title")}</h1>
        <p className="mt-2 text-[#5d574b] text-base leading-relaxed">{t("description")}</p>
      </div>

      {/* Profile Information */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="mb-6 font-semibold text-[#211f1a] text-xl">{t("profile.title")}</h2>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("profile.fullName")}
              </div>
              <p className="text-[#211f1a]">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("profile.email")}
              </div>
              <p className="text-[#211f1a]">{user.email || "—"}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("profile.phone")}
              </div>
              <p className="text-[#211f1a]">{profile?.phone || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
                {t("profile.city")}
              </div>
              <p className="text-[#211f1a]">{profile?.city || "—"}</p>
            </div>
          </div>

          <div className="rounded-lg bg-[#fef5e7] p-4">
            <p className="text-[#5d574b] text-sm">
              <strong className="text-[#211f1a]">{t("profile.note")}:</strong>{" "}
              {t("profile.noteDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Property Preferences */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="mb-6 font-semibold text-[#211f1a] text-xl">{t("preferences.title")}</h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 block font-semibold text-[#7d7566] text-xs uppercase tracking-[0.2em]">
              {t("preferences.propertyType")}
            </div>
            <p className="text-[#211f1a]">
              {propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : "—"}
            </p>
          </div>

          <div className="rounded-lg bg-[#fef5e7] p-4">
            <p className="text-[#5d574b] text-sm">
              <strong className="text-[#211f1a]">{t("preferences.comingSoon")}:</strong>{" "}
              {t("preferences.comingSoonDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="mb-6 font-semibold text-[#211f1a] text-xl">{t("addresses.title")}</h2>
        <SavedAddressesManager addresses={savedAddresses} />
      </div>
    </section>
  );
}
