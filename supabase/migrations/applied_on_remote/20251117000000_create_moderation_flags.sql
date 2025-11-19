-- Migration: Moderation Flags System
-- Description: Creates moderation_flags table for automated fraud detection and manual flagging
-- Date: 2025-01-17

-- ============================================================================
-- Moderation Flags Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  auto_detected BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken'))
);

-- Create indexes for common queries
CREATE INDEX idx_moderation_flags_user_id ON moderation_flags(user_id);
CREATE INDEX idx_moderation_flags_severity ON moderation_flags(severity);
CREATE INDEX idx_moderation_flags_status ON moderation_flags(status);
CREATE INDEX idx_moderation_flags_created_at ON moderation_flags(created_at DESC);
CREATE INDEX idx_moderation_flags_severity_status ON moderation_flags(severity, status);
CREATE INDEX idx_moderation_flags_flag_type ON moderation_flags(flag_type);

-- ============================================================================
-- Enhance Disputes Table (if not already enhanced)
-- ============================================================================

-- Add resolution fields to disputes table
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolution_type TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2);
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS action_taken TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolution_message TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- User Suspensions Table (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suspension_type TEXT NOT NULL CHECK (suspension_type IN ('temporary', 'permanent')),
  reason TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  suspended_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suspended_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lift_reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Add is_active column if table already exists (for existing user_suspensions tables)
ALTER TABLE user_suspensions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create indexes for user_suspensions
CREATE INDEX IF NOT EXISTS idx_user_suspensions_user_id ON user_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_is_active ON user_suspensions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_suspensions_expires_at ON user_suspensions(expires_at);

-- ============================================================================
-- RLS Policies for Moderation Flags
-- ============================================================================

ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can view moderation flags
CREATE POLICY "Admins can view all moderation flags"
  ON moderation_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can create moderation flags
CREATE POLICY "Admins can create moderation flags"
  ON moderation_flags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update moderation flags
CREATE POLICY "Admins can update moderation flags"
  ON moderation_flags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for User Suspensions
-- ============================================================================

ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

-- Only admins can view user suspensions
CREATE POLICY "Admins can view all user suspensions"
  ON user_suspensions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can create user suspensions
CREATE POLICY "Admins can create user suspensions"
  ON user_suspensions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update user suspensions
CREATE POLICY "Admins can update user suspensions"
  ON user_suspensions
  FOR UPDATE
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

-- Function to get active suspension for a user
CREATE OR REPLACE FUNCTION get_active_suspension(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  suspension_type TEXT,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.suspension_type,
    s.reason,
    s.expires_at,
    s.suspended_at
  FROM user_suspensions s
  WHERE s.user_id = user_uuid
    AND s.is_active = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
  ORDER BY s.suspended_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get moderation flag statistics
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE (
  total_flags BIGINT,
  critical_flags BIGINT,
  pending_flags BIGINT,
  auto_detected_flags BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_flags,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT AS critical_flags,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_flags,
    COUNT(*) FILTER (WHERE auto_detected = true)::BIGINT AS auto_detected_flags
  FROM moderation_flags;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
