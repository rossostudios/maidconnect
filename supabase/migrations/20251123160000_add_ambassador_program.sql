-- ============================================================================
-- Ambassador Program Migration
-- Sprint: Referral System - Casaora Ambassador Program
--
-- Creates tables for managing ambassador applications and approved ambassadors.
-- Integrates with existing referral system for professional recruitment.
-- ============================================================================

-- ============================================================================
-- Ambassador Applications Table
-- Tracks applications from realtors, lawyers, and other professionals
-- who want to become Casaora Ambassadors
-- ============================================================================
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant info (may not have a user account yet)
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,

  -- Professional details
  profession TEXT NOT NULL,  -- 'realtor', 'lawyer', 'property_manager', 'interior_designer', 'other'
  profession_other TEXT,     -- Custom profession if 'other' selected
  company_name TEXT,         -- Company/practice/agency name
  website_url TEXT,          -- Professional website or LinkedIn

  -- Location
  country TEXT NOT NULL,
  city TEXT NOT NULL,

  -- Application details
  referral_source TEXT,      -- How they heard about the program: 'search', 'social', 'friend', 'event', 'other'
  motivation TEXT,           -- Why they want to be an ambassador (free text)
  estimated_monthly_referrals INTEGER,  -- How many pros they expect to refer per month
  has_network BOOLEAN DEFAULT false,    -- Do they have an existing network of service providers?

  -- Review status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,         -- Admin notes about the decision
  rejection_reason TEXT,     -- If rejected, why

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Ambassadors Table
-- Approved ambassadors with active referral capabilities
-- ============================================================================
CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to user account (required for active ambassadors)
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES ambassador_applications(id) ON DELETE SET NULL,

  -- Unique referral code for this ambassador
  referral_code TEXT NOT NULL UNIQUE,

  -- Tier system (for future expansion)
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard', 'bronze', 'silver', 'gold', 'platinum')),

  -- Statistics
  total_referrals INTEGER NOT NULL DEFAULT 0,           -- Total professionals referred
  successful_referrals INTEGER NOT NULL DEFAULT 0,       -- Completed first job
  pending_referrals INTEGER NOT NULL DEFAULT 0,          -- In onboarding
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,       -- Total earned (in cents)
  pending_earnings_cents INTEGER NOT NULL DEFAULT 0,     -- Pending payout (in cents)

  -- Reward configuration (can override defaults per ambassador)
  reward_per_referral_cents INTEGER DEFAULT 1500,  -- $15 default
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one ambassador per user
  CONSTRAINT unique_ambassador_user UNIQUE (user_id)
);

-- ============================================================================
-- Ambassador Referrals Table
-- Tracks individual referrals made by ambassadors (separate from user referrals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who made the referral
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,

  -- Who was referred (the professional)
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  referred_name TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Signed up but not onboarded
    'onboarding',        -- In onboarding process
    'active',            -- Completed onboarding, profile live
    'first_job_completed', -- Completed first job (triggers reward)
    'rewarded',          -- Ambassador has been paid
    'expired',           -- Referral expired (no action within 90 days)
    'cancelled'          -- Referred user cancelled/deleted account
  )),

  -- Reward tracking
  reward_amount_cents INTEGER,
  reward_currency TEXT DEFAULT 'USD',
  rewarded_at TIMESTAMPTZ,
  payout_id UUID,  -- Link to payout record when paid

  -- Timeline tracking
  signed_up_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  first_job_completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,  -- 90 days from signup

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Ambassador applications indexes
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_status ON ambassador_applications(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_email ON ambassador_applications(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_user_id ON ambassador_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_created_at ON ambassador_applications(created_at DESC);

-- Ambassadors indexes
CREATE INDEX IF NOT EXISTS idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassadors_referral_code ON ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_ambassadors_is_active ON ambassadors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ambassadors_tier ON ambassadors(tier);

-- Ambassador referrals indexes
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_ambassador_id ON ambassador_referrals(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_referred_user_id ON ambassador_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_status ON ambassador_referrals(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_referred_email ON ambassador_referrals(referred_email);

-- ============================================================================
-- Triggers for Updated Timestamps
-- ============================================================================

-- Trigger function (reuse if exists, otherwise create)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ambassador applications trigger
DROP TRIGGER IF EXISTS update_ambassador_applications_updated_at ON ambassador_applications;
CREATE TRIGGER update_ambassador_applications_updated_at
  BEFORE UPDATE ON ambassador_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ambassadors trigger
DROP TRIGGER IF EXISTS update_ambassadors_updated_at ON ambassadors;
CREATE TRIGGER update_ambassadors_updated_at
  BEFORE UPDATE ON ambassadors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ambassador referrals trigger
DROP TRIGGER IF EXISTS update_ambassador_referrals_updated_at ON ambassador_referrals;
CREATE TRIGGER update_ambassador_referrals_updated_at
  BEFORE UPDATE ON ambassador_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;

-- Ambassador Applications Policies
-- Users can view their own applications
CREATE POLICY ambassador_applications_select_own ON ambassador_applications
  FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can insert applications (public signup)
CREATE POLICY ambassador_applications_insert ON ambassador_applications
  FOR INSERT
  WITH CHECK (true);

-- Admins can do everything
CREATE POLICY ambassador_applications_admin ON ambassador_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ambassadors Policies
-- Ambassadors can view their own record
CREATE POLICY ambassadors_select_own ON ambassadors
  FOR SELECT
  USING (user_id = auth.uid());

-- Public can lookup ambassador by referral code (for referral validation)
CREATE POLICY ambassadors_select_by_code ON ambassadors
  FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY ambassadors_admin ON ambassadors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Ambassador Referrals Policies
-- Ambassadors can view their own referrals
CREATE POLICY ambassador_referrals_select_own ON ambassador_referrals
  FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY ambassador_referrals_admin ON ambassador_referrals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Generate unique ambassador referral code
CREATE OR REPLACE FUNCTION generate_ambassador_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code with AMB prefix
    new_code := 'AMB-' || upper(substring(md5(random()::text) from 1 for 6));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM ambassadors WHERE referral_code = new_code) INTO code_exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Get ambassador stats
CREATE OR REPLACE FUNCTION get_ambassador_stats(p_ambassador_id UUID)
RETURNS TABLE (
  total_referrals BIGINT,
  successful_referrals BIGINT,
  pending_referrals BIGINT,
  total_earnings_cents BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_referrals,
    COUNT(*) FILTER (WHERE ar.status IN ('first_job_completed', 'rewarded'))::BIGINT as successful_referrals,
    COUNT(*) FILTER (WHERE ar.status IN ('pending', 'onboarding', 'active'))::BIGINT as pending_referrals,
    COALESCE(SUM(ar.reward_amount_cents) FILTER (WHERE ar.status = 'rewarded'), 0)::BIGINT as total_earnings_cents,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE ar.status IN ('first_job_completed', 'rewarded'))::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as conversion_rate
  FROM ambassador_referrals ar
  WHERE ar.ambassador_id = p_ambassador_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE ambassador_applications IS 'Applications from professionals wanting to become Casaora Ambassadors';
COMMENT ON TABLE ambassadors IS 'Approved ambassadors who can refer professionals to Casaora';
COMMENT ON TABLE ambassador_referrals IS 'Individual professional referrals made by ambassadors';

COMMENT ON COLUMN ambassador_applications.profession IS 'realtor, lawyer, property_manager, interior_designer, other';
COMMENT ON COLUMN ambassador_applications.status IS 'pending, under_review, approved, rejected';
COMMENT ON COLUMN ambassadors.tier IS 'standard, bronze, silver, gold, platinum - for future rewards scaling';
COMMENT ON COLUMN ambassador_referrals.status IS 'pending, onboarding, active, first_job_completed, rewarded, expired, cancelled';
