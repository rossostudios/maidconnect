import { getTranslations } from "next-intl/server";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function CustomerBookingsPage(props: { params: Promise<{ locale: string }> }) {
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
        <h1 className="text-3xl font-semibold text-[#211f1a]">{t("title")}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">{t("description")}</p>
      </div>

      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <CustomerBookingList bookings={bookings} />
      </div>
    </section>
  );
}
