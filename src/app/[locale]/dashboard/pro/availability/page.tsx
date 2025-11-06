import { getTranslations } from "next-intl/server";
import { unstable_noStore } from "next/cache";
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

  // Parse availability settings
  const availabilitySettings = profileData?.availability_settings as any;
  const weeklyHours = availabilitySettings?.weeklyHours as DaySchedule[] | undefined;
  const blockedDates = (profileData?.blocked_dates as string[]) || [];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h1 className="font-semibold text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Availability Editor */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <AvailabilityEditor initialBlockedDates={blockedDates} initialWeeklyHours={weeklyHours} />
      </div>

      {/* Help Section */}
      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-sm">
        <h3 className="font-semibold text-[var(--foreground)] text-lg">{t("tips.title")}</h3>
        <ul className="mt-4 space-y-3 text-[var(--muted-foreground)] text-base">
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[var(--red)]">•</span>
            <span>
              <strong className="text-[var(--foreground)]">{t("tips.workingHours.label")}</strong>{" "}
              {t("tips.workingHours.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[var(--red)]">•</span>
            <span>
              <strong className="text-[var(--foreground)]">{t("tips.blockedDates.label")}</strong>{" "}
              {t("tips.blockedDates.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[var(--red)]">•</span>
            <span>
              <strong className="text-[var(--foreground)]">{t("tips.bufferTime.label")}</strong>{" "}
              {t("tips.bufferTime.text")}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[var(--red)]">•</span>
            <span>
              <strong className="text-[var(--foreground)]">{t("tips.flexibility.label")}</strong>{" "}
              {t("tips.flexibility.text")}
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
