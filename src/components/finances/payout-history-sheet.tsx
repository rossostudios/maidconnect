"use client";

import { useTranslations } from "next-intl";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Currency } from "@/lib/utils/format";

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

type PayoutHistorySheetProps = {
  /**
   * Whether the sheet is open
   */
  isOpen: boolean;
  /**
   * Callback when sheet open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Array of payout transfer records
   */
  transfers: PayoutTransfer[];
  /**
   * Currency code for formatting
   */
  currencyCode: Currency;
  /**
   * Professional ID for analytics tracking
   */
  professionalId?: string;
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
};

// ========================================
// PayoutHistorySheet Component
// ========================================

/**
 * PayoutHistorySheet - Slide-out sheet for viewing payout transaction history
 *
 * Opens from the right side with a wider width (sm:max-w-xl) to accommodate
 * the transaction list and filters. Uses the existing PayoutHistory component
 * with the "sheet" variant for proper styling.
 *
 * @example
 * ```tsx
 * <PayoutHistorySheet
 *   isOpen={showHistory}
 *   onOpenChange={setShowHistory}
 *   transfers={transfers}
 *   currencyCode="COP"
 *   professionalId={professionalId}
 *   isLoading={false}
 * />
 * ```
 */
export function PayoutHistorySheet({
  isOpen,
  onOpenChange,
  transfers,
  currencyCode,
  professionalId,
  isLoading = false,
}: PayoutHistorySheetProps) {
  const t = useTranslations("dashboard.pro.payoutHistory");

  return (
    <Sheet onOpenChange={onOpenChange} open={isOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl" side="right">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <PayoutHistory
            currencyCode={currencyCode}
            isLoading={isLoading}
            professionalId={professionalId}
            transfers={transfers}
            variant="sheet"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
