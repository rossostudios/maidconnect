-- Migration: Create comprehensive platform settings
-- Description: Platform-wide configuration for business rules, features, and admin settings
-- Author: Claude
-- Date: 2025-11-10

-- ============================================================================
-- ENSURE PLATFORM_SETTINGS TABLE EXISTS
-- ============================================================================

-- Create platform_settings table if not exists
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_category text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON public.platform_settings(setting_category);

-- ============================================================================
-- INSERT DEFAULT SETTINGS
-- ============================================================================

-- Business Settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_category, description)
VALUES
  -- Commission & Fees
  ('platform_commission_rate', '{"rate": 15, "type": "percentage"}', 'business', 'Platform commission rate charged to professionals'),
  ('customer_service_fee', '{"rate": 2.99, "type": "fixed"}', 'business', 'Service fee charged to customers per booking'),
  ('cancellation_fee', '{"customer": 0, "professional": 10, "no_show": 25}', 'business', 'Cancellation and no-show fees'),

  -- Booking Rules
  ('booking_rules', '{
    "min_advance_hours": 24,
    "max_duration_hours": 8,
    "min_booking_amount": 30,
    "max_service_radius_km": 50,
    "auto_accept_threshold": 100
  }', 'business', 'Booking configuration and limits'),

  -- Payout Settings
  ('payout_settings', '{
    "schedule": "weekly",
    "min_threshold": 50,
    "currency": "USD",
    "auto_payout": true
  }', 'business', 'Payout configuration for professionals'),

  -- Feature Flags
  ('feature_recurring_bookings', '{"enabled": true}', 'features', 'Enable recurring booking feature'),
  ('feature_amara_ai', '{"enabled": true}', 'features', 'Enable Amara AI assistant'),
  ('feature_auto_translate', '{"enabled": true}', 'features', 'Enable automatic chat translation'),
  ('feature_gps_verification', '{"enabled": true}', 'features', 'Enable GPS-based check-in verification'),
  ('feature_one_tap_rebook', '{"enabled": true}', 'features', 'Enable one-tap rebooking'),
  ('feature_professional_bidding', '{"enabled": false}', 'features', 'Enable professional bidding system'),
  ('feature_customer_reviews', '{"enabled": true}', 'features', 'Enable customer reviews'),
  ('feature_tips', '{"enabled": true}', 'features', 'Enable tip functionality'),

  -- Professional Approval
  ('professional_approval', '{
    "auto_approve": false,
    "require_background_check": true,
    "require_id_verification": true,
    "require_references": false
  }', 'moderation', 'Professional approval requirements'),

  -- Content Moderation
  ('content_moderation', '{
    "auto_filter_profanity": true,
    "review_flag_threshold": 3,
    "image_moderation": true
  }', 'moderation', 'Content moderation settings')

ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform settings
CREATE POLICY "Admins can view platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (private.user_has_role('admin'));

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (private.user_has_role('admin'))
  WITH CHECK (private.user_has_role('admin'));

-- Only admins can insert platform settings
CREATE POLICY "Admins can insert platform settings"
  ON public.platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (private.user_has_role('admin'));

-- Admins cannot delete platform settings (to prevent accidents)
-- If needed, this can be done via SQL console

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.platform_settings IS 'Platform-wide configuration settings';
COMMENT ON COLUMN public.platform_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN public.platform_settings.setting_value IS 'JSON value of the setting';
COMMENT ON COLUMN public.platform_settings.setting_category IS 'Category: business, features, moderation, security';
