import { unstable_noStore } from "next/cache";
import { AdminProfileEditor } from "@/components/admin/admin-profile-editor";
import { AdminSecuritySettings } from "@/components/admin/admin-security-settings";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";
import { BackgroundCheckProviderSettings } from "@/components/admin/background-check-provider-settings";
import { FeatureFlagsSettings } from "@/components/admin/feature-flags-settings";
import { PlatformBusinessSettings } from "@/components/admin/platform-business-settings";
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

  // Fetch all platform settings
  const { data: allSettings } = await supabase
    .from("platform_settings")
    .select("setting_key, setting_value")
    .in("setting_key", [
      "background_check_provider",
      "platform_commission_rate",
      "customer_service_fee",
      "cancellation_fee",
      "booking_rules",
      "payout_settings",
      "feature_recurring_bookings",
      "feature_amara_ai",
      "feature_auto_translate",
      "feature_gps_verification",
      "feature_one_tap_rebook",
      "feature_professional_bidding",
      "feature_customer_reviews",
      "feature_tips",
    ]);

  // Helper to get setting value
  const getSetting = (key: string, defaultValue: unknown) => {
    const setting = allSettings?.find((s) => s.setting_key === key);
    return setting?.setting_value || defaultValue;
  };

  // Background Check Settings
  type BackgroundCheckSettings = {
    provider: "checkr" | "truora";
    enabled: boolean;
    auto_initiate: boolean;
  };

  const backgroundCheckSettings: BackgroundCheckSettings = getSetting("background_check_provider", {
    provider: "checkr",
    enabled: true,
    auto_initiate: false,
  }) as BackgroundCheckSettings;

  // Business Settings
  const businessSettings = {
    commission_rate: (getSetting("platform_commission_rate", { rate: 15 }) as { rate: number })
      .rate,
    service_fee: (getSetting("customer_service_fee", { rate: 2.99 }) as { rate: number }).rate,
    cancellation_fees: getSetting("cancellation_fee", {
      customer: 0,
      professional: 10,
      no_show: 25,
    }) as { customer: number; professional: number; no_show: number },
    booking_rules: getSetting("booking_rules", {
      min_advance_hours: 24,
      max_duration_hours: 8,
      min_booking_amount: 30,
      max_service_radius_km: 50,
      auto_accept_threshold: 100,
    }) as {
      min_advance_hours: number;
      max_duration_hours: number;
      min_booking_amount: number;
      max_service_radius_km: number;
      auto_accept_threshold: number;
    },
    payout_settings: getSetting("payout_settings", {
      schedule: "weekly",
      min_threshold: 50,
      currency: "USD",
      auto_payout: true,
    }) as {
      schedule: "daily" | "weekly" | "monthly";
      min_threshold: number;
      currency: string;
      auto_payout: boolean;
    },
  };

  // Feature Flags
  const featureFlags = {
    recurring_bookings: (
      getSetting("feature_recurring_bookings", { enabled: true }) as { enabled: boolean }
    ).enabled,
    amara_ai: (getSetting("feature_amara_ai", { enabled: true }) as { enabled: boolean }).enabled,
    auto_translate: (
      getSetting("feature_auto_translate", { enabled: true }) as { enabled: boolean }
    ).enabled,
    gps_verification: (
      getSetting("feature_gps_verification", { enabled: true }) as { enabled: boolean }
    ).enabled,
    one_tap_rebook: (
      getSetting("feature_one_tap_rebook", { enabled: true }) as { enabled: boolean }
    ).enabled,
    professional_bidding: (
      getSetting("feature_professional_bidding", { enabled: false }) as { enabled: boolean }
    ).enabled,
    customer_reviews: (
      getSetting("feature_customer_reviews", { enabled: true }) as { enabled: boolean }
    ).enabled,
    tips: (getSetting("feature_tips", { enabled: true }) as { enabled: boolean }).enabled,
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-bold text-3xl text-neutral-900">Settings</h1>
        <p className="mt-2 text-neutral-700">Manage your account and platform settings</p>
      </div>

      {/* Tabbed Settings */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
        <AdminSettingsTabs
          defaultTab="profile"
          tabs={[
            {
              value: "profile",
              label: "Profile",
              icon: "user",
              content: (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-neutral-900 text-xl">Profile Information</h2>
                    <p className="mt-1 text-neutral-500 text-sm">
                      Update your personal information and avatar
                    </p>
                  </div>
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
              ),
            },
            {
              value: "security",
              label: "Security",
              icon: "lock",
              content: (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-neutral-900 text-xl">Security Settings</h2>
                    <p className="mt-1 text-neutral-500 text-sm">
                      Manage your password and account security
                    </p>
                  </div>
                  <AdminSecuritySettings />
                </div>
              ),
            },
            {
              value: "platform",
              label: "Platform",
              icon: "building",
              content: (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-neutral-900 text-xl">
                      Platform Business Settings
                    </h2>
                    <p className="mt-1 text-neutral-500 text-sm">
                      Configure commission rates, fees, booking rules, and payout settings
                    </p>
                  </div>
                  <PlatformBusinessSettings initialSettings={businessSettings} />
                </div>
              ),
            },
            {
              value: "features",
              label: "Features",
              icon: "settings",
              content: (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-neutral-900 text-xl">Feature Flags</h2>
                    <p className="mt-1 text-neutral-500 text-sm">
                      Enable or disable platform features instantly without deployment
                    </p>
                  </div>
                  <FeatureFlagsSettings initialFlags={featureFlags} />
                </div>
              ),
            },
            {
              value: "integrations",
              label: "Integrations",
              icon: "shield",
              content: (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-semibold text-neutral-900 text-xl">
                      Background Check Provider
                    </h2>
                    <p className="mt-1 text-neutral-500 text-sm">
                      Configure which provider to use for professional background checks
                    </p>
                  </div>
                  <BackgroundCheckProviderSettings initialSettings={backgroundCheckSettings} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
