"use client";

/**
 * PaymentProcessorInfo Component
 *
 * Shows payment processor connection information and setup guidance
 * tailored to the professional's country:
 * - Colombia: Stripe connection instructions
 * - Paraguay/Uruguay/Argentina: PayPal connection instructions
 *
 * @example
 * ```tsx
 * <PaymentProcessorInfo />
 * ```
 */

import { Alert01Icon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useMarket } from "@/lib/contexts/MarketContext";

export function PaymentProcessorInfo() {
  const t = useTranslations("dashboard.pro.finances");
  const { country, marketInfo } = useMarket();

  const isStripeCountry = country === "CO";
  const processorName = isStripeCountry ? "Stripe" : "PayPal";
  const processorIcon = isStripeCountry ? "💳" : "🔵";

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center text-2xl">{processorIcon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-neutral-900">
            {t("paymentProcessor.title", { processor: processorName })}
          </h3>
          <p className="mt-1 text-neutral-600 text-sm">
            {t("paymentProcessor.description", {
              processor: processorName,
              country: marketInfo.countryName,
            })}
          </p>
        </div>
      </div>

      {/* Stripe Instructions (Colombia) */}
      {isStripeCountry && (
        <div className="space-y-4 border-neutral-200 border-t pt-4">
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Alert01Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-blue-900 text-sm">
              <p className="font-medium">{t("paymentProcessor.stripe.setup.title")}</p>
              <p className="mt-1">{t("paymentProcessor.stripe.setup.description")}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-900 text-sm">
              {t("paymentProcessor.stripe.requirements.title")}
            </h4>
            <ul className="space-y-2 text-neutral-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.stripe.requirements.colombianBank")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.stripe.requirements.cedula")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.stripe.requirements.rut")}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-neutral-200 border-t pt-4">
            <h4 className="font-semibold text-neutral-900 text-sm">
              {t("paymentProcessor.stripe.payoutInfo.title")}
            </h4>
            <p className="text-neutral-700 text-sm">
              {t("paymentProcessor.stripe.payoutInfo.description")}
            </p>
          </div>
        </div>
      )}

      {/* PayPal Instructions (Paraguay/Uruguay/Argentina) */}
      {!isStripeCountry && (
        <div className="space-y-4 border-neutral-200 border-t pt-4">
          <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <Alert01Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
            <div className="text-orange-900 text-sm">
              <p className="font-medium">{t("paymentProcessor.paypal.setup.title")}</p>
              <p className="mt-1">{t("paymentProcessor.paypal.setup.description")}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-900 text-sm">
              {t("paymentProcessor.paypal.requirements.title")}
            </h4>
            <ul className="space-y-2 text-neutral-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.paypal.requirements.verifiedAccount")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.paypal.requirements.bankLink")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-orange-500">•</span>
                <span>{t("paymentProcessor.paypal.requirements.localBank")}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-neutral-200 border-t pt-4">
            <h4 className="font-semibold text-neutral-900 text-sm">
              {t("paymentProcessor.paypal.payoutInfo.title")}
            </h4>
            <p className="text-neutral-700 text-sm">
              {t("paymentProcessor.paypal.payoutInfo.description")}
            </p>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="font-medium text-neutral-900 text-sm">
              {t("paymentProcessor.paypal.note.title")}
            </p>
            <p className="mt-1 text-neutral-700 text-sm">
              {t("paymentProcessor.paypal.note.description")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
