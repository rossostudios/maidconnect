/**
 * Payout Transfer History API Endpoint
 * GET /api/pro/payouts/history
 *
 * Returns paginated history of payout transfers (both instant and batch)
 * Supports filtering by payout type and status
 *
 * Query Parameters:
 * - type: "instant" | "batch" | "all" (default: "all")
 * - status: "completed" | "pending" | "processing" | "failed" | "all" (default: "all")
 * - limit: number of results per page (default: 50, max: 100)
 * - offset: pagination offset (default: 0)
 *
 * Returns:
 * - transfers: Array of payout transfer records
 * - pagination: Metadata about pagination
 * - stats: Aggregate statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { logger } from '@/lib/logger';
import type { Currency } from '@/lib/utils/format';

// ========================================
// Query Parameter Schema
// ========================================

const HistoryQuerySchema = z.object({
  type: z.enum(['instant', 'batch', 'all']).default('all'),
  status: z.enum(['completed', 'pending', 'processing', 'failed', 'all']).default('all'),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

// ========================================
// GET: Fetch Payout Transfer History
// ========================================

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    // ========================================
    // 1. Parse and Validate Query Parameters
    // ========================================

    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      type: searchParams.get('type') || 'all',
      status: searchParams.get('status') || 'all',
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    };

    const validation = HistoryQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { type, status, limit, offset } = validation.data;

    logger.info('[Payout History API] Fetching history', {
      professionalId: user.id,
      type,
      status,
      limit,
      offset,
    });

    // ========================================
    // 2. Build Query with Filters
    // ========================================

    let query = supabaseAdmin
      .from('payout_transfers')
      .select('*', { count: 'exact' })
      .eq('professional_id', user.id)
      .order('requested_at', { ascending: false });

    // Apply payout type filter
    if (type !== 'all') {
      query = query.eq('payout_type', type);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: transfers, error: transfersError, count } = await query;

    if (transfersError) {
      logger.error('[Payout History API] Failed to fetch transfers', {
        professionalId: user.id,
        error: transfersError.message,
      });

      return NextResponse.json({ error: 'Failed to fetch payout history' }, { status: 500 });
    }

    // ========================================
    // 3. Calculate Statistics
    // ========================================

    const { data: stats } = await supabaseAdmin.rpc('get_payout_transfer_stats', {
      p_professional_id: user.id,
    });

    // Fallback stats calculation if RPC function doesn't exist
    const statsData = stats || {
      total_payouts: 0,
      instant_count: 0,
      batch_count: 0,
      total_fees: 0,
      total_instant_amount: 0,
      total_batch_amount: 0,
    };

    // ========================================
    // 4. Enrich Transfers with Currency Code
    // ========================================

    // TODO: Derive currencyCode from professional's country after multi-currency migration
    const currencyCode: Currency = 'COP';

    // Add currencyCode to each transfer record
    // Database still has _cop columns (migration pending)
    const enrichedTransfers = (transfers || []).map((transfer) => ({
      ...transfer,
      currencyCode,
      // Generic field names for client consumption
      amount: transfer.amount_cop,
      feeAmount: transfer.fee_amount_cop,
      // Keep _cop fields for backward compatibility
      amount_cop: transfer.amount_cop,
      fee_amount_cop: transfer.fee_amount_cop,
    }));

    // ========================================
    // 5. Return Response
    // ========================================

    return NextResponse.json({
      success: true,
      transfers: enrichedTransfers,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: count ? offset + limit < count : false,
      },
      stats: {
        currencyCode,
        totalPayouts: statsData.total_payouts || 0,
        instantCount: statsData.instant_count || 0,
        batchCount: statsData.batch_count || 0,
        totalFees: statsData.total_fees || 0,
        totalInstantAmount: statsData.total_instant_amount || 0,
        totalBatchAmount: statsData.total_batch_amount || 0,
      },
    });
  } catch (error) {
    logger.error('[Payout History API] Unexpected error', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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
export const dynamic = 'force-dynamic'; // Always fetch fresh data
