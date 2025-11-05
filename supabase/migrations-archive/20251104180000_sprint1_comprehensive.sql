-- Sprint 1: Professional Experience Enhancement - Comprehensive Migration
-- This migration combines all Sprint 1 features in correct dependency order
-- Run this if individual migrations failed

-- ============================================================================
-- 1. ENABLE POSTGIS (if not already enabled)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. ADD ONBOARDING CHECKLIST TO PROFILES
-- ============================================================================

-- Add onboarding columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_checklist JSONB DEFAULT jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('id', 'profile_photo', 'label', 'Upload profile photo', 'required', true, 'completed', false),
    jsonb_build_object('id', 'services', 'label', 'Add at least one service', 'required', true, 'completed', false),
    jsonb_build_object('id', 'availability', 'label', 'Set your working hours', 'required', true, 'completed', false),
    jsonb_build_object('id', 'service_radius', 'label', 'Define service area', 'required', true, 'completed', false),
    jsonb_build_object('id', 'bio', 'label', 'Write a bio (min 100 chars)', 'required', true, 'completed', false),
    jsonb_build_object('id', 'background_check', 'label', 'Complete background check', 'required', true, 'completed', false),
    jsonb_build_object('id', 'portfolio', 'label', 'Add portfolio photos', 'required', false, 'completed', false),
    jsonb_build_object('id', 'certifications', 'label', 'Upload certifications', 'required', false, 'completed', false)
  ),
  'lastUpdated', to_jsonb(NOW())
),
ADD COLUMN IF NOT EXISTS onboarding_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_accept_bookings BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_checklist
ON profiles USING GIN (onboarding_checklist);

CREATE INDEX IF NOT EXISTS idx_profiles_can_accept_bookings
ON profiles (can_accept_bookings)
WHERE user_type = 'professional';

-- ============================================================================
-- 3. CREATE PROFESSIONAL WORKING HOURS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_available BOOLEAN DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_profile_day UNIQUE (profile_id, day_of_week),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_working_hours_profile
ON professional_working_hours (profile_id);

CREATE INDEX IF NOT EXISTS idx_working_hours_day
ON professional_working_hours (day_of_week);

CREATE INDEX IF NOT EXISTS idx_working_hours_available
ON professional_working_hours (profile_id, is_available)
WHERE is_available = true;

ALTER TABLE professional_working_hours ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_working_hours'
    AND policyname = 'Public can view working hours'
  ) THEN
    CREATE POLICY "Public can view working hours"
      ON professional_working_hours
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_working_hours'
    AND policyname = 'Professionals can manage their own working hours'
  ) THEN
    CREATE POLICY "Professionals can manage their own working hours"
      ON professional_working_hours
      FOR ALL
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE PROFESSIONAL TRAVEL BUFFERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_travel_buffers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_radius_km NUMERIC(4, 1) NOT NULL DEFAULT 10.0 CHECK (service_radius_km > 0 AND service_radius_km <= 100),
  service_location GEOGRAPHY(POINT, 4326) NOT NULL,
  travel_buffer_before_minutes INTEGER DEFAULT 30 CHECK (travel_buffer_before_minutes >= 0),
  travel_buffer_after_minutes INTEGER DEFAULT 30 CHECK (travel_buffer_after_minutes >= 0),
  avg_travel_speed_kmh NUMERIC(4, 1) DEFAULT 30.0 CHECK (avg_travel_speed_kmh > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_profile_travel_buffer UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_travel_buffers_location
ON professional_travel_buffers USING GIST (service_location);

CREATE INDEX IF NOT EXISTS idx_travel_buffers_radius
ON professional_travel_buffers (profile_id, service_radius_km);

ALTER TABLE professional_travel_buffers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_travel_buffers'
    AND policyname = 'Public can view travel buffers for radius filtering'
  ) THEN
    CREATE POLICY "Public can view travel buffers for radius filtering"
      ON professional_travel_buffers
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_travel_buffers'
    AND policyname = 'Professionals can manage their own travel buffers'
  ) THEN
    CREATE POLICY "Professionals can manage their own travel buffers"
      ON professional_travel_buffers
      FOR ALL
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Helper function
CREATE OR REPLACE FUNCTION is_within_service_radius(
  professional_profile_id UUID,
  customer_location GEOGRAPHY
)
RETURNS BOOLEAN AS $$
DECLARE
  service_center GEOGRAPHY;
  max_radius_m NUMERIC;
  distance_m NUMERIC;
BEGIN
  SELECT service_location, service_radius_km * 1000
  INTO service_center, max_radius_m
  FROM professional_travel_buffers
  WHERE profile_id = professional_profile_id;

  IF service_center IS NULL THEN
    RETURN false;
  END IF;

  distance_m := ST_Distance(service_center, customer_location);

  RETURN distance_m <= max_radius_m;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 5. CREATE SERVICE BUNDLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  services JSONB NOT NULL,
  total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop > 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 50),
  final_price_cop INTEGER NOT NULL CHECK (final_price_cop > 0),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_bundle_pricing CHECK (
    final_price_cop = base_price_cop - (base_price_cop * discount_percentage / 100)
  )
);

CREATE INDEX IF NOT EXISTS idx_service_bundles_profile
ON service_bundles (profile_id);

CREATE INDEX IF NOT EXISTS idx_service_bundles_active
ON service_bundles (profile_id, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_bundles_services
ON service_bundles USING GIN (services);

ALTER TABLE service_bundles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_bundles'
    AND policyname = 'Public can view active service bundles'
  ) THEN
    CREATE POLICY "Public can view active service bundles"
      ON service_bundles
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_bundles'
    AND policyname = 'Professionals can manage their own bundles'
  ) THEN
    CREATE POLICY "Professionals can manage their own bundles"
      ON service_bundles
      FOR ALL
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Auto-calculate final price trigger
CREATE OR REPLACE FUNCTION calculate_bundle_final_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_price_cop := NEW.base_price_cop - (NEW.base_price_cop * NEW.discount_percentage / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_bundle_price ON service_bundles;
CREATE TRIGGER trigger_calculate_bundle_price
  BEFORE INSERT OR UPDATE ON service_bundles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bundle_final_price();

-- ============================================================================
-- 6. CREATE AVAILABILITY CACHE (MATERIALIZED VIEW)
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS professional_availability_cache;

CREATE MATERIALIZED VIEW professional_availability_cache AS
SELECT
  p.id AS profile_id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.can_accept_bookings,
  p.onboarding_completion_percentage,
  tb.service_location,
  tb.service_radius_km,
  tb.travel_buffer_before_minutes,
  tb.travel_buffer_after_minutes,
  jsonb_agg(
    jsonb_build_object(
      'dayOfWeek', wh.day_of_week,
      'isAvailable', wh.is_available,
      'startTime', wh.start_time,
      'endTime', wh.end_time
    ) ORDER BY wh.day_of_week
  ) FILTER (WHERE wh.id IS NOT NULL) AS weekly_schedule,
  COUNT(CASE WHEN wh.is_available THEN 1 END) AS available_days_count,
  p.updated_at AS last_profile_update
FROM profiles p
LEFT JOIN professional_travel_buffers tb ON tb.profile_id = p.id
LEFT JOIN professional_working_hours wh ON wh.profile_id = p.id
WHERE p.user_type = 'professional'
GROUP BY
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.can_accept_bookings,
  p.onboarding_completion_percentage,
  tb.service_location,
  tb.service_radius_km,
  tb.travel_buffer_before_minutes,
  tb.travel_buffer_after_minutes,
  p.updated_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_cache_profile
ON professional_availability_cache (profile_id);

CREATE INDEX IF NOT EXISTS idx_availability_cache_location
ON professional_availability_cache USING GIST (service_location)
WHERE service_location IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_availability_cache_active
ON professional_availability_cache (can_accept_bookings)
WHERE can_accept_bookings = true;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_availability_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY professional_availability_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-refresh cache
DROP TRIGGER IF EXISTS trigger_refresh_cache_on_working_hours ON professional_working_hours;
CREATE TRIGGER trigger_refresh_cache_on_working_hours
  AFTER INSERT OR UPDATE OR DELETE ON professional_working_hours
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

DROP TRIGGER IF EXISTS trigger_refresh_cache_on_travel_buffers ON professional_travel_buffers;
CREATE TRIGGER trigger_refresh_cache_on_travel_buffers
  AFTER INSERT OR UPDATE OR DELETE ON professional_travel_buffers
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

DROP TRIGGER IF EXISTS trigger_refresh_cache_on_profile ON profiles;
CREATE TRIGGER trigger_refresh_cache_on_profile
  AFTER UPDATE OF can_accept_bookings, onboarding_completion_percentage ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

-- ============================================================================
-- 7. ADD ONBOARDING AUTO-CALCULATION TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_onboarding_completion()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INTEGER;
  required_count INTEGER;
  percentage INTEGER;
BEGIN
  -- Count completed required items
  SELECT COUNT(*) INTO completed_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true
    AND (item->>'completed')::boolean = true;

  -- Count total required items
  SELECT COUNT(*) INTO required_count
  FROM jsonb_array_elements(NEW.onboarding_checklist->'items') item
  WHERE (item->>'required')::boolean = true;

  -- Calculate percentage
  IF required_count > 0 THEN
    percentage := (completed_count * 100) / required_count;
  ELSE
    percentage := 0;
  END IF;

  -- Update fields
  NEW.onboarding_completion_percentage := percentage;
  NEW.can_accept_bookings := (percentage = 100);

  -- Update lastUpdated timestamp in JSONB
  NEW.onboarding_checklist := jsonb_set(
    NEW.onboarding_checklist,
    '{lastUpdated}',
    to_jsonb(NOW())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_onboarding_completion ON profiles;
CREATE TRIGGER trigger_update_onboarding_completion
  BEFORE INSERT OR UPDATE OF onboarding_checklist ON profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'professional')
  EXECUTE FUNCTION update_onboarding_completion();

-- Helper function to mark item completed
CREATE OR REPLACE FUNCTION mark_onboarding_item_completed(
  professional_profile_id UUID,
  item_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  updated_checklist JSONB;
  item_index INTEGER;
BEGIN
  -- Find the index of the item in the array
  SELECT ordinality - 1 INTO item_index
  FROM jsonb_array_elements(
    (SELECT onboarding_checklist->'items' FROM profiles WHERE id = professional_profile_id)
  ) WITH ORDINALITY arr(item, ordinality)
  WHERE item->>'id' = item_id;

  IF item_index IS NULL THEN
    RAISE EXCEPTION 'Onboarding item % not found', item_id;
  END IF;

  -- Update the specific item's completed status
  UPDATE profiles
  SET onboarding_checklist = jsonb_set(
    onboarding_checklist,
    array['items', item_index::text, 'completed'],
    'true'::jsonb
  )
  WHERE id = professional_profile_id
  RETURNING onboarding_checklist INTO updated_checklist;

  RETURN updated_checklist;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get progress
CREATE OR REPLACE FUNCTION get_onboarding_progress(professional_profile_id UUID)
RETURNS TABLE(
  completion_percentage INTEGER,
  can_accept_bookings BOOLEAN,
  completed_items JSONB,
  pending_required_items JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.onboarding_completion_percentage,
    p.can_accept_bookings,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'completed')::boolean = true
    ) AS completed_items,
    (
      SELECT jsonb_agg(item)
      FROM jsonb_array_elements(p.onboarding_checklist->'items') item
      WHERE (item->>'required')::boolean = true
        AND (item->>'completed')::boolean = false
    ) AS pending_required_items
  FROM profiles p
  WHERE p.id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Sprint 1 migration complete
-- ============================================================================
