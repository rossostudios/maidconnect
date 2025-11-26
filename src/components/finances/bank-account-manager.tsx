"use client";

import {
  Alert01Icon,
  Building06Icon,
  CheckmarkCircle02Icon,
  LinkSquare02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackBankAccountAdded } from "@/lib/analytics/professional-events";
import { cn } from "@/lib/utils/core";

// ========================================
// Types
// ========================================

type BankAccount = {
  id: string;
  bankName: string;
  last4: string;
  currency: string;
  routingNumber: string;
  accountHolderName: string;
  accountHolderType: string;
  status: "new" | "validated" | "verified" | "verification_failed" | "errored";
  isDefault: boolean;
};

type BankAccountData = {
  success: boolean;
  bankAccounts: BankAccount[];
  defaultAccount: string | null;
  hasVerifiedAccount: boolean;
  requiresOnboarding: boolean;
  payoutsEnabled: boolean;
};

type BankAccountManagerProps = {
  className?: string;
};

// ========================================
// Bank Account Manager Component
// ========================================

/**
 * BankAccountManager - Compact single-line bank account display
 *
 * Ultra-minimal Airbnb-inspired design:
 * - Single row when connected (bank icon + name + last4 + status badge + manage link)
 * - Empty state with add button when no accounts
 * - Inline warning if payouts disabled
 */
export function BankAccountManager({ className }: BankAccountManagerProps) {
  const t = useTranslations("dashboard.pro.bankAccount");

  const [accountData, setAccountData] = useState<BankAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [previousVerifiedCount, setPreviousVerifiedCount] = useState<number>(0);

  // ========================================
  // Data Fetching
  // ========================================

  const fetchBankAccounts = useCallback(async () => {
    try {
      if (!professionalId) {
        const userResponse = await fetch("/api/auth/session");
        const userData = await userResponse.json();
        if (userData.user?.id) {
          setProfessionalId(userData.user.id);
        }
      }

      const response = await fetch("/api/pro/stripe/bank-account");
      const data = await response.json();

      if (response.ok) {
        setAccountData(data);

        // Track analytics
        if (professionalId && data.bankAccounts) {
          const verifiedAccounts = data.bankAccounts.filter(
            (acc: BankAccount) => acc.status === "verified"
          );
          const currentVerifiedCount = verifiedAccounts.length;

          if (currentVerifiedCount > previousVerifiedCount && previousVerifiedCount >= 0) {
            const isFirstAccount = previousVerifiedCount === 0;
            const newestAccount = verifiedAccounts[currentVerifiedCount - 1];

            trackBankAccountAdded({
              professionalId,
              accountStatus: newestAccount.status,
              isFirstAccount,
            });
          }

          setPreviousVerifiedCount(currentVerifiedCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [professionalId, previousVerifiedCount]);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleManageAccount = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/pro/stripe/connect", { method: "POST" });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(t("errors.connectFailed"));
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Failed to connect to Stripe:", error);
      toast.error(t("errors.connectFailed"));
      setIsConnecting(false);
    }
  };

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border border-neutral-200 bg-white p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="size-10 animate-pulse rounded-lg bg-neutral-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!accountData) {
    return null;
  }

  // ========================================
  // Empty / Onboarding State
  // ========================================

  if (accountData.requiresOnboarding || accountData.bankAccounts.length === 0) {
    return (
      <div className={cn("rounded-lg border border-neutral-200 bg-white p-4", className)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
              <HugeiconsIcon className="size-5 text-neutral-400" icon={Building06Icon} />
            </div>
            <div>
              <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                {t("title")}
              </p>
              <p className={cn("text-neutral-500 text-xs", geistSans.className)}>
                {accountData.requiresOnboarding ? t("onboarding.description") : t("empty.title")}
              </p>
            </div>
          </div>
          <Button
            className="gap-2"
            disabled={isConnecting}
            onClick={handleManageAccount}
            size="sm"
            variant="outline"
          >
            {isConnecting ? (
              <HugeiconsIcon className="size-4 animate-spin" icon={Loading03Icon} />
            ) : (
              <HugeiconsIcon className="size-4" icon={LinkSquare02Icon} />
            )}
            {accountData.requiresOnboarding ? t("onboarding.startButton") : t("empty.addButton")}
          </Button>
        </div>
      </div>
    );
  }

  // ========================================
  // Connected State (Compact Single-Line)
  // ========================================

  const defaultAccount =
    accountData.bankAccounts.find((acc) => acc.isDefault) || accountData.bankAccounts[0];
  const statusConfig = getStatusConfig(defaultAccount.status, t);

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white", className)}>
      {/* Main Account Row */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-neutral-100">
            <HugeiconsIcon className="size-5 text-neutral-600" icon={Building06Icon} />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
                {defaultAccount.bankName}
              </p>
              <p className={cn("text-neutral-500 text-xs", geistSans.className)}>
                •••• {defaultAccount.last4}
              </p>
            </div>
            <Badge
              className={cn(
                "gap-1 text-xs",
                statusConfig.bg,
                statusConfig.border,
                statusConfig.color
              )}
              variant="outline"
            >
              <HugeiconsIcon className="size-3" icon={statusConfig.icon} />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <Button
          className="gap-2 text-rausch-600"
          disabled={isConnecting}
          onClick={handleManageAccount}
          size="sm"
          variant="ghost"
        >
          {isConnecting ? (
            <HugeiconsIcon className="size-4 animate-spin" icon={Loading03Icon} />
          ) : (
            <HugeiconsIcon className="size-4" icon={LinkSquare02Icon} />
          )}
          {t("manage.button")}
        </Button>
      </div>

      {/* Payouts Disabled Warning */}
      {!accountData.payoutsEnabled && (
        <div className="border-rausch-100 border-t bg-rausch-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon className="size-4 text-rausch-600" icon={Alert01Icon} />
            <p className={cn("text-rausch-700 text-xs", geistSans.className)}>
              {t("warning.payoutsDisabled.title")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// Status Config Helper
// ========================================

function getStatusConfig(status: BankAccount["status"], t: any) {
  const configs = {
    verified: {
      icon: CheckmarkCircle02Icon,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      label: t("status.verified"),
    },
    validated: {
      icon: CheckmarkCircle02Icon,
      color: "text-babu-700",
      bg: "bg-babu-50",
      border: "border-babu-200",
      label: t("status.validated"),
    },
    new: {
      icon: Alert01Icon,
      color: "text-rausch-700",
      bg: "bg-rausch-50",
      border: "border-rausch-200",
      label: t("status.new"),
    },
    verification_failed: {
      icon: Alert01Icon,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: t("status.failed"),
    },
    errored: {
      icon: Alert01Icon,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: t("status.errored"),
    },
  };

  return configs[status];
}
