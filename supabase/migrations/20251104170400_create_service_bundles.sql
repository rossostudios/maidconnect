-- Create service_bundles table for saved quick-quote templates
-- Allows professionals to create reusable service packages with pre-defined pricing

CREATE TABLE IF NOT EXISTS service_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  services JSONB NOT NULL, -- Array of service objects with durations
  total_duration_minutes INTEGER NOT NULL CHECK (total_duration_minutes > 0),
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop > 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 50),
  final_price_cop INTEGER NOT NULL CHECK (final_price_cop > 0),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure final price reflects discount
  CONSTRAINT valid_bundle_pricing CHECK (
    final_price_cop = base_price_cop - (base_price_cop * discount_percentage / 100)
  )
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_service_bundles_profile
ON service_bundles (profile_id);

CREATE INDEX IF NOT EXISTS idx_service_bundles_active
ON service_bundles (profile_id, is_active)
WHERE is_active = true;

-- Create GIN index for querying services JSONB
CREATE INDEX IF NOT EXISTS idx_service_bundles_services
ON service_bundles USING GIN (services);

-- Enable RLS
ALTER TABLE service_bundles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active service bundles"
  ON service_bundles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Professionals can manage their own bundles"
  ON service_bundles
  FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Trigger to update final_price_cop on insert/update
CREATE OR REPLACE FUNCTION calculate_bundle_final_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_price_cop := NEW.base_price_cop - (NEW.base_price_cop * NEW.discount_percentage / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_bundle_price
  BEFORE INSERT OR UPDATE ON service_bundles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_bundle_final_price();

COMMENT ON TABLE service_bundles IS 'Reusable service packages created by professionals for quick quoting';
COMMENT ON COLUMN service_bundles.services IS 'JSONB array: [{"serviceId": "uuid", "name": "Deep Clean", "durationMinutes": 120}]';
COMMENT ON COLUMN service_bundles.discount_percentage IS 'Bundle discount (0-50%) applied to base price';
COMMENT ON COLUMN service_bundles.usage_count IS 'Number of times this bundle has been used in bookings';
