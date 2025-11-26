-- ============================================================================
-- Migration: Add RPC function to increment professional earnings stats
-- Purpose: Atomically update professional's career earnings after booking completion
-- Powers: Digital CV / Earnings Badge feature (Phase 2)
-- ============================================================================

-- Create function to atomically increment professional earnings stats
CREATE OR REPLACE FUNCTION increment_professional_earnings_stats(
  p_professional_id UUID,
  p_amount_cents BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE professional_profiles
  SET
    total_bookings_completed = COALESCE(total_bookings_completed, 0) + 1,
    total_earnings_cents = COALESCE(total_earnings_cents, 0) + p_amount_cents,
    earnings_last_updated_at = NOW(),
    updated_at = NOW()
  WHERE profile_id = p_professional_id;

  -- Raise notice if no rows updated (professional not found)
  IF NOT FOUND THEN
    RAISE WARNING 'Professional profile not found for earnings update: %', p_professional_id;
  END IF;
END;
$$;

-- Add comment
COMMENT ON FUNCTION increment_professional_earnings_stats(UUID, BIGINT) IS
  'Atomically increment professional earnings stats after booking completion. Used by Digital CV feature.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_professional_earnings_stats(UUID, BIGINT) TO authenticated;
