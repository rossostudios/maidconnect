-- =====================================================
-- Instant Payout System Migration
-- =====================================================
-- Purpose: Enable professionals to cash out instantly for a fee
-- Features: Real-time balance tracking, configurable fees, rate limiting
-- Business Impact: Retention & loyalty through fastest payouts in Colombia
-- =====================================================

-- =====================================================
-- 1. Platform Settings Table (Configurable Fees)
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add instant payout fee configuration (1.5% default)
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'instant_payout_fee_percentage',
  '1.5'::jsonb,
  'Percentage fee charged for instant payouts (e.g., 1.5 = 1.5%). Can be adjusted based on Stripe costs and business needs.'
) ON CONFLICT (setting_key) DO NOTHING;

-- Add minimum payout threshold (50,000 COP)
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'minimum_instant_payout_cop',
  '50000'::jsonb,
  'Minimum balance required to request an instant payout (in COP cents). Currently 50,000 COP (~$12 USD).'
) ON CONFLICT (setting_key) DO NOTHING;

-- Add rate limit configuration (3 per day)
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'instant_payout_daily_limit',
  '3'::jsonb,
  'Maximum number of instant payouts a professional can request per 24-hour period. Prevents abuse and fraud.'
) ON CONFLICT (setting_key) DO NOTHING;

COMMENT ON TABLE platform_settings IS 'Global platform configuration settings for fees, limits, and business rules';

-- =====================================================
-- 2. Professional Profiles - Add Balance Fields
-- =====================================================

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS available_balance_cop BIGINT DEFAULT 0 CHECK (available_balance_cop >= 0),
  ADD COLUMN IF NOT EXISTS pending_balance_cop BIGINT DEFAULT 0 CHECK (pending_balance_cop >= 0),
  ADD COLUMN IF NOT EXISTS last_balance_update TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instant_payout_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN professional_profiles.available_balance_cop IS
  'Balance available for instant withdrawal (cleared after 24hr hold). Amount in COP cents.';

COMMENT ON COLUMN professional_profiles.pending_balance_cop IS
  'Balance pending clearance (24hr hold period after booking completion). Amount in COP cents.';

COMMENT ON COLUMN professional_profiles.last_balance_update IS
  'Timestamp of last balance update for audit trail';

COMMENT ON COLUMN professional_profiles.instant_payout_enabled IS
  'Whether professional can use instant payout feature (can be disabled for risk management)';

-- Create index for balance queries (used frequently in dashboard)
CREATE INDEX IF NOT EXISTS idx_professional_profiles_balance
  ON professional_profiles(available_balance_cop DESC)
  WHERE available_balance_cop > 0;

-- =====================================================
-- 3. Payout Transfers - Add Instant Payout Support
-- =====================================================

-- Add new columns for instant payout tracking
ALTER TABLE payout_transfers
  ADD COLUMN IF NOT EXISTS payout_type TEXT DEFAULT 'batch' CHECK (payout_type IN ('batch', 'instant')),
  ADD COLUMN IF NOT EXISTS fee_amount_cop BIGINT DEFAULT 0 CHECK (fee_amount_cop >= 0),
  ADD COLUMN IF NOT EXISTS fee_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;

COMMENT ON COLUMN payout_transfers.payout_type IS
  'Type of payout: "batch" for weekly payouts, "instant" for on-demand cashouts';

COMMENT ON COLUMN payout_transfers.fee_amount_cop IS
  'Fee charged for instant payout in COP cents. Zero for batch payouts.';

COMMENT ON COLUMN payout_transfers.fee_percentage IS
  'Fee percentage used for this payout (audit trail if fee changes over time). E.g., 1.50 = 1.5%';

COMMENT ON COLUMN payout_transfers.requested_at IS
  'Timestamp when professional requested the payout (for instant payouts)';

-- Create index for payout type filtering
CREATE INDEX IF NOT EXISTS idx_payout_transfers_type
  ON payout_transfers(payout_type, created_at DESC);

-- Create index for professional payout history
CREATE INDEX IF NOT EXISTS idx_payout_transfers_professional
  ON payout_transfers(professional_id, created_at DESC);

-- =====================================================
-- 4. Payout Rate Limits Table (Fraud Prevention)
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  instant_payout_count INTEGER DEFAULT 0 CHECK (instant_payout_count >= 0),
  last_payout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One record per professional per day
  UNIQUE(professional_id, payout_date)
);

COMMENT ON TABLE payout_rate_limits IS
  'Tracks daily instant payout count per professional to prevent abuse. Max 3 instant payouts per 24hr period.';

-- Index for rate limit checks (hot path - checked on every instant payout request)
CREATE INDEX IF NOT EXISTS idx_payout_rate_limits_lookup
  ON payout_rate_limits(professional_id, payout_date);

-- =====================================================
-- 5. Balance Clearance Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS balance_clearance_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cop BIGINT NOT NULL CHECK (amount_cop > 0),
  completed_at TIMESTAMPTZ NOT NULL,
  clearance_at TIMESTAMPTZ NOT NULL, -- completed_at + 24 hours
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'disputed', 'cancelled')),
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE balance_clearance_queue IS
  'Tracks bookings waiting for 24hr clearance period before funds become available for instant payout. Prevents chargeback risk.';

-- Index for scheduled job to process clearances
CREATE INDEX IF NOT EXISTS idx_balance_clearance_pending
  ON balance_clearance_queue(clearance_at, status)
  WHERE status = 'pending';

-- Index for professional balance queries
CREATE INDEX IF NOT EXISTS idx_balance_clearance_professional
  ON balance_clearance_queue(professional_id, status);

-- =====================================================
-- 6. Database Functions for Atomic Balance Operations
-- =====================================================

-- Function: Add amount to pending balance (called when booking completes)
CREATE OR REPLACE FUNCTION add_to_pending_balance(
  p_professional_id UUID,
  p_amount_cop BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE professional_profiles
  SET
    pending_balance_cop = pending_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_to_pending_balance IS
  'Atomically adds amount to professional pending balance. Called when booking is completed.';

-- Function: Move amount from pending to available (called after 24hr clearance)
CREATE OR REPLACE FUNCTION clear_pending_balance(
  p_professional_id UUID,
  p_amount_cop BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE professional_profiles
  SET
    pending_balance_cop = pending_balance_cop - p_amount_cop,
    available_balance_cop = available_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id
    AND pending_balance_cop >= p_amount_cop; -- Safety check

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient pending balance for professional %', p_professional_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clear_pending_balance IS
  'Moves amount from pending to available balance after 24hr clearance. Includes safety checks.';

-- Function: Deduct amount from available balance (called when instant payout is processed)
CREATE OR REPLACE FUNCTION deduct_available_balance(
  p_professional_id UUID,
  p_amount_cop BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE professional_profiles
  SET
    available_balance_cop = available_balance_cop - p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id
    AND available_balance_cop >= p_amount_cop; -- Safety check

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient available balance for professional %', p_professional_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION deduct_available_balance IS
  'Deducts amount from available balance when instant payout is processed. Prevents overdrafts.';

-- Function: Refund balance (called if instant payout fails)
CREATE OR REPLACE FUNCTION refund_available_balance(
  p_professional_id UUID,
  p_amount_cop BIGINT
) RETURNS VOID AS $$
BEGIN
  UPDATE professional_profiles
  SET
    available_balance_cop = available_balance_cop + p_amount_cop,
    last_balance_update = NOW()
  WHERE profile_id = p_professional_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refund_available_balance IS
  'Refunds amount to available balance if instant payout fails (e.g., Stripe error).';

-- Function: Check and increment rate limit
CREATE OR REPLACE FUNCTION check_instant_payout_rate_limit(
  p_professional_id UUID,
  p_max_daily_limit INTEGER DEFAULT 3
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Upsert today's rate limit record
  INSERT INTO payout_rate_limits (professional_id, payout_date, instant_payout_count, last_payout_at)
  VALUES (p_professional_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (professional_id, payout_date)
  DO UPDATE SET
    instant_payout_count = payout_rate_limits.instant_payout_count + 1,
    last_payout_at = NOW(),
    updated_at = NOW()
  RETURNING instant_payout_count INTO v_current_count;

  -- Return true if under limit, false if exceeded
  RETURN v_current_count <= p_max_daily_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_instant_payout_rate_limit IS
  'Atomically checks and increments daily instant payout count. Returns true if under limit (default: 3/day).';

-- =====================================================
-- 7. Triggers for Balance Audit Trail
-- =====================================================

-- Create audit log table for balance changes
CREATE TABLE IF NOT EXISTS balance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('add_pending', 'clear_to_available', 'deduct_payout', 'refund')),
  amount_cop BIGINT NOT NULL,
  balance_before_cop BIGINT,
  balance_after_cop BIGINT,
  balance_type TEXT NOT NULL CHECK (balance_type IN ('pending', 'available')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  payout_transfer_id UUID REFERENCES payout_transfers(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE balance_audit_log IS
  'Audit trail for all balance changes. Critical for debugging, dispute resolution, and accounting.';

CREATE INDEX IF NOT EXISTS idx_balance_audit_professional
  ON balance_audit_log(professional_id, created_at DESC);

-- Trigger function to log balance changes
CREATE OR REPLACE FUNCTION log_balance_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log pending balance changes
  IF OLD.pending_balance_cop IS DISTINCT FROM NEW.pending_balance_cop THEN
    INSERT INTO balance_audit_log (
      professional_id,
      change_type,
      amount_cop,
      balance_before_cop,
      balance_after_cop,
      balance_type
    ) VALUES (
      NEW.profile_id,
      CASE
        WHEN NEW.pending_balance_cop > OLD.pending_balance_cop THEN 'add_pending'
        ELSE 'clear_to_available'
      END,
      ABS(NEW.pending_balance_cop - OLD.pending_balance_cop),
      OLD.pending_balance_cop,
      NEW.pending_balance_cop,
      'pending'
    );
  END IF;

  -- Log available balance changes
  IF OLD.available_balance_cop IS DISTINCT FROM NEW.available_balance_cop THEN
    INSERT INTO balance_audit_log (
      professional_id,
      change_type,
      amount_cop,
      balance_before_cop,
      balance_after_cop,
      balance_type
    ) VALUES (
      NEW.profile_id,
      CASE
        WHEN NEW.available_balance_cop > OLD.available_balance_cop THEN 'refund'
        ELSE 'deduct_payout'
      END,
      ABS(NEW.available_balance_cop - OLD.available_balance_cop),
      OLD.available_balance_cop,
      NEW.available_balance_cop,
      'available'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to professional_profiles
DROP TRIGGER IF EXISTS trigger_log_balance_changes ON professional_profiles;
CREATE TRIGGER trigger_log_balance_changes
  AFTER UPDATE OF pending_balance_cop, available_balance_cop ON professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_balance_change();

-- =====================================================
-- 8. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_clearance_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_audit_log ENABLE ROW LEVEL SECURITY;

-- Platform settings: Admin read/write, professionals read-only
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Professionals can view platform settings"
  ON platform_settings FOR SELECT
  USING (true); -- All authenticated users can read

-- Rate limits: Professionals can view own, admins can view all
CREATE POLICY "Professionals can view own rate limits"
  ON payout_rate_limits FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can manage all rate limits"
  ON payout_rate_limits FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Balance clearance queue: Similar to rate limits
CREATE POLICY "Professionals can view own clearance queue"
  ON balance_clearance_queue FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can manage clearance queue"
  ON balance_clearance_queue FOR ALL
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- Balance audit log: View only, no deletes
CREATE POLICY "Professionals can view own balance audit log"
  ON balance_audit_log FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can view all balance audit logs"
  ON balance_audit_log FOR SELECT
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- =====================================================
-- 9. Initial Data Migration - Backfill Balances
-- =====================================================

DO $$
DECLARE
  v_migrated_count INTEGER := 0;
BEGIN
  -- Calculate initial balances for all professionals
  -- Available balance = sum of completed bookings older than 24hrs
  -- Pending balance = sum of completed bookings within last 24hrs

  WITH professional_earnings AS (
    SELECT
      pp.profile_id as professional_id,
      -- Available: bookings completed > 24 hours ago, not yet paid out
      COALESCE(SUM(
        CASE
          WHEN b.status = 'completed'
            AND b.updated_at < (NOW() - INTERVAL '24 hours')
            AND b.final_amount_captured IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM payout_transfers pt
              WHERE pt.booking_id = b.id
              AND pt.status IN ('pending', 'completed')
            )
          THEN ROUND(b.final_amount_captured * 0.82) -- After 18% platform fee
          ELSE 0
        END
      ), 0)::BIGINT as available,

      -- Pending: bookings completed in last 24 hours, not yet paid out
      COALESCE(SUM(
        CASE
          WHEN b.status = 'completed'
            AND b.updated_at >= (NOW() - INTERVAL '24 hours')
            AND b.final_amount_captured IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM payout_transfers pt
              WHERE pt.booking_id = b.id
              AND pt.status IN ('pending', 'completed')
            )
          THEN ROUND(b.final_amount_captured * 0.82) -- After 18% platform fee
          ELSE 0
        END
      ), 0)::BIGINT as pending
    FROM professional_profiles pp
    LEFT JOIN bookings b ON b.professional_id = pp.profile_id
    GROUP BY pp.profile_id
  )
  UPDATE professional_profiles pp
  SET
    available_balance_cop = pe.available,
    pending_balance_cop = pe.pending,
    last_balance_update = NOW()
  FROM professional_earnings pe
  WHERE pp.profile_id = pe.professional_id
    AND (pe.available > 0 OR pe.pending > 0);

  GET DIAGNOSTICS v_migrated_count = ROW_COUNT;

  RAISE NOTICE 'Backfilled balances for % professionals', v_migrated_count;
  RAISE NOTICE 'Total available balance across platform: % COP', (
    SELECT COALESCE(SUM(available_balance_cop), 0) FROM professional_profiles
  );
  RAISE NOTICE 'Total pending balance across platform: % COP', (
    SELECT COALESCE(SUM(pending_balance_cop), 0) FROM professional_profiles
  );
END $$;

-- =====================================================
-- 10. Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Instant Payout System Migration Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Real-time balance tracking (pending + available)';
  RAISE NOTICE '  ✓ Configurable instant payout fee (1.5%% default)';
  RAISE NOTICE '  ✓ 24-hour clearance period for fraud protection';
  RAISE NOTICE '  ✓ Rate limiting (3 instant payouts per day)';
  RAISE NOTICE '  ✓ Complete audit trail for compliance';
  RAISE NOTICE '  ✓ RLS policies for security';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy BalanceService for business logic';
  RAISE NOTICE '  2. Create /api/pro/payouts/instant endpoint';
  RAISE NOTICE '  3. Build instant payout UI in finances dashboard';
  RAISE NOTICE '  4. Set up scheduled job for balance clearance';
  RAISE NOTICE '========================================';
END $$;
