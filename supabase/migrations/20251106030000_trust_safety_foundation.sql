-- Migration: Trust & Safety Foundation
-- Description: Core tables for background checks, interviews, user blocking, SMS logs, and insurance claims
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- ====================
-- Background Checks
-- ====================

-- Drop existing types and tables if they exist (for idempotency)
DROP TABLE IF EXISTS public.background_checks CASCADE;
DROP TYPE IF EXISTS background_check_status CASCADE;

CREATE TYPE background_check_status AS ENUM (
  'pending',
  'clear',
  'consider',
  'suspended'
);

CREATE TABLE public.background_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'checkr', 'truora', etc.
  provider_check_id text NOT NULL,
  status background_check_status NOT NULL DEFAULT 'pending',
  result_data jsonb DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_background_checks_professional ON public.background_checks(professional_id);
CREATE INDEX idx_background_checks_status ON public.background_checks(status);
CREATE INDEX idx_background_checks_provider_check ON public.background_checks(provider_check_id);

COMMENT ON TABLE public.background_checks IS 'Stores background check results from external providers';
COMMENT ON COLUMN public.background_checks.result_data IS 'JSON blob with full background check results from provider';

-- ====================
-- Interview Scheduling
-- ====================

DROP TABLE IF EXISTS public.interview_slots CASCADE;
DROP TYPE IF EXISTS interview_status CASCADE;

CREATE TYPE interview_status AS ENUM (
  'scheduled',
  'completed',
  'no_show',
  'rescheduled',
  'cancelled'
);

CREATE TABLE public.interview_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  location text NOT NULL,
  location_address jsonb DEFAULT '{}'::jsonb,
  status interview_status NOT NULL DEFAULT 'scheduled',
  interview_notes text,
  completed_by uuid REFERENCES public.profiles(id),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interview_slots_professional ON public.interview_slots(professional_id);
CREATE INDEX idx_interview_slots_scheduled ON public.interview_slots(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_interview_slots_status ON public.interview_slots(status);

COMMENT ON TABLE public.interview_slots IS 'Stores scheduled in-person interviews for professional vetting';
COMMENT ON COLUMN public.interview_slots.location_address IS 'Structured address with street, city, directions';

-- ====================
-- User Blocking System
-- ====================

DROP TABLE IF EXISTS public.user_blocks CASCADE;

CREATE TABLE public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON public.user_blocks(blocked_id);

COMMENT ON TABLE public.user_blocks IS 'Mutual blocking system for users to prevent interactions';
COMMENT ON COLUMN public.user_blocks.reason IS 'Optional reason provided by blocker';

-- ====================
-- SMS Tracking
-- ====================

DROP TABLE IF EXISTS public.sms_logs CASCADE;
DROP TYPE IF EXISTS sms_status CASCADE;

CREATE TYPE sms_status AS ENUM (
  'sent',
  'delivered',
  'failed',
  'undelivered'
);

CREATE TABLE public.sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  phone text NOT NULL,
  message text NOT NULL,
  status sms_status NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'undelivered')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sms_logs_user ON public.sms_logs(user_id);
CREATE INDEX idx_sms_logs_sent_at ON public.sms_logs(sent_at DESC);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);

COMMENT ON TABLE public.sms_logs IS 'Tracks all SMS messages sent through the platform';
COMMENT ON COLUMN public.sms_logs.provider_message_id IS 'Message ID from Twilio or other SMS provider';

-- ====================
-- Insurance Claims
-- ====================

DROP TABLE IF EXISTS public.insurance_claims CASCADE;
DROP TYPE IF EXISTS claim_status CASCADE;
DROP TYPE IF EXISTS claim_type CASCADE;

CREATE TYPE claim_type AS ENUM (
  'damage',
  'theft',
  'injury',
  'other'
);

CREATE TYPE claim_status AS ENUM (
  'filed',
  'investigating',
  'approved',
  'denied',
  'paid'
);

CREATE TABLE public.insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  filed_by uuid NOT NULL REFERENCES public.profiles(id),
  claim_type claim_type NOT NULL,
  description text NOT NULL,
  estimated_cost integer,
  evidence_urls text[] DEFAULT '{}'::text[],
  status claim_status NOT NULL DEFAULT 'filed',
  payout_amount integer,
  resolution_notes text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_insurance_claims_booking ON public.insurance_claims(booking_id);
CREATE INDEX idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX idx_insurance_claims_filed_by ON public.insurance_claims(filed_by);

COMMENT ON TABLE public.insurance_claims IS 'Stores insurance and damage claims for bookings';
COMMENT ON COLUMN public.insurance_claims.estimated_cost IS 'Amount in cents (e.g., 5000 = $50.00)';
COMMENT ON COLUMN public.insurance_claims.evidence_urls IS 'Array of Supabase Storage URLs for photos/receipts';

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add emergency contact to professional_profiles
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.professional_profiles.emergency_contact IS 'Emergency contact info: {name, relationship, phone, alternate_phone}';

-- Add emergency contact to customer_profiles
ALTER TABLE public.customer_profiles
ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.customer_profiles.emergency_contact IS 'Emergency contact info: {name, relationship, phone, alternate_phone}';

-- Add SMS preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sms_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verification_code text,
ADD COLUMN IF NOT EXISTS phone_verification_sent_at timestamptz;

COMMENT ON COLUMN public.profiles.sms_notifications_enabled IS 'User opt-in for SMS notifications';
COMMENT ON COLUMN public.profiles.phone_verified IS 'Whether phone number has been verified via SMS code';

-- Add background check references to professional_profiles (NO FOREIGN KEY to avoid circular dependency)
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS latest_background_check_id uuid,
ADD COLUMN IF NOT EXISTS background_check_status text DEFAULT 'pending';

COMMENT ON COLUMN public.professional_profiles.latest_background_check_id IS 'Latest background check ID (manually maintained, no FK constraint)';
COMMENT ON COLUMN public.professional_profiles.background_check_status IS 'Current background check status';

-- Add interview references to professional_profiles (NO FOREIGN KEY to avoid circular dependency)
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS latest_interview_id uuid,
ADD COLUMN IF NOT EXISTS interview_completed boolean DEFAULT false;

COMMENT ON COLUMN public.professional_profiles.latest_interview_id IS 'Latest interview slot ID (manually maintained, no FK constraint)';
COMMENT ON COLUMN public.professional_profiles.interview_completed IS 'Whether in-person interview has been completed';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

-- ====================
-- Background Checks Policies
-- ====================

-- Professionals can view their own background checks
CREATE POLICY "Professionals can view their own background checks"
  ON public.background_checks
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- Service role can manage all background checks
CREATE POLICY "Service role can manage all background checks"
  ON public.background_checks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ====================
-- Interview Slots Policies
-- ====================

-- Professionals can view their own interview slots
CREATE POLICY "Professionals can view their own interview slots"
  ON public.interview_slots
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- Professionals can update their own pending interview slots (for rescheduling)
CREATE POLICY "Professionals can reschedule their pending interviews"
  ON public.interview_slots
  FOR UPDATE
  TO authenticated
  USING (professional_id = (SELECT auth.uid()) AND status = 'scheduled')
  WITH CHECK (professional_id = (SELECT auth.uid()));

-- Service role can manage all interview slots
CREATE POLICY "Service role can manage all interview slots"
  ON public.interview_slots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ====================
-- User Blocks Policies
-- ====================

-- Users can view blocks they created or that target them
CREATE POLICY "Users can view their own blocks"
  ON public.user_blocks
  FOR SELECT
  TO authenticated
  USING (
    blocker_id = (SELECT auth.uid())
    OR blocked_id = (SELECT auth.uid())
  );

-- Users can create blocks
CREATE POLICY "Users can create blocks"
  ON public.user_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = (SELECT auth.uid()));

-- Users can delete blocks they created
CREATE POLICY "Users can delete their own blocks"
  ON public.user_blocks
  FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

-- Service role can manage all blocks
CREATE POLICY "Service role can manage all blocks"
  ON public.user_blocks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ====================
-- SMS Logs Policies
-- ====================

-- Users can view their own SMS logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Service role can manage all SMS logs
CREATE POLICY "Service role can manage all SMS logs"
  ON public.sms_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ====================
-- Insurance Claims Policies
-- ====================

-- Users can view claims they filed
CREATE POLICY "Users can view their own insurance claims"
  ON public.insurance_claims
  FOR SELECT
  TO authenticated
  USING (filed_by = (SELECT auth.uid()));

-- Users can create claims for their bookings
CREATE POLICY "Users can create insurance claims"
  ON public.insurance_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (filed_by = (SELECT auth.uid()));

-- Service role can manage all claims
CREATE POLICY "Service role can manage all insurance claims"
  ON public.insurance_claims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger for background_checks
CREATE TRIGGER set_background_checks_updated_at
  BEFORE UPDATE ON public.background_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Updated_at trigger for interview_slots
CREATE TRIGGER set_interview_slots_updated_at
  BEFORE UPDATE ON public.interview_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Updated_at trigger for insurance_claims
CREATE TRIGGER set_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if users have blocked each other
CREATE OR REPLACE FUNCTION public.are_users_blocked(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_blocks
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
$$;

COMMENT ON FUNCTION public.are_users_blocked IS 'Check if two users have blocked each other (mutual or one-way)';
