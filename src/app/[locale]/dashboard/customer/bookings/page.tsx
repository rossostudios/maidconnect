import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { TrialCreditsSummary } from "@/components/trial-credits/trial-credits-summary";
import { requireUser } from "@/lib/auth";
import { getCustomerTrialCredits } from "@/lib/services/trial-credits/trialCreditService";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function CustomerBookingsPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.bookingsPage",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  // Fetch bookings
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      scheduled_start,
      duration_minutes,
      service_name,
      amount_authorized,
      amount_captured,
      currency,
      created_at,
      professional:professional_profiles!professional_id(full_name, profile_id)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const bookings =
    (bookingsData as Array<{
      id: string;
      status: string;
      scheduled_start: string | null;
      duration_minutes: number | null;
      service_name: string | null;
      amount_authorized: number | null;
      amount_captured: number | null;
      currency: string | null;
      created_at: string;
      professional: { full_name: string | null; profile_id: string } | null;
    }> | null) ?? [];

  // Fetch trial credits for this customer
  const trialCredits = await getCustomerTrialCredits(supabase, user.id);

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base leading-6 text-neutral-700">{t("description")}</p>
      </div>

      {/* Trial Credits Summary */}
      {trialCredits.length > 0 && (
        <TrialCreditsSummary locale={params.locale} trialCredits={trialCredits} />
      )}

      {/* Bookings List */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <CustomerBookingList bookings={bookings} />
      </div>
    </section>
  );
}
