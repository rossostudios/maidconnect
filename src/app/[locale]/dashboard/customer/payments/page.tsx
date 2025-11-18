import { unstable_noStore } from "next/cache";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { geistSans } from "@/app/fonts";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

// Dynamically import TanStack Table component (reduces initial bundle size)
const PaymentHistoryTable = dynamic(
  () =>
    import("@/components/payments/payment-history-table").then((mod) => ({
      default: mod.PaymentHistoryTable,
    })),
  {
    loading: () => (
      <div className="h-[400px] w-full animate-pulse bg-gradient-to-br from-neutral-200/30 to-neutral-200/10" />
    ),
  }
);

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

export default async function CustomerPaymentsPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page

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
    } catch (_error) {
      console.error("Error fetching payment methods:", _error);
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
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <MetricCard
          description={t("metrics.totalSpent.description")}
          label={t("metrics.totalSpent.label")}
          value={formatCurrency(totalSpent)}
        />
        <MetricCard
          description={t("metrics.pendingCharges.description")}
          label={t("metrics.pendingCharges.label")}
          value={formatCurrency(totalAuthorized)}
        />
        <MetricCard
          description={t("metrics.totalBookings.description")}
          label={t("metrics.totalBookings.label")}
          value={bookings.length.toString()}
        />
      </div>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className={cn("mb-4 font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("paymentMethods.title")}
          </h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                key={method.id}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-200">
                    <svg
                      aria-label="Credit card icon"
                      className="h-5 w-5 text-neutral-900"
                      fill="none"
                      role="img"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {method.card.brand.toUpperCase()} •••• {method.card.last4}
                    </p>
                    <p className="text-neutral-500 text-sm">
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
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className={cn("mb-6 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          {t("paymentHistory.title")}
        </h2>
        <PaymentHistoryTable bookings={bookings} />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <dt className="font-semibold text-neutral-700 text-xs uppercase tracking-wider">{label}</dt>
      <dd className={cn("mt-3 font-semibold text-3xl text-neutral-900", geistSans.className)}>
        {value}
      </dd>
      <p className="mt-1 text-neutral-500 text-sm">{description}</p>
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
