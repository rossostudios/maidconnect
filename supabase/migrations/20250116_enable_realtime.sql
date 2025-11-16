-- Enable Realtime for Admin Dashboard Tables
-- Week 3: Real-time Features & Notifications
--
-- This migration enables PostgreSQL Change Data Capture (CDC) for admin dashboard tables
-- allowing real-time subscriptions to database changes.
--
-- Tables enabled:
-- - bookings: Track booking status changes
-- - users: Monitor user registrations and profile updates
-- - professionals: Watch professional application status
-- - reviews: New review submissions
-- - disputes: Dispute creation and resolution
-- - notifications: Admin notification queue

-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for professionals table
ALTER PUBLICATION supabase_realtime ADD TABLE professionals;

-- Enable realtime for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- Enable realtime for disputes table (if exists)
-- Note: Disputes table may not exist yet, so we use DO block to conditionally add it
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disputes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE disputes;
  END IF;
END
$$;

-- Enable realtime for notifications table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END
$$;

-- Create index on created_at for efficient realtime filtering
-- This improves performance when filtering by recent changes
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS professionals_created_at_idx ON professionals(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);

-- Create index on status for efficient realtime filtering
-- Useful for subscribing to specific booking statuses
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Create index on updated_at for tracking changes
CREATE INDEX IF NOT EXISTS bookings_updated_at_idx ON bookings(updated_at DESC);
CREATE INDEX IF NOT EXISTS professionals_updated_at_idx ON professionals(updated_at DESC);

-- Verify realtime is enabled (for debugging)
-- To check which tables have realtime enabled, run:
-- SELECT schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime';
