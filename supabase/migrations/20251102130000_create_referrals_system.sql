-- =============================================
-- Referral Program System Migration
-- =============================================
-- Creates tables and functions for two-sided referral rewards program
-- Research: 90%+ of successful referral programs use double-sided incentives
-- Typical conversion: Referrer gets $15 credit, Referee gets $10 credit

-- =============================================
-- 1. Referral Codes Table
-- =============================================
-- Stores unique referral codes for each user
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,

  -- Metadata
  uses_count integer NOT NULL DEFAULT 0,
  max_uses integer, -- NULL = unlimited uses
  is_active boolean NOT NULL DEFAULT true,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- NULL = never expires

  -- Ensure one active code per user
  CONSTRAINT unique_active_code_per_user UNIQUE (user_id, is_active) WHERE is_active = true
);

-- Indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code) WHERE is_active = true;
CREATE INDEX idx_referral_codes_active ON public.referral_codes(is_active) WHERE is_active = true;

-- =============================================
-- 2. Referrals Table
-- =============================================
-- Tracks who referred whom and reward status
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties involved
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_id uuid NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,

  -- Reward amounts (in credits, stored as cents)
  referrer_credit_amount integer NOT NULL DEFAULT 1500, -- $15.00
  referee_credit_amount integer NOT NULL DEFAULT 1000, -- $10.00

  -- Status tracking
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired')),
  qualified_at timestamptz, -- When referee completed qualifying action
  rewarded_at timestamptz, -- When credits were issued

  -- Qualifying booking (first completed booking)
  qualifying_booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent self-referral and duplicate referrals
  CONSTRAINT no_self_referral CHECK (referrer_id != referee_id),
  CONSTRAINT unique_referee UNIQUE (referee_id) -- Each user can only be referred once
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referrals_code_id ON public.referrals(referral_code_id);

-- =============================================
-- 3. Referral Credits Table
-- =============================================
-- Ledger of all referral credit transactions
CREATE TABLE IF NOT EXISTS public.referral_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Credit owner
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction details
  amount integer NOT NULL, -- Credits in cents (can be negative for deductions)
  balance_after integer NOT NULL, -- Running balance after this transaction
  transaction_type text NOT NULL CHECK (transaction_type IN ('referral_reward', 'signup_bonus', 'used', 'expired', 'adjustment')),

  -- Related referral (if applicable)
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,

  -- Related booking (if credits were used)
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,

  -- Metadata
  description text,
  expires_at timestamptz, -- Credits can expire (e.g., 365 days)

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_referral_credits_user_id ON public.referral_credits(user_id);
CREATE INDEX idx_referral_credits_referral_id ON public.referral_credits(referral_id);
CREATE INDEX idx_referral_credits_type ON public.referral_credits(transaction_type);
CREATE INDEX idx_referral_credits_expires_at ON public.referral_credits(expires_at) WHERE expires_at IS NOT NULL;

-- =============================================
-- 4. Helper Functions
-- =============================================

-- Function: Generate unique referral code
-- Uses human-readable alphabet (no confusing characters: l, o, 0, 1)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- 32 characters (no I, L, O, 0, 1)
  code_length int := 8;
  new_code text;
  code_exists boolean;
  max_attempts int := 100;
  attempt int := 0;
BEGIN
  LOOP
    -- Generate random code
    new_code := '';
    FOR i IN 1..code_length LOOP
      new_code := new_code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    END LOOP;

    -- Format with hyphen for readability: XXXX-YYYY
    new_code := substr(new_code, 1, 4) || '-' || substr(new_code, 5, 4);

    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.referral_codes WHERE code = new_code
    ) INTO code_exists;

    -- Exit if unique or max attempts reached
    EXIT WHEN NOT code_exists OR attempt >= max_attempts;

    attempt := attempt + 1;
  END LOOP;

  IF attempt >= max_attempts THEN
    RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;
  END IF;

  RETURN new_code;
END;
$$;

-- Function: Get user's total available credits
CREATE OR REPLACE FUNCTION public.get_user_referral_credits(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_credits integer;
BEGIN
  -- Get sum of all credit transactions, excluding expired credits
  SELECT COALESCE(SUM(amount), 0)
  INTO total_credits
  FROM public.referral_credits
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > now());

  RETURN GREATEST(total_credits, 0); -- Never return negative
END;
$$;

-- Function: Award referral credits (called when referee completes first booking)
CREATE OR REPLACE FUNCTION public.award_referral_credits(
  p_referral_id uuid,
  p_booking_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral record;
  v_referrer_balance integer;
  v_referee_balance integer;
  v_credits_expire_at timestamptz := now() + interval '365 days'; -- Credits expire in 1 year
BEGIN
  -- Get referral details
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE id = p_referral_id
    AND status = 'qualified'
  FOR UPDATE; -- Lock row to prevent double-awarding

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral not found or not in qualified status';
  END IF;

  -- Get current balances
  v_referrer_balance := public.get_user_referral_credits(v_referral.referrer_id);
  v_referee_balance := public.get_user_referral_credits(v_referral.referee_id);

  -- Award credit to referrer
  INSERT INTO public.referral_credits (
    user_id, amount, balance_after, transaction_type, referral_id, description, expires_at
  ) VALUES (
    v_referral.referrer_id,
    v_referral.referrer_credit_amount,
    v_referrer_balance + v_referral.referrer_credit_amount,
    'referral_reward',
    p_referral_id,
    'Referral reward for inviting ' || (SELECT email FROM auth.users WHERE id = v_referral.referee_id),
    v_credits_expire_at
  );

  -- Award credit to referee (signup bonus)
  INSERT INTO public.referral_credits (
    user_id, amount, balance_after, transaction_type, referral_id, description, expires_at
  ) VALUES (
    v_referral.referee_id,
    v_referral.referee_credit_amount,
    v_referee_balance + v_referral.referee_credit_amount,
    'signup_bonus',
    p_referral_id,
    'Welcome bonus for signing up with a referral code',
    v_credits_expire_at
  );

  -- Update referral status
  UPDATE public.referrals
  SET
    status = 'rewarded',
    rewarded_at = now(),
    qualifying_booking_id = p_booking_id,
    updated_at = now()
  WHERE id = p_referral_id;

  -- Increment referral code usage count
  UPDATE public.referral_codes
  SET
    uses_count = uses_count + 1,
    updated_at = now()
  WHERE id = v_referral.referral_code_id;
END;
$$;

-- =============================================
-- 5. Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;

-- Referral Codes Policies
CREATE POLICY "Users can view their own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Referrals Policies
CREATE POLICY "Users can view referrals they're involved in"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Referral Credits Policies
CREATE POLICY "Users can view their own credits"
  ON public.referral_credits FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- 6. Triggers
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_referral_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON public.referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_updated_at();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_updated_at();

-- =============================================
-- 7. Comments for Documentation
-- =============================================

COMMENT ON TABLE public.referral_codes IS 'Unique referral codes for users to share with friends';
COMMENT ON TABLE public.referrals IS 'Tracks referral relationships and reward status';
COMMENT ON TABLE public.referral_credits IS 'Ledger of all referral credit transactions';

COMMENT ON FUNCTION public.generate_referral_code IS 'Generates unique 8-character referral code (format: XXXX-YYYY) using human-readable alphabet';
COMMENT ON FUNCTION public.get_user_referral_credits IS 'Returns total available referral credits for a user (excluding expired)';
COMMENT ON FUNCTION public.award_referral_credits IS 'Awards credits to both referrer and referee when qualifying booking completes';
