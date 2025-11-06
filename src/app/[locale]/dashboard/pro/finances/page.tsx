import { getTranslations } from "next-intl/server";
import { unstable_noStore } from "next/cache";
import { FinancesOverview } from "@/components/finances/finances-overview";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
  unstable_noStore(); // Opt out of caching for dynamic page

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pro.finances" });

  const user = await requireUser({ allowedRoles: ["professional"] });
  const supabase = await createSupabaseServerClient();

  // Fetch completed bookings for revenue analytics
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_start, amount_captured, amount_authorized, currency, service_name, created_at"
    )
    .eq("professional_id", user.id)
    .eq("status", "completed")
    .order("scheduled_start", { ascending: true });

  const bookings = (bookingsData as BookingRow[] | null) ?? [];

  // Fetch pending payouts
  const { data: payoutsData } = await supabase
    .from("payouts")
    .select("*")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  const payouts = payoutsData ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl text-[var(--foreground)]">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-base leading-relaxed">
          {t("description")}
        </p>
      </div>

      <FinancesOverview bookings={bookings} payouts={payouts} />
    </section>
  );
}
