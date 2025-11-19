-- =====================================================
-- Trial Credit System for Direct Hire Conversion
-- =====================================================
-- Purpose: Gamify gig-to-employee transition by offering
--          50% credit on bookings toward direct hire fee
-- Strategy: De-risk $299 placement fee with partial refund
-- =====================================================

-- =====================================================
-- 1. Create trial_credits table
-- =====================================================
-- Tracks trial credit eligibility and usage per customer-professional pair
-- Scope: Per-professional (customers can earn separate credits with different pros)
-- Credit: 50% of completed booking fees, capped at 50% of direct hire fee (~$150 USD)

CREATE TABLE IF NOT EXISTS trial_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Tracking metrics
  total_bookings_count INTEGER NOT NULL DEFAULT 0,
  total_bookings_value_cop BIGINT NOT NULL DEFAULT 0,  -- Sum of all completed booking fees
  credit_earned_cop BIGINT NOT NULL DEFAULT 0,         -- 50% of total bookings (capped)
  credit_used_cop BIGINT NOT NULL DEFAULT 0,           -- Credit applied to direct hire
  credit_remaining_cop BIGINT NOT NULL DEFAULT 0,      -- Available credit balance

  -- Metadata
  last_booking_at TIMESTAMPTZ,
  last_booking_id UUID REFERENCES bookings(id),
  credit_applied_to_booking_id UUID REFERENCES bookings(id),  -- Direct hire booking that used credit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT trial_credits_customer_professional_unique UNIQUE(customer_id, professional_id),
  CONSTRAINT trial_credits_bookings_count_positive CHECK (total_bookings_count >= 0),
  CONSTRAINT trial_credits_value_positive CHECK (total_bookings_value_cop >= 0),
  CONSTRAINT trial_credits_earned_positive CHECK (credit_earned_cop >= 0),
  CONSTRAINT trial_credits_used_positive CHECK (credit_used_cop >= 0),
  CONSTRAINT trial_credits_remaining_positive CHECK (credit_remaining_cop >= 0),
  CONSTRAINT trial_credits_remaining_valid CHECK (credit_remaining_cop = credit_earned_cop - credit_used_cop)
);

-- Indexes for performance
CREATE INDEX idx_trial_credits_customer_id ON trial_credits(customer_id);
CREATE INDEX idx_trial_credits_professional_id ON trial_credits(professional_id);
CREATE INDEX idx_trial_credits_has_credit ON trial_credits(credit_remaining_cop) WHERE credit_remaining_cop > 0;
CREATE INDEX idx_trial_credits_last_booking_at ON trial_credits(last_booking_at DESC);

-- Comments for documentation
COMMENT ON TABLE trial_credits IS 'Tracks trial credit earned from completed bookings, redeemable toward direct hire placement fee';
COMMENT ON COLUMN trial_credits.credit_earned_cop IS '50% of total_bookings_value_cop, capped at 50% of professional direct_hire_fee_cop';
COMMENT ON COLUMN trial_credits.credit_remaining_cop IS 'Available credit balance: credit_earned_cop - credit_used_cop';

-- =====================================================
-- 2. Extend bookings table for trial tracking
-- =====================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS trial_credit_applied_cop BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_price_cop BIGINT,  -- Price before trial discount (for direct hire only)
  ADD COLUMN IF NOT EXISTS is_trial_eligible BOOLEAN DEFAULT false;

-- Index for analytics and reporting
CREATE INDEX IF NOT EXISTS idx_bookings_trial_eligible ON bookings(is_trial_eligible) WHERE is_trial_eligible = true;
CREATE INDEX IF NOT EXISTS idx_bookings_trial_credit_applied ON bookings(trial_credit_applied_cop) WHERE trial_credit_applied_cop > 0;

-- Comments
COMMENT ON COLUMN bookings.trial_credit_applied_cop IS 'Amount of trial credit discount applied to this booking (in COP cents)';
COMMENT ON COLUMN bookings.original_price_cop IS 'Original direct hire fee before trial credit discount';
COMMENT ON COLUMN bookings.is_trial_eligible IS 'Flag indicating this booking contributed to trial credit calculation';

-- =====================================================
-- 3. Auto-update trial credits on booking completion
-- =====================================================

CREATE OR REPLACE FUNCTION update_trial_credit_on_booking_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_credit_cap_cop BIGINT;
  v_new_credit_earned_cop BIGINT;
  v_direct_hire_fee_cop BIGINT;
  v_total_bookings_value_cop BIGINT;
BEGIN
  -- Only process when booking transitions to 'completed' status
  -- Must be 'hourly' type (not 'direct_hire') and have captured amount
  IF NEW.status = 'completed'
     AND OLD.status != 'completed'
     AND NEW.booking_type = 'hourly'
     AND NEW.amount_captured IS NOT NULL
     AND NEW.amount_captured > 0 THEN

    -- Get professional's direct hire fee for credit cap calculation
    SELECT COALESCE(direct_hire_fee_cop, 1196000) INTO v_direct_hire_fee_cop
    FROM professional_profiles
    WHERE id = NEW.professional_id;

    -- Calculate credit cap: 50% of direct hire fee
    -- Example: $299 fee (1,196,000 COP) → $149.50 max credit (598,000 COP)
    v_credit_cap_cop := ROUND(v_direct_hire_fee_cop * 0.5);

    -- Upsert trial credit record
    -- Increment booking count and total value
    INSERT INTO trial_credits (
      customer_id,
      professional_id,
      total_bookings_count,
      total_bookings_value_cop,
      last_booking_at,
      last_booking_id,
      created_at,
      updated_at
    )
    VALUES (
      NEW.customer_id,
      NEW.professional_id,
      1,  -- First booking
      NEW.amount_captured,
      NEW.completed_at,
      NEW.id,
      NOW(),
      NOW()
    )
    ON CONFLICT (customer_id, professional_id)
    DO UPDATE SET
      total_bookings_count = trial_credits.total_bookings_count + 1,
      total_bookings_value_cop = trial_credits.total_bookings_value_cop + NEW.amount_captured,
      last_booking_at = NEW.completed_at,
      last_booking_id = NEW.id,
      updated_at = NOW();

    -- Calculate new credit earned: 50% of total bookings, capped
    -- Formula: MIN(total_bookings * 0.5, direct_hire_fee * 0.5)
    SELECT total_bookings_value_cop INTO v_total_bookings_value_cop
    FROM trial_credits
    WHERE customer_id = NEW.customer_id AND professional_id = NEW.professional_id;

    v_new_credit_earned_cop := LEAST(
      ROUND(v_total_bookings_value_cop * 0.5),  -- 50% of all bookings
      v_credit_cap_cop                           -- Max: 50% of direct hire fee
    );

    -- Update credit amounts
    -- Maintain invariant: credit_remaining_cop = credit_earned_cop - credit_used_cop
    UPDATE trial_credits
    SET
      credit_earned_cop = v_new_credit_earned_cop,
      credit_remaining_cop = GREATEST(v_new_credit_earned_cop - COALESCE(credit_used_cop, 0), 0),
      updated_at = NOW()
    WHERE customer_id = NEW.customer_id AND professional_id = NEW.professional_id;

    -- Mark booking as trial eligible
    UPDATE bookings
    SET is_trial_eligible = true
    WHERE id = NEW.id;

    RAISE NOTICE 'Trial credit updated for customer % with professional %: % COP earned (capped at % COP)',
      NEW.customer_id, NEW.professional_id, v_new_credit_earned_cop, v_credit_cap_cop;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_trial_credit_on_booking_completion ON bookings;
CREATE TRIGGER trigger_update_trial_credit_on_booking_completion
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_credit_on_booking_completion();

COMMENT ON FUNCTION update_trial_credit_on_booking_completion() IS
  'Auto-calculates trial credit when booking is marked completed. Credit = 50% of total bookings, capped at 50% of direct hire fee.';

-- =====================================================
-- 4. Helper function to get trial credit info
-- =====================================================
-- Returns trial credit information for a customer-professional pair
-- Used by backend services and direct hire checkout flow

CREATE OR REPLACE FUNCTION get_trial_credit_info(
  p_customer_id UUID,
  p_professional_id UUID
)
RETURNS TABLE (
  has_credit BOOLEAN,
  credit_available_cop BIGINT,
  credit_available_usd INTEGER,
  bookings_completed INTEGER,
  total_bookings_value_cop BIGINT,
  max_credit_cop BIGINT,
  percentage_earned NUMERIC
) AS $$
DECLARE
  v_direct_hire_fee_cop BIGINT;
BEGIN
  -- Fetch professional's direct hire fee for max credit calculation
  SELECT COALESCE(pp.direct_hire_fee_cop, 1196000) INTO v_direct_hire_fee_cop
  FROM professional_profiles pp
  WHERE pp.id = p_professional_id;

  -- Return credit info (or defaults if no record exists)
  RETURN QUERY
  SELECT
    COALESCE(tc.credit_remaining_cop > 0, false) AS has_credit,
    COALESCE(tc.credit_remaining_cop, 0) AS credit_available_cop,
    ROUND(COALESCE(tc.credit_remaining_cop, 0) / 4000)::INTEGER AS credit_available_usd,
    COALESCE(tc.total_bookings_count, 0) AS bookings_completed,
    COALESCE(tc.total_bookings_value_cop, 0) AS total_bookings_value_cop,
    ROUND(v_direct_hire_fee_cop * 0.5) AS max_credit_cop,
    LEAST(
      CASE
        WHEN v_direct_hire_fee_cop > 0 THEN
          (COALESCE(tc.credit_earned_cop, 0)::NUMERIC / (v_direct_hire_fee_cop * 0.5)) * 100
        ELSE 0
      END,
      100.0
    ) AS percentage_earned
  FROM (SELECT p_customer_id AS cid, p_professional_id AS pid) AS params
  LEFT JOIN trial_credits tc
    ON tc.customer_id = params.cid
    AND tc.professional_id = params.pid;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_trial_credit_info(UUID, UUID) IS
  'Returns trial credit information for display in UI and direct hire checkout';

-- =====================================================
-- 5. Grant permissions
-- =====================================================

-- Allow authenticated users to read their own trial credits
ALTER TABLE trial_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY trial_credits_select_own
  ON trial_credits
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Only backend services can insert/update (via triggers)
CREATE POLICY trial_credits_insert_service
  ON trial_credits
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY trial_credits_update_service
  ON trial_credits
  FOR UPDATE
  TO service_role
  USING (true);

-- =====================================================
-- 6. Migration Complete
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Trial Credit System migration complete!';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - trial_credits table created';
  RAISE NOTICE '  - bookings table extended with trial tracking';
  RAISE NOTICE '  - Auto-update trigger on booking completion';
  RAISE NOTICE '  - Helper function get_trial_credit_info()';
  RAISE NOTICE 'Credit calculation: 50%% of completed bookings, capped at 50%% of direct hire fee';
  RAISE NOTICE 'Scope: Per-professional (separate credits for each pro)';
END $$;
