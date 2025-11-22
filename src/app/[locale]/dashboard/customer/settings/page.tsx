import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { updateNotificationPreferencesAction } from "@/app/actions/update-notification-preferences";
import { geistSans } from "@/app/fonts";
import {
  type SavedAddress,
  SavedAddressesManager,
} from "@/components/addresses/saved-addresses-manager";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

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
      .select("property_preferences, saved_addresses, notification_preferences")
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
      notification_preferences: Record<string, boolean> | null;
    } | null) ?? null;

  const savedAddressesRaw = customerProfile?.saved_addresses;
  const savedAddresses: SavedAddress[] = Array.isArray(savedAddressesRaw) ? savedAddressesRaw : [];
  const propertyType =
    (customerProfile?.property_preferences?.property_type as string | undefined) ?? null;
  const notificationPreferences = customerProfile?.notification_preferences ?? null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          {t("profile.title")}
        </h2>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("profile.fullName")}
              </div>
              <p className="text-neutral-900">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("profile.email")}
              </div>
              <p className="text-neutral-900">{user.email || "—"}</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("profile.phone")}
              </div>
              <p className="text-neutral-900">{profile?.phone || "—"}</p>
            </div>
            <div>
              <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("profile.city")}
              </div>
              <p className="text-neutral-900">{profile?.city || "—"}</p>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-neutral-500 text-sm">
              <strong className="text-neutral-900">{t("profile.note")}:</strong>{" "}
              {t("profile.noteDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Property Preferences */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          {t("preferences.title")}
        </h2>
        <div className="space-y-4">
          <div>
            <div className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
              {t("preferences.propertyType")}
            </div>
            <p className="text-neutral-900">
              {propertyType ? propertyType.charAt(0).toUpperCase() + propertyType.slice(1) : "—"}
            </p>
          </div>

          <div className="rounded-lg bg-neutral-50 p-4">
            <p className="text-neutral-500 text-sm">
              <strong className="text-neutral-900">{t("preferences.comingSoon")}:</strong>{" "}
              {t("preferences.comingSoonDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          {t("addresses.title")}
        </h2>
        <SavedAddressesManager addresses={savedAddresses} />
      </div>

      {/* Notification Preferences */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          Notification Preferences
        </h2>
        <NotificationPreferences
          initialPreferences={
            notificationPreferences as Parameters<
              typeof NotificationPreferences
            >[0]["initialPreferences"]
          }
          onSave={updateNotificationPreferencesAction}
        />
      </div>
    </section>
  );
}
