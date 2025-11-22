"use server";

import { unstable_noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import type { PaymentMethodData } from "@/app/api/payments/methods/route";
import { geistSans } from "@/app/fonts";
import { PaymentMethodsList } from "@/components/payments/payment-methods-list";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/integrations/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { cn } from "@/lib/utils";

export default async function CustomerPaymentsPage(props: { params: Promise<{ locale: string }> }) {
  unstable_noStore();

  const params = await props.params;
  const t = await getTranslations({
    locale: params.locale,
    namespace: "dashboard.customer.payments",
  });

  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  // Get Stripe customer ID from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let paymentMethods: PaymentMethodData[] = [];
  let defaultPaymentMethodId: string | null = null;

  if (profile?.stripe_customer_id) {
    try {
      // Fetch customer to get default payment method
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id);

      if (!customer.deleted) {
        defaultPaymentMethodId =
          typeof customer.invoice_settings?.default_payment_method === "string"
            ? customer.invoice_settings.default_payment_method
            : customer.invoice_settings?.default_payment_method?.id || null;

        // Fetch payment methods
        const methods = await stripe.paymentMethods.list({
          customer: profile.stripe_customer_id,
          type: "card",
        });

        paymentMethods = methods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand || "unknown",
          last4: pm.card?.last4 || "****",
          exp_month: pm.card?.exp_month || 0,
          exp_year: pm.card?.exp_year || 0,
          is_default: pm.id === defaultPaymentMethodId,
          created: pm.created,
        }));
      }
    } catch (error) {
      console.error("[CustomerPayments] Failed to fetch payment methods:", error);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className={cn("font-semibold text-3xl text-neutral-900", geistSans.className)}>
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">{t("description")}</p>
      </div>

      {/* Payment Methods Section */}
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
            {t("savedCards")}
          </h2>
        </div>
        <PaymentMethodsList
          initialDefaultId={defaultPaymentMethodId}
          initialPaymentMethods={paymentMethods}
        />
      </div>

      {/* Info Section */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
        <h3 className={cn("font-semibold text-orange-900", geistSans.className)}>
          {t("securityInfo.title")}
        </h3>
        <div className="mt-3 space-y-2 text-orange-800 text-sm">
          <p>
            <strong>{t("securityInfo.encryption.label")}</strong>{" "}
            {t("securityInfo.encryption.description")}
          </p>
          <p>
            <strong>{t("securityInfo.stripe.label")}</strong> {t("securityInfo.stripe.description")}
          </p>
          <p>
            <strong>{t("securityInfo.noStorage.label")}</strong>{" "}
            {t("securityInfo.noStorage.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
