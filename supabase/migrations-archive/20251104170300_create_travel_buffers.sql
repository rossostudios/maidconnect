-- Create professional_travel_buffers table for calendar conflict detection
-- Stores service radius and travel time buffers to prevent overlapping bookings

CREATE TABLE IF NOT EXISTS professional_travel_buffers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_radius_km NUMERIC(4, 1) NOT NULL DEFAULT 10.0 CHECK (service_radius_km > 0 AND service_radius_km <= 100),
  service_location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS geography type for WGS84 coordinates
  travel_buffer_before_minutes INTEGER DEFAULT 30 CHECK (travel_buffer_before_minutes >= 0),
  travel_buffer_after_minutes INTEGER DEFAULT 30 CHECK (travel_buffer_after_minutes >= 0),
  avg_travel_speed_kmh NUMERIC(4, 1) DEFAULT 30.0 CHECK (avg_travel_speed_kmh > 0), -- For route planning
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Only one active travel buffer per professional
  CONSTRAINT unique_profile_travel_buffer UNIQUE (profile_id)
);

-- Create spatial index for geography queries
CREATE INDEX IF NOT EXISTS idx_travel_buffers_location
ON professional_travel_buffers USING GIST (service_location);

-- Create index for radius queries
CREATE INDEX IF NOT EXISTS idx_travel_buffers_radius
ON professional_travel_buffers (profile_id, service_radius_km);

-- Enable RLS
ALTER TABLE professional_travel_buffers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view travel buffers for radius filtering"
  ON professional_travel_buffers
  FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their own travel buffers"
  ON professional_travel_buffers
  FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Helper function to check if a location is within service radius
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

COMMENT ON TABLE professional_travel_buffers IS 'Service radius and travel time buffers for professionals';
COMMENT ON COLUMN professional_travel_buffers.service_location IS 'Center point of service area (PostGIS geography)';
COMMENT ON COLUMN professional_travel_buffers.service_radius_km IS 'Maximum distance willing to travel from service location';
COMMENT ON FUNCTION is_within_service_radius IS 'Check if customer location falls within professional service radius';
