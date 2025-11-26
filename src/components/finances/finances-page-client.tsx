"use client";

import { Invoice03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { trackFinancesDashboardViewed } from "@/lib/analytics/professional-events";
import { cn } from "@/lib/utils/core";
import type { Currency } from "@/lib/utils/format";

import { BankAccountManager } from "./bank-account-manager";
import { EarningsSummaryCards } from "./earnings-summary-cards";
import { type CurrencyCode, FeeTransparencySection } from "./fee-transparency-section";
import { type FinancesTab, FinancesTabPanel, FinancesTabs, useFinancesTab } from "./finances-tabs";
import { HeroBalanceSection } from "./hero-balance-section";
import { InstantPayoutModal } from "./instant-payout-modal";
import { PayoutHistorySheet } from "./payout-history-sheet";

// ========================================
// Types
// ========================================

type PayoutTransfer = {
  id: string;
  professional_id: string;
  amount_cop: number;
  payout_type: "instant" | "batch";
  fee_amount_cop: number | null;
  fee_percentage: number | null;
  requested_at: string;
  processed_at: string | null;
  status: "processing" | "pending" | "completed" | "failed";
  stripe_payout_id: string | null;
  error_message: string | null;
  created_at: string;
};

type BalanceEligibilityResponse = {
  success: boolean;
  balance: {
    availableCop: number;
    pendingCop: number;
    totalCop: number;
  };
  eligibility: {
    isEligible: boolean;
    reasons: string[];
  };
  feeInfo: {
    feePercentage: number;
    minThresholdCop: number;
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
  };
};

type FinancesPageClientProps = {
  currencyCode: Currency;
};

// ========================================
// Finances Page Client Component
// ========================================

/**
 * FinancesPageClient - Redesigned Airbnb-inspired finances dashboard
 *
 * Ultra-minimal layout:
 * - Hero balance section (prominent balance + Get Paid CTA)
 * - Tab navigation (Overview | Transactions | Settings)
 * - Overview: 2 summary cards (no charts)
 * - Transactions: Button → opens PayoutHistorySheet
 * - Settings: Bank account + collapsible fee breakdown
 */
export function FinancesPageClient({ currencyCode }: FinancesPageClientProps) {
  const t = useTranslations("dashboard.pro.finances");

  // Tab state from URL
  const activeTab = useFinancesTab();

  // UI State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showPayoutHistorySheet, setShowPayoutHistorySheet] = useState(false);

  // Data State
  const [balanceData, setBalanceData] = useState<BalanceEligibilityResponse | null>(null);
  const [transfers, setTransfers] = useState<PayoutTransfer[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [professionalId, setProfessionalId] = useState<string>("");

  // ========================================
  // Data Fetching
  // ========================================

  const fetchBalance = useCallback(async () => {
    try {
      const userResponse = await fetch("/api/auth/session");
      const userData = await userResponse.json();

      if (userData.user?.id) {
        setProfessionalId(userData.user.id);
      }

      const response = await fetch("/api/pro/payouts/instant");
      const data = await response.json();

      if (response.ok) {
        setBalanceData(data);

        // Track analytics
        if (userData.user?.id) {
          trackFinancesDashboardViewed({
            professionalId: userData.user.id,
            totalBalanceCOP: data.balance.totalCop,
            availableBalanceCOP: data.balance.availableCop,
            pendingBalanceCOP: data.balance.pendingCop,
            hasBankAccount: false,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, []);

  const fetchPayoutHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/pro/payouts/history?limit=50");
      const data = await response.json();

      if (response.ok && data.transfers) {
        setTransfers(data.transfers);
      }
    } catch (error) {
      console.error("Failed to fetch payout history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchPayoutHistory();
  }, [fetchBalance, fetchPayoutHistory]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleRequestPayout = () => {
    setShowPayoutModal(true);
  };

  const handlePayoutSuccess = () => {
    toast.success(t("payout.success"), {
      description: t("payout.successDescription"),
    });
    fetchBalance();
    fetchPayoutHistory();
    setShowPayoutModal(false);
  };

  const handlePayoutError = (error: string) => {
    toast.error(t("payout.failed"), { description: error });
  };

  const handleTabChange = (_tab: FinancesTab) => {
    // URL is updated via FinancesTabs component
    // This callback is for any additional side effects
  };

  // ========================================
  // Render
  // ========================================

  return (
    <div className="space-y-6">
      {/* Hero Balance Section */}
      <HeroBalanceSection currencyCode={currencyCode} onRequestPayout={handleRequestPayout} />

      {/* Tab Navigation */}
      <FinancesTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <FinancesTabPanel activeTab={activeTab} tabId="overview">
        <EarningsSummaryCards
          currencyCode={currencyCode}
          isLoading={isLoadingHistory}
          transfers={transfers}
        />
      </FinancesTabPanel>

      <FinancesTabPanel activeTab={activeTab} tabId="transactions">
        <TransactionsTabContent onViewHistory={() => setShowPayoutHistorySheet(true)} />
      </FinancesTabPanel>

      <FinancesTabPanel activeTab={activeTab} tabId="settings">
        <SettingsTabContent
          currencyCode={currencyCode}
          feePercentage={balanceData?.feeInfo.feePercentage ?? 15}
        />
      </FinancesTabPanel>

      {/* Payout History Sheet */}
      <PayoutHistorySheet
        currencyCode={currencyCode}
        isLoading={isLoadingHistory}
        isOpen={showPayoutHistorySheet}
        onOpenChange={setShowPayoutHistorySheet}
        professionalId={professionalId}
        transfers={transfers}
      />

      {/* Instant Payout Modal */}
      {balanceData && (
        <InstantPayoutModal
          availableBalance={balanceData.balance.availableCop}
          currencyCode={currencyCode}
          feePercentage={balanceData.feeInfo.feePercentage}
          minThreshold={balanceData.feeInfo.minThresholdCop}
          onClose={() => setShowPayoutModal(false)}
          onError={handlePayoutError}
          onSuccess={handlePayoutSuccess}
          open={showPayoutModal}
          pendingBalance={balanceData.balance.pendingCop}
          professionalId={professionalId}
        />
      )}
    </div>
  );
}

// ========================================
// Transactions Tab Content
// ========================================

type TransactionsTabContentProps = {
  onViewHistory: () => void;
};

function TransactionsTabContent({ onViewHistory }: TransactionsTabContentProps) {
  const t = useTranslations("dashboard.pro.finances");

  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon className="size-6 text-muted-foreground" icon={Invoice03Icon} />
      </div>
      <h3 className={cn("mt-4 font-semibold text-foreground text-lg", geistSans.className)}>
        {t("transactions.title")}
      </h3>
      <p className={cn("mt-1 text-muted-foreground text-sm", geistSans.className)}>
        {t("transactions.description")}
      </p>
      <Button className="mt-6" onClick={onViewHistory} variant="default">
        {t("transactions.viewHistory")}
      </Button>
    </div>
  );
}

// ========================================
// Settings Tab Content
// ========================================

type SettingsTabContentProps = {
  currencyCode: Currency;
  feePercentage: number;
};

function SettingsTabContent({ currencyCode, feePercentage }: SettingsTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Bank Account */}
      <BankAccountManager />

      {/* Fee Breakdown - Collapsible */}
      <FeeTransparencySection
        currency={currencyCode as CurrencyCode}
        fees={{ platformFeePercent: feePercentage }}
      />
    </div>
  );
}
