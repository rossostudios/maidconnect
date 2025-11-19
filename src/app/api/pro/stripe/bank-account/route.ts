/**
 * Bank Account Details API Endpoint
 * GET /api/pro/stripe/bank-account
 *
 * Returns bank account details for professional's Stripe Connect account
 * This includes external account information (bank accounts) and verification status
 *
 * Returns:
 * - bankAccounts: Array of connected bank accounts
 * - defaultAccount: ID of default bank account
 * - hasVerifiedAccount: Whether at least one account is verified
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

// ========================================
// GET: Fetch Bank Account Details
// ========================================

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    // ========================================
    // 1. Get Stripe Connect Account ID
    // ========================================

    const { data: profile, error: profileError } = await supabase
      .from('professional_profiles')
      .select('stripe_connect_account_id, stripe_connect_onboarding_status')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    if (!profile.stripe_connect_account_id) {
      return NextResponse.json({
        success: true,
        bankAccounts: [],
        defaultAccount: null,
        hasVerifiedAccount: false,
        requiresOnboarding: true,
      });
    }

    // ========================================
    // 2. Fetch Account from Stripe
    // ========================================

    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);

    // ========================================
    // 3. Get External Accounts (Bank Accounts)
    // ========================================

    const externalAccounts = await stripe.accounts.listExternalAccounts(
      profile.stripe_connect_account_id,
      {
        object: 'bank_account',
        limit: 10,
      }
    );

    // ========================================
    // 4. Format Bank Account Data
    // ========================================

    const bankAccounts = externalAccounts.data.map((account) => {
      if (account.object === 'bank_account') {
        return {
          id: account.id,
          bankName: account.bank_name || 'Unknown Bank',
          last4: account.last4,
          currency: account.currency.toUpperCase(),
          routingNumber: account.routing_number,
          accountHolderName: account.account_holder_name,
          accountHolderType: account.account_holder_type,
          status: account.status,
          isDefault: account.default_for_currency,
        };
      }
      return null;
    }).filter(Boolean);

    const hasVerifiedAccount = bankAccounts.some((acc) => acc?.status === 'verified');

    logger.info('[Bank Account API] Fetched bank accounts', {
      professionalId: user.id,
      accountCount: bankAccounts.length,
      hasVerifiedAccount,
    });

    // ========================================
    // 5. Return Response
    // ========================================

    return NextResponse.json({
      success: true,
      bankAccounts,
      defaultAccount: account.default_currency || 'cop',
      hasVerifiedAccount,
      requiresOnboarding: false,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (error) {
    logger.error('[Bank Account API] Failed to fetch bank accounts', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch bank account details',
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
export const dynamic = 'force-dynamic';
