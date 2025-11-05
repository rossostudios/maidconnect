-- Create materialized view for professional availability caching
-- Improves performance of availability queries by pre-computing weekly schedules

CREATE MATERIALIZED VIEW IF NOT EXISTS professional_availability_cache AS
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
  ) AS weekly_schedule,
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

-- Create unique index on profile_id for efficient lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_cache_profile
ON professional_availability_cache (profile_id);

-- Create spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_availability_cache_location
ON professional_availability_cache USING GIST (service_location);

-- Create index for filtering by booking acceptance
CREATE INDEX IF NOT EXISTS idx_availability_cache_active
ON professional_availability_cache (can_accept_bookings)
WHERE can_accept_bookings = true;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_availability_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY professional_availability_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to refresh cache when relevant data changes
CREATE TRIGGER trigger_refresh_cache_on_working_hours
  AFTER INSERT OR UPDATE OR DELETE ON professional_working_hours
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

CREATE TRIGGER trigger_refresh_cache_on_travel_buffers
  AFTER INSERT OR UPDATE OR DELETE ON professional_travel_buffers
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

CREATE TRIGGER trigger_refresh_cache_on_profile
  AFTER UPDATE OF can_accept_bookings, onboarding_completion_percentage ON profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_availability_cache();

COMMENT ON MATERIALIZED VIEW professional_availability_cache IS 'Pre-computed professional availability data for fast queries';
COMMENT ON FUNCTION refresh_availability_cache IS 'Automatically refreshes availability cache when working hours, travel buffers, or profile status changes';
