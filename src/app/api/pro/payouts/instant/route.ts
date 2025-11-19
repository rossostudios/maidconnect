/**
 * Instant Payout API Endpoint
 * POST /api/pro/payouts/instant
 *
 * Allows professionals to cash out their available balance instantly for a 1.5% fee.
 * Implements comprehensive validation, rate limiting, and fraud prevention.
 *
 * Business Rules:
 * - Minimum payout: 50,000 COP (~$12 USD)
 * - Fee: 1.5% (configurable via platform_settings)
 * - Rate limit: Max 3 instant payouts per 24 hours
 * - Balance must have cleared 24hr fraud protection period
 * - Requires active Stripe Connect account
 *
 * Security:
 * - Authentication required (professionals only)
 * - Rate limiting via database-enforced daily limits
 * - Atomic balance deduction via PostgreSQL functions
 * - Complete audit trail in balance_audit_log
 *
 * Rate Limit: 10 requests per minute (prevents spam/abuse)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { BalanceService } from '@/lib/services/balance/balance-service';
import { trackServerEvent } from '@/lib/integrations/posthog/server';
import { logger } from '@/lib/logger';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// ========================================
// Request Validation Schema
// ========================================

const InstantPayoutRequestSchema = z.object({
  amountCop: z
    .number()
    .int()
    .positive()
    .min(50000, 'Minimum payout is 50,000 COP (~$12 USD)')
    .max(100000000, 'Maximum payout is 100,000,000 COP (~$25,000 USD)'),
});

type InstantPayoutRequest = z.infer<typeof InstantPayoutRequestSchema>;

// ========================================
// GET: Check Instant Payout Eligibility
// ========================================

/**
 * Returns current balance, fee estimate, and eligibility status
 * Useful for displaying instant payout modal with real-time calculations
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const balanceService = new BalanceService(supabaseAdmin);

    // Get balance breakdown
    const balanceBreakdown = await balanceService.getBalanceBreakdown(user.id);

    // Get instant payout fee percentage
    const feePercentage = await balanceService.getInstantPayoutFeePercentage();

    // Get minimum threshold
    const { data: minThresholdData } = await supabaseAdmin
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'minimum_instant_payout_cop')
      .single();

    const minThresholdCop = minThresholdData
      ? Number(minThresholdData.setting_value)
      : 50000;

    // Check rate limits (today's count)
    const { data: rateLimitData } = await supabaseAdmin
      .from('payout_rate_limits')
      .select('instant_payout_count')
      .eq('professional_id', user.id)
      .eq('payout_date', new Date().toISOString().split('T')[0])
      .single();

    const todayCount = rateLimitData?.instant_payout_count ?? 0;
    const dailyLimit = 3;

    // Check Stripe Connect account
    const { data: profile } = await supabaseAdmin
      .from('professional_profiles')
      .select('stripe_account_id, instant_payout_enabled')
      .eq('profile_id', user.id)
      .single();

    const isEligible =
      balanceBreakdown.availableBalanceCop >= minThresholdCop &&
      todayCount < dailyLimit &&
      profile?.stripe_account_id &&
      profile?.instant_payout_enabled;

    // Calculate fee for available balance (if user wants to cash out everything)
    const feeAmount = Math.round(balanceBreakdown.availableBalanceCop * (feePercentage / 100));
    const netAmount = balanceBreakdown.availableBalanceCop - feeAmount;

    return NextResponse.json({
      success: true,
      balance: {
        availableCop: balanceBreakdown.availableBalanceCop,
        pendingCop: balanceBreakdown.pendingBalanceCop,
        totalCop: balanceBreakdown.totalBalanceCop,
      },
      eligibility: {
        isEligible,
        reasons: !isEligible
          ? [
              balanceBreakdown.availableBalanceCop < minThresholdCop &&
                `Minimum balance is ${minThresholdCop.toLocaleString()} COP`,
              todayCount >= dailyLimit && `Daily limit reached (${dailyLimit} payouts per day)`,
              !profile?.stripe_account_id && 'Stripe Connect account not set up',
              !profile?.instant_payout_enabled && 'Instant payouts disabled for your account',
            ].filter(Boolean)
          : [],
      },
      feeInfo: {
        feePercentage,
        minThresholdCop,
        dailyLimit,
        usedToday: todayCount,
        remainingToday: Math.max(0, dailyLimit - todayCount),
      },
      estimate: {
        grossAmountCop: balanceBreakdown.availableBalanceCop,
        feeAmountCop: feeAmount,
        netAmountCop: netAmount,
      },
      pendingClearances: balanceBreakdown.pendingClearances,
    });
  } catch (error) {
    logger.error('[Instant Payout API] Failed to fetch eligibility', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch instant payout eligibility' },
      { status: 500 }
    );
  }
}

// ========================================
// POST: Request Instant Payout
// ========================================

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const startTime = Date.now();

  try {
    // ========================================
    // 1. Parse and Validate Request
    // ========================================

    const body = await request.json();
    const validation = InstantPayoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { amountCop } = validation.data;

    logger.info('[Instant Payout API] Request initiated', {
      professionalId: user.id,
      requestedAmount: amountCop,
    });

    // ========================================
    // 2. Comprehensive Validation
    // ========================================

    const balanceService = new BalanceService(supabaseAdmin);
    const validationResult = await balanceService.validateInstantPayout(user.id, amountCop);

    if (!validationResult.isValid) {
      logger.warn('[Instant Payout API] Validation failed', {
        professionalId: user.id,
        requestedAmount: amountCop,
        errors: validationResult.errors,
      });

      await trackServerEvent('instant_payout_validation_failed', {
        professional_id: user.id,
        requested_amount_cop: amountCop,
        errors: validationResult.errors,
      });

      return NextResponse.json(
        {
          error: 'Instant payout validation failed',
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
        { status: 400 }
      );
    }

    // ========================================
    // 3. Get Professional Stripe Account
    // ========================================

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('professional_profiles')
      .select('stripe_account_id')
      .eq('profile_id', user.id)
      .single();

    if (profileError || !profile?.stripe_account_id) {
      logger.error('[Instant Payout API] Stripe account not found', {
        professionalId: user.id,
        error: profileError?.message,
      });

      return NextResponse.json(
        { error: 'Stripe Connect account not configured' },
        { status: 400 }
      );
    }

    // ========================================
    // 4. Check Rate Limit (Atomic)
    // ========================================

    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin.rpc(
      'check_instant_payout_rate_limit',
      {
        p_professional_id: user.id,
        p_max_daily_limit: 3,
      }
    );

    if (rateLimitError || !rateLimitCheck) {
      logger.error('[Instant Payout API] Rate limit check failed', {
        professionalId: user.id,
        error: rateLimitError?.message,
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 3 instant payouts per day.' },
        { status: 429 }
      );
    }

    // ========================================
    // 5. Deduct Balance (Atomic)
    // ========================================

    const deductResult = await balanceService.deductForInstantPayout(user.id, amountCop);

    if (!deductResult.success) {
      logger.error('[Instant Payout API] Balance deduction failed', {
        professionalId: user.id,
        requestedAmount: amountCop,
        error: deductResult.message,
      });

      return NextResponse.json({ error: deductResult.message }, { status: 400 });
    }

    // ========================================
    // 6. Create Payout Transfer Record
    // ========================================

    const { data: transfer, error: transferError } = await supabaseAdmin
      .from('payout_transfers')
      .insert({
        professional_id: user.id,
        amount_cop: validationResult.netAmount,
        payout_type: 'instant',
        fee_amount_cop: validationResult.feeAmount,
        fee_percentage: await balanceService.getInstantPayoutFeePercentage(),
        requested_at: new Date().toISOString(),
        status: 'processing',
      })
      .select('id')
      .single();

    if (transferError || !transfer) {
      logger.error('[Instant Payout API] Failed to create transfer record', {
        professionalId: user.id,
        error: transferError?.message,
      });

      // Refund balance since transfer creation failed
      await balanceService.refundFailedPayout(user.id, amountCop);

      return NextResponse.json(
        { error: 'Failed to create payout transfer record' },
        { status: 500 }
      );
    }

    // ========================================
    // 7. Create Stripe Instant Payout
    // ========================================

    let stripePayout: Stripe.Payout;

    try {
      stripePayout = await stripe.payouts.create(
        {
          amount: validationResult.netAmount,
          currency: 'cop',
          method: 'instant',
          statement_descriptor: 'Casaora Payout',
          metadata: {
            transfer_id: transfer.id,
            professional_id: user.id,
            payout_type: 'instant',
            fee_amount_cop: validationResult.feeAmount.toString(),
          },
        },
        {
          stripeAccount: profile.stripe_account_id,
        }
      );

      logger.info('[Instant Payout API] Stripe payout created', {
        professionalId: user.id,
        transferId: transfer.id,
        stripePayoutId: stripePayout.id,
        netAmount: validationResult.netAmount,
        feeAmount: validationResult.feeAmount,
      });
    } catch (stripeError) {
      logger.error('[Instant Payout API] Stripe payout creation failed', {
        professionalId: user.id,
        transferId: transfer.id,
        error: stripeError instanceof Error ? stripeError.message : 'Unknown error',
      });

      // Update transfer status to failed
      await supabaseAdmin
        .from('payout_transfers')
        .update({
          status: 'failed',
          error_message: stripeError instanceof Error ? stripeError.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transfer.id);

      // Refund balance
      await balanceService.refundFailedPayout(user.id, amountCop);

      return NextResponse.json(
        {
          error: 'Failed to process instant payout with Stripe',
          details: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // ========================================
    // 8. Update Transfer with Stripe ID
    // ========================================

    await supabaseAdmin
      .from('payout_transfers')
      .update({
        stripe_payout_id: stripePayout.id,
        status: 'pending', // Will be updated to 'completed' by webhook
        updated_at: new Date().toISOString(),
      })
      .eq('id', transfer.id);

    // ========================================
    // 9. Track Analytics
    // ========================================

    const duration = Date.now() - startTime;

    await trackServerEvent('instant_payout_requested', {
      professional_id: user.id,
      transfer_id: transfer.id,
      stripe_payout_id: stripePayout.id,
      requested_amount_cop: amountCop,
      fee_amount_cop: validationResult.feeAmount,
      net_amount_cop: validationResult.netAmount,
      fee_percentage: await balanceService.getInstantPayoutFeePercentage(),
      arrival_date: stripePayout.arrival_date
        ? new Date(stripePayout.arrival_date * 1000).toISOString()
        : null,
      duration_ms: duration,
    });

    // ========================================
    // 10. Return Success Response
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message: 'Instant payout initiated successfully',
        payout: {
          transferId: transfer.id,
          stripePayoutId: stripePayout.id,
          grossAmountCop: amountCop,
          feeAmountCop: validationResult.feeAmount,
          netAmountCop: validationResult.netAmount,
          status: 'processing',
          arrivalDate: stripePayout.arrival_date
            ? new Date(stripePayout.arrival_date * 1000).toISOString()
            : null,
          requestedAt: new Date().toISOString(),
        },
        newBalance: {
          availableCop: deductResult.newAvailableBalance,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('[Instant Payout API] Unexpected error', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    await trackServerEvent('instant_payout_error', {
      professional_id: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: duration,
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ========================================
// Runtime Configuration
// ========================================

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max (instant payouts should be fast)
