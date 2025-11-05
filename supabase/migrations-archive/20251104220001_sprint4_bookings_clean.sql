-- Sprint 4: Booking Lifecycle - CLEAN MIGRATION
-- Drops any conflicting tables first, then creates correct schema

-- ============================================================================
-- 0. DROP EXISTING CONFLICTING TABLES (IF ANY)
-- ============================================================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS booking_addons CASCADE;
DROP TABLE IF EXISTS booking_status_history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Drop sequence if exists
DROP SEQUENCE IF EXISTS booking_number_seq CASCADE;

-- Drop old functions if exist
DROP FUNCTION IF EXISTS generate_booking_number();
DROP FUNCTION IF EXISTS set_booking_number();
DROP FUNCTION IF EXISTS track_booking_status_change();
DROP FUNCTION IF EXISTS get_customer_booking_summary(UUID);
DROP FUNCTION IF EXISTS get_professional_booking_summary(UUID);
DROP FUNCTION IF EXISTS calculate_booking_price(UUID);
DROP FUNCTION IF EXISTS check_booking_availability(UUID, DATE, TIME, TIME, UUID);

-- ============================================================================
-- 1. CREATE BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE RESTRICT,
  pricing_tier_id UUID REFERENCES service_pricing_tiers(id) ON DELETE SET NULL,

  -- Booking details
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
  )),

  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Location
  service_address_id UUID, -- Optional reference to saved addresses (no FK constraint)
  service_address_line1 VARCHAR(255),
  service_address_line2 VARCHAR(255),
  service_address_city VARCHAR(100),
  service_address_postal_code VARCHAR(20),
  service_address_country VARCHAR(2) DEFAULT 'CO',
  location_lat NUMERIC(10, 8),
  location_lng NUMERIC(11, 8),

  -- Pricing
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop >= 0),
  tier_price_cop INTEGER DEFAULT 0 CHECK (tier_price_cop >= 0),
  addons_price_cop INTEGER DEFAULT 0 CHECK (addons_price_cop >= 0),
  tip_amount_cop INTEGER DEFAULT 0 CHECK (tip_amount_cop >= 0),
  total_price_cop INTEGER NOT NULL CHECK (total_price_cop >= 0),

  -- Additional info
  customer_notes TEXT,
  professional_notes TEXT,
  special_requirements JSONB DEFAULT '[]'::jsonb,

  -- Cancellation
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,

  -- Ratings and reviews
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  customer_rated_at TIMESTAMPTZ,
  professional_rating INTEGER CHECK (professional_rating >= 1 AND professional_rating <= 5),
  professional_review TEXT,
  professional_rated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_scheduled_time CHECK (scheduled_end_time > scheduled_start_time),
  CONSTRAINT valid_actual_time CHECK (
    actual_end_time IS NULL OR actual_start_time IS NULL OR
    actual_end_time > actual_start_time
  ),
  CONSTRAINT different_parties CHECK (customer_id != professional_id)
);

-- Indexes for performance
CREATE INDEX idx_bookings_customer ON bookings (customer_id, created_at DESC);
CREATE INDEX idx_bookings_professional ON bookings (professional_id, scheduled_date DESC);
CREATE INDEX idx_bookings_service ON bookings (service_id);
CREATE INDEX idx_bookings_status ON bookings (status, scheduled_date);
CREATE INDEX idx_bookings_date ON bookings (scheduled_date, scheduled_start_time);
CREATE INDEX idx_bookings_number ON bookings (booking_number);
CREATE INDEX idx_bookings_location ON bookings (location_lat, location_lng) WHERE location_lat IS NOT NULL;
CREATE INDEX idx_bookings_pending_rating ON bookings (customer_id)
  WHERE status = 'completed' AND customer_rating IS NULL;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookings as customer"
  ON bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Users can view their own bookings as professional"
  ON bookings FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Professionals can update bookings assigned to them"
  ON bookings FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid());

-- ============================================================================
-- 2. CREATE BOOKING STATUS HISTORY TABLE
-- ============================================================================

CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_booking ON booking_status_history (booking_id, created_at DESC);

ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history for their bookings"
  ON booking_status_history FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid() OR professional_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. CREATE BOOKING ADDONS TABLE
-- ============================================================================

CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES service_addons(id) ON DELETE RESTRICT,
  addon_name VARCHAR(200) NOT NULL,
  addon_price_cop INTEGER NOT NULL CHECK (addon_price_cop >= 0),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_booking_addon UNIQUE (booking_id, addon_id)
);

CREATE INDEX idx_booking_addons_booking ON booking_addons (booking_id);

ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view addons for their bookings"
  ON booking_addons FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid() OR professional_id = auth.uid()
    )
  );

CREATE POLICY "Customers can manage addons for pending bookings"
  ON booking_addons FOR ALL
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE customer_id = auth.uid() AND status = 'pending'
    )
  );

-- ============================================================================
-- 4. CREATE BOOKING NUMBER SEQUENCE
-- ============================================================================

CREATE SEQUENCE booking_number_seq START 1000;

-- Function to generate unique booking numbers
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_num INTEGER;
  new_number VARCHAR(20);
BEGIN
  next_num := nextval('booking_number_seq');
  new_number := 'BK' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(next_num::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Auto-generate booking number on insert
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_number();

-- Track status changes
CREATE OR REPLACE FUNCTION track_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.cancellation_reason
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION track_booking_status_change();

-- Auto-update timestamps
CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Get customer booking summary
CREATE OR REPLACE FUNCTION get_customer_booking_summary(customer_profile_id UUID)
RETURNS TABLE(
  total_bookings INTEGER,
  pending_bookings INTEGER,
  completed_bookings INTEGER,
  cancelled_bookings INTEGER,
  total_spent_cop INTEGER,
  pending_ratings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER AS pending_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER AS completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER AS cancelled_bookings,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER AS total_spent_cop,
    COUNT(CASE WHEN status = 'completed' AND customer_rating IS NULL THEN 1 END)::INTEGER AS pending_ratings
  FROM bookings
  WHERE customer_id = customer_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Get professional booking summary
CREATE OR REPLACE FUNCTION get_professional_booking_summary(professional_profile_id UUID)
RETURNS TABLE(
  total_bookings INTEGER,
  pending_bookings INTEGER,
  confirmed_bookings INTEGER,
  completed_bookings INTEGER,
  cancelled_bookings INTEGER,
  total_earned_cop INTEGER,
  average_rating NUMERIC,
  total_ratings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER AS pending_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::INTEGER AS confirmed_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER AS completed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER AS cancelled_bookings,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER AS total_earned_cop,
    ROUND(AVG(CASE WHEN professional_rating IS NOT NULL THEN professional_rating END), 2) AS average_rating,
    COUNT(CASE WHEN professional_rating IS NOT NULL THEN 1 END)::INTEGER AS total_ratings
  FROM bookings
  WHERE professional_id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Calculate booking price with addons
CREATE OR REPLACE FUNCTION calculate_booking_price(
  booking_id_param UUID
)
RETURNS JSONB AS $$
DECLARE
  base_price INTEGER;
  tier_price INTEGER;
  addons_price INTEGER;
  tip_amount INTEGER;
  total_price INTEGER;
  result JSONB;
BEGIN
  SELECT
    base_price_cop,
    COALESCE(tier_price_cop, 0),
    COALESCE(addons_price_cop, 0),
    COALESCE(tip_amount_cop, 0)
  INTO base_price, tier_price, addons_price, tip_amount
  FROM bookings
  WHERE id = booking_id_param;

  total_price := base_price + tier_price + addons_price + tip_amount;

  result := jsonb_build_object(
    'basePrice', base_price,
    'tierPrice', tier_price,
    'addonsPrice', addons_price,
    'tipAmount', tip_amount,
    'totalPrice', total_price
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Check booking availability for a professional
CREATE OR REPLACE FUNCTION check_booking_availability(
  professional_profile_id UUID,
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM bookings
  WHERE professional_id = professional_profile_id
    AND scheduled_date = booking_date
    AND status NOT IN ('cancelled', 'completed')
    AND (id != exclude_booking_id OR exclude_booking_id IS NULL)
    AND (
      (scheduled_start_time, scheduled_end_time) OVERLAPS (start_time, end_time)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Sprint 4 migration complete
-- ============================================================================
