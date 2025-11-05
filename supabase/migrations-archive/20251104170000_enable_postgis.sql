-- Enable PostGIS extension for geography-based calculations
-- Allows us to calculate service radius, travel distances, and route optimization

CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify extension is enabled
COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial objects and functions';
