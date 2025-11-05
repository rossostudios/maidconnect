import {
  Alert01Icon,
  ClipboardIcon,
  MapsLocation01Icon,
  Message01Icon,
  StarIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { ProfessionalVettingDashboard } from "@/components/admin/professional-vetting-dashboard";
import { BookingPipeline } from "@/components/dashboard/booking-pipeline";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function AdminHomePage() {
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
      <section className="mb-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Profile Photo Circle */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <Image
                  alt={userName}
                  className="h-12 w-12 rounded-full border-2 border-[#E5E5E5] object-cover"
                  height={48}
                  src={avatarUrl}
                  width={48}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-[#E63946]/10">
                  <HugeiconsIcon className="h-6 w-6 text-[#E63946]" icon={UserCircleIcon} />
                </div>
              )}
            </div>

            {/* Greeting Text */}
            <div>
              <h1 className="mb-1 font-bold text-3xl text-[#171717]">
                {greeting}, {userName}
              </h1>
              <p className="text-[#737373]">Here's what's happening with your platform today</p>
            </div>
          </div>
        </div>

        <ExecutiveDashboard />
      </section>

      {/* Booking Pipeline */}
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#171717]">Booking Pipeline</h2>
          <p className="text-[#737373] text-sm">Real-time view of bookings by lifecycle stage</p>
        </div>
        <BookingPipeline />
      </section>

      {/* Professional Vetting Queue */}
      <section className="mb-10">
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#171717]">Professional Vetting Queue</h2>
          <p className="text-[#737373] text-sm">Review and approve professional applications</p>
        </div>
        <ProfessionalVettingDashboard />
      </section>

      {/* Management Tools */}
      <section>
        <div className="mb-6">
          <h2 className="mb-2 font-bold text-2xl text-[#171717]">Management Tools</h2>
          <p className="text-[#737373] text-sm">Quick access to platform management features</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Changelog Management */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/changelog"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={StarIcon} />
              <h3 className="font-semibold text-[#171717] text-base">Changelog Management</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Create and manage sprint updates</p>
          </Link>

          {/* Feedback Management */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/feedback"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Message01Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Feedback Management</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Review and manage user feedback</p>
          </Link>

          {/* Roadmap Management */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/roadmap"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={MapsLocation01Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Roadmap Management</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Manage public roadmap items</p>
          </Link>

          {/* User Management */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/users"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={UserGroupIcon} />
              <h3 className="font-semibold text-[#171717] text-base">User Management</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Manage users and suspensions</p>
          </Link>

          {/* Dispute Resolution */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/disputes"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={Alert01Icon} />
              <h3 className="font-semibold text-[#171717] text-base">Dispute Resolution</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">Resolve customer/professional disputes</p>
          </Link>

          {/* Audit Logs */}
          <Link
            className="group rounded-lg border border-[#E5E5E5] bg-white p-6 transition hover:border-[#D5D5D5] hover:shadow-md"
            href="/admin/audit-logs"
          >
            <div className="mb-2 flex items-center gap-3">
              <HugeiconsIcon className="h-5 w-5 text-[#737373]" icon={ClipboardIcon} />
              <h3 className="font-semibold text-[#171717] text-base">Audit Logs</h3>
            </div>
            <p className="text-[#A3A3A3] text-sm">View all admin action history</p>
          </Link>
        </div>
      </section>
    </>
  );
}
