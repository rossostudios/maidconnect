import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { FinancesOverview } from "@/components/finances/finances-overview";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

type BookingRow = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_captured: number | null;
  amount_authorized: number | null;
  currency: string | null;
  service_name: string | null;
  created_at: string;
};

export default async function ProFinancesPage({ params }: { params: Promise<{ locale: string }> }) {
  unstable_noStore();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.finances" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, amount_captured, amount_authorized, currency, service_name, created_at"
    )
    .eq("professional_id", user.id)
    .eq("status", "completed")
    .order("scheduled_start", { ascending: true });

  const bookings = (bookingsData as BookingRow[] | null) ?? [];

  const { data: payoutsData } = await supabase
    .from("payouts")
    .select("*")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const payouts = payoutsData ?? [];

  return (
    <div className="space-y-8">
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

      <FinancesOverview bookings={bookings} payouts={payouts} />
    </div>
  );
}
