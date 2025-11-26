"use client";

import { CheckmarkCircle02Icon, CreditCardIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { PaymentMethodData } from "@/app/api/payments/methods/route";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type Props = {
  initialPaymentMethods?: PaymentMethodData[];
  initialDefaultId?: string | null;
};

const cardBrandIcons: Record<string, string> = {
  visa: "💳 Visa",
  mastercard: "💳 Mastercard",
  amex: "💳 Amex",
  discover: "💳 Discover",
  diners: "💳 Diners",
  jcb: "💳 JCB",
  unionpay: "💳 UnionPay",
  unknown: "💳 Card",
};

export function PaymentMethodsList({ initialPaymentMethods = [], initialDefaultId = null }: Props) {
  const t = useTranslations("dashboard.customer.payments");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>(initialPaymentMethods);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(
    initialDefaultId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/methods");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load payment methods");
      }

      setPaymentMethods(data.data.paymentMethods);
      setDefaultPaymentMethodId(data.data.defaultPaymentMethodId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialPaymentMethods.length === 0) {
      fetchPaymentMethods();
    }
  }, [fetchPaymentMethods, initialPaymentMethods.length]);

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    setDeletingId(paymentMethodId);

    try {
      const response = await fetch(`/api/payments/methods?paymentMethodId=${paymentMethodId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete payment method");
      }

      // Remove from local state
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== paymentMethodId));
      if (defaultPaymentMethodId === paymentMethodId) {
        setDefaultPaymentMethodId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment method");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    setSettingDefaultId(paymentMethodId);

    try {
      const response = await fetch("/api/payments/methods/default", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to set default payment method");
      }

      setDefaultPaymentMethodId(paymentMethodId);
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          is_default: pm.id === paymentMethodId,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default payment method");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const formatExpiry = (month: number, year: number) =>
    `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rausch-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-red-700 text-sm">{error}</p>
        <button
          className="mt-2 font-medium text-red-600 text-sm hover:text-red-700"
          onClick={fetchPaymentMethods}
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center">
        <HugeiconsIcon className="mx-auto h-12 w-12 text-neutral-400" icon={CreditCardIcon} />
        <p className={cn("mt-4 font-medium text-neutral-900", geistSans.className)}>
          {t("emptyState.title")}
        </p>
        <p className="mt-1 text-neutral-600 text-sm">{t("emptyState.description")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((pm) => (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border bg-white p-4 transition",
            pm.is_default ? "border-rausch-200 bg-rausch-50/50" : "border-neutral-200"
          )}
          key={pm.id}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <HugeiconsIcon className="h-6 w-6 text-neutral-600" icon={CreditCardIcon} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={cn("font-medium text-neutral-900", geistSans.className)}>
                  {cardBrandIcons[pm.brand] || cardBrandIcons.unknown} •••• {pm.last4}
                </p>
                {pm.is_default && (
                  <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-green-700 text-xs">
                    <HugeiconsIcon className="h-3 w-3" icon={CheckmarkCircle02Icon} />
                    {t("default")}
                  </span>
                )}
              </div>
              <p className="text-neutral-500 text-sm">
                {t("expires")} {formatExpiry(pm.exp_month, pm.exp_year)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!pm.is_default && (
              <button
                className="rounded-lg px-3 py-2 font-medium text-neutral-700 text-sm transition hover:bg-neutral-100"
                disabled={settingDefaultId === pm.id}
                onClick={() => handleSetDefault(pm.id)}
                type="button"
              >
                {settingDefaultId === pm.id ? t("setting") : t("setDefault")}
              </button>
            )}
            <button
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
              disabled={deletingId === pm.id}
              onClick={() => handleDelete(pm.id)}
              title={t("delete")}
              type="button"
            >
              {deletingId === pm.id ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              ) : (
                <HugeiconsIcon className="h-5 w-5" icon={Delete02Icon} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
