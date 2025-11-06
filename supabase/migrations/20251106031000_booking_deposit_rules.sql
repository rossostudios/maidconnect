-- Migration: Booking Deposit and Insurance Rules
-- Description: Add deposit/insurance tracking and authorization logic for bookings
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- ====================
-- Booking Authorization Tracking
-- ====================

CREATE TYPE authorization_status AS ENUM (
  'authorized',
  'captured',
  'cancelled',
  'expired'
);

CREATE TABLE public.booking_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id text NOT NULL,
  authorized_amount integer NOT NULL, -- Amount in cents
  captured_amount integer DEFAULT 0,
  status authorization_status NOT NULL DEFAULT 'authorized',
  authorized_at timestamptz NOT NULL DEFAULT now(),
  captured_at timestamptz,
  expires_at timestamptz NOT NULL, -- Stripe authorizations expire after 7 days
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_authorizations_booking ON public.booking_authorizations(booking_id);
CREATE INDEX idx_booking_authorizations_status ON public.booking_authorizations(status);
CREATE INDEX idx_booking_authorizations_stripe ON public.booking_authorizations(stripe_payment_intent_id);
CREATE INDEX idx_booking_authorizations_expires ON public.booking_authorizations(expires_at) WHERE status = 'authorized';

COMMENT ON TABLE public.booking_authorizations IS 'Tracks Stripe payment authorizations for deposits';
COMMENT ON COLUMN public.booking_authorizations.authorized_amount IS 'Initial deposit amount held (in cents)';
COMMENT ON COLUMN public.booking_authorizations.captured_amount IS 'Amount actually captured (in cents)';
COMMENT ON COLUMN public.booking_authorizations.expires_at IS 'Stripe authorization expiry (typically 7 days)';

-- ====================
-- Update Bookings Table
-- ====================

-- Add deposit and insurance tracking to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS deposit_amount integer, -- Deposit authorized (in cents)
ADD COLUMN IF NOT EXISTS deposit_captured_at timestamptz, -- When deposit was captured
ADD COLUMN IF NOT EXISTS insurance_fee integer DEFAULT 0, -- Insurance/damage waiver fee (in cents)
ADD COLUMN IF NOT EXISTS requires_insurance boolean DEFAULT false, -- Whether insurance is required
ADD COLUMN IF NOT EXISTS final_amount_captured integer; -- Total amount captured after service (in cents)

COMMENT ON COLUMN public.bookings.deposit_amount IS 'Deposit amount authorized at booking creation (in cents)';
COMMENT ON COLUMN public.bookings.insurance_fee IS 'Damage waiver/insurance fee (in cents)';
COMMENT ON COLUMN public.bookings.final_amount_captured IS 'Total amount captured after service completion (in cents)';

-- ====================
-- Update Professional Profiles for Service-Level Insurance
-- ====================

-- Since services are stored as JSONB in professional_profiles.services,
-- we'll document the expected structure for insurance in that JSONB field
-- Example: { "id": "...", "name": "...", "requiresInsurance": true, "damageWaiverAmount": 500 }

COMMENT ON COLUMN public.professional_profiles.services IS 'JSONB array of services. Each service can include: {id, name, description, hourly_rate, requires_insurance: boolean, damage_waiver_amount: integer}';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.booking_authorizations ENABLE ROW LEVEL SECURITY;

-- Users can view authorizations for their bookings
CREATE POLICY "Users can view their booking authorizations"
  ON public.booking_authorizations
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE customer_id = (SELECT auth.uid())
         OR professional_id = (SELECT auth.uid())
    )
  );

-- Service role can manage all authorizations
CREATE POLICY "Service role can manage all booking authorizations"
  ON public.booking_authorizations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger for booking_authorizations
CREATE TRIGGER set_booking_authorizations_updated_at
  BEFORE UPDATE ON public.booking_authorizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================
-- Audit Trigger for Booking Status Changes
-- ====================

CREATE OR REPLACE FUNCTION public.audit_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only audit if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Insert into audit_logs if it exists (assuming admin_audit_logs table)
    -- This will be called by the application layer
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_booking_status
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_booking_status_change();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate deposit amount based on pricing controls
CREATE OR REPLACE FUNCTION public.calculate_deposit_amount(
  booking_total integer,
  deposit_percentage integer
)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (booking_total * deposit_percentage / 100);
$$;

COMMENT ON FUNCTION public.calculate_deposit_amount IS 'Calculate deposit amount from total and percentage';

-- Function to calculate refund amount based on cancellation policy
CREATE OR REPLACE FUNCTION public.calculate_refund_amount(
  booking_id uuid,
  cancellation_time timestamptz
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record record;
  hours_until_service integer;
  refund_percentage integer;
  refund_amount integer;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.bookings
  WHERE id = booking_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Calculate hours until scheduled service
  hours_until_service := EXTRACT(EPOCH FROM (booking_record.scheduled_start - cancellation_time)) / 3600;

  -- Tiered refund policy
  IF hours_until_service >= 48 THEN
    refund_percentage := 100; -- Full refund
  ELSIF hours_until_service >= 24 THEN
    refund_percentage := 50; -- 50% refund
  ELSE
    refund_percentage := 0; -- No refund
  END IF;

  -- Calculate refund amount (from deposit)
  refund_amount := (COALESCE(booking_record.deposit_amount, 0) * refund_percentage / 100);

  RETURN refund_amount;
END;
$$;

COMMENT ON FUNCTION public.calculate_refund_amount IS 'Calculate refund based on tiered cancellation policy';

-- Function to check if authorization is expired
CREATE OR REPLACE FUNCTION public.is_authorization_expired(auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT expires_at < now()
  FROM public.booking_authorizations
  WHERE id = auth_id;
$$;

COMMENT ON FUNCTION public.is_authorization_expired IS 'Check if a booking authorization has expired';

-- ============================================================================
-- VALIDATION CONSTRAINTS
-- ============================================================================

-- Ensure deposit amount doesn't exceed total
ALTER TABLE public.bookings
ADD CONSTRAINT check_deposit_amount_valid
CHECK (deposit_amount IS NULL OR deposit_amount <= amount_authorized);

-- Ensure insurance fee is non-negative
ALTER TABLE public.bookings
ADD CONSTRAINT check_insurance_fee_non_negative
CHECK (insurance_fee >= 0);
