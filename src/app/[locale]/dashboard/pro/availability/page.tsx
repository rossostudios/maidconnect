import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { AvailabilityEditor } from "@/components/availability/availability-editor";

type DaySchedule = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export default async function ProAvailabilityPage() {
  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch professional availability settings
  const { data: profileData, error } = await supabase
    .from("professional_profiles")
    .select("availability_settings, blocked_dates")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch availability:", error);
  }

  // Parse availability settings
  const availabilitySettings = profileData?.availability_settings as any;
  const weeklyHours = availabilitySettings?.weeklyHours as DaySchedule[] | undefined;
  const blockedDates = (profileData?.blocked_dates as string[]) || [];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-[#211f1a]">Availability Settings</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          Manage your working hours and block dates when you're unavailable. This controls when
          customers can book you.
        </p>
      </div>

      {/* Availability Editor */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <AvailabilityEditor
          initialWeeklyHours={weeklyHours}
          initialBlockedDates={blockedDates}
        />
      </div>

      {/* Help Section */}
      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-[#211f1a]">Tips for Managing Availability</h3>
        <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#ff5d46]">•</span>
            <span>
              <strong className="text-[#211f1a]">Working Hours:</strong> Set realistic hours that
              you can consistently maintain. Customers value reliability.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#ff5d46]">•</span>
            <span>
              <strong className="text-[#211f1a]">Blocked Dates:</strong> Block dates in advance for
              vacations or personal time. Update this regularly to avoid booking conflicts.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#ff5d46]">•</span>
            <span>
              <strong className="text-[#211f1a]">Buffer Time:</strong> Consider leaving time
              between bookings for travel and unexpected delays.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 text-[#ff5d46]">•</span>
            <span>
              <strong className="text-[#211f1a]">Flexibility:</strong> The more hours you're
              available, the more booking opportunities you'll have.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
