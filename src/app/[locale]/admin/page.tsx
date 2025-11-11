import { UserCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import Image from "next/image";
import { BackgroundCheckDashboard } from "@/components/admin/background-check-dashboard";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";
import { BookingPipeline } from "@/components/dashboard/booking-pipeline";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function AdminHomePage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  const user = await requireUser({ allowedRoles: ["admin"] });
  const supabase = await createSupabaseServerClient();

  // Fetch user profile to get avatar and name
  const { data: profileData } = await supabase
    .from("profiles")
    .select("avatar_url, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const avatarUrl = profileData?.avatar_url;

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  const userName = profileData?.full_name?.split(" ")[0] || "Admin";

  return (
    <>
      {/* Greeting & Quick Stats */}
      <section className="mb-8 min-h-[600px]">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Photo Circle */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <Image
                  alt={userName}
                  className="h-12 w-12 rounded-full border-2 border-[#E4E2E3] object-cover"
                  height={48}
                  src={avatarUrl}
                  width={48}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E4E2E3] bg-[#FEF8E8]">
                  <HugeiconsIcon className="h-6 w-6 text-[#F44A22]" icon={UserCircleIcon} />
                </div>
              )}
            </div>

            {/* Greeting Text */}
            <div>
              <h1 className="mb-1 font-bold text-3xl text-[#161616]">
                {greeting}, {userName}
              </h1>
              <p className="text-[#A8AAAC]">Here's what's happening with your platform today</p>
            </div>
          </div>
        </div>

        <ExecutiveDashboard />
      </section>

      {/* Booking Pipeline */}
      <section className="mb-10 min-h-[800px]">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#161616]">Booking Pipeline</h2>
          <p className="text-[#A8AAAC] text-sm">Real-time view of bookings by lifecycle stage</p>
        </div>
        <BookingPipeline />
      </section>

      {/* Professional Vetting Queue */}
      <section className="mb-10 min-h-[400px]">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#161616]">Professional Vetting Queue</h2>
          <p className="text-[#A8AAAC] text-sm">Review and approve professional applications</p>
        </div>
        <ProfessionalVettingDashboard />
      </section>

      {/* Background Checks */}
      <section className="mb-10 min-h-[400px]">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#161616]">Background Checks</h2>
          <p className="text-[#A8AAAC] text-sm">Monitor and review background check results</p>
        </div>
        <BackgroundCheckDashboard />
      </section>
    </>
  );
}
