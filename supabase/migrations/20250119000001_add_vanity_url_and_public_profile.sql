-- ========================================
-- Migration: Add Vanity URL and Public Profile System
-- ========================================
-- Description: Adds slug-based URLs, profile visibility controls, and earnings badge opt-in
-- for Phase 2: Digital CV/Wallet
--
-- Changes:
-- 1. Add slug field for vanity URLs (e.g., /pro/maria-garcia-123)
-- 2. Add profile_visibility field (public/private)
-- 3. Add share_earnings_badge field for opt-in earnings display
-- 4. Add unique constraint and index on slug
-- 5. Create function to generate unique slugs
--
-- Author: AI Assistant
-- Date: 2025-01-19
-- ========================================

-- ========================================
-- 1. Add New Columns to professional_profiles
-- ========================================

ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
  ADD COLUMN IF NOT EXISTS share_earnings_badge BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_earnings_cop BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_bookings_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS earnings_last_updated_at TIMESTAMPTZ;

-- ========================================
-- 2. Create Unique Index on Slug
-- ========================================

CREATE UNIQUE INDEX IF NOT EXISTS professional_profiles_slug_unique_idx
  ON professional_profiles(slug)
  WHERE slug IS NOT NULL;

-- ========================================
-- 3. Create Index for Public Profile Queries
-- ========================================

CREATE INDEX IF NOT EXISTS professional_profiles_public_visibility_idx
  ON professional_profiles(profile_visibility, status, verification_level)
  WHERE profile_visibility = 'public';

-- ========================================
-- 4. Create Slug Generation Function
-- ========================================

CREATE OR REPLACE FUNCTION generate_professional_slug(
  p_full_name TEXT,
  p_profile_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_slug TEXT;
  v_final_slug TEXT;
  v_counter INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  -- Generate base slug from full name
  -- 1. Convert to lowercase
  -- 2. Replace spaces with hyphens
  -- 3. Remove special characters (keep only letters, numbers, hyphens)
  -- 4. Remove consecutive hyphens
  -- 5. Trim leading/trailing hyphens
  v_base_slug := LOWER(p_full_name);
  v_base_slug := REGEXP_REPLACE(v_base_slug, '\s+', '-', 'g');
  v_base_slug := REGEXP_REPLACE(v_base_slug, '[^a-z0-9\-]', '', 'g');
  v_base_slug := REGEXP_REPLACE(v_base_slug, '\-+', '-', 'g');
  v_base_slug := TRIM(BOTH '-' FROM v_base_slug);

  -- Limit slug length to 50 characters
  IF LENGTH(v_base_slug) > 50 THEN
    v_base_slug := SUBSTRING(v_base_slug FROM 1 FOR 50);
    v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
  END IF;

  -- If slug is empty after processing, use a default
  IF v_base_slug = '' OR v_base_slug IS NULL THEN
    v_base_slug := 'professional';
  END IF;

  -- Append short hash from profile_id for uniqueness
  -- Use first 6 characters of profile_id
  v_final_slug := v_base_slug || '-' || SUBSTRING(p_profile_id::TEXT FROM 1 FOR 6);

  -- Check if slug already exists (should be rare with UUID hash)
  SELECT EXISTS(
    SELECT 1 FROM professional_profiles
    WHERE slug = v_final_slug
    AND profile_id != p_profile_id
  ) INTO v_exists;

  -- If exists, add counter
  WHILE v_exists LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_base_slug || '-' || SUBSTRING(p_profile_id::TEXT FROM 1 FOR 6) || '-' || v_counter::TEXT;

    SELECT EXISTS(
      SELECT 1 FROM professional_profiles
      WHERE slug = v_final_slug
      AND profile_id != p_profile_id
    ) INTO v_exists;
  END LOOP;

  RETURN v_final_slug;
END;
$$;

-- ========================================
-- 5. Create Function to Auto-Generate Slugs
-- ========================================

CREATE OR REPLACE FUNCTION auto_generate_slug_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate slug if not already provided and full_name exists
  IF NEW.slug IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.slug := generate_professional_slug(NEW.full_name, NEW.profile_id);
  END IF;

  RETURN NEW;
END;
$$;

-- ========================================
-- 6. Create Trigger for Auto-Slug Generation
-- ========================================

DROP TRIGGER IF EXISTS auto_generate_slug_trigger ON professional_profiles;

CREATE TRIGGER auto_generate_slug_trigger
  BEFORE INSERT OR UPDATE OF full_name
  ON professional_profiles
  FOR EACH ROW
  WHEN (NEW.slug IS NULL AND NEW.full_name IS NOT NULL)
  EXECUTE FUNCTION auto_generate_slug_on_insert();

-- ========================================
-- 7. Backfill Slugs for Existing Professionals
-- ========================================

DO $$
DECLARE
  prof RECORD;
BEGIN
  FOR prof IN
    SELECT profile_id, full_name
    FROM professional_profiles
    WHERE slug IS NULL
    AND full_name IS NOT NULL
  LOOP
    UPDATE professional_profiles
    SET slug = generate_professional_slug(prof.full_name, prof.profile_id)
    WHERE profile_id = prof.profile_id;
  END LOOP;
END $$;

-- ========================================
-- 8. Add Comments for Documentation
-- ========================================

COMMENT ON COLUMN professional_profiles.slug IS
  'Unique, SEO-friendly URL slug for public profile (e.g., maria-garcia-abc123). Auto-generated from full_name.';

COMMENT ON COLUMN professional_profiles.profile_visibility IS
  'Controls whether profile is publicly accessible. Options: public, private. Default: private.';

COMMENT ON COLUMN professional_profiles.share_earnings_badge IS
  'Opt-in flag for displaying earnings badge on public profile. Default: false.';

COMMENT ON COLUMN professional_profiles.total_earnings_cop IS
  'Total earnings in COP from completed bookings. Updated automatically.';

COMMENT ON COLUMN professional_profiles.total_bookings_completed IS
  'Total number of completed bookings. Updated automatically.';

COMMENT ON COLUMN professional_profiles.earnings_last_updated_at IS
  'Timestamp of last earnings calculation update.';

COMMENT ON FUNCTION generate_professional_slug(TEXT, UUID) IS
  'Generates a unique, SEO-friendly slug from professional full name and profile ID';

-- ========================================
-- 9. Grant Permissions
-- ========================================

-- Allow authenticated users to read public profiles
GRANT SELECT ON professional_profiles TO authenticated;
GRANT SELECT ON professional_profiles TO anon;

-- ========================================
-- Migration Complete
-- ========================================
