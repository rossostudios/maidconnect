-- Migration: Add Full-Text Search Indexes for Professionals
-- Description: Implements PostgreSQL full-text search with weighted tsvector columns and GIN indexes
-- Research: Based on PostgreSQL best practices for full-text search optimization
--
-- Key Features:
-- 1. Weighted search vector (A=name, B=bio, C=service, D=location)
-- 2. GIN index for fast full-text lookups
-- 3. Search function with relevance ranking
-- 4. Automatic updates via trigger
--
-- Performance: GIN indexes provide O(log n) search time vs O(n) for ILIKE

-- Enable pg_trgm extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 1: Create immutable function to generate weighted search vector
-- Immutable functions can be used in generated columns and indexes
CREATE OR REPLACE FUNCTION professional_search_vector(
  full_name TEXT,
  bio TEXT,
  primary_services TEXT[],
  city TEXT,
  country TEXT
)
RETURNS tsvector
AS $$
BEGIN
  RETURN
    -- A weight (highest): Professional name
    setweight(to_tsvector('english', coalesce(full_name, '')), 'A') ||
    -- B weight: Bio/description
    setweight(to_tsvector('english', coalesce(bio, '')), 'B') ||
    -- C weight: Service types
    setweight(to_tsvector('english', coalesce(array_to_string(primary_services, ' '), '')), 'C') ||
    -- D weight (lowest): Location
    setweight(to_tsvector('english', coalesce(city, '') || ' ' || coalesce(country, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Add search_vector column to professional_profiles table
-- Using GENERATED ALWAYS to auto-update when source columns change
-- Note: Generated columns need to reference columns from the same table,
-- so we'll update this via trigger to include city/country from profiles
ALTER TABLE professional_profiles
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 3: Create function to update search vector
CREATE OR REPLACE FUNCTION update_professional_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  profile_city TEXT;
  profile_country TEXT;
BEGIN
  -- Get city and country from profiles table
  SELECT city, country INTO profile_city, profile_country
  FROM profiles
  WHERE id = NEW.profile_id;

  -- Update search vector with all fields
  NEW.search_vector := professional_search_vector(
    NEW.full_name,
    NEW.bio,
    NEW.primary_services,
    profile_city,
    profile_country
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-update search vector
DROP TRIGGER IF EXISTS professional_search_vector_update ON professional_profiles;
CREATE TRIGGER professional_search_vector_update
  BEFORE INSERT OR UPDATE OF full_name, bio, primary_services
  ON professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_search_vector();

-- Step 5: Also update search vector when profiles table (city/country) changes
CREATE OR REPLACE FUNCTION update_professional_search_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professional_profiles
  SET search_vector = professional_search_vector(
    full_name,
    bio,
    primary_services,
    NEW.city,
    NEW.country
  )
  WHERE profile_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_location_update ON profiles;
CREATE TRIGGER profile_location_update
  AFTER UPDATE OF city, country
  ON profiles
  FOR EACH ROW
  WHEN (NEW.city IS DISTINCT FROM OLD.city OR NEW.country IS DISTINCT FROM OLD.country)
  EXECUTE FUNCTION update_professional_search_on_profile_change();

-- Step 6: Backfill existing records
UPDATE professional_profiles pp
SET search_vector = professional_search_vector(
  pp.full_name,
  pp.bio,
  pp.primary_services,
  p.city,
  p.country
)
FROM profiles p
WHERE pp.profile_id = p.id;

-- Step 7: Create GIN index on search_vector for fast full-text search
-- GIN (Generalized Inverted Index) is optimized for tsvector columns
CREATE INDEX IF NOT EXISTS idx_professional_search_vector
ON professional_profiles
USING GIN (search_vector);

-- Step 8: Create additional indexes for fallback searches
-- These help when full-text search doesn't match user intent
CREATE INDEX IF NOT EXISTS idx_professional_full_name_trgm
ON professional_profiles
USING GIN (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_city_trgm
ON profiles
USING GIN (city gin_trgm_ops);

-- Step 9: Create search function with relevance ranking
-- This RPC function can be called from the API
CREATE OR REPLACE FUNCTION search_professionals(
  search_query TEXT,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  bio TEXT,
  service_types TEXT[],
  city TEXT,
  country TEXT,
  profile_photo_url TEXT,
  avg_rating NUMERIC,
  review_count BIGINT,
  rank REAL
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    prof.profile_id AS id,
    prof.full_name,
    prof.bio,
    prof.primary_services AS service_types,
    p.city,
    p.country,
    prof.avatar_url AS profile_photo_url,
    CAST(NULL AS NUMERIC) AS avg_rating,  -- Placeholder for future rating system
    CAST(0 AS BIGINT) AS review_count,    -- Placeholder for future review system
    -- ts_rank calculates relevance score based on:
    -- 1. Term frequency (how often search terms appear)
    -- 2. Document length (shorter docs with matches rank higher)
    -- 3. Weight (A > B > C > D as defined above)
    ts_rank(prof.search_vector, to_tsquery('english', search_query)) AS rank
  FROM professional_profiles prof
  INNER JOIN profiles p ON prof.profile_id = p.id
  WHERE
    p.role = 'professional'
    AND prof.status = 'active'
    AND prof.search_vector @@ to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 10: Add comment for documentation
COMMENT ON COLUMN professional_profiles.search_vector IS 'Weighted tsvector for full-text search. Auto-generated from full_name (A), bio (B), primary_services (C), and location (D). Indexed with GIN for fast lookups.';
COMMENT ON FUNCTION search_professionals IS 'Full-text search for professionals with relevance ranking. Returns top matches ordered by ts_rank score. Joins professional_profiles with profiles for location data.';

-- Step 11: Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION search_professionals TO authenticated;
GRANT EXECUTE ON FUNCTION search_professionals TO anon;
