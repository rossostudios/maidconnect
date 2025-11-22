-- ============================================================================
-- Subscription System Migration
-- Sprint: Monetization - Stripe Subscriptions
--
-- Creates tables for managing customer and professional subscriptions.
-- Integrates with Stripe Billing for recurring payments.
-- ============================================================================

-- ============================================================================
-- Subscription Plans Table
-- Defines available subscription tiers
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Plan type: 'customer' or 'professional'
  plan_type TEXT NOT NULL CHECK (plan_type IN ('customer', 'professional')),

  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_id TEXT,

  -- Pricing (in minor currency units)
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),

  -- Features (JSON array of feature strings)
  features JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Limits
  max_bookings_per_month INTEGER, -- NULL = unlimited
  priority_badge BOOLEAN NOT NULL DEFAULT false,
  discount_percentage NUMERIC(5,2) DEFAULT 0, -- Discount on bookings

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- User Subscriptions Table
-- Tracks active subscriptions for users
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Plan reference
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,

  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',           -- Currently active
    'trialing',         -- In trial period
    'past_due',         -- Payment failed, grace period
    'canceled',         -- Canceled, will end at period end
    'unpaid',           -- Payment failed, subscription suspended
    'incomplete',       -- Initial payment pending
    'incomplete_expired' -- Initial payment failed
  )),

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Trial info
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Cancellation info
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Usage tracking
  bookings_this_month INTEGER NOT NULL DEFAULT 0,
  bookings_month_reset_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one active subscription per user per type
  UNIQUE (user_id, plan_id)
);

-- ============================================================================
-- Subscription Usage Table
-- Tracks usage for metered subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,

  -- Usage details
  usage_type TEXT NOT NULL, -- 'booking', 'feature_access', etc.
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Related booking (if applicable)
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Billing period this usage belongs to
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_subscription_plans_plan_type ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- ============================================================================
-- Row Level Security
-- ============================================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Subscription plans are readable by all authenticated users
CREATE POLICY "subscription_plans_read_policy" ON subscription_plans
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins can manage subscription plans
CREATE POLICY "subscription_plans_admin_policy" ON subscription_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can read their own subscriptions
CREATE POLICY "user_subscriptions_read_own" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own subscriptions (for cancellation)
CREATE POLICY "user_subscriptions_update_own" ON user_subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can manage all subscriptions
CREATE POLICY "user_subscriptions_admin_policy" ON user_subscriptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert/update subscriptions (for webhooks)
CREATE POLICY "user_subscriptions_service_role" ON user_subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can read their own usage
CREATE POLICY "subscription_usage_read_own" ON subscription_usage
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_subscriptions.id = subscription_usage.subscription_id
      AND user_subscriptions.user_id = auth.uid()
    )
  );

-- Service role can manage usage
CREATE POLICY "subscription_usage_service_role" ON subscription_usage
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Seed Default Plans
-- ============================================================================
INSERT INTO subscription_plans (name, slug, plan_type, price_cents, currency, billing_interval, features, max_bookings_per_month, priority_badge, discount_percentage, description)
VALUES
  -- Customer Plans
  (
    'Customer Basic',
    'customer-basic',
    'customer',
    0,
    'USD',
    'month',
    '["Pay per booking", "Standard support", "Access to all professionals"]'::jsonb,
    NULL,
    false,
    0,
    'Free tier for customers - pay only for bookings'
  ),
  (
    'Customer Pro',
    'customer-pro',
    'customer',
    2900,
    'USD',
    'month',
    '["Unlimited 2-hour cleanings", "Priority support", "5% discount on longer bookings", "Favorite professionals list", "Schedule recurring bookings"]'::jsonb,
    NULL,
    false,
    5.00,
    'Unlimited short cleanings for busy households'
  ),

  -- Professional Plans
  (
    'Professional Basic',
    'pro-basic',
    'professional',
    0,
    'USD',
    'month',
    '["List your services", "Accept bookings", "Standard visibility"]'::jsonb,
    NULL,
    false,
    0,
    'Free tier for professionals - pay only commission on bookings'
  ),
  (
    'Professional Pro',
    'pro-pro',
    'professional',
    900,
    'USD',
    'month',
    '["Priority badge", "Featured in search results", "Lower commission rate", "Analytics dashboard", "Priority support"]'::jsonb,
    NULL,
    true,
    0,
    'Boost your visibility and earn more'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_timestamp
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

CREATE TRIGGER update_user_subscriptions_timestamp
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Check if user has active subscription of a specific type
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID, p_plan_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
    AND sp.plan_type = p_plan_type
    AND us.status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's subscription discount
CREATE OR REPLACE FUNCTION get_subscription_discount(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_discount NUMERIC;
BEGIN
  SELECT COALESCE(sp.discount_percentage, 0)
  INTO v_discount
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.status IN ('active', 'trialing')
  ORDER BY sp.discount_percentage DESC
  LIMIT 1;

  RETURN COALESCE(v_discount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
