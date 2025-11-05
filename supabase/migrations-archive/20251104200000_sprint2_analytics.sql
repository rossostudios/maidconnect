-- Sprint 2: Performance Metrics & Insights
-- This migration creates analytics tables and views for professional performance tracking

-- ============================================================================
-- 1. CREATE PROFESSIONAL PERFORMANCE METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Booking Metrics
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  completion_rate NUMERIC(5, 2) DEFAULT 0.00, -- Percentage (0-100)
  cancellation_rate NUMERIC(5, 2) DEFAULT 0.00, -- Percentage (0-100)

  -- Revenue Metrics (in COP)
  total_revenue_cop INTEGER DEFAULT 0,
  revenue_last_30_days_cop INTEGER DEFAULT 0,
  revenue_last_7_days_cop INTEGER DEFAULT 0,
  average_booking_value_cop INTEGER DEFAULT 0,

  -- Customer Satisfaction Metrics
  average_rating NUMERIC(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
  total_reviews INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,

  -- Performance Metrics
  average_response_time_minutes INTEGER DEFAULT 0, -- Time to accept/decline booking
  on_time_arrival_rate NUMERIC(5, 2) DEFAULT 0.00, -- Percentage (0-100)
  repeat_customer_rate NUMERIC(5, 2) DEFAULT 0.00, -- Percentage (0-100)

  -- Time-based Metrics
  bookings_last_30_days INTEGER DEFAULT 0,
  bookings_last_7_days INTEGER DEFAULT 0,

  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_profile_metrics UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_profile
ON professional_performance_metrics (profile_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating
ON professional_performance_metrics (average_rating DESC)
WHERE average_rating > 0;

CREATE INDEX IF NOT EXISTS idx_performance_metrics_completion_rate
ON professional_performance_metrics (completion_rate DESC);

ALTER TABLE professional_performance_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_performance_metrics'
    AND policyname = 'Public can view performance metrics'
  ) THEN
    CREATE POLICY "Public can view performance metrics"
      ON professional_performance_metrics
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_performance_metrics'
    AND policyname = 'Professionals can view their own metrics'
  ) THEN
    CREATE POLICY "Professionals can view their own metrics"
      ON professional_performance_metrics
      FOR SELECT
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 2. CREATE BOOKING ANALYTICS MATERIALIZED VIEW
-- ============================================================================

-- Note: This view assumes a 'bookings' table exists
-- If it doesn't exist yet, this will be created in a future migration

-- Placeholder comment for future implementation
-- DROP MATERIALIZED VIEW IF EXISTS booking_analytics_cache;

-- CREATE MATERIALIZED VIEW booking_analytics_cache AS
-- SELECT
--   b.professional_id,
--   COUNT(*) AS total_bookings,
--   COUNT(CASE WHEN b.status = 'completed' THEN 1 END) AS completed_bookings,
--   COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) AS cancelled_bookings,
--   ROUND(
--     (COUNT(CASE WHEN b.status = 'completed' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
--     2
--   ) AS completion_rate,
--   SUM(CASE WHEN b.status = 'completed' THEN b.total_price_cop ELSE 0 END) AS total_revenue_cop,
--   AVG(CASE WHEN b.status = 'completed' THEN b.total_price_cop END)::INTEGER AS avg_booking_value_cop
-- FROM bookings b
-- GROUP BY b.professional_id;

-- ============================================================================
-- 3. CREATE REVENUE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Snapshot Period
  snapshot_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  -- Revenue Data (in COP)
  total_revenue_cop INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  average_booking_value_cop INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_profile_snapshot UNIQUE (profile_id, snapshot_date, period_type)
);

CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_profile_date
ON professional_revenue_snapshots (profile_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_snapshots_period
ON professional_revenue_snapshots (period_type, snapshot_date DESC);

ALTER TABLE professional_revenue_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_revenue_snapshots'
    AND policyname = 'Professionals can view their own revenue snapshots'
  ) THEN
    CREATE POLICY "Professionals can view their own revenue snapshots"
      ON professional_revenue_snapshots
      FOR SELECT
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE HELPER FUNCTIONS FOR ANALYTICS
-- ============================================================================

-- Calculate metrics for a specific professional
CREATE OR REPLACE FUNCTION calculate_professional_metrics(professional_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  metrics JSONB;
BEGIN
  -- For now, return placeholder metrics
  -- This will be updated when the bookings table is created
  metrics := jsonb_build_object(
    'totalBookings', 0,
    'completedBookings', 0,
    'cancelledBookings', 0,
    'completionRate', 0.00,
    'cancellationRate', 0.00,
    'totalRevenueCop', 0,
    'averageBookingValueCop', 0,
    'averageRating', 0.00,
    'totalReviews', 0,
    'bookingsLast30Days', 0,
    'bookingsLast7Days', 0,
    'revenueLast30DaysCop', 0,
    'revenueLast7DaysCop', 0
  );

  RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Get revenue trend for a professional (last 30 days)
CREATE OR REPLACE FUNCTION get_revenue_trend(
  professional_profile_id UUID,
  days INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  revenue_cop INTEGER,
  bookings_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.snapshot_date AS date,
    rs.total_revenue_cop AS revenue_cop,
    rs.completed_bookings AS bookings_count
  FROM professional_revenue_snapshots rs
  WHERE rs.profile_id = professional_profile_id
    AND rs.period_type = 'daily'
    AND rs.snapshot_date >= CURRENT_DATE - days
  ORDER BY rs.snapshot_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Get top performing professionals by completion rate
CREATE OR REPLACE FUNCTION get_top_professionals_by_completion_rate(
  limit_count INTEGER DEFAULT 10,
  min_bookings INTEGER DEFAULT 5
)
RETURNS TABLE(
  profile_id UUID,
  full_name TEXT,
  completion_rate NUMERIC,
  total_bookings INTEGER,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.profile_id,
    p.full_name::TEXT,
    pm.completion_rate,
    pm.total_bookings,
    pm.average_rating
  FROM professional_performance_metrics pm
  JOIN profiles p ON p.id = pm.profile_id
  WHERE pm.total_bookings >= min_bookings
  ORDER BY pm.completion_rate DESC, pm.average_rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get performance summary for a professional
CREATE OR REPLACE FUNCTION get_performance_summary(professional_profile_id UUID)
RETURNS TABLE(
  total_bookings INTEGER,
  completion_rate NUMERIC,
  average_rating NUMERIC,
  total_revenue_cop INTEGER,
  revenue_last_30_days_cop INTEGER,
  bookings_last_30_days INTEGER,
  average_booking_value_cop INTEGER,
  repeat_customer_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.total_bookings,
    pm.completion_rate,
    pm.average_rating,
    pm.total_revenue_cop,
    pm.revenue_last_30_days_cop,
    pm.bookings_last_30_days,
    pm.average_booking_value_cop,
    pm.repeat_customer_rate
  FROM professional_performance_metrics pm
  WHERE pm.profile_id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Initialize performance metrics for a professional
CREATE OR REPLACE FUNCTION initialize_performance_metrics(professional_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  new_metrics JSONB;
BEGIN
  INSERT INTO professional_performance_metrics (profile_id)
  VALUES (professional_profile_id)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT row_to_json(pm.*)::JSONB INTO new_metrics
  FROM professional_performance_metrics pm
  WHERE pm.profile_id = professional_profile_id;

  RETURN new_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS FOR AUTO-INITIALIZATION
-- ============================================================================

-- Auto-initialize performance metrics when a professional profile is created
CREATE OR REPLACE FUNCTION auto_initialize_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'professional' THEN
    INSERT INTO professional_performance_metrics (profile_id)
    VALUES (NEW.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_init_performance_metrics ON profiles;
CREATE TRIGGER trigger_auto_init_performance_metrics
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'professional')
  EXECUTE FUNCTION auto_initialize_performance_metrics();

-- ============================================================================
-- 6. CREATE SNAPSHOT GENERATION FUNCTION
-- ============================================================================

-- Generate daily revenue snapshot for a professional
CREATE OR REPLACE FUNCTION generate_daily_revenue_snapshot(
  professional_profile_id UUID,
  snapshot_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  snapshot_data JSONB;
BEGIN
  -- Placeholder implementation
  -- Will be updated when bookings table exists
  INSERT INTO professional_revenue_snapshots (
    profile_id,
    snapshot_date,
    period_type,
    total_revenue_cop,
    completed_bookings,
    average_booking_value_cop
  )
  VALUES (
    professional_profile_id,
    snapshot_date,
    'daily',
    0, -- Will calculate from bookings
    0, -- Will count from bookings
    0  -- Will average from bookings
  )
  ON CONFLICT (profile_id, snapshot_date, period_type)
  DO UPDATE SET
    total_revenue_cop = EXCLUDED.total_revenue_cop,
    completed_bookings = EXCLUDED.completed_bookings,
    average_booking_value_cop = EXCLUDED.average_booking_value_cop;

  SELECT row_to_json(rs.*)::JSONB INTO snapshot_data
  FROM professional_revenue_snapshots rs
  WHERE rs.profile_id = professional_profile_id
    AND rs.snapshot_date = snapshot_date
    AND rs.period_type = 'daily';

  RETURN snapshot_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Sprint 2 migration complete (Part 1 - Analytics Infrastructure)
-- ============================================================================
-- Note: Booking-related calculations will be implemented when bookings table exists
