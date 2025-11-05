/**
 * Professional Lead Queue Page
 *
 * Dedicated view for pending booking requests
 * Sprint 2: Professional Inbox Improvements
 */

import { redirect } from "next/navigation";
import { LeadQueue } from "@/components/professional/lead-queue";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata = {
  title: "Lead Queue | Professional Dashboard",
  description: "View and respond to pending booking requests",
};

export default async function ProLeadsPage() {
  const supabase = await createSupabaseServerClient();

  // Check authentication and role
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

  // Fetch pending booking requests for this professional
  const { data: pendingBookings } = await supabase
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-[var(--foreground)]">Lead Queue</h1>
        <p className="mt-2 text-[#7d7566]">Pending booking requests waiting for your response</p>
      </div>

      <LeadQueue initialBookings={pendingBookings || []} professionalId={user.id} />
    </div>
  );
}
