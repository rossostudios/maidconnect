-- COMPREHENSIVE MIGRATION: Sprint 3 (Services) + Sprint 4 (Bookings)
-- This migration drops ALL related tables and creates them fresh
-- Run this INSTEAD of individual sprint migrations

-- ============================================================================
-- STEP 0: DROP EVERYTHING (avoid conflicts and deadlocks)
-- ============================================================================

-- Terminate any active connections to these tables
DO $$
BEGIN
  -- Disable triggers temporarily to avoid cascading issues
  SET session_replication_role = replica;
END $$;

-- Drop Sprint 4 tables (reverse dependency order)
DROP TABLE IF EXISTS booking_addons CASCADE;
DROP TABLE IF EXISTS booking_status_history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP SEQUENCE IF EXISTS booking_number_seq CASCADE;

-- Drop Sprint 3 tables (reverse dependency order)
DROP TABLE IF EXISTS service_addons CASCADE;
DROP TABLE IF EXISTS service_pricing_tiers CASCADE;
DROP TABLE IF EXISTS professional_services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

-- Drop all related functions
DROP FUNCTION IF EXISTS generate_booking_number() CASCADE;
DROP FUNCTION IF EXISTS set_booking_number() CASCADE;
DROP FUNCTION IF EXISTS track_booking_status_change() CASCADE;
DROP FUNCTION IF EXISTS get_customer_booking_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_professional_booking_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_booking_price(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_booking_availability(UUID, DATE, TIME, TIME, UUID) CASCADE;
DROP FUNCTION IF EXISTS check_service_ownership(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_professional_services_summary(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_service_price(UUID, UUID, UUID[]) CASCADE;

-- Re-enable triggers
DO $$
BEGIN
  SET session_replication_role = DEFAULT;
END $$;

-- ============================================================================
-- SPRINT 3: SERVICE MANAGEMENT
-- ============================================================================

-- 1. SERVICE CATEGORIES
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  parent_category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_categories_slug ON service_categories (slug);
CREATE INDEX idx_service_categories_parent ON service_categories (parent_category_id) WHERE parent_category_id IS NOT NULL;
CREATE INDEX idx_service_categories_active ON service_categories (is_active, display_order) WHERE is_active = true;

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active service categories"
  ON service_categories FOR SELECT TO public USING (is_active = true);

-- Seed default categories
INSERT INTO service_categories (name, slug, description, icon, display_order) VALUES
  ('Housekeeping', 'housekeeping', 'General house cleaning and maintenance', 'Home01Icon', 1),
  ('Deep Cleaning', 'deep-cleaning', 'Thorough cleaning of all areas', 'CleaningBucketIcon', 2),
  ('Laundry & Ironing', 'laundry-ironing', 'Washing, drying, and ironing services', 'WashingMachineIcon', 3),
  ('Cooking', 'cooking', 'Meal preparation and cooking', 'ChefHatIcon', 4),
  ('Childcare', 'childcare', 'Babysitting and child supervision', 'BabyBoyIcon', 5),
  ('Elder Care', 'elder-care', 'Assistance and companionship for elderly', 'OldManIcon', 6),
  ('Pet Care', 'pet-care', 'Pet sitting, walking, and grooming', 'PawIcon', 7),
  ('Gardening', 'gardening', 'Garden maintenance and landscaping', 'PlantGrowthIcon', 8),
  ('Organization', 'organization', 'Home organization and decluttering', 'LayoutColumnIcon', 9),
  ('Errands', 'errands', 'Shopping and errand running', 'ShoppingBasketIcon', 10);

-- 2. PROFESSIONAL SERVICES
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  service_type VARCHAR(20) DEFAULT 'one-time' CHECK (service_type IN ('one-time', 'recurring', 'package')),
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop >= 0),
  pricing_unit VARCHAR(20) DEFAULT 'hour' CHECK (pricing_unit IN ('hour', 'day', 'job', 'week', 'month')),
  estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
  min_duration_minutes INTEGER CHECK (min_duration_minutes > 0),
  max_duration_minutes INTEGER CHECK (max_duration_minutes > 0),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  advance_booking_hours INTEGER DEFAULT 24 CHECK (advance_booking_hours >= 0),
  max_booking_days_ahead INTEGER DEFAULT 90 CHECK (max_booking_days_ahead > 0),
  requirements JSONB DEFAULT '[]'::jsonb,
  included_items JSONB DEFAULT '[]'::jsonb,
  booking_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_duration_range CHECK (
    (min_duration_minutes IS NULL AND max_duration_minutes IS NULL) OR
    (min_duration_minutes <= max_duration_minutes)
  )
);

CREATE INDEX idx_professional_services_profile ON professional_services (profile_id);
CREATE INDEX idx_professional_services_category ON professional_services (category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_professional_services_active ON professional_services (is_active, is_featured) WHERE is_active = true;
CREATE INDEX idx_professional_services_type ON professional_services (service_type);
CREATE INDEX idx_professional_services_rating ON professional_services (average_rating DESC) WHERE average_rating > 0;

ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active services"
  ON professional_services FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Professionals can manage their own services"
  ON professional_services FOR ALL TO authenticated USING (profile_id = auth.uid());

-- 3. RLS HELPER FUNCTION
CREATE OR REPLACE FUNCTION check_service_ownership(p_service_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM professional_services
    WHERE id = p_service_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SERVICE PRICING TIERS
CREATE TABLE service_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE CASCADE,
  tier_name VARCHAR(50) NOT NULL,
  tier_level INTEGER NOT NULL CHECK (tier_level > 0),
  description TEXT,
  price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
  pricing_adjustment_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_adjustment_type IN ('fixed', 'percentage')),
  pricing_adjustment_value INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  max_area_sqm INTEGER,
  max_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_service_tier_level UNIQUE (service_id, tier_level)
);

CREATE INDEX idx_pricing_tiers_service ON service_pricing_tiers (service_id);
CREATE INDEX idx_pricing_tiers_active ON service_pricing_tiers (is_active, tier_level) WHERE is_active = true;

ALTER TABLE service_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active pricing tiers"
  ON service_pricing_tiers FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Professionals can manage their own pricing tiers"
  ON service_pricing_tiers FOR ALL TO authenticated USING (check_service_ownership(service_id));

-- 5. SERVICE ADD-ONS
CREATE TABLE service_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
  pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'per_hour', 'per_item')),
  additional_duration_minutes INTEGER DEFAULT 0 CHECK (additional_duration_minutes >= 0),
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  max_quantity INTEGER DEFAULT 1 CHECK (max_quantity > 0),
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_addons_service ON service_addons (service_id);
CREATE INDEX idx_service_addons_active ON service_addons (is_active, display_order) WHERE is_active = true;

ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active service add-ons"
  ON service_addons FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Professionals can manage their own add-ons"
  ON service_addons FOR ALL TO authenticated USING (check_service_ownership(service_id));

-- 6. TRIGGERS FOR SPRINT 3
CREATE TRIGGER trigger_update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_professional_services_updated_at
  BEFORE UPDATE ON professional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_pricing_tiers_updated_at
  BEFORE UPDATE ON service_pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_service_addons_updated_at
  BEFORE UPDATE ON service_addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. HELPER FUNCTIONS FOR SPRINT 3
CREATE OR REPLACE FUNCTION get_professional_services_summary(professional_profile_id UUID)
RETURNS TABLE(
  total_services INTEGER,
  active_services INTEGER,
  featured_services INTEGER,
  total_bookings INTEGER,
  average_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN is_active THEN 1 END)::INTEGER,
    COUNT(CASE WHEN is_featured THEN 1 END)::INTEGER,
    COALESCE(SUM(booking_count), 0)::INTEGER,
    ROUND(AVG(CASE WHEN average_rating > 0 THEN average_rating END), 2)
  FROM professional_services
  WHERE profile_id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_service_price(
  service_id_param UUID,
  tier_id_param UUID DEFAULT NULL,
  addon_ids_param UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS JSONB AS $$
DECLARE
  base_price INTEGER;
  tier_price INTEGER := 0;
  addons_price INTEGER := 0;
  service_duration INTEGER := 0;
  addons_duration INTEGER := 0;
  total_duration INTEGER;
  result JSONB;
BEGIN
  SELECT base_price_cop, COALESCE(estimated_duration_minutes, 0)
  INTO base_price, service_duration
  FROM professional_services
  WHERE id = service_id_param;

  IF tier_id_param IS NOT NULL THEN
    SELECT price_cop INTO tier_price
    FROM service_pricing_tiers
    WHERE id = tier_id_param AND service_id = service_id_param;
  END IF;

  IF array_length(addon_ids_param, 1) > 0 THEN
    SELECT COALESCE(SUM(price_cop), 0), COALESCE(SUM(additional_duration_minutes), 0)
    INTO addons_price, addons_duration
    FROM service_addons
    WHERE id = ANY(addon_ids_param) AND service_id = service_id_param;
  END IF;

  total_duration := service_duration + addons_duration;

  result := jsonb_build_object(
    'basePrice', base_price,
    'tierPrice', tier_price,
    'addonsPrice', addons_price,
    'totalPrice', COALESCE(tier_price, base_price) + addons_price,
    'estimatedDurationMinutes', total_duration
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SPRINT 4: BOOKING LIFECYCLE
-- ============================================================================

-- 1. BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE RESTRICT,
  pricing_tier_id UUID REFERENCES service_pricing_tiers(id) ON DELETE SET NULL,
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'
  )),
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  service_address_id UUID,
  service_address_line1 VARCHAR(255),
  service_address_line2 VARCHAR(255),
  service_address_city VARCHAR(100),
  service_address_postal_code VARCHAR(20),
  service_address_country VARCHAR(2) DEFAULT 'CO',
  location_lat NUMERIC(10, 8),
  location_lng NUMERIC(11, 8),
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop >= 0),
  tier_price_cop INTEGER DEFAULT 0 CHECK (tier_price_cop >= 0),
  addons_price_cop INTEGER DEFAULT 0 CHECK (addons_price_cop >= 0),
  tip_amount_cop INTEGER DEFAULT 0 CHECK (tip_amount_cop >= 0),
  total_price_cop INTEGER NOT NULL CHECK (total_price_cop >= 0),
  customer_notes TEXT,
  professional_notes TEXT,
  special_requirements JSONB DEFAULT '[]'::jsonb,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  customer_rated_at TIMESTAMPTZ,
  professional_rating INTEGER CHECK (professional_rating >= 1 AND professional_rating <= 5),
  professional_review TEXT,
  professional_rated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_scheduled_time CHECK (scheduled_end_time > scheduled_start_time),
  CONSTRAINT valid_actual_time CHECK (
    actual_end_time IS NULL OR actual_start_time IS NULL OR actual_end_time > actual_start_time
  ),
  CONSTRAINT different_parties CHECK (customer_id != professional_id)
);

CREATE INDEX idx_bookings_customer ON bookings (customer_id, created_at DESC);
CREATE INDEX idx_bookings_professional ON bookings (professional_id, scheduled_date DESC);
CREATE INDEX idx_bookings_service ON bookings (service_id);
CREATE INDEX idx_bookings_status ON bookings (status, scheduled_date);
CREATE INDEX idx_bookings_date ON bookings (scheduled_date, scheduled_start_time);
CREATE INDEX idx_bookings_number ON bookings (booking_number);
CREATE INDEX idx_bookings_location ON bookings (location_lat, location_lng) WHERE location_lat IS NOT NULL;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings as customer"
  ON bookings FOR SELECT TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Users can view their own bookings as professional"
  ON bookings FOR SELECT TO authenticated USING (professional_id = auth.uid());

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own pending bookings"
  ON bookings FOR UPDATE TO authenticated USING (customer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Professionals can update bookings assigned to them"
  ON bookings FOR UPDATE TO authenticated USING (professional_id = auth.uid());

-- 2. BOOKING STATUS HISTORY
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
  ON booking_status_history FOR SELECT TO authenticated USING (
    booking_id IN (SELECT id FROM bookings WHERE customer_id = auth.uid() OR professional_id = auth.uid())
  );

-- 3. BOOKING ADDONS
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
  ON booking_addons FOR SELECT TO authenticated USING (
    booking_id IN (SELECT id FROM bookings WHERE customer_id = auth.uid() OR professional_id = auth.uid())
  );

CREATE POLICY "Customers can manage addons for pending bookings"
  ON booking_addons FOR ALL TO authenticated USING (
    booking_id IN (SELECT id FROM bookings WHERE customer_id = auth.uid() AND status = 'pending')
  );

-- 4. BOOKING NUMBER GENERATION
CREATE SEQUENCE booking_number_seq START 1000;

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

-- 5. STATUS CHANGE TRACKING
CREATE OR REPLACE FUNCTION track_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, reason)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.cancellation_reason);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION track_booking_status_change();

CREATE TRIGGER trigger_update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. HELPER FUNCTIONS FOR SPRINT 4
CREATE OR REPLACE FUNCTION get_customer_booking_summary(customer_profile_id UUID)
RETURNS TABLE(
  total_bookings INTEGER, pending_bookings INTEGER, completed_bookings INTEGER,
  cancelled_bookings INTEGER, total_spent_cop INTEGER, pending_ratings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER,
    COUNT(CASE WHEN status = 'completed' AND customer_rating IS NULL THEN 1 END)::INTEGER
  FROM bookings WHERE customer_id = customer_profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_professional_booking_summary(professional_profile_id UUID)
RETURNS TABLE(
  total_bookings INTEGER, pending_bookings INTEGER, confirmed_bookings INTEGER,
  completed_bookings INTEGER, cancelled_bookings INTEGER, total_earned_cop INTEGER,
  average_rating NUMERIC, total_ratings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::INTEGER,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price_cop END), 0)::INTEGER,
    ROUND(AVG(CASE WHEN professional_rating IS NOT NULL THEN professional_rating END), 2),
    COUNT(CASE WHEN professional_rating IS NOT NULL THEN 1 END)::INTEGER
  FROM bookings WHERE professional_id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_booking_availability(
  professional_profile_id UUID, booking_date DATE, start_time TIME, end_time TIME,
  exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE professional_id = professional_profile_id
    AND scheduled_date = booking_date
    AND status NOT IN ('cancelled', 'completed')
    AND (id != exclude_booking_id OR exclude_booking_id IS NULL)
    AND (scheduled_start_time, scheduled_end_time) OVERLAPS (start_time, end_time);
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DONE! Sprints 3 & 4 migration complete
-- ============================================================================
