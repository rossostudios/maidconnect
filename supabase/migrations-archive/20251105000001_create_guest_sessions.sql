-- Create guest_sessions table for anonymous checkout
-- Allows users to book without creating an account first
-- Can be converted to full accounts post-booking

CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  converted_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_email ON guest_sessions(email);
CREATE INDEX idx_guest_sessions_expires ON guest_sessions(expires_at) WHERE converted_to_user_id IS NULL;
CREATE INDEX idx_guest_sessions_converted ON guest_sessions(converted_to_user_id) WHERE converted_to_user_id IS NOT NULL;

-- Add guest_session_id to bookings table (nullable for existing bookings)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES guest_sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_bookings_guest_session ON bookings(guest_session_id) WHERE guest_session_id IS NOT NULL;

-- Update bookings table to make customer_id nullable (for guest bookings)
ALTER TABLE bookings
  ALTER COLUMN customer_id DROP NOT NULL;

-- Add constraint: must have either customer_id OR guest_session_id
ALTER TABLE bookings
  ADD CONSTRAINT bookings_customer_or_guest_check
  CHECK (
    (customer_id IS NOT NULL AND guest_session_id IS NULL) OR
    (customer_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- Enable RLS on guest_sessions
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a guest session
CREATE POLICY "Anyone can create guest sessions"
  ON guest_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Guest can read their own session by token
CREATE POLICY "Guest can read own session"
  ON guest_sessions
  FOR SELECT
  USING (
    session_token = current_setting('request.jwt.claims', true)::json->>'guest_token'
    OR id::text = current_setting('request.jwt.claims', true)::json->>'guest_session_id'
  );

-- Policy: Converted users can read their original guest session
CREATE POLICY "Users can read their converted guest session"
  ON guest_sessions
  FOR SELECT
  USING (converted_to_user_id = auth.uid());

-- Policy: Admins can view all guest sessions
CREATE POLICY "Admins can view all guest sessions"
  ON guest_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to clean up expired guest sessions
CREATE OR REPLACE FUNCTION cleanup_expired_guest_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM guest_sessions
  WHERE expires_at < NOW()
  AND converted_to_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert guest session to user account
CREATE OR REPLACE FUNCTION convert_guest_to_user(
  p_guest_session_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Update guest session
  UPDATE guest_sessions
  SET
    converted_to_user_id = p_user_id,
    updated_at = NOW()
  WHERE id = p_guest_session_id;

  -- Update bookings to link to user instead of guest session
  UPDATE bookings
  SET
    customer_id = p_user_id,
    guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT ON guest_sessions TO authenticated;
GRANT SELECT, INSERT ON guest_sessions TO anon;

-- Comments
COMMENT ON TABLE guest_sessions IS 'Stores temporary guest checkout sessions before account creation';
COMMENT ON COLUMN guest_sessions.session_token IS 'Unique token for guest session identification';
COMMENT ON COLUMN guest_sessions.converted_to_user_id IS 'User ID after guest converts to full account';
COMMENT ON COLUMN guest_sessions.expires_at IS 'Session expires after 7 days if not converted';
COMMENT ON FUNCTION cleanup_expired_guest_sessions() IS 'Removes expired guest sessions without conversions';
COMMENT ON FUNCTION convert_guest_to_user(UUID, UUID) IS 'Converts guest session to full user account and migrates bookings';
