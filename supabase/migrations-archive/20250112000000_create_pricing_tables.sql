-- =============================================
-- Pricing System Database Schema
-- =============================================
-- Description: Creates tables for pricing plans and FAQs
-- Created: 2025-01-12
-- =============================================

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,

  -- Pricing
  price_monthly DECIMAL(10,2), -- null for custom pricing
  price_annual DECIMAL(10,2),  -- null for custom pricing
  currency TEXT DEFAULT 'USD',
  billing_period TEXT DEFAULT 'monthly'
    CHECK (billing_period IN ('monthly', 'annual', 'custom')),

  -- Features (JSON array of feature objects)
  features JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Highlighting
  highlight_as_popular BOOLEAN DEFAULT false,
  recommended_for TEXT, -- e.g., "Small teams", "Growing businesses"

  -- Call to action
  cta_text TEXT DEFAULT 'Get Started',
  cta_url TEXT,

  -- Targeting
  target_audience TEXT DEFAULT 'both'
    CHECK (target_audience IN ('customer', 'professional', 'both')),

  -- Display
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pricing_faqs table
CREATE TABLE IF NOT EXISTS public.pricing_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Categorization
  category TEXT DEFAULT 'general'
    CHECK (category IN ('billing', 'security', 'features', 'general', 'support')),

  -- Display
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Performance indexes for pricing_plans
CREATE INDEX idx_pricing_plans_slug ON public.pricing_plans(slug);
CREATE INDEX idx_pricing_plans_visible ON public.pricing_plans(is_visible) WHERE is_visible = true;
CREATE INDEX idx_pricing_plans_display_order ON public.pricing_plans(display_order);
CREATE INDEX idx_pricing_plans_target_audience ON public.pricing_plans(target_audience);

-- Performance indexes for pricing_faqs
CREATE INDEX idx_pricing_faqs_category ON public.pricing_faqs(category);
CREATE INDEX idx_pricing_faqs_visible ON public.pricing_faqs(is_visible) WHERE is_visible = true;
CREATE INDEX idx_pricing_faqs_display_order ON public.pricing_faqs(display_order);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_faqs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for pricing_plans
-- =============================================

-- Anyone can view visible pricing plans
CREATE POLICY "Public can view visible pricing plans"
  ON public.pricing_plans
  FOR SELECT
  USING (is_visible = true);

-- Admins can view all pricing plans
CREATE POLICY "Admins can view all pricing plans"
  ON public.pricing_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can create pricing plans
CREATE POLICY "Admins can create pricing plans"
  ON public.pricing_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update pricing plans
CREATE POLICY "Admins can update pricing plans"
  ON public.pricing_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete pricing plans
CREATE POLICY "Admins can delete pricing plans"
  ON public.pricing_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- RLS Policies for pricing_faqs
-- =============================================

-- Anyone can view visible FAQs
CREATE POLICY "Public can view visible FAQs"
  ON public.pricing_faqs
  FOR SELECT
  USING (is_visible = true);

-- Admins can view all FAQs
CREATE POLICY "Admins can view all FAQs"
  ON public.pricing_faqs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can create FAQs
CREATE POLICY "Admins can create FAQs"
  ON public.pricing_faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update FAQs
CREATE POLICY "Admins can update FAQs"
  ON public.pricing_faqs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete FAQs
CREATE POLICY "Admins can delete FAQs"
  ON public.pricing_faqs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- Functions and Triggers
-- =============================================

-- Function to automatically update updated_at timestamp for pricing_plans
CREATE OR REPLACE FUNCTION update_pricing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pricing_plans updated_at
CREATE TRIGGER set_pricing_plans_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_plans_updated_at();

-- Function to automatically update updated_at for pricing_faqs
CREATE OR REPLACE FUNCTION update_pricing_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pricing_faqs updated_at
CREATE TRIGGER set_pricing_faqs_updated_at
  BEFORE UPDATE ON public.pricing_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_faqs_updated_at();

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.pricing_plans IS 'Stores pricing plan tiers with features and pricing information';
COMMENT ON TABLE public.pricing_faqs IS 'Stores frequently asked questions about pricing and billing';

COMMENT ON COLUMN public.pricing_plans.features IS 'JSONB array of feature objects with category, items, and availability';
COMMENT ON COLUMN public.pricing_plans.highlight_as_popular IS 'Whether to highlight this plan as "Most Popular" or "Best Value"';
COMMENT ON COLUMN public.pricing_plans.billing_period IS 'Default billing period: monthly, annual, or custom';
COMMENT ON COLUMN public.pricing_plans.target_audience IS 'Which user type this plan is for: customer, professional, or both';

-- =============================================
-- Sample Data (Optional - comment out if not needed)
-- =============================================

/*
INSERT INTO public.pricing_plans (name, slug, description, price_monthly, price_annual, features, highlight_as_popular, display_order, target_audience) VALUES
('Starter', 'starter', 'Perfect for individuals getting started', 0, 0, '[
  {"category": "Core Features", "items": [
    {"name": "Up to 5 bookings per month", "included": true},
    {"name": "Basic messaging", "included": true},
    {"name": "Standard support", "included": true}
  ]}
]'::jsonb, false, 1, 'customer'),
('Professional', 'professional', 'Best for growing professionals', 29.99, 299.88, '[
  {"category": "Core Features", "items": [
    {"name": "Unlimited bookings", "included": true},
    {"name": "Priority messaging", "included": true},
    {"name": "Priority support", "included": true},
    {"name": "Advanced analytics", "included": true}
  ]}
]'::jsonb, true, 2, 'professional'),
('Business', 'business', 'For established service providers', 79.99, 799.88, '[
  {"category": "Everything in Professional", "items": [
    {"name": "Team management", "included": true},
    {"name": "White-label branding", "included": true},
    {"name": "API access", "included": true},
    {"name": "Dedicated account manager", "included": true}
  ]}
]'::jsonb, false, 3, 'professional');

INSERT INTO public.pricing_faqs (question, answer, category, display_order) VALUES
('Can I change my plan later?', 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.', 'billing', 1),
('What payment methods do you accept?', 'We accept all major credit cards, debit cards, and PayPal.', 'billing', 2),
('Is there a free trial?', 'Yes, we offer a 14-day free trial on all paid plans. No credit card required.', 'general', 3),
('How secure is my data?', 'We use bank-level encryption and are SOC 2 compliant. Your data is always secure.', 'security', 4);
*/
