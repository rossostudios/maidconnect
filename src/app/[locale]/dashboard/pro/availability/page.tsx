import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { AvailabilityEditor } from "@/components/availability/availability-editor";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export default async function ProAvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.availability" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional availability settings
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("availability_settings, blocked_dates")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching availability settings:", error);
  }

  // Parse availability settings (JSONB column)
  const availabilitySettings = profileData?.availability_settings as unknown;
  const weeklyHours =
    availabilitySettings &&
    typeof availabilitySettings === "object" &&
    "weeklyHours" in availabilitySettings
      ? (availabilitySettings.weeklyHours as DaySchedule[] | undefined)
      : undefined;
  const blockedDates = (profileData?.blocked_dates as string[]) || [];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-500 leading-relaxed">{t("description")}</p>
      </div>

      {/* Availability Editor */}
      <div className="bg-neutral-50 p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)]">
        <AvailabilityEditor initialBlockedDates={blockedDates} initialWeeklyHours={weeklyHours} />
      </div>

      {/* Help Section */}
      <div className="border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
        <h3 className="font-semibold text-lg text-neutral-900">{t("tips.title")}</h3>
        <ul className="mt-4 space-y-3 text-base text-neutral-500">
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-orange-500">•</span>
            <span>
              <strong className="text-neutral-900">{t("tips.workingHours.label")}</strong>{" "}
              {t("tips.workingHours.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-orange-500">•</span>
            <span>
              <strong className="text-neutral-900">{t("tips.blockedDates.label")}</strong>{" "}
              {t("tips.blockedDates.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-orange-500">•</span>
            <span>
              <strong className="text-neutral-900">{t("tips.bufferTime.label")}</strong>{" "}
              {t("tips.bufferTime.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-orange-500">•</span>
            <span>
              <strong className="text-neutral-900">{t("tips.flexibility.label")}</strong>{" "}
              {t("tips.flexibility.text")}
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
