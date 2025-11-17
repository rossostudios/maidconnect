import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerBookingsPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.bookingsPage",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      <div className="border border-neutral-200 bg-neutral-50 p-8 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
        <CustomerBookingList bookings={bookings} />
      </div>
    </section>
  );
}
