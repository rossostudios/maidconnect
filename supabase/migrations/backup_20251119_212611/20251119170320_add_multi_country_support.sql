-- Migration: Add Multi-Country Support (Paraguay, Uruguay, Argentina + Colombia)
-- Description: Creates reference tables for countries, cities, and neighborhoods
--              Updates pricing_controls to support multiple countries
-- Author: AI Assistant
-- Date: 2025-11-19

-- ============================================================================
-- STEP 1: Create Reference Tables
-- ============================================================================

-- Countries reference table
CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY,  -- ISO 3166-1 alpha-2 (CO, PY, UY, AR)
  name_en text NOT NULL,
  name_es text NOT NULL,
  currency_code text NOT NULL,  -- ISO 4217 (COP, PYG, UYU, ARS)
  payment_processor text NOT NULL CHECK (payment_processor IN ('stripe', 'paypal')),
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Cities reference table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_code text NOT NULL REFERENCES countries(code) ON DELETE CASCADE,
  slug text NOT NULL,  -- URL-friendly version (e.g., 'buenos-aires')
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(slug, country_code),
  UNIQUE(name, country_code)
);

-- Neighborhoods reference table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  slug text NOT NULL,  -- URL-friendly version
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(slug, city_id),
  UNIQUE(name, city_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_is_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city_id ON neighborhoods(city_id);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_is_active ON neighborhoods(is_active);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_neighborhoods_updated_at
  BEFORE UPDATE ON neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 2: Seed Country Data
-- ============================================================================

INSERT INTO countries (code, name_en, name_es, currency_code, payment_processor) VALUES
  ('CO', 'Colombia', 'Colombia', 'COP', 'stripe'),
  ('PY', 'Paraguay', 'Paraguay', 'PYG', 'paypal'),
  ('UY', 'Uruguay', 'Uruguay', 'UYU', 'paypal'),
  ('AR', 'Argentina', 'Argentina', 'ARS', 'paypal')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- STEP 3: Seed City Data
-- ============================================================================

-- Colombia Cities (existing)
INSERT INTO cities (name, country_code, slug) VALUES
  ('Bogotá', 'CO', 'bogota'),
  ('Medellín', 'CO', 'medellin'),
  ('Cali', 'CO', 'cali'),
  ('Barranquilla', 'CO', 'barranquilla'),
  ('Cartagena', 'CO', 'cartagena'),
  ('Bucaramanga', 'CO', 'bucaramanga'),
  ('Pereira', 'CO', 'pereira')
ON CONFLICT (name, country_code) DO NOTHING;

-- Paraguay Cities
INSERT INTO cities (name, country_code, slug) VALUES
  ('Asunción', 'PY', 'asuncion'),
  ('Ciudad del Este', 'PY', 'ciudad-del-este'),
  ('Encarnación', 'PY', 'encarnacion')
ON CONFLICT (name, country_code) DO NOTHING;

-- Uruguay Cities
INSERT INTO cities (name, country_code, slug) VALUES
  ('Montevideo', 'UY', 'montevideo'),
  ('Punta del Este', 'UY', 'punta-del-este'),
  ('Maldonado', 'UY', 'maldonado')
ON CONFLICT (name, country_code) DO NOTHING;

-- Argentina Cities
INSERT INTO cities (name, country_code, slug) VALUES
  ('Buenos Aires', 'AR', 'buenos-aires'),
  ('Córdoba', 'AR', 'cordoba'),
  ('Rosario', 'AR', 'rosario'),
  ('Mendoza', 'AR', 'mendoza')
ON CONFLICT (name, country_code) DO NOTHING;

-- ============================================================================
-- STEP 4: Seed Colombian Neighborhoods (existing data from codebase)
-- ============================================================================

-- Get city IDs for neighborhood insertion
DO $$
DECLARE
  bogota_id uuid;
  medellin_id uuid;
  cali_id uuid;
  cartagena_id uuid;
  barranquilla_id uuid;
BEGIN
  -- Get city IDs
  SELECT id INTO bogota_id FROM cities WHERE slug = 'bogota' AND country_code = 'CO';
  SELECT id INTO medellin_id FROM cities WHERE slug = 'medellin' AND country_code = 'CO';
  SELECT id INTO cali_id FROM cities WHERE slug = 'cali' AND country_code = 'CO';
  SELECT id INTO cartagena_id FROM cities WHERE slug = 'cartagena' AND country_code = 'CO';
  SELECT id INTO barranquilla_id FROM cities WHERE slug = 'barranquilla' AND country_code = 'CO';

  -- Bogotá Neighborhoods
  INSERT INTO neighborhoods (name, city_id, slug) VALUES
    ('Chapinero', bogota_id, 'chapinero'),
    ('Usaquén', bogota_id, 'usaquen'),
    ('Suba', bogota_id, 'suba'),
    ('Engativá', bogota_id, 'engativa'),
    ('Kennedy', bogota_id, 'kennedy'),
    ('Fontibón', bogota_id, 'fontibon'),
    ('Teusaquillo', bogota_id, 'teusaquillo')
  ON CONFLICT (name, city_id) DO NOTHING;

  -- Medellín Neighborhoods
  INSERT INTO neighborhoods (name, city_id, slug) VALUES
    ('El Poblado', medellin_id, 'el-poblado'),
    ('Laureles', medellin_id, 'laureles'),
    ('Envigado', medellin_id, 'envigado'),
    ('Sabaneta', medellin_id, 'sabaneta'),
    ('Belén', medellin_id, 'belen')
  ON CONFLICT (name, city_id) DO NOTHING;

  -- Cali Neighborhoods
  INSERT INTO neighborhoods (name, city_id, slug) VALUES
    ('Granada', cali_id, 'granada'),
    ('San Fernando', cali_id, 'san-fernando'),
    ('Ciudad Jardín', cali_id, 'ciudad-jardin'),
    ('El Peñón', cali_id, 'el-penon')
  ON CONFLICT (name, city_id) DO NOTHING;

  -- Cartagena Neighborhoods
  INSERT INTO neighborhoods (name, city_id, slug) VALUES
    ('Bocagrande', cartagena_id, 'bocagrande'),
    ('Castillogrande', cartagena_id, 'castillogrande'),
    ('Manga', cartagena_id, 'manga'),
    ('Getsemaní', cartagena_id, 'getsemani')
  ON CONFLICT (name, city_id) DO NOTHING;

  -- Barranquilla Neighborhoods
  INSERT INTO neighborhoods (name, city_id, slug) VALUES
    ('El Prado', barranquilla_id, 'el-prado'),
    ('Riomar', barranquilla_id, 'riomar'),
    ('Alto Prado', barranquilla_id, 'alto-prado'),
    ('Villa Country', barranquilla_id, 'villa-country')
  ON CONFLICT (name, city_id) DO NOTHING;
END $$;

-- ============================================================================
-- STEP 5: Update pricing_controls Table
-- ============================================================================

-- First, migrate existing country data from 'Colombia' to 'CO'
UPDATE pricing_controls
SET country = 'CO'
WHERE country = 'Colombia' OR country IS NULL;

-- Remove the old DEFAULT constraint and add validation
ALTER TABLE pricing_controls
  ALTER COLUMN country DROP DEFAULT;

-- Add check constraint for valid country codes
ALTER TABLE pricing_controls
  ADD CONSTRAINT pricing_controls_country_check
  CHECK (country IN ('CO', 'PY', 'UY', 'AR'));

-- Make country NOT NULL (after migration)
ALTER TABLE pricing_controls
  ALTER COLUMN country SET NOT NULL;

-- Update unique constraint to include country (if it doesn't exist)
-- This allows different pricing rules per country
DO $$
BEGIN
  -- Drop old unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_active_rule'
  ) THEN
    ALTER TABLE pricing_controls DROP CONSTRAINT unique_active_rule;
  END IF;

  -- Add new unique constraint including country
  ALTER TABLE pricing_controls
    ADD CONSTRAINT unique_active_rule_per_country
    UNIQUE (service_category, city, country, effective_from);
END $$;

-- ============================================================================
-- STEP 6: Add RLS Policies for New Tables
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

-- Countries: Public read access
CREATE POLICY "Countries are viewable by everyone"
  ON countries FOR SELECT
  USING (is_active = true);

-- Cities: Public read access
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (is_active = true);

-- Neighborhoods: Public read access
CREATE POLICY "Neighborhoods are viewable by everyone"
  ON neighborhoods FOR SELECT
  USING (is_active = true);

-- Admin-only write access for all reference tables
CREATE POLICY "Only admins can manage countries"
  ON countries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage cities"
  ON cities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage neighborhoods"
  ON neighborhoods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STEP 7: Add Helper Functions
-- ============================================================================

-- Function to get all active cities for a country
CREATE OR REPLACE FUNCTION get_cities_by_country(country_code_param text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug
  FROM cities c
  WHERE c.country_code = country_code_param
    AND c.is_active = true
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all active neighborhoods for a city
CREATE OR REPLACE FUNCTION get_neighborhoods_by_city(city_id_param uuid)
RETURNS TABLE (
  id uuid,
  name text,
  slug text
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.name, n.slug
  FROM neighborhoods n
  WHERE n.city_id = city_id_param
    AND n.is_active = true
  ORDER BY n.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get country info by code
CREATE OR REPLACE FUNCTION get_country_info(country_code_param text)
RETURNS TABLE (
  code text,
  name_en text,
  name_es text,
  currency_code text,
  payment_processor text
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.code, c.name_en, c.name_es, c.currency_code, c.payment_processor
  FROM countries c
  WHERE c.code = country_code_param
    AND c.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add comment to migration
COMMENT ON TABLE countries IS 'Reference table for supported countries with payment processor configuration';
COMMENT ON TABLE cities IS 'Reference table for supported cities per country';
COMMENT ON TABLE neighborhoods IS 'Reference table for neighborhoods/districts within cities';
