import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { ProBookingCalendar } from "@/components/bookings/pro-booking-calendar";
import { ProBookingList } from "@/components/bookings/pro-booking-list";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

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
  unstable_noStore();

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1
            className={cn(
              "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
              geistSans.className
            )}
          >
            {t("title")}
          </h1>
          <p
            className={cn(
              "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
              geistSans.className
            )}
          >
            {t("description")}
          </p>
        </div>
        <Link
          className={cn(
            "inline-flex items-center justify-center border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-wider transition-all hover:bg-neutral-50",
            geistSans.className
          )}
          href="/dashboard/pro/onboarding"
        >
          {t("updateAvailability")}
        </Link>
      </div>

      <div className="border border-neutral-200 bg-white p-6">
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

      <div className="border border-neutral-200 bg-white">
        <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
          <h2
            className={cn(
              "font-semibold text-neutral-900 text-xs uppercase tracking-wider",
              geistSans.className
            )}
          >
            {t("allBookings")}
          </h2>
        </div>
        <div className="p-6">
          <ProBookingList bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
