-- Create pricing controls table for tunable commission rates
-- Allows admins to set commission by service category and/or city
-- PRD requirement: Commission 15-20% + background check fee (tunable)

-- Ensure uuid extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pricing_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope selectors (NULL = applies to all)
  service_category TEXT, -- e.g., "cleaning", "cooking", "childcare"
  city TEXT,              -- e.g., "Bogotá", "Medellín"
  country TEXT DEFAULT 'Colombia',

  -- Pricing configuration
  commission_rate DECIMAL(5, 4) NOT NULL CHECK (commission_rate >= 0.10 AND commission_rate <= 0.30),
  background_check_fee_cop INTEGER DEFAULT 0 CHECK (background_check_fee_cop >= 0),

  -- Price floors and ceilings
  min_price_cop INTEGER CHECK (min_price_cop IS NULL OR min_price_cop >= 0),
  max_price_cop INTEGER CHECK (max_price_cop IS NULL OR max_price_cop >= min_price_cop),

  -- Deposit configuration
  deposit_percentage DECIMAL(5, 4) CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 1.0)),
  late_cancel_hours INTEGER DEFAULT 24 CHECK (late_cancel_hours >= 0),
  late_cancel_fee_percentage DECIMAL(5, 4) DEFAULT 0.50 CHECK (late_cancel_fee_percentage >= 0 AND late_cancel_fee_percentage <= 1.0),

  -- Effective dates
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure effective_until is after effective_from
  CONSTRAINT valid_date_range CHECK (effective_until IS NULL OR effective_until >= effective_from)
);

-- Unique constraint: only one active rule per category/city combination (using partial unique index)
CREATE UNIQUE INDEX unique_active_rule ON pricing_controls(service_category, city, effective_from)
  NULLS NOT DISTINCT WHERE is_active = true;

-- Create indexes
CREATE INDEX idx_pricing_controls_category ON pricing_controls(service_category) WHERE is_active = true;
CREATE INDEX idx_pricing_controls_city ON pricing_controls(city) WHERE is_active = true;
CREATE INDEX idx_pricing_controls_effective ON pricing_controls(effective_from, effective_until) WHERE is_active = true;
CREATE INDEX idx_pricing_controls_active ON pricing_controls(is_active) WHERE is_active = true;

-- Insert default pricing rule (18% commission, as per current hardcoded value)
INSERT INTO pricing_controls (
  service_category,
  city,
  commission_rate,
  background_check_fee_cop,
  notes
) VALUES (
  NULL, -- Applies to all categories
  NULL, -- Applies to all cities
  0.18, -- 18% commission
  0,    -- No background check fee yet
  'Default platform-wide commission rate (legacy)'
);

-- Function to get applicable pricing rule
CREATE OR REPLACE FUNCTION get_pricing_rule(
  p_service_category TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  id UUID,
  commission_rate DECIMAL,
  background_check_fee_cop INTEGER,
  min_price_cop INTEGER,
  max_price_cop INTEGER,
  deposit_percentage DECIMAL,
  late_cancel_hours INTEGER,
  late_cancel_fee_percentage DECIMAL
) AS $$
BEGIN
  -- Priority order:
  -- 1. Exact category + city match
  -- 2. Category match (any city)
  -- 3. City match (any category)
  -- 4. Default rule (NULL category, NULL city)

  RETURN QUERY
  SELECT
    pc.id,
    pc.commission_rate,
    pc.background_check_fee_cop,
    pc.min_price_cop,
    pc.max_price_cop,
    pc.deposit_percentage,
    pc.late_cancel_hours,
    pc.late_cancel_fee_percentage
  FROM pricing_controls pc
  WHERE
    pc.is_active = true
    AND pc.effective_from <= p_effective_date
    AND (pc.effective_until IS NULL OR pc.effective_until >= p_effective_date)
  ORDER BY
    -- Prioritize most specific rules first
    CASE
      WHEN pc.service_category = p_service_category AND pc.city = p_city THEN 1
      WHEN pc.service_category = p_service_category AND pc.city IS NULL THEN 2
      WHEN pc.service_category IS NULL AND pc.city = p_city THEN 3
      WHEN pc.service_category IS NULL AND pc.city IS NULL THEN 4
      ELSE 5
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update pricing rule
CREATE OR REPLACE FUNCTION update_pricing_rule()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pricing_rule
  BEFORE UPDATE ON pricing_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_rule();

-- Enable RLS
ALTER TABLE pricing_controls ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage pricing controls"
  ON pricing_controls
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Authenticated users can view active rules (for pricing calculations)
CREATE POLICY "Users can view active pricing rules"
  ON pricing_controls
  FOR SELECT
  USING (is_active = true);

-- Grant permissions
GRANT SELECT ON pricing_controls TO authenticated;
GRANT ALL ON pricing_controls TO service_role;

-- Comments
COMMENT ON TABLE pricing_controls IS 'Tunable pricing configuration by service category and city';
COMMENT ON COLUMN pricing_controls.commission_rate IS 'Platform commission rate (0.10 to 0.30, i.e., 10% to 30%)';
COMMENT ON COLUMN pricing_controls.background_check_fee_cop IS 'One-time background check fee in COP';
COMMENT ON COLUMN pricing_controls.min_price_cop IS 'Minimum allowed price for this category/city';
COMMENT ON COLUMN pricing_controls.max_price_cop IS 'Maximum allowed price for this category/city';
COMMENT ON COLUMN pricing_controls.deposit_percentage IS 'Required deposit percentage (NULL = use default)';
COMMENT ON COLUMN pricing_controls.late_cancel_hours IS 'Hours before service when late cancel fee applies';
COMMENT ON COLUMN pricing_controls.late_cancel_fee_percentage IS 'Percentage of booking to charge as late cancel fee';
COMMENT ON FUNCTION get_pricing_rule(TEXT, TEXT, DATE) IS 'Gets most specific applicable pricing rule for given context';
