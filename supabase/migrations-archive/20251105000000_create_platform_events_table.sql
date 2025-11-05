-- Create platform_events table for comprehensive event instrumentation
-- Tracks user actions, conversions, and platform behavior for analytics

CREATE TABLE IF NOT EXISTS platform_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_platform_events_event_type ON platform_events(event_type);
CREATE INDEX idx_platform_events_user_id ON platform_events(user_id);
CREATE INDEX idx_platform_events_created_at ON platform_events(created_at DESC);
CREATE INDEX idx_platform_events_session_id ON platform_events(session_id) WHERE session_id IS NOT NULL;

-- GIN index for JSONB properties for flexible querying
CREATE INDEX idx_platform_events_properties ON platform_events USING GIN(properties);

-- Add comment for documentation
COMMENT ON TABLE platform_events IS 'Tracks all platform events for analytics and conversion funnel analysis';
COMMENT ON COLUMN platform_events.event_type IS 'Event name (e.g., SearchStarted, ProfessionalViewed, CheckoutStarted)';
COMMENT ON COLUMN platform_events.user_id IS 'User who triggered the event (NULL for anonymous)';
COMMENT ON COLUMN platform_events.session_id IS 'Session identifier for anonymous tracking';
COMMENT ON COLUMN platform_events.properties IS 'Event-specific data (service, city, amounts, etc.)';

-- Enable RLS
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admins can view all events"
  ON platform_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert events (no user authentication required for tracking)
CREATE POLICY "System can insert events"
  ON platform_events
  FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON platform_events TO authenticated;
GRANT SELECT, INSERT ON platform_events TO anon;
