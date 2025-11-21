"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Check, DollarSign, Info, Loader2, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { geistSans } from "@/app/fonts";
import {
  trackInstantPayoutModalOpened,
  trackInstantPayoutRequested,
  trackInstantPayoutCompleted,
  trackInstantPayoutFailed,
} from "@/lib/analytics/professional-events";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/core";
import { formatFromMinorUnits, type Currency } from "@/lib/utils/format";

// ========================================
// Types
// ========================================

type InstantPayoutModalProps = {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Available balance in minor currency units (centavos/céntimos)
   */
  availableBalance: number;
  /**
   * Pending balance in minor currency units
   */
  pendingBalance?: number;
  /**
   * Professional ID for analytics tracking
   */
  professionalId?: string;
  /**
   * Fee percentage (e.g., 1.5 for 1.5%)
   */
  feePercentage: number;
  /**
   * Minimum payout amount in minor currency units
   */
  minThreshold: number;
  /**
   * Callback when payout is successfully initiated
   */
  onSuccess?: (result: PayoutSuccessResult) => void;
  /**
   * Callback when payout fails
   */
  onError?: (error: string) => void;
  /**
   * Currency code for formatting (COP, PYG, UYU, ARS)
   */
  currencyCode: Currency;
  /**
   * @deprecated Use availableBalance instead
   */
  availableBalanceCop?: number;
  /**
   * @deprecated Use pendingBalance instead
   */
  pendingBalanceCop?: number;
  /**
   * @deprecated Use minThreshold instead
   */
  minThresholdCop?: number;
};

type PayoutSuccessResult = {
  transferId: string;
  payoutId: string; // Generic payout ID (Stripe or PayPal)
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  newBalance: number;
  // Deprecated fields for backward compatibility
  stripePayoutId?: string;
  grossAmountCop?: number;
  feeAmountCop?: number;
  netAmountCop?: number;
  newBalanceCop?: number;
};

// ========================================
// Form Schema
// ========================================

const InstantPayoutFormSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .int("Amount must be a whole number")
    .positive("Amount must be positive"),
});

type InstantPayoutFormData = z.infer<typeof InstantPayoutFormSchema>;

// ========================================
// Instant Payout Modal Component
// ========================================

/**
 * InstantPayoutModal - Modal for requesting instant payouts with fee calculation
 *
 * Features:
 * - Amount input with validation
 * - Real-time fee calculation
 * - Confirmation step
 * - Success and error states
 * - Quick action buttons (25%, 50%, 75%, 100%)
 * - Multi-currency support (COP, PYG, UYU, ARS)
 *
 * @example
 * ```tsx
 * <InstantPayoutModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   availableBalance={2500000}
 *   feePercentage={1.5}
 *   minThreshold={50000}
 *   currencyCode="COP"
 *   onSuccess={(result) => showSuccessToast(result)}
 * />
 * ```
 */
export function InstantPayoutModal({
  open,
  onClose,
  availableBalance,
  pendingBalance = 0,
  professionalId,
  feePercentage,
  minThreshold,
  onSuccess,
  onError,
  currencyCode,
  // Deprecated props - support backward compatibility
  availableBalanceCop,
  pendingBalanceCop,
  minThresholdCop,
}: InstantPayoutModalProps) {
  const t = useTranslations("dashboard.pro.instantPayoutModal");
  const locale = useLocale();

  // Support deprecated props for backward compatibility
  const balance = availableBalance ?? availableBalanceCop ?? 0;
  const pending = pendingBalance ?? pendingBalanceCop ?? 0;
  const minAmount = minThreshold ?? minThresholdCop ?? 50000;

  const [step, setStep] = useState<"input" | "confirm" | "processing" | "success" | "error">(
    "input"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successResult, setSuccessResult] = useState<PayoutSuccessResult | null>(null);
  const [hasTrackedModalOpen, setHasTrackedModalOpen] = useState(false);

  // ========================================
  // Form Setup
  // ========================================

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstantPayoutFormData>({
    resolver: zodResolver(InstantPayoutFormSchema),
    defaultValues: {
      amount: balance,
    },
  });

  const amount = watch("amount");

  // ========================================
  // Fee Calculations
  // ========================================

  const feeAmount = amount ? Math.round(amount * (feePercentage / 100)) : 0;
  const netAmount = amount ? amount - feeAmount : 0;

  // ========================================
  // Handlers
  // ========================================

  const handleClose = () => {
    onClose();
    // Reset state after animation completes
    setTimeout(() => {
      setStep("input");
      setErrorMessage("");
      setSuccessResult(null);
      reset({ amount: balance });
    }, 300);
  };

  const handleSetPercentage = (percentage: number) => {
    const calculatedAmount = Math.round((balance * percentage) / 100);
    setValue("amount", calculatedAmount, { shouldValidate: true });
  };

  const handleConfirm = (data: InstantPayoutFormData) => {
    setStep("confirm");
  };

  const handleSubmitPayout = async () => {
    setStep("processing");
    const requestTimestamp = Date.now();

    // Track analytics - payout requested
    if (professionalId) {
      trackInstantPayoutRequested({
        professionalId,
        amountCOP: amount, // Analytics still uses COP naming for backward compatibility
        feeAmountCOP: feeAmount,
        feePercentage,
        availableBalanceCOP: balance,
      });
    }

    try {
      const response = await fetch("/api/pro/payouts/instant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send both amount and amountCop for backward compatibility
        body: JSON.stringify({ amount, amountCop: amount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process payout");
      }

      // Handle both new and legacy API response formats
      const payout = result.payout;
      const successData: PayoutSuccessResult = {
        transferId: payout.transferId,
        payoutId: payout.payoutId || payout.stripePayoutId,
        grossAmount: payout.grossAmount ?? payout.grossAmountCop,
        feeAmount: payout.feeAmount ?? payout.feeAmountCop,
        netAmount: payout.netAmount ?? payout.netAmountCop,
        newBalance: result.newBalance?.available ?? result.newBalance?.availableCop,
        // Include deprecated fields for backward compatibility
        stripePayoutId: payout.stripePayoutId,
        grossAmountCop: payout.grossAmountCop ?? payout.grossAmount,
        feeAmountCop: payout.feeAmountCop ?? payout.feeAmount,
        netAmountCop: payout.netAmountCop ?? payout.netAmount,
        newBalanceCop: result.newBalance?.availableCop ?? result.newBalance?.available,
      };

      setSuccessResult(successData);
      setStep("success");
      onSuccess?.(successData);

      // Track analytics - payout completed
      if (professionalId) {
        trackInstantPayoutCompleted({
          professionalId,
          amountCOP: successData.grossAmount,
          feeAmountCOP: successData.feeAmount,
          payoutId: successData.transferId,
          processingTimeMs: Date.now() - requestTimestamp,
        });
      }

      // Auto-close after 3 seconds
      setTimeout(handleClose, 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      setStep("error");
      onError?.(errorMsg);

      // Track analytics - payout failed
      if (professionalId) {
        trackInstantPayoutFailed({
          professionalId,
          amountCOP: amount,
          feeAmountCOP: feeAmount,
          errorMessage: errorMsg,
        });
      }
    }
  };

  // ========================================
  // Effects
  // ========================================

  // Track modal open
  if (open && !hasTrackedModalOpen && professionalId) {
    trackInstantPayoutModalOpened({
      professionalId,
      availableBalanceCOP: balance,
      pendingBalanceCOP: pending,
    });
    setHasTrackedModalOpen(true);
  }

  // Reset tracking flag when modal closes
  if (!open && hasTrackedModalOpen) {
    setHasTrackedModalOpen(false);
  }

  // ========================================
  // Render
  // ========================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="instant-payout-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-orange-100 rounded-lg">
              <Zap className="size-5 text-orange-600" />
            </div>
            <span className={cn("text-neutral-900 text-xl", geistSans.className)}>
              {t("title")}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Input Step */}
        {step === "input" && (
          <form onSubmit={handleSubmit(handleConfirm)} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className={cn("text-neutral-900 text-sm", geistSans.className)}>
                {t("fields.amount.label")}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                {...register("amount", { valueAsNumber: true })}
                className={cn(
                  "font-mono text-lg",
                  errors.amount && "border-red-300 focus-visible:ring-red-500"
                )}
              />
              {errors.amount && (
                <p className={cn("flex items-center gap-1 text-red-600 text-sm", geistSans.className)}>
                  <AlertCircle className="size-4" />
                  {errors.amount.message}
                </p>
              )}

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPercentage(percentage)}
                    className={cn("text-xs", geistSans.className)}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Available Balance */}
            <div className="border-neutral-200 bg-neutral-50 border p-4 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className={cn("text-neutral-600", geistSans.className)}>
                  {t("info.availableBalance")}
                </span>
                <span className={cn("font-medium text-neutral-900", geistSans.className)}>
                  {formatFromMinorUnits(balance, currencyCode)}
                </span>
              </div>
            </div>

            {/* Fee Breakdown */}
            {amount >= minAmount && (
              <div className="space-y-3 border-neutral-200 bg-blue-50 border p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 text-blue-600" />
                  <p className={cn("text-blue-900 text-sm", geistSans.className)}>
                    {t("info.feeExplanation", { percentage: feePercentage })}
                  </p>
                </div>
                <div className="space-y-2 border-blue-200 border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn("text-blue-800", geistSans.className)}>
                      {t("breakdown.requested")}
                    </span>
                    <span className={cn("font-medium text-blue-900", geistSans.className)}>
                      {formatFromMinorUnits(amount, currencyCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn("text-blue-800", geistSans.className)}>
                      {t("breakdown.fee")}
                    </span>
                    <span className={cn("font-medium text-blue-900", geistSans.className)} data-testid="fee-amount">
                      -{formatFromMinorUnits(feeAmount, currencyCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-blue-200 border-t pt-2 font-semibold text-sm">
                    <span className={cn("text-blue-900", geistSans.className)}>
                      {t("breakdown.youReceive")}
                    </span>
                    <span className={cn("text-green-700 text-base", geistSans.className)} data-testid="net-amount">
                      {formatFromMinorUnits(netAmount, currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                {t("actions.cancel")}
              </Button>
              <Button type="submit" className="flex-1 gap-2">
                {t("actions.continue")}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div className="space-y-4 border-neutral-200 bg-neutral-50 border p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-semibold text-neutral-700 text-sm uppercase tracking-wider",
                    geistSans.className
                  )}
                >
                  {t("confirm.youReceive")}
                </span>
                <DollarSign className="size-5 text-neutral-400" />
              </div>
              <p
                className={cn(
                  "font-bold text-4xl text-green-700 tracking-tighter",
                  geistSans.className
                )}
              >
                {formatFromMinorUnits(netAmount, currencyCode)}
              </p>
              <div className="space-y-1 border-neutral-200 border-t pt-3 text-sm">
                <div className="flex justify-between">
                  <span className={cn("text-neutral-600", geistSans.className)}>
                    {t("confirm.requested")}
                  </span>
                  <span className={cn("text-neutral-900", geistSans.className)}>
                    {formatFromMinorUnits(amount, currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={cn("text-neutral-600", geistSans.className)}>
                    {t("confirm.fee")} ({feePercentage}%)
                  </span>
                  <span className={cn("text-neutral-900", geistSans.className)}>
                    -{formatFromMinorUnits(feeAmount, currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-amber-200 bg-amber-50 border p-4 rounded-lg">
              <p className={cn("text-amber-900 text-sm", geistSans.className)}>
                {t("confirm.warning")}
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("input")} className="flex-1">
                {t("actions.back")}
              </Button>
              <Button onClick={handleSubmitPayout} className="flex-1 gap-2">
                <Zap className="size-4" />
                {t("actions.confirmPayout")}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="size-12 animate-spin text-orange-600" />
            <p className={cn("font-medium text-neutral-900", geistSans.className)}>
              {t("processing.title")}
            </p>
            <p className={cn("text-center text-neutral-600 text-sm", geistSans.className)}>
              {t("processing.description")}
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && successResult && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex size-16 items-center justify-center bg-green-100 rounded-full">
              <Check className="size-8 text-green-700" />
            </div>
            <p className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("success.title")}
            </p>
            <div className="w-full space-y-2 border-neutral-200 bg-neutral-50 border p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className={cn("text-neutral-600", geistSans.className)}>
                  {t("success.amount")}
                </span>
                <span className={cn("font-medium text-green-700", geistSans.className)}>
                  {formatFromMinorUnits(successResult.netAmount, currencyCode)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={cn("text-neutral-600", geistSans.className)}>
                  {t("success.newBalance")}
                </span>
                <span className={cn("font-medium text-neutral-900", geistSans.className)}>
                  {formatFromMinorUnits(successResult.newBalance, currencyCode)}
                </span>
              </div>
            </div>
            <p className={cn("text-center text-neutral-600 text-sm", geistSans.className)}>
              {t("success.description")}
            </p>
          </div>
        )}

        {/* Error Step */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex size-16 items-center justify-center bg-red-100 rounded-full">
              <AlertCircle className="size-8 text-red-700" />
            </div>
            <p className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
              {t("error.title")}
            </p>
            <p className={cn("text-center text-neutral-700 text-sm", geistSans.className)}>
              {errorMessage}
            </p>
            <Button onClick={() => setStep("input")} className="mt-4">
              {t("actions.tryAgain")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
