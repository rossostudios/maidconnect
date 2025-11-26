-- Migration: Add professional_date_pricing table
-- Purpose: Store per-date custom hourly rates for professionals (Airbnb-style pricing)
-- Note: Falls back to professional_services.hourly_rate when no custom pricing exists

-- Create professional_date_pricing table
CREATE TABLE IF NOT EXISTS professional_date_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hourly_rate_cents BIGINT NOT NULL CHECK (hourly_rate_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one price per professional per date
  CONSTRAINT unique_professional_date UNIQUE (professional_id, date)
);

-- Add comments for documentation
COMMENT ON TABLE professional_date_pricing IS 'Per-date custom hourly rates for professionals. Falls back to service rate when not set.';
COMMENT ON COLUMN professional_date_pricing.professional_id IS 'Reference to the professional (auth.users)';
COMMENT ON COLUMN professional_date_pricing.date IS 'The specific date this pricing applies to';
COMMENT ON COLUMN professional_date_pricing.hourly_rate_cents IS 'Hourly rate in cents (minor currency units)';

-- Create index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_pro_date_pricing_lookup
  ON professional_date_pricing(professional_id, date);

-- Create index for date-based queries (finding all pros with pricing on a date)
CREATE INDEX IF NOT EXISTS idx_pro_date_pricing_date
  ON professional_date_pricing(date);

-- Enable Row Level Security
ALTER TABLE professional_date_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Professionals can manage their own pricing
CREATE POLICY "Professionals manage own pricing"
  ON professional_date_pricing
  FOR ALL
  TO authenticated
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Policy: Public can read pricing (for availability/booking UIs)
CREATE POLICY "Public can read pricing"
  ON professional_date_pricing
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_professional_date_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_professional_date_pricing_updated_at
  BEFORE UPDATE ON professional_date_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_date_pricing_updated_at();

-- Helper function to get effective hourly rate for a professional on a date
-- Returns custom rate if set, otherwise falls back to service default
CREATE OR REPLACE FUNCTION get_professional_hourly_rate(
  p_professional_id UUID,
  p_date DATE,
  p_service_id UUID DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  custom_rate BIGINT;
  default_rate BIGINT;
BEGIN
  -- First check for custom date pricing
  SELECT hourly_rate_cents INTO custom_rate
  FROM professional_date_pricing
  WHERE professional_id = p_professional_id
    AND date = p_date;

  IF custom_rate IS NOT NULL THEN
    RETURN custom_rate;
  END IF;

  -- Fall back to service hourly rate
  IF p_service_id IS NOT NULL THEN
    SELECT hourly_rate INTO default_rate
    FROM professional_services
    WHERE id = p_service_id
      AND professional_id = p_professional_id;
  ELSE
    -- Get the first (primary) service rate
    SELECT hourly_rate INTO default_rate
    FROM professional_services
    WHERE professional_id = p_professional_id
      AND is_active = true
    ORDER BY created_at
    LIMIT 1;
  END IF;

  RETURN COALESCE(default_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to bulk upsert pricing for multiple dates
CREATE OR REPLACE FUNCTION upsert_professional_date_pricing(
  p_professional_id UUID,
  p_dates DATE[],
  p_hourly_rate_cents BIGINT
)
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Verify the user is updating their own pricing
  IF auth.uid() != p_professional_id THEN
    RAISE EXCEPTION 'Cannot update pricing for another professional';
  END IF;

  INSERT INTO professional_date_pricing (professional_id, date, hourly_rate_cents)
  SELECT p_professional_id, d, p_hourly_rate_cents
  FROM unnest(p_dates) AS d
  ON CONFLICT (professional_id, date)
  DO UPDATE SET
    hourly_rate_cents = EXCLUDED.hourly_rate_cents,
    updated_at = now();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_professional_hourly_rate(UUID, DATE, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION upsert_professional_date_pricing(UUID, DATE[], BIGINT) TO authenticated;
