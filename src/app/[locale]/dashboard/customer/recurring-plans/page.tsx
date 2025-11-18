/**
 * Customer Recurring Plans Page
 *
 * View and manage recurring service plans
 * Sprint 2: Supply & Ops - Recurring Plans UI
 */

import { unstable_noStore } from "next/cache";
import { redirect } from "next/navigation";
import { geistSans } from "@/app/fonts";
import { RecurringPlansManager } from "@/components/customer/recurring-plans-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Recurring Plans | Customer Dashboard",
  description: "View and manage your recurring service plans",
};

export default async function RecurringPlansPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

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

  if (profile?.role !== "customer") {
    redirect("/");
  }

  // Fetch recurring plans for this customer
  const { data: recurringPlansRaw } = await supabase
    .from("recurring_plans")
    .select(`
      id,
      service_name,
      duration_minutes,
      address,
      special_instructions,
      frequency,
      day_of_week,
      preferred_time,
      base_amount,
      discount_percentage,
      final_amount,
      currency,
      status,
      pause_start_date,
      pause_end_date,
      created_at,
      next_booking_date,
      total_bookings_completed,
      professional:profiles!recurring_plans_professional_id_fkey (
        user_id,
        full_name,
        avatar_url
      )
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Transform data: PostgREST returns professional as array, but we need single object
  const recurringPlans =
    recurringPlansRaw?.map((plan: any) => ({
      ...plan,
      professional: Array.isArray(plan.professional)
        ? plan.professional[0] || null
        : plan.professional,
    })) || [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          Recurring Plans
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">
          Manage your recurring service subscriptions and save up to 15%
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <RecurringPlansManager initialPlans={recurringPlans} userId={user.id} />
      </div>
    </section>
  );
}
