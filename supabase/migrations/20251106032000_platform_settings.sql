-- Migration: Platform Settings
-- Description: Centralized settings table for platform configuration
-- Author: Claude
-- Date: 2025-11-06

-- ============================================================================
-- SCHEMA CHANGES
-- ============================================================================

-- Create platform_settings table for global configuration
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(setting_key);

COMMENT ON TABLE public.platform_settings IS 'Global platform configuration settings';
COMMENT ON COLUMN public.platform_settings.setting_key IS 'Unique key for the setting (e.g., "background_check_provider")';
COMMENT ON COLUMN public.platform_settings.setting_value IS 'JSONB value containing the setting configuration';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view platform settings
DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
CREATE POLICY "Admins can view platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Only admins can update platform settings
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- Service role can manage all settings
DROP POLICY IF EXISTS "Service role can manage all platform settings" ON public.platform_settings;
CREATE POLICY "Service role can manage all platform settings"
  ON public.platform_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER set_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- DEFAULT SETTINGS
-- ============================================================================

-- Insert default background check provider setting
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES (
  'background_check_provider',
  jsonb_build_object(
    'provider', 'checkr',
    'enabled', true,
    'auto_initiate', false
  ),
  'Configuration for background check provider (checkr or truora)'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default SMS provider setting (for future use)
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES (
  'sms_provider',
  jsonb_build_object(
    'provider', 'twilio',
    'enabled', false
  ),
  'Configuration for SMS notification provider'
)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default deposit rules
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES (
  'deposit_rules',
  jsonb_build_object(
    'deposit_percentage', 20,
    'minimum_deposit_cop', 50000,
    'require_deposit', true
  ),
  'Booking deposit requirements and percentages'
)
ON CONFLICT (setting_key) DO NOTHING;
