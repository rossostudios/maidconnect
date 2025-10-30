import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { ProBookingList } from "@/components/bookings/pro-booking-list";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ProfessionalBookingRow = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_estimated: number | null;
  amount_captured: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  currency: string | null;
  created_at: string | null;
  service_name: string | null;
  service_hourly_rate: number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  time_extension_minutes: number | null;
  address: Record<string, any> | null;
  customer: { id: string } | null;
};

export default async function ProBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.bookings" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
      customer:profiles!customer_id(id)`
    )
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as ProfessionalBookingRow[] | null) ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#211f1a]">{t("title")}</h1>
          <p className="mt-2 text-base leading-relaxed text-[#5d574b]">{t("description")}</p>
        </div>
        <Link
          href="/dashboard/pro/onboarding"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] px-5 py-2.5 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          {t("updateAvailability")}
        </Link>
      </div>

      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <ProBookingCalendar
          bookings={bookings.map((booking) => ({
            id: booking.id,
            status: booking.status,
            scheduled_start: booking.scheduled_start,
            duration_minutes: booking.duration_minutes,
            amount_authorized: booking.amount_authorized,
            amount_captured: booking.amount_captured,
            currency: booking.currency,
          }))}
        />
      </div>

      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("allBookings")}</h2>
        <ProBookingList bookings={bookings} />
      </div>
    </section>
  );
}
