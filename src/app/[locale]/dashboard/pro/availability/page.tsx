import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { AvailabilityEditor } from "@/components/availability/availability-editor";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

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
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.availability" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("availability_settings, blocked_dates")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching availability settings:", error);
  }

  const availabilitySettings = profileData?.availability_settings as unknown;
  const weeklyHours =
    availabilitySettings &&
    typeof availabilitySettings === "object" &&
    "weeklyHours" in availabilitySettings
      ? (availabilitySettings.weeklyHours as DaySchedule[] | undefined)
      : undefined;
  const blockedDates = (profileData?.blocked_dates as string[]) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      {/* Availability Editor */}
      <div className="border border-neutral-200 bg-white p-6">
        <AvailabilityEditor initialBlockedDates={blockedDates} initialWeeklyHours={weeklyHours} />
      </div>

      {/* Help Section */}
      <div className="border border-neutral-200 bg-white">
        <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
          <h3
            className={cn(
              "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {t("tips.title")}
          </h3>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-[#FF5200]">•</span>
              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                <strong className="font-semibold text-neutral-900">
                  {t("tips.workingHours.label")}
                </strong>{" "}
                {t("tips.workingHours.text")}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-[#FF5200]">•</span>
              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                <strong className="font-semibold text-neutral-900">
                  {t("tips.blockedDates.label")}
                </strong>{" "}
                {t("tips.blockedDates.text")}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-[#FF5200]">•</span>
              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                <strong className="font-semibold text-neutral-900">
                  {t("tips.bufferTime.label")}
                </strong>{" "}
                {t("tips.bufferTime.text")}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 text-[#FF5200]">•</span>
              <span className={cn("text-neutral-700 text-sm", geistSans.className)}>
                <strong className="font-semibold text-neutral-900">
                  {t("tips.flexibility.label")}
                </strong>{" "}
                {t("tips.flexibility.text")}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
