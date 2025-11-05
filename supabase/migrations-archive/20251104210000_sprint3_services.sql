-- Sprint 3: Service Management
-- This migration creates tables for professional service catalog, pricing tiers, and add-ons

-- ============================================================================
-- 1. CREATE SERVICE CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Icon name from hugeicons-react
  parent_category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_slug
ON service_categories (slug);

CREATE INDEX IF NOT EXISTS idx_service_categories_parent
ON service_categories (parent_category_id)
WHERE parent_category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_categories_active
ON service_categories (is_active, display_order)
WHERE is_active = true;

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_categories'
    AND policyname = 'Public can view active service categories'
  ) THEN
    CREATE POLICY "Public can view active service categories"
      ON service_categories
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

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
  ('Errands', 'errands', 'Shopping and errand running', 'ShoppingBasketIcon', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. CREATE PROFESSIONAL SERVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,

  -- Service Details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  service_type VARCHAR(20) DEFAULT 'one-time' CHECK (service_type IN ('one-time', 'recurring', 'package')),

  -- Pricing
  base_price_cop INTEGER NOT NULL CHECK (base_price_cop >= 0),
  pricing_unit VARCHAR(20) DEFAULT 'hour' CHECK (pricing_unit IN ('hour', 'day', 'job', 'week', 'month')),

  -- Duration
  estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
  min_duration_minutes INTEGER CHECK (min_duration_minutes > 0),
  max_duration_minutes INTEGER CHECK (max_duration_minutes > 0),

  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Booking Settings
  requires_approval BOOLEAN DEFAULT false,
  advance_booking_hours INTEGER DEFAULT 24 CHECK (advance_booking_hours >= 0),
  max_booking_days_ahead INTEGER DEFAULT 90 CHECK (max_booking_days_ahead > 0),

  -- Additional Info
  requirements JSONB DEFAULT '[]'::jsonb, -- Array of requirements/notes
  included_items JSONB DEFAULT '[]'::jsonb, -- What's included in base price

  -- Metrics
  booking_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_duration_range CHECK (
    (min_duration_minutes IS NULL AND max_duration_minutes IS NULL) OR
    (min_duration_minutes <= max_duration_minutes)
  )
);

CREATE INDEX IF NOT EXISTS idx_professional_services_profile
ON professional_services (profile_id);

CREATE INDEX IF NOT EXISTS idx_professional_services_category
ON professional_services (category_id)
WHERE category_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_professional_services_active
ON professional_services (is_active, is_featured)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_professional_services_type
ON professional_services (service_type);

CREATE INDEX IF NOT EXISTS idx_professional_services_rating
ON professional_services (average_rating DESC)
WHERE average_rating > 0;

ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_services'
    AND policyname = 'Public can view active services'
  ) THEN
    CREATE POLICY "Public can view active services"
      ON professional_services
      FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'professional_services'
    AND policyname = 'Professionals can manage their own services'
  ) THEN
    CREATE POLICY "Professionals can manage their own services"
      ON professional_services
      FOR ALL
      USING (
        profile_id IN (
          SELECT id FROM profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE SERVICE PRICING TIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE CASCADE,

  -- Tier Details
  tier_name VARCHAR(50) NOT NULL, -- e.g., 'Basic', 'Standard', 'Premium'
  tier_level INTEGER NOT NULL CHECK (tier_level > 0), -- 1=Basic, 2=Standard, 3=Premium
  description TEXT,

  -- Pricing
  price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
  pricing_adjustment_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_adjustment_type IN ('fixed', 'percentage')),
  pricing_adjustment_value INTEGER DEFAULT 0,

  -- Features
  features JSONB DEFAULT '[]'::jsonb, -- Array of included features
  max_area_sqm INTEGER, -- For cleaning services
  max_hours INTEGER, -- For hourly services

  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_service_tier_level UNIQUE (service_id, tier_level)
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_service
ON service_pricing_tiers (service_id);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active
ON service_pricing_tiers (is_active, tier_level)
WHERE is_active = true;

ALTER TABLE service_pricing_tiers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_pricing_tiers'
    AND policyname = 'Public can view active pricing tiers'
  ) THEN
    CREATE POLICY "Public can view active pricing tiers"
      ON service_pricing_tiers
      FOR SELECT
      USING (
        is_active = true AND
        service_id IN (SELECT id FROM professional_services WHERE is_active = true)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_pricing_tiers'
    AND policyname = 'Professionals can manage their own pricing tiers'
  ) THEN
    CREATE POLICY "Professionals can manage their own pricing tiers"
      ON service_pricing_tiers
      FOR ALL
      USING (
        service_id IN (
          SELECT id FROM professional_services
          WHERE profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE SERVICE ADD-ONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES professional_services(id) ON DELETE CASCADE,

  -- Add-on Details
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Pricing
  price_cop INTEGER NOT NULL CHECK (price_cop >= 0),
  pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'per_hour', 'per_item')),

  -- Duration Impact
  additional_duration_minutes INTEGER DEFAULT 0 CHECK (additional_duration_minutes >= 0),

  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  max_quantity INTEGER DEFAULT 1 CHECK (max_quantity > 0),

  -- Display
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50), -- Icon name from hugeicons-react

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_addons_service
ON service_addons (service_id);

CREATE INDEX IF NOT EXISTS idx_service_addons_active
ON service_addons (is_active, display_order)
WHERE is_active = true;

ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_addons'
    AND policyname = 'Public can view active service add-ons'
  ) THEN
    CREATE POLICY "Public can view active service add-ons"
      ON service_addons
      FOR SELECT
      USING (
        is_active = true AND
        service_id IN (SELECT id FROM professional_services WHERE is_active = true)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'service_addons'
    AND policyname = 'Professionals can manage their own add-ons'
  ) THEN
    CREATE POLICY "Professionals can manage their own add-ons"
      ON service_addons
      FOR ALL
      USING (
        service_id IN (
          SELECT id FROM professional_services
          WHERE profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Calculate total price for a service with tiers and add-ons
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
  total_duration INTEGER := 0;
  result JSONB;
BEGIN
  -- Get base service price and duration
  SELECT base_price_cop, COALESCE(estimated_duration_minutes, 0)
  INTO base_price, total_duration
  FROM professional_services
  WHERE id = service_id_param;

  -- Get tier price if specified
  IF tier_id_param IS NOT NULL THEN
    SELECT price_cop
    INTO tier_price
    FROM service_pricing_tiers
    WHERE id = tier_id_param AND service_id = service_id_param;
  END IF;

  -- Calculate add-ons price and duration
  IF array_length(addon_ids_param, 1) > 0 THEN
    SELECT
      COALESCE(SUM(price_cop), 0),
      COALESCE(SUM(additional_duration_minutes), 0)
    INTO addons_price, total_duration
    FROM service_addons
    WHERE id = ANY(addon_ids_param) AND service_id = service_id_param;

    total_duration := total_duration + COALESCE((
      SELECT estimated_duration_minutes
      FROM professional_services
      WHERE id = service_id_param
    ), 0);
  END IF;

  -- Use tier price if provided, otherwise base price
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

-- Get all services for a professional with counts
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
    COUNT(*)::INTEGER AS total_services,
    COUNT(CASE WHEN is_active THEN 1 END)::INTEGER AS active_services,
    COUNT(CASE WHEN is_featured THEN 1 END)::INTEGER AS featured_services,
    COALESCE(SUM(booking_count), 0)::INTEGER AS total_bookings,
    ROUND(AVG(CASE WHEN average_rating > 0 THEN average_rating END), 2) AS average_rating
  FROM professional_services
  WHERE profile_id = professional_profile_id;
END;
$$ LANGUAGE plpgsql;

-- Get services by category with professional details
CREATE OR REPLACE FUNCTION get_services_by_category(
  category_slug_param VARCHAR,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  service_id UUID,
  service_name VARCHAR,
  service_description TEXT,
  base_price_cop INTEGER,
  pricing_unit VARCHAR,
  professional_id UUID,
  professional_name TEXT,
  professional_rating NUMERIC,
  category_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS service_id,
    s.name AS service_name,
    s.description AS service_description,
    s.base_price_cop,
    s.pricing_unit,
    s.profile_id AS professional_id,
    p.full_name AS professional_name,
    s.average_rating AS professional_rating,
    c.name AS category_name
  FROM professional_services s
  JOIN profiles p ON p.id = s.profile_id
  LEFT JOIN service_categories c ON c.id = s.category_id
  WHERE s.is_active = true
    AND (category_slug_param IS NULL OR c.slug = category_slug_param)
  ORDER BY s.is_featured DESC, s.average_rating DESC, s.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE AUTO-UPDATE TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_categories_updated_at ON service_categories;
CREATE TRIGGER trigger_update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_professional_services_updated_at ON professional_services;
CREATE TRIGGER trigger_update_professional_services_updated_at
  BEFORE UPDATE ON professional_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_pricing_tiers_updated_at ON service_pricing_tiers;
CREATE TRIGGER trigger_update_pricing_tiers_updated_at
  BEFORE UPDATE ON service_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_service_addons_updated_at ON service_addons;
CREATE TRIGGER trigger_update_service_addons_updated_at
  BEFORE UPDATE ON service_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE! Sprint 3 migration complete
-- ============================================================================
