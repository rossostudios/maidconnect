/**
 * Balance Service
 *
 * Handles all professional balance operations for the instant payout system:
 * - Real-time balance calculations (pending & available)
 * - Balance updates on booking completion
 * - 24-hour clearance period management
 * - Atomic balance deductions for payouts
 *
 * Business Model (Airbnb-style):
 * - Professionals keep 100% of their listed rate
 * - Customers pay a 15% service fee on top (handled at checkout)
 * - Platform commission from professionals: 0%
 *
 * Balance Rules:
 * - Pending Balance: Bookings completed < 24 hours ago (fraud protection)
 * - Available Balance: Bookings cleared after 24-hour hold period
 * - Instant Payout Fee: 1.5% of payout amount (configurable)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Currency } from "@/lib/utils/format";
import type { Database } from "@/types/supabase";

// ========================================
// Type Definitions
// ========================================

export type BalanceBreakdown = {
  professionalId: string;
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  currencyCode: Currency;
  lastUpdate: string | null;
  pendingClearances: PendingClearance[];
};

export type PendingClearance = {
  bookingId: string;
  amount: number;
  currencyCode: Currency;
  completedAt: string;
  clearanceAt: string;
  hoursRemaining: number;
};

export type BalanceUpdate = {
  success: boolean;
  newAvailableBalance: number;
  newPendingBalance: number;
  currencyCode: Currency;
  message?: string;
};

export type InstantPayoutValidation = {
  isValid: boolean;
  availableBalance: number;
  requestedAmount: number;
  feeAmount: number;
  netAmount: number;
  currencyCode: Currency;
  errors: string[];
  warnings: string[];
};

// ========================================
// Constants
// ========================================

const PLATFORM_FEE_PERCENTAGE = 0; // Airbnb model: pros keep 100%, customer pays fee
const CLEARANCE_PERIOD_HOURS = 24; // 24-hour fraud protection hold
const DEFAULT_INSTANT_PAYOUT_FEE = 1.5; // 1.5% fee
const DEFAULT_MINIMUM_PAYOUT = 50_000; // 50,000 COP (~$12 USD)
const DEFAULT_DAILY_LIMIT = 3; // Max 3 instant payouts per day

// ========================================
// Balance Service Class
// ========================================

export class BalanceService {
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  // ========================================
  // Public Methods - Balance Queries
  // ========================================

  /**
   * Get comprehensive balance breakdown for a professional
   * Includes both database values and calculated pending clearances
   *
   * TODO: After database migration, derive currencyCode from professional's country field
   * Currently hardcoded to COP since database only has _cop columns
   */
  async getBalanceBreakdown(professionalId: string): Promise<BalanceBreakdown> {
    // Fetch current balance from database
    const { data: profile, error: profileError } = await this.supabase
      .from("professional_profiles")
      .select("available_balance_cents, pending_balance_cents, last_balance_update")
      .eq("profile_id", professionalId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to fetch professional balance: ${profileError?.message}`);
    }

    // Fetch pending clearances
    const { data: clearances, error: clearanceError } = await this.supabase
      .from("balance_clearance_queue")
      .select("booking_id, amount_cop, completed_at, clearance_at")
      .eq("professional_id", professionalId)
      .eq("status", "pending")
      .order("clearance_at", { ascending: true });

    if (clearanceError) {
      throw new Error(`Failed to fetch pending clearances: ${clearanceError.message}`);
    }

    // TODO: Derive currency from professional's country after migration
    const currencyCode: Currency = "COP";

    // Calculate hours remaining for each clearance
    const now = new Date();
    const pendingClearances: PendingClearance[] = (clearances || []).map((clearance) => {
      const clearanceDate = new Date(clearance.clearance_at);
      const hoursRemaining = Math.max(
        0,
        Math.ceil((clearanceDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      );

      return {
        bookingId: clearance.booking_id,
        amount: clearance.amount_cop, // Database still uses _cop column
        currencyCode,
        completedAt: clearance.completed_at,
        clearanceAt: clearance.clearance_at,
        hoursRemaining,
      };
    });

    return {
      professionalId,
      availableBalance: profile.available_balance_cents ?? 0,
      pendingBalance: profile.pending_balance_cents ?? 0,
      totalBalance: (profile.available_balance_cents ?? 0) + (profile.pending_balance_cents ?? 0),
      currencyCode,
      lastUpdate: profile.last_balance_update,
      pendingClearances,
    };
  }

  /**
   * Calculate net professional earnings from a booking amount
   * Airbnb model: professionals keep 100% of their rate
   * (Customer pays the 15% service fee separately at checkout)
   */
  calculateProfessionalEarnings(bookingAmount: number): number {
    // Pros keep 100% - no platform fee deducted from their earnings
    return Math.round(bookingAmount * (1 - PLATFORM_FEE_PERCENTAGE));
  }

  /**
   * Get instant payout fee configuration from platform settings
   */
  async getInstantPayoutFeePercentage(): Promise<number> {
    const { data, error } = await this.supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "instant_payout_fee_percentage")
      .single();

    if (error || !data) {
      console.warn(
        "Failed to fetch instant payout fee, using default:",
        DEFAULT_INSTANT_PAYOUT_FEE
      );
      return DEFAULT_INSTANT_PAYOUT_FEE;
    }

    const feeValue =
      typeof data.setting_value === "number"
        ? data.setting_value
        : Number.parseFloat(String(data.setting_value));

    return Number.isNaN(feeValue) ? DEFAULT_INSTANT_PAYOUT_FEE : feeValue;
  }

  /**
   * Get minimum payout amount from platform settings
   */
  async getMinimumPayoutAmount(): Promise<number> {
    const { data, error } = await this.supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "minimum_instant_payout_cop")
      .single();

    if (error || !data) {
      console.warn("Failed to fetch minimum payout, using default:", DEFAULT_MINIMUM_PAYOUT);
      return DEFAULT_MINIMUM_PAYOUT;
    }

    const minValue =
      typeof data.setting_value === "number"
        ? data.setting_value
        : Number.parseInt(String(data.setting_value), 10);

    return Number.isNaN(minValue) ? DEFAULT_MINIMUM_PAYOUT : minValue;
  }

  // ========================================
  // Public Methods - Balance Updates
  // ========================================

  /**
   * Add booking earnings to pending balance
   * Called when a booking is completed (not yet cleared)
   *
   * TODO: Accept currencyCode parameter after multi-currency migration
   */
  async addToPendingBalance(
    professionalId: string,
    bookingId: string,
    bookingAmountCop: number
  ): Promise<BalanceUpdate> {
    const professionalEarnings = this.calculateProfessionalEarnings(bookingAmountCop);
    const clearanceAt = new Date();
    clearanceAt.setHours(clearanceAt.getHours() + CLEARANCE_PERIOD_HOURS);

    // TODO: Hardcoded to COP until database migration
    const currencyCode: Currency = "COP";

    // Use database function for atomic update
    const { error: balanceError } = await this.supabase.rpc("add_to_pending_balance", {
      p_professional_id: professionalId,
      p_amount_cop: professionalEarnings,
    });

    if (balanceError) {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Failed to update pending balance: ${balanceError.message}`,
      };
    }

    // Add to clearance queue
    const { error: queueError } = await this.supabase.from("balance_clearance_queue").insert({
      booking_id: bookingId,
      professional_id: professionalId,
      amount_cop: professionalEarnings,
      completed_at: new Date().toISOString(),
      clearance_at: clearanceAt.toISOString(),
      status: "pending",
    });

    if (queueError) {
      console.error("Failed to add to clearance queue:", queueError);
      // Don't fail the balance update if queue insert fails
    }

    // Fetch updated balances
    const breakdown = await this.getBalanceBreakdown(professionalId);

    return {
      success: true,
      newAvailableBalance: breakdown.availableBalance,
      newPendingBalance: breakdown.pendingBalance,
      currencyCode: breakdown.currencyCode,
      message: `Added ${professionalEarnings} ${currencyCode} to pending balance. Available after 24hr hold.`,
    };
  }

  /**
   * Move booking earnings from pending to available balance
   * Called after 24-hour clearance period
   */
  async clearPendingBalance(bookingId: string): Promise<BalanceUpdate> {
    // TODO: Hardcoded to COP until database migration
    const currencyCode: Currency = "COP";

    // Fetch clearance record
    const { data: clearance, error: fetchError } = await this.supabase
      .from("balance_clearance_queue")
      .select("professional_id, amount_cop, status")
      .eq("booking_id", bookingId)
      .single();

    if (fetchError || !clearance) {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Clearance record not found for booking ${bookingId}`,
      };
    }

    if (clearance.status !== "pending") {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Booking ${bookingId} already processed (status: ${clearance.status})`,
      };
    }

    // Use database function for atomic transfer
    const { error: transferError } = await this.supabase.rpc("clear_pending_balance", {
      p_professional_id: clearance.professional_id,
      p_amount_cop: clearance.amount_cop,
    });

    if (transferError) {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Failed to clear pending balance: ${transferError.message}`,
      };
    }

    // Update clearance status
    const { error: updateError } = await this.supabase
      .from("balance_clearance_queue")
      .update({
        status: "cleared",
        cleared_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId);

    if (updateError) {
      console.error("Failed to update clearance status:", updateError);
      // Don't fail if status update fails
    }

    // Fetch updated balances
    const breakdown = await this.getBalanceBreakdown(clearance.professional_id);

    return {
      success: true,
      newAvailableBalance: breakdown.availableBalance,
      newPendingBalance: breakdown.pendingBalance,
      currencyCode: breakdown.currencyCode,
      message: `Cleared ${clearance.amount_cop} ${currencyCode} to available balance.`,
    };
  }

  /**
   * Process batch clearances for all bookings past 24-hour hold
   * Called by scheduled job (hourly)
   */
  async processBatchClearances(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const now = new Date().toISOString();

    // Fetch all pending clearances past their clearance time
    const { data: clearances, error: fetchError } = await this.supabase
      .from("balance_clearance_queue")
      .select("booking_id, professional_id, amount_cop")
      .eq("status", "pending")
      .lt("clearance_at", now)
      .order("clearance_at", { ascending: true });

    if (fetchError) {
      return {
        processed: 0,
        failed: 0,
        errors: [`Failed to fetch clearances: ${fetchError.message}`],
      };
    }

    if (!clearances || clearances.length === 0) {
      return {
        processed: 0,
        failed: 0,
        errors: [],
      };
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each clearance
    for (const clearance of clearances) {
      const result = await this.clearPendingBalance(clearance.booking_id);
      if (result.success) {
        processed++;
      } else {
        failed++;
        errors.push(`Booking ${clearance.booking_id}: ${result.message}`);
      }
    }

    return { processed, failed, errors };
  }

  /**
   * Deduct amount from available balance for instant payout
   * Called when instant payout is processed
   *
   * TODO: Accept currencyCode parameter after multi-currency migration
   */
  async deductForInstantPayout(professionalId: string, amountCop: number): Promise<BalanceUpdate> {
    // TODO: Hardcoded to COP until database migration
    const currencyCode: Currency = "COP";

    // Use database function for atomic deduction
    const { error: deductError } = await this.supabase.rpc("deduct_available_balance", {
      p_professional_id: professionalId,
      p_amount_cop: amountCop,
    });

    if (deductError) {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Failed to deduct balance: ${deductError.message}`,
      };
    }

    // Fetch updated balances
    const breakdown = await this.getBalanceBreakdown(professionalId);

    return {
      success: true,
      newAvailableBalance: breakdown.availableBalance,
      newPendingBalance: breakdown.pendingBalance,
      currencyCode: breakdown.currencyCode,
      message: `Deducted ${amountCop} ${currencyCode} for instant payout.`,
    };
  }

  /**
   * Refund amount to available balance if payout fails
   * Called when Stripe payout fails
   *
   * TODO: Accept currencyCode parameter after multi-currency migration
   */
  async refundFailedPayout(professionalId: string, amountCop: number): Promise<BalanceUpdate> {
    // TODO: Hardcoded to COP until database migration
    const currencyCode: Currency = "COP";

    // Use database function for atomic refund
    const { error: refundError } = await this.supabase.rpc("refund_available_balance", {
      p_professional_id: professionalId,
      p_amount_cop: amountCop,
    });

    if (refundError) {
      return {
        success: false,
        newAvailableBalance: 0,
        newPendingBalance: 0,
        currencyCode,
        message: `Failed to refund balance: ${refundError.message}`,
      };
    }

    // Fetch updated balances
    const breakdown = await this.getBalanceBreakdown(professionalId);

    return {
      success: true,
      newAvailableBalance: breakdown.availableBalance,
      newPendingBalance: breakdown.pendingBalance,
      currencyCode: breakdown.currencyCode,
      message: `Refunded ${amountCop} ${currencyCode} after failed payout.`,
    };
  }

  // ========================================
  // Public Methods - Instant Payout Validation
  // ========================================

  /**
   * Validate instant payout request
   * Checks balance, amount, rate limits, and Stripe status
   *
   * TODO: Accept currencyCode parameter after multi-currency migration
   */
  async validateInstantPayout(
    professionalId: string,
    requestedAmountCop: number
  ): Promise<InstantPayoutValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // TODO: Hardcoded to COP until database migration
    const currencyCode: Currency = "COP";

    // 1. Fetch professional profile
    const { data: profile, error: profileError } = await this.supabase
      .from("professional_profiles")
      .select(
        "available_balance_cents, instant_payout_enabled, stripe_connect_account_id, stripe_connect_onboarding_status"
      )
      .eq("profile_id", professionalId)
      .single();

    if (profileError || !profile) {
      errors.push("Professional profile not found");
      return {
        isValid: false,
        availableBalance: 0,
        requestedAmount: requestedAmountCop,
        feeAmount: 0,
        netAmount: 0,
        currencyCode,
        errors,
        warnings,
      };
    }

    const availableBalance = profile.available_balance_cents ?? 0;

    // 2. Check if instant payouts are enabled for this professional
    if (!profile.instant_payout_enabled) {
      errors.push("Instant payouts are disabled for your account. Please contact support.");
    }

    // 3. Check Stripe Connect status
    if (!profile.stripe_connect_account_id) {
      errors.push("Please complete your payout setup before requesting an instant payout.");
    } else if (profile.stripe_connect_onboarding_status !== "complete") {
      errors.push("Your payout account setup is incomplete. Please finish setup first.");
    }

    // 4. Get minimum payout amount
    const minimumPayout = await this.getMinimumPayoutAmount();
    if (requestedAmountCop < minimumPayout) {
      errors.push(
        `Minimum instant payout is ${minimumPayout.toLocaleString()} COP (~$${Math.round(minimumPayout / 4000)} USD)`
      );
    }

    // 5. Check available balance
    if (requestedAmountCop > availableBalance) {
      errors.push(
        `Insufficient balance. You have ${availableBalance.toLocaleString()} COP available, but requested ${requestedAmountCop.toLocaleString()} COP.`
      );
    }

    // 6. Calculate fees
    const feePercentage = await this.getInstantPayoutFeePercentage();
    const feeAmount = Math.round(requestedAmountCop * (feePercentage / 100));
    const netAmount = requestedAmountCop - feeAmount;

    // 7. Check rate limiting
    const { data: rateLimit } = await this.supabase
      .from("payout_rate_limits")
      .select("instant_payout_count")
      .eq("professional_id", professionalId)
      .eq("payout_date", new Date().toISOString().split("T")[0])
      .single();

    const currentCount = rateLimit?.instant_payout_count ?? 0;
    if (currentCount >= DEFAULT_DAILY_LIMIT) {
      errors.push(
        `Daily limit reached. You can request up to ${DEFAULT_DAILY_LIMIT} instant payouts per day. Please try again tomorrow.`
      );
    } else if (currentCount >= DEFAULT_DAILY_LIMIT - 1) {
      warnings.push(
        `This will be your last instant payout for today (${currentCount + 1}/${DEFAULT_DAILY_LIMIT}).`
      );
    }

    // 8. Fraud check: Flag unusually large amounts
    const averageBookingValue = 200_000; // TODO: Calculate from professional's booking history
    if (requestedAmountCop > averageBookingValue * 5) {
      warnings.push(
        "This payout amount is unusually high. It may require manual approval and take longer to process."
      );
    }

    return {
      isValid: errors.length === 0,
      availableBalance,
      requestedAmount: requestedAmountCop,
      feeAmount,
      netAmount,
      currencyCode,
      errors,
      warnings,
    };
  }

  /**
   * Check and increment rate limit atomically
   */
  async checkAndIncrementRateLimit(professionalId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("check_instant_payout_rate_limit", {
      p_professional_id: professionalId,
      p_max_daily_limit: DEFAULT_DAILY_LIMIT,
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      return false; // Fail closed - deny payout if rate limit check fails
    }

    return data === true;
  }
}

// ========================================
// Usage Example
// ========================================
// import { createSupabaseServerClient } from '@/lib/supabase/server-client';
// const supabase = await createSupabaseServerClient();
// const balanceService = new BalanceService(supabase);
