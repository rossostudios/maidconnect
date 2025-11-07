-- Migration: Base Schema for Local Development
-- Description: Essential tables required for MaidConnect platform
-- Author: Claude
-- Date: 2025-11-06
--
-- NOTE: This migration creates the foundational schema that was previously
-- in archived migrations. Required for local development.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('customer', 'professional', 'admin')),
  locale text NOT NULL DEFAULT 'en-US',
  phone text,
  country text,
  city text,
  account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned', 'deleted')),
  onboarding_status text NOT NULL DEFAULT 'application_pending',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Professional profiles table
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  experience_years integer,
  languages text[] DEFAULT ARRAY[]::text[],
  services jsonb DEFAULT '[]'::jsonb,
  primary_services text[] DEFAULT ARRAY[]::text[],
  availability jsonb DEFAULT '{}'::jsonb,
  references_data jsonb DEFAULT '[]'::jsonb,
  portfolio_images jsonb DEFAULT '[]'::jsonb,
  city text,
  country text,
  location_latitude numeric,
  location_longitude numeric,
  verification_level text DEFAULT 'none' CHECK (verification_level IN ('none', 'phone', 'email', 'id', 'background_check')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'profile_submitted', 'approved', 'active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Customer profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_tier text NOT NULL DEFAULT 'basic',
  property_preferences jsonb DEFAULT '{}'::jsonb,
  default_address jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Bookings table
-- Drop existing to ensure clean state with proper schema
DROP TABLE IF EXISTS public.bookings CASCADE;

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'in_progress', 'completed', 'cancelled')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  total_amount integer, -- Amount in cents
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Reviews table
DROP TABLE IF EXISTS public.reviews CASCADE;

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating numeric(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(booking_id) -- One review per booking
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON public.profiles(onboarding_status);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_status ON public.professional_profiles(status);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_verification ON public.professional_profiles(verification_level);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_location ON public.professional_profiles(location_latitude, location_longitude) WHERE location_latitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start ON public.bookings(scheduled_start);

CREATE INDEX IF NOT EXISTS idx_reviews_professional ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_professional_profiles_updated_at ON public.professional_profiles;
CREATE TRIGGER set_professional_profiles_updated_at
  BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_profiles_updated_at ON public.customer_profiles;
CREATE TRIGGER set_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, locale, onboarding_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-US'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'customer') = 'professional'
      THEN 'application_pending'
      ELSE 'active'
    END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Professional profiles policies
DROP POLICY IF EXISTS "Professional profiles viewable by owner" ON public.professional_profiles;
CREATE POLICY "Professional profiles viewable by owner"
  ON public.professional_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Professional profiles editable by owner" ON public.professional_profiles;
CREATE POLICY "Professional profiles editable by owner"
  ON public.professional_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Professional profiles insertable by owner" ON public.professional_profiles;
CREATE POLICY "Professional profiles insertable by owner"
  ON public.professional_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Customer profiles policies
DROP POLICY IF EXISTS "Customer profiles viewable by owner" ON public.customer_profiles;
CREATE POLICY "Customer profiles viewable by owner"
  ON public.customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Customer profiles editable by owner" ON public.customer_profiles;
CREATE POLICY "Customer profiles editable by owner"
  ON public.customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Customer profiles insertable by owner" ON public.customer_profiles;
CREATE POLICY "Customer profiles insertable by owner"
  ON public.customer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Bookings policies
DROP POLICY IF EXISTS "Customers can view their bookings" ON public.bookings;
CREATE POLICY "Customers can view their bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Professionals can view their bookings" ON public.bookings;
CREATE POLICY "Professionals can view their bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Customers can create reviews for their bookings" ON public.reviews;
CREATE POLICY "Customers can create reviews for their bookings"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with role-based data';
COMMENT ON TABLE public.professional_profiles IS 'Extended profile data for professional users';
COMMENT ON TABLE public.customer_profiles IS 'Extended profile data for customer users';
COMMENT ON TABLE public.bookings IS 'Booking records between customers and professionals';
COMMENT ON TABLE public.reviews IS 'Customer reviews of professionals';
