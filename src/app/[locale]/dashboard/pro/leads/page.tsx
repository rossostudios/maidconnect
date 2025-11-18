/**
 * Professional Lead Queue Page
 *
 * Dedicated view for pending booking requests
 * Sprint 2: Professional Inbox Improvements
 */

import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";
import { geistSans } from "@/app/fonts";
import { LeadQueue } from "@/components/professional/lead-queue";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Lead Queue | Professional Dashboard",
  description: "View and respond to pending booking requests",
};

export default async function ProLeadsPage() {
  unstable_noStore();

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "professional") {
    redirect("/");
  }

  const { data: pendingBookingsRaw } = await supabase
    .from("bookings")
    .select(`
      id,
      service_name,
      service_category,
      scheduled_start,
      scheduled_end,
      duration_minutes,
      amount_estimated,
      currency,
      status,
      special_instructions,
      address,
      created_at,
      customer:profiles!bookings_customer_id_fkey (
        user_id,
        full_name,
        avatar_url
      )
    `)
    .eq("professional_id", user.id)
    .in("status", ["pending", "pending_payment", "confirmed"])
    .order("created_at", { ascending: false });

  const pendingBookings =
    pendingBookingsRaw?.map((booking: any) => ({
      ...booking,
      customer: Array.isArray(booking.customer) ? booking.customer[0] || null : booking.customer,
    })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
            geistSans.className
          )}
        >
          Lead Queue
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
            geistSans.className
          )}
        >
          Pending booking requests waiting for your response
        </p>
      </div>

      <LeadQueue initialBookings={pendingBookings} professionalId={user.id} />
    </div>
  );
}
