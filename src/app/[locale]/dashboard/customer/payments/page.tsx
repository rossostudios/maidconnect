import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { stripe } from "@/lib/stripe";

type BookingRow = {
  id: string;
  status: string;
  scheduled_start: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  service_name: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
  professional: { full_name: string | null } | null;
};

export default async function CustomerPaymentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.paymentsPage",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  // Fetch profile to get Stripe customer ID
  const { data: profileData } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as { stripe_customer_id: string | null } | null;

  // Fetch bookings with payment info
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      scheduled_start,
      amount_authorized,
      amount_captured,
      currency,
      service_name,
      created_at,
      stripe_payment_intent_id,
      professional:professional_profiles!professional_id(full_name)
    `)
    .eq("customer_id", user.id)
    .not("amount_authorized", "is", null)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as BookingRow[] | null) ?? [];

  // Fetch payment methods from Stripe
  let paymentMethods: any[] = [];
  if (profile?.stripe_customer_id) {
    try {
      const methods = await stripe.paymentMethods.list({
        customer: profile.stripe_customer_id,
        type: "card",
      });
      paymentMethods = methods.data;
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  }

  // Calculate totals
  const totalSpent = bookings
    .filter((b) => b.amount_captured)
    .reduce((sum, b) => sum + (b.amount_captured || 0), 0);

  const totalAuthorized = bookings
    .filter((b) => b.amount_authorized && b.status !== "completed" && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.amount_authorized || 0), 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#211f1a]">{t("title")}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          {t("description")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard
          label={t("metrics.totalSpent.label")}
          value={formatCurrency(totalSpent)}
          description={t("metrics.totalSpent.description")}
        />
        <MetricCard
          label={t("metrics.pendingCharges.label")}
          value={formatCurrency(totalAuthorized)}
          description={t("metrics.pendingCharges.description")}
        />
        <MetricCard
          label={t("metrics.totalBookings.label")}
          value={bookings.length.toString()}
          description={t("metrics.totalBookings.description")}
        />
      </div>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#211f1a]">{t("paymentMethods.title")}</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border border-[#ebe5d8] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe5d8]">
                    <svg className="h-5 w-5 text-[#211f1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#211f1a]">
                      {method.card.brand.toUpperCase()} •••• {method.card.last4}
                    </p>
                    <p className="text-sm text-[#7d7566]">
                      {t("paymentMethods.expires")} {method.card.exp_month}/{method.card.exp_year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-semibold text-[#211f1a]">{t("paymentHistory.title")}</h2>
        <PaymentHistoryTable bookings={bookings} />
      </div>
    </section>
  );
}

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7566]">{label}</dt>
      <dd className="mt-3 text-3xl font-semibold text-[#211f1a]">{value}</dd>
      <p className="mt-1 text-sm text-[#7d7566]">{description}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}
