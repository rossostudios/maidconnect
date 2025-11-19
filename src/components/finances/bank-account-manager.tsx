"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Building2, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/core";
import { trackBankAccountAdded } from "@/lib/analytics/professional-events";

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
  /**
   * Custom class name for styling
   */
  className?: string;
};

// ========================================
// Bank Account Manager Component
// ========================================

/**
 * BankAccountManager - Displays and manages Stripe Connect bank accounts
 *
 * Features:
 * - Show connected bank accounts with verification status
 * - Display default payout account
 * - Link to Stripe Express Dashboard for updates
 * - Refresh account data
 * - Handle onboarding for new professionals
 *
 * @example
 * ```tsx
 * <BankAccountManager />
 * ```
 */
export function BankAccountManager({ className }: BankAccountManagerProps) {
  const t = useTranslations("dashboard.pro.bankAccount");

  const [accountData, setAccountData] = useState<BankAccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [previousVerifiedCount, setPreviousVerifiedCount] = useState<number>(0);

  // ========================================
  // Data Fetching
  // ========================================

  const fetchBankAccounts = async () => {
    try {
      // Fetch user session to get professional ID (only on initial load)
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

        // Track analytics - detect new verified accounts
        if (professionalId && data.bankAccounts) {
          const verifiedAccounts = data.bankAccounts.filter(
            (acc: BankAccount) => acc.status === "verified"
          );
          const currentVerifiedCount = verifiedAccounts.length;

          // If we now have verified accounts and we didn't before, track the addition
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
      } else {
        toast.error(t("errors.fetchFailed"));
      }
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // ========================================
  // Event Handlers
  // ========================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBankAccounts();
    toast.success(t("refresh.success"));
  };

  const handleManageAccount = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/pro/stripe/connect", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Express Dashboard
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
  // Render States
  // ========================================

  if (isLoading) {
    return (
      <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
        <CardHeader className="p-6 pb-4">
          <div className="h-7 w-48 animate-pulse bg-neutral-200 rounded-lg" />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accountData) {
    return null;
  }

  // ========================================
  // Main Render
  // ========================================

  return (
    <Card className={cn("border-neutral-200 bg-white shadow-sm", className)}>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("title")}
            </h2>
            <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
              {t("description")}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            {t("refresh.button")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        {/* Requires Onboarding State */}
        {accountData.requiresOnboarding && (
          <div className="border-neutral-200 bg-neutral-50 border p-6 rounded-lg text-center">
            <div className="flex size-12 mx-auto items-center justify-center bg-orange-100 rounded-full">
              <Building2 className="size-6 text-orange-600" />
            </div>
            <h3 className={cn("mt-4 font-semibold text-neutral-900", geistSans.className)}>
              {t("onboarding.title")}
            </h3>
            <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
              {t("onboarding.description")}
            </p>
            <Button
              onClick={handleManageAccount}
              disabled={isConnecting}
              className="mt-4 gap-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  {t("onboarding.connecting")}
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  {t("onboarding.startButton")}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Bank Accounts List */}
        {!accountData.requiresOnboarding && accountData.bankAccounts.length > 0 && (
          <div className="space-y-3">
            {accountData.bankAccounts.map((account) => (
              <BankAccountCard key={account.id} account={account} t={t} />
            ))}

            <Button
              variant="outline"
              onClick={handleManageAccount}
              disabled={isConnecting}
              className="mt-4 w-full gap-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  {t("manage.connecting")}
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  {t("manage.button")}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!accountData.requiresOnboarding && accountData.bankAccounts.length === 0 && (
          <div className="border-neutral-200 bg-neutral-50 border p-6 rounded-lg text-center">
            <div className="flex size-12 mx-auto items-center justify-center bg-neutral-100 rounded-full">
              <Building2 className="size-6 text-neutral-400" />
            </div>
            <h3 className={cn("mt-4 font-semibold text-neutral-900", geistSans.className)}>
              {t("empty.title")}
            </h3>
            <p className={cn("mt-2 text-neutral-600 text-sm", geistSans.className)}>
              {t("empty.description")}
            </p>
            <Button
              onClick={handleManageAccount}
              disabled={isConnecting}
              className="mt-4 gap-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  {t("empty.connecting")}
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {t("empty.addButton")}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Payouts Status Warning */}
        {!accountData.payoutsEnabled && accountData.bankAccounts.length > 0 && (
          <div className="border-orange-200 bg-orange-50 mt-4 border p-4 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className={cn("font-medium text-orange-900 text-sm", geistSans.className)}>
                  {t("warning.payoutsDisabled.title")}
                </h4>
                <p className={cn("mt-1 text-orange-700 text-sm", geistSans.className)}>
                  {t("warning.payoutsDisabled.description")}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================
// Bank Account Card Component
// ========================================

function BankAccountCard({ account, t }: { account: BankAccount; t: any }) {
  const statusConfig = {
    verified: {
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
      label: t("status.verified"),
    },
    validated: {
      icon: CheckCircle2,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: t("status.validated"),
    },
    new: {
      icon: AlertCircle,
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: t("status.new"),
    },
    verification_failed: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: t("status.failed"),
    },
    errored: {
      icon: AlertCircle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      label: t("status.errored"),
    },
  };

  const config = statusConfig[account.status];
  const StatusIcon = config.icon;

  return (
    <div className="border-neutral-200 bg-neutral-50 border p-4 rounded-lg" data-testid="bank-account-info">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center bg-neutral-100 rounded-lg">
            <Building2 className="size-5 text-neutral-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn("font-medium text-neutral-900", geistSans.className)}>
                {account.bankName}
              </h3>
              {account.isDefault && (
                <Badge variant="default" className="text-xs">
                  {t("default")}
                </Badge>
              )}
            </div>

            <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
              {t("accountNumber")}: •••• {account.last4}
            </p>

            <p className={cn("mt-0.5 text-neutral-500 text-sm", geistSans.className)}>
              {account.accountHolderName}
            </p>

            <div className="mt-2">
              <Badge
                variant="outline"
                className={cn("gap-1", config.bg, config.border, config.color)}
              >
                <StatusIcon className="size-3" />
                {config.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
