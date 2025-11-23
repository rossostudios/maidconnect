"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { trackFinancesDashboardViewed } from "@/lib/analytics/professional-events";
import type { Currency } from "@/lib/utils/format";
import { BalanceCard } from "./balance-card";
import { BankAccountManager } from "./bank-account-manager";
import { InstantPayoutModal } from "./instant-payout-modal";
import { PaymentProcessorInfo } from "./payment-processor-info";
import { PayoutHistory } from "./payout-history";

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
  estimate: {
    grossAmountCop: number;
    feeAmountCop: number;
    netAmountCop: number;
  };
  pendingClearances: Array<{
    bookingId: string;
    amountCop: number;
    completedAt: string;
    clearanceAt: string;
    hoursRemaining: number;
  }>;
};

// ========================================
// Finances Page Client Component
// ========================================

/**
 * FinancesPageClient - Client-side wrapper for instant payout UI
 *
 * Handles state management and data fetching for:
 * - Balance card
 * - Instant payout modal
 * - Payout history
 */
export function FinancesPageClient({ currencyCode }: { currencyCode: Currency }) {
  const t = useTranslations("dashboard.pro.finances");

  // State
  const [balanceData, setBalanceData] = useState<BalanceEligibilityResponse | null>(null);
  const [transfers, setTransfers] = useState<PayoutTransfer[]>([]);
  const [_isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [_hasBankAccount, _setHasBankAccount] = useState(false);

  // ========================================
  // Data Fetching
  // ========================================

  const fetchBalance = useCallback(async () => {
    try {
      // Fetch user session to get professional ID
      const userResponse = await fetch("/api/auth/session");
      const userData = await userResponse.json();

      if (userData.user?.id) {
        setProfessionalId(userData.user.id);
      }

      const response = await fetch("/api/pro/payouts/instant");
      const data = await response.json();
      if (response.ok) {
        setBalanceData(data);

        // Track analytics - dashboard viewed
        if (userData.user?.id) {
          trackFinancesDashboardViewed({
            professionalId: userData.user.id,
            totalBalanceCOP: data.balance.totalCop,
            availableBalanceCOP: data.balance.availableCop,
            pendingBalanceCOP: data.balance.pendingCop,
            hasBankAccount: false, // Will be updated by BankAccountManager
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setIsLoadingBalance(false);
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

  // Initial data fetch
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

  const handlePayoutSuccess = (_result: any) => {
    toast.success(t("payout.success"), {
      description: t("payout.successDescription"),
    });

    // Refresh balance and history
    fetchBalance();
    fetchPayoutHistory();

    // Close modal
    setShowPayoutModal(false);
  };

  const handlePayoutError = (error: string) => {
    toast.error(t("payout.failed"), {
      description: error,
    });
  };

  // ========================================
  // Render
  // ========================================

  return (
    <div className="space-y-8">
      {/* Balance Card with Instant Payout Button */}
      <BalanceCard currencyCode={currencyCode} onRequestPayout={handleRequestPayout} />

      {/* Bank Account Manager */}
      <BankAccountManager />

      {/* Payment Processor Information */}
      <PaymentProcessorInfo />

      {/* Payout History */}
      <PayoutHistory
        currencyCode={currencyCode}
        isLoading={isLoadingHistory}
        professionalId={professionalId}
        transfers={transfers}
      />

      {/* Instant Payout Modal */}
      {balanceData && (
        <InstantPayoutModal
          availableBalanceCop={balanceData.balance.availableCop}
          currencyCode={currencyCode}
          feePercentage={balanceData.feeInfo.feePercentage}
          minThresholdCop={balanceData.feeInfo.minThresholdCop}
          onClose={() => setShowPayoutModal(false)}
          onError={handlePayoutError}
          onSuccess={handlePayoutSuccess}
          open={showPayoutModal}
          pendingBalanceCop={balanceData.balance.pendingCop}
          professionalId={professionalId}
        />
      )}
    </div>
  );
}
