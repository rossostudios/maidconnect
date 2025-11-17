import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerSettingsPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

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

  const savedAddressesRaw = customerProfile?.saved_addresses;
  const savedAddresses: SavedAddress[] = Array.isArray(savedAddressesRaw) ? savedAddressesRaw : [];
  const propertyType =
    (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Profile Information */}
      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <h2 className="mb-6 font-semibold text-neutral-900 text-xl">{t("profile.title")}</h2>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]">
                {t("profile.fullName")}
              </div>
              <p className="text-neutral-900">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]">
                {t("profile.email")}
              </div>
              <p className="text-neutral-900">{user.email || "—"}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]">
                {t("profile.phone")}
              </div>
              <p className="text-neutral-900">{profile?.phone || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]">
                {t("profile.city")}
              </div>
              <p className="text-neutral-900">{profile?.city || "—"}</p>
            </div>
          </div>

          <div className="bg-neutral-50 p-4">
            <p className="text-neutral-500 text-sm">
              <strong className="text-neutral-900">{t("profile.note")}:</strong>{" "}
              {t("profile.noteDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Property Preferences */}
      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <h2 className="mb-6 font-semibold text-neutral-900 text-xl">{t("preferences.title")}</h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-[0.2em]">
              {t("preferences.propertyType")}
            </div>
            <p className="text-neutral-900">
              {propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : "—"}
            </p>
          </div>

          <div className="bg-neutral-50 p-4">
            <p className="text-neutral-500 text-sm">
              <strong className="text-neutral-900">{t("preferences.comingSoon")}:</strong>{" "}
              {t("preferences.comingSoonDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <h2 className="mb-6 font-semibold text-neutral-900 text-xl">{t("addresses.title")}</h2>
        <SavedAddressesManager addresses={savedAddresses} />
      </div>
    </section>
  );
}
