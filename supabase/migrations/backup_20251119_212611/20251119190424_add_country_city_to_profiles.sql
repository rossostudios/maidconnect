-- =====================================================
-- Migration: Add country_code and city_id to profiles
-- Purpose: Multi-country data model Phase 1
-- =====================================================
-- This migration adds foreign key references to the countries and cities tables,
-- enabling proper data isolation and filtering by country/city for multi-market operations.

-- Step 1: Add new columns (nullable for backfill)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city_id uuid;

-- Step 2: Backfill country_code from legacy country text column
-- Map text values to ISO 3166-1 alpha-2 codes
UPDATE profiles
SET country_code = CASE
  -- Explicit text matches (case-insensitive)
  WHEN LOWER(country) = 'colombia' THEN 'CO'
  WHEN LOWER(country) = 'paraguay' THEN 'PY'
  WHEN LOWER(country) = 'uruguay' THEN 'UY'
  WHEN LOWER(country) = 'argentina' THEN 'AR'
  -- Spanish variants
  WHEN LOWER(country) = 'colombia' THEN 'CO'
  WHEN LOWER(country) = 'paraguay' THEN 'PY'
  WHEN LOWER(country) = 'uruguay' THEN 'UY'
  WHEN LOWER(country) = 'argentina' THEN 'AR'
  -- ISO codes (if already present)
  WHEN UPPER(country) IN ('CO', 'PY', 'UY', 'AR') THEN UPPER(country)
  -- Default to Colombia for NULL or unrecognized values
  ELSE 'CO'
END
WHERE country_code IS NULL;

-- Step 3: Backfill city_id from legacy city text column
-- Match city names (case-insensitive) to cities table
UPDATE profiles p
SET city_id = c.id
FROM cities c
WHERE
  p.city_id IS NULL
  AND p.country_code = c.country_code
  AND LOWER(TRIM(p.city)) = LOWER(c.name);

-- Step 4: Set default city for profiles with unmatched cities
-- Use first active city in each country as fallback
UPDATE profiles p
SET city_id = (
  SELECT c.id
  FROM cities c
  WHERE c.country_code = p.country_code
    AND c.is_active = true
  ORDER BY c.name ASC
  LIMIT 1
)
WHERE
  p.city_id IS NULL
  AND p.country_code IS NOT NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE profiles
  ADD CONSTRAINT profiles_country_code_fkey
    FOREIGN KEY (country_code)
    REFERENCES countries(code)
    ON DELETE RESTRICT,
  ADD CONSTRAINT profiles_city_id_fkey
    FOREIGN KEY (city_id)
    REFERENCES cities(id)
    ON DELETE RESTRICT;

-- Step 6: Make columns NOT NULL (after backfill)
ALTER TABLE profiles
  ALTER COLUMN country_code SET NOT NULL,
  ALTER COLUMN city_id SET NOT NULL;

-- Step 7: Create indexes for filtering and joins
CREATE INDEX IF NOT EXISTS idx_profiles_country_code
  ON profiles(country_code);

CREATE INDEX IF NOT EXISTS idx_profiles_city_id
  ON profiles(city_id);

-- Step 8: Add check constraint to ensure country_code is supported
ALTER TABLE profiles
  ADD CONSTRAINT profiles_country_code_supported_check
    CHECK (country_code IN ('CO', 'PY', 'UY', 'AR'));

-- Step 9: Drop legacy text columns (after validation)
-- NOTE: Commented out for safety - uncomment after validating migration
-- ALTER TABLE profiles
--   DROP COLUMN IF EXISTS country,
--   DROP COLUMN IF EXISTS city;

-- Step 10: Add comment for documentation
COMMENT ON COLUMN profiles.country_code IS
  'ISO 3166-1 alpha-2 country code (CO, PY, UY, AR). Foreign key to countries.code.';

COMMENT ON COLUMN profiles.city_id IS
  'UUID reference to cities table. Determines user''s primary city for service availability.';
