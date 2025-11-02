-- =============================================
-- Seed Pricing Plans
-- =============================================
-- Description: Populates pricing_plans table with initial subscription tiers
-- Created: 2025-11-01
-- =============================================

-- Insert pricing plans (matching the SAMPLE_PLANS structure)
INSERT INTO public.pricing_plans (
  name,
  slug,
  description,
  price_monthly,
  price_annual,
  currency,
  billing_period,
  features,
  highlight_as_popular,
  recommended_for,
  cta_text,
  cta_url,
  target_audience,
  display_order,
  is_visible
) VALUES
(
  'Starter',
  'starter',
  'Perfect for individuals getting started',
  0.00,
  0.00,
  'USD',
  'monthly',
  '[
    {
      "category": "Core Features",
      "items": [
        {"name": "Up to 5 bookings per month", "included": true},
        {"name": "Basic messaging", "included": true},
        {"name": "Standard support", "included": true},
        {"name": "Mobile app access", "included": true}
      ]
    }
  ]'::jsonb,
  false,
  'Individuals and freelancers',
  'Get Started Free',
  '/auth/sign-up',
  'both',
  1,
  true
),
(
  'Professional',
  'professional',
  'Best for growing professionals',
  29.99,
  299.88,
  'USD',
  'monthly',
  '[
    {
      "category": "Everything in Starter",
      "items": [
        {"name": "Unlimited bookings", "included": true},
        {"name": "Priority messaging", "included": true},
        {"name": "Priority support", "included": true},
        {"name": "Advanced analytics", "included": true},
        {"name": "Custom branding", "included": true}
      ]
    }
  ]'::jsonb,
  true,
  'Growing service professionals',
  'Start Free Trial',
  '/auth/sign-up',
  'professional',
  2,
  true
),
(
  'Business',
  'business',
  'For established service providers',
  79.99,
  799.88,
  'USD',
  'monthly',
  '[
    {
      "category": "Everything in Professional",
      "items": [
        {"name": "Everything in Professional", "included": true},
        {"name": "Team management", "included": true},
        {"name": "White-label branding", "included": true},
        {"name": "API access", "included": true},
        {"name": "Dedicated account manager", "included": true}
      ]
    }
  ]'::jsonb,
  false,
  'Established businesses and teams',
  'Contact Sales',
  '/contact',
  'professional',
  3,
  true
);

-- Insert pricing FAQs
INSERT INTO public.pricing_faqs (
  question,
  answer,
  category,
  display_order,
  is_visible
) VALUES
(
  'Can I change my plan later?',
  'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we''ll prorate any charges or credits.',
  'billing',
  1,
  true
),
(
  'What payment methods do you accept?',
  'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets. All payments are processed securely through Stripe.',
  'billing',
  2,
  true
),
(
  'Is there a free trial?',
  'Yes! We offer a 14-day free trial on all paid plans. No credit card required to start. You can upgrade to a paid plan at any time during or after the trial.',
  'general',
  3,
  true
),
(
  'How secure is my data?',
  'We use bank-level AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are SOC 2 Type II compliant and undergo regular third-party security audits. Your data is always secure.',
  'security',
  4,
  true
),
(
  'Can I cancel anytime?',
  'Yes, you can cancel your subscription at any time with no cancellation fees. Your access will continue until the end of your current billing period.',
  'billing',
  5,
  true
),
(
  'Do you offer discounts for annual billing?',
  'Yes! Annual billing comes with a 20% discount compared to monthly billing. This is automatically applied when you select annual billing.',
  'billing',
  6,
  true
),
(
  'What happens if I exceed my booking limit on the Starter plan?',
  'You''ll receive a notification when you approach your limit. You can either wait until the next month when your limit resets, or upgrade to a Professional plan for unlimited bookings.',
  'features',
  7,
  true
),
(
  'Is customer support included?',
  'Yes! All plans include customer support. Starter plans receive standard email support (24-48 hour response), while Professional and Business plans get priority support with faster response times.',
  'support',
  8,
  true
);

-- Add comment for documentation
COMMENT ON TABLE public.pricing_plans IS 'Stores subscription pricing plans - seeded with Starter, Professional, and Business tiers';
COMMENT ON TABLE public.pricing_faqs IS 'Stores frequently asked questions about pricing and billing - seeded with 8 common questions';
