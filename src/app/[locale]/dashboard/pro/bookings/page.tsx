import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { requireUser } from "@/lib/auth";
import type { Currency } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";
import { ProBookingsClient } from "./client";

type ProfessionalBookingRow = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  amount_authorized: number | null;
  amount_estimated: number | null;
  amount_captured: number | null;
  amount_final: number | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: string | null;
  currency: string | null;
  created_at: string | null;
  service_name: string | null;
  service_hourly_rate: number | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  time_extension_minutes: number | null;
  address: string | null;
  customer: { id: string; full_name: string | null } | null;
};

export default async function ProBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.bookings" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch bookings and professional service data in parallel
  const [bookingsResult, serviceResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        `id, status, scheduled_start, scheduled_end, duration_minutes, amount_estimated, amount_authorized, amount_captured, amount_final, currency, stripe_payment_intent_id, stripe_payment_status, created_at, service_name, service_hourly_rate, checked_in_at, checked_out_at, time_extension_minutes, address,
        customer:profiles!customer_id(id, full_name)`
      )
      .eq("professional_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("professional_services")
      .select("hourly_rate, currency")
      .eq("professional_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single(),
  ]);

  const bookings = (bookingsResult.data as ProfessionalBookingRow[] | null) ?? [];

  // Get default hourly rate from primary service (or fallback)
  const defaultHourlyRateCents = serviceResult.data?.hourly_rate ?? 0;
  const currency = (serviceResult.data?.currency?.toUpperCase() || "COP") as Currency;

  return (
    <div className="space-y-8">
      <div>
        <h1
          className={cn(
            "font-semibold text-3xl text-foreground uppercase tracking-tight",
            geistSans.className
          )}
        >
          {t("title")}
        </h1>
        <p
          className={cn(
            "mt-1.5 font-normal text-muted-foreground text-sm tracking-wide",
            geistSans.className
          )}
        >
          {t("description")}
        </p>
      </div>

      <ProBookingsClient
        bookings={bookings}
        currency={currency}
        defaultHourlyRateCents={defaultHourlyRateCents}
        professionalId={user.id}
      />
    </div>
  );
}
