"use client";

import { CreditCardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  priority: number;
};

type ColombianPaymentSelectorProps = {
  onPaymentMethodSelect: (methodId: string) => void;
  selectedMethod?: string;
};

/**
 * Colombian Payment Selector Component
 *
 * Prioritizes local Colombian payment methods (PSE, Nequi) over international cards.
 * Based on research showing 87% mobile purchases and high PSE adoption in Colombia.
 *
 * Research sources:
 * - Rapyd: PSE connects 100% of Colombian banks
 * - CommerceGate: Nequi has massive adoption in Colombia
 */
export function ColombianPaymentSelector({
  onPaymentMethodSelect,
  selectedMethod,
}: ColombianPaymentSelectorProps) {
  const t = useTranslations("components.paymentSelector");
  const [selected, setSelected] = useState<string>(selectedMethod || "");

  const paymentMethods: PaymentMethod[] = [
    {
      id: "pse",
      name: "PSE - Transferencia Bancaria",
      description: "Confirmación instantánea • Sin comisión adicional",
      icon: "🏦",
      badge: "Más popular",
      priority: 1,
    },
    {
      id: "nequi",
      name: "Nequi",
      description: "Pago rápido desde tu celular",
      icon: "📱",
      priority: 2,
    },
    {
      id: "bancolombia",
      name: "Bancolombia",
      description: "Transferencia desde tu cuenta",
      icon: "🏛️",
      priority: 3,
    },
    {
      id: "card",
      name: "Tarjeta de Crédito/Débito",
      description: "Visa, Mastercard, American Express",
      icon: "💳",
      priority: 4,
    },
  ];

  const handleSelect = (methodId: string) => {
    setSelected(methodId);
    onPaymentMethodSelect(methodId);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="mb-2 font-semibold text-[var(--foreground)] text-lg">{t("title")}</h3>
        <p className="text-[#6b7280] text-sm">{t("subtitle")}</p>
      </div>

      {/* Payment Method Options */}
      <div className="space-y-3">
        {paymentMethods
          .sort((a, b) => a.priority - b.priority)
          .map((method) => (
            <button
              className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all ${
                selected === method.id
                  ? "border-[var(--red)] bg-[var(--red)]/5 shadow-md"
                  : "border-[#ebe5d8] bg-white hover:border-[var(--red)]/50 hover:shadow-sm"
              }`}
              key={method.id}
              onClick={() => handleSelect(method.id)}
              type="button"
            >
              {/* Badge */}
              {method.badge && (
                <div className="absolute top-3 right-3 rounded-full bg-[var(--red)] px-3 py-1 font-semibold text-white text-xs">
                  {method.badge}
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f9fafb] text-2xl">
                  {method.icon}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="mb-1 font-semibold text-[var(--foreground)] text-base">
                    {method.name}
                  </div>
                  <div className="text-[#6b7280] text-sm">{method.description}</div>
                </div>

                {/* Radio indicator */}
                <div
                  className={`mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 transition-all ${
                    selected === method.id
                      ? "border-[var(--red)] bg-[var(--red)]"
                      : "border-[#d1d5db] bg-white"
                  }`}
                >
                  {selected === method.id && (
                    <svg
                      className="h-full w-full text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Help Text */}
      {selected === "pse" && (
        <div className="rounded-xl bg-blue-50 p-4 text-blue-900 text-sm">
          <p className="font-semibold">💡 {t("pseHelp.title")}</p>
          <p className="mt-1 text-blue-800">{t("pseHelp.description")}</p>
        </div>
      )}

      {selected === "nequi" && (
        <div className="rounded-xl bg-purple-50 p-4 text-purple-900 text-sm">
          <p className="font-semibold">💡 {t("nequiHelp.title")}</p>
          <p className="mt-1 text-purple-800">{t("nequiHelp.description")}</p>
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 border-[#ebe5d8] border-t pt-4 text-[#6b7280] text-sm">
        <HugeiconsIcon className="h-5 w-5" icon={CreditCardIcon} />
        <span>{t("securityNote")}</span>
      </div>
    </div>
  );
}
