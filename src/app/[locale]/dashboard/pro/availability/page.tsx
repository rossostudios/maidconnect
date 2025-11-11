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
      <div className="rounded-[28px] bg-[#FFEEFF8E8] p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)] backdrop-blur-sm">
        <h1 className="font-semibold text-3xl text-[#116611616]">{t("title")}</h1>
        <p className="mt-2 text-[#AA88AAAAC] text-base leading-relaxed">{t("description")}</p>
      </div>

      {/* Availability Editor */}
      <div className="rounded-[28px] bg-[#FFEEFF8E8] p-8 shadow-[0_20px_60px_-15px_rgba(22,22,22,0.15)] backdrop-blur-sm">
        <AvailabilityEditor initialBlockedDates={blockedDates} initialWeeklyHours={weeklyHours} />
      </div>

      {/* Help Section */}
      <div className="rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-8 shadow-sm">
        <h3 className="font-semibold text-[#116611616] text-lg">{t("tips.title")}</h3>
        <ul className="mt-4 space-y-3 text-[#AA88AAAAC] text-base">
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#FF4444A22]">•</span>
            <span>
              <strong className="text-[#116611616]">{t("tips.workingHours.label")}</strong>{" "}
              {t("tips.workingHours.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#FF4444A22]">•</span>
            <span>
              <strong className="text-[#116611616]">{t("tips.blockedDates.label")}</strong>{" "}
              {t("tips.blockedDates.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#FF4444A22]">•</span>
            <span>
              <strong className="text-[#116611616]">{t("tips.bufferTime.label")}</strong>{" "}
              {t("tips.bufferTime.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#FF4444A22]">•</span>
            <span>
              <strong className="text-[#116611616]">{t("tips.flexibility.label")}</strong>{" "}
              {t("tips.flexibility.text")}
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
