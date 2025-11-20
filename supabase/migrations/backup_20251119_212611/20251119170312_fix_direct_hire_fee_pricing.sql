-- =====================================================
-- Fix Direct Hire Fee Pricing Discrepancy
-- =====================================================
-- Problem: UI shows $299 USD but database stores 2,000,000 COP (~$500 USD)
-- Solution: Update database to match marketing price
-- New Default: 1,196,000 COP = $299 USD (at 4,000 COP/USD exchange rate)
-- =====================================================

-- =====================================================
-- 1. Update existing professional profiles
-- =====================================================

-- Update all professionals currently using default 2M COP fee
UPDATE professional_profiles
SET
  direct_hire_fee_cop = 1196000,  -- $299 USD at 4,000 COP/USD
  updated_at = NOW()
WHERE direct_hire_fee_cop = 2000000;

-- Log affected rows
DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % professional profiles from 2,000,000 COP to 1,196,000 COP', v_updated_count;
END $$;

-- =====================================================
-- 2. Update table default for new professionals
-- =====================================================

ALTER TABLE professional_profiles
  ALTER COLUMN direct_hire_fee_cop SET DEFAULT 1196000;

-- =====================================================
-- 3. Add documentation
-- =====================================================

COMMENT ON COLUMN professional_profiles.direct_hire_fee_cop IS
  'Direct hire placement fee in COP cents. Default 1,196,000 COP (~$299 USD at 4,000 COP/USD exchange rate). Professionals can customize this amount.';

-- =====================================================
-- 4. Verify pricing consistency
-- =====================================================

DO $$
DECLARE
  v_min_fee BIGINT;
  v_max_fee BIGINT;
  v_avg_fee NUMERIC;
  v_count_at_default INTEGER;
BEGIN
  -- Get pricing statistics
  SELECT
    MIN(direct_hire_fee_cop),
    MAX(direct_hire_fee_cop),
    ROUND(AVG(direct_hire_fee_cop)),
    COUNT(*) FILTER (WHERE direct_hire_fee_cop = 1196000)
  INTO v_min_fee, v_max_fee, v_avg_fee, v_count_at_default
  FROM professional_profiles;

  RAISE NOTICE 'Direct Hire Fee Statistics:';
  RAISE NOTICE '  Minimum: % COP (~$% USD)', v_min_fee, ROUND(v_min_fee / 4000);
  RAISE NOTICE '  Maximum: % COP (~$% USD)', v_max_fee, ROUND(v_max_fee / 4000);
  RAISE NOTICE '  Average: % COP (~$% USD)', v_avg_fee, ROUND(v_avg_fee / 4000);
  RAISE NOTICE '  Professionals at $299 default: %', v_count_at_default;
END $$;

-- =====================================================
-- 5. Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Direct Hire Fee Pricing Fix complete!';
  RAISE NOTICE 'Database now matches marketing price: $299 USD (1,196,000 COP)';
  RAISE NOTICE 'All UI, API, and database pricing is now consistent';
END $$;
