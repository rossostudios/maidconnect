-- =============================================
-- RPC Function: increment_professional_stats
-- =============================================
-- Atomically increments professional's career stats when bookings complete
-- Called from Stripe webhook handler on payment_intent.succeeded
--
-- Parameters:
--   p_professional_id: UUID of the professional profile
--   p_earnings_cop: Amount to add to total earnings (in COP cents)
--
-- Updates:
--   - total_earnings_cop (atomically incremented)
--   - total_bookings_completed (atomically incremented by 1)
--   - updated_at (set to current timestamp)

CREATE OR REPLACE FUNCTION increment_professional_stats(
  p_professional_id UUID,
  p_earnings_cop BIGINT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atomically update stats for the professional
  UPDATE professional_profiles
  SET
    total_earnings_cop = COALESCE(total_earnings_cop, 0) + p_earnings_cop,
    total_bookings_completed = COALESCE(total_bookings_completed, 0) + 1,
    updated_at = NOW()
  WHERE profile_id = p_professional_id;

  -- Raise exception if professional not found (helps with debugging)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professional profile not found: %', p_professional_id;
  END IF;
END;
$$;

-- =============================================
-- Grant Execution Permission
-- =============================================
-- Allow authenticated users to call this function
-- (Supabase service role already has access)

GRANT EXECUTE ON FUNCTION increment_professional_stats(UUID, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_professional_stats(UUID, BIGINT) TO service_role;

-- =============================================
-- Add Function Comment
-- =============================================

COMMENT ON FUNCTION increment_professional_stats IS
  'Atomically increments professional career stats (earnings and bookings count) when bookings complete. Called from Stripe webhook handler.';
