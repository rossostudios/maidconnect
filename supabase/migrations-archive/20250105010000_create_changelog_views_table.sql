-- Create changelog_views table for tracking user views
CREATE TABLE IF NOT EXISTS changelog_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changelog_id UUID NOT NULL REFERENCES changelogs(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, changelog_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS changelog_views_user_id_idx ON changelog_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS changelog_views_changelog_id_idx ON changelog_views(changelog_id);
CREATE INDEX IF NOT EXISTS changelog_views_unread_idx ON changelog_views(user_id) WHERE dismissed_at IS NULL;

-- Enable RLS
ALTER TABLE changelog_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own changelog views
CREATE POLICY "Users can view own changelog views"
  ON changelog_views
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own changelog views
CREATE POLICY "Users can insert own changelog views"
  ON changelog_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own changelog views
CREATE POLICY "Users can update own changelog views"
  ON changelog_views
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all changelog views
CREATE POLICY "Admins can view all changelog views"
  ON changelog_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get unread changelog count for a user
CREATE OR REPLACE FUNCTION get_unread_changelog_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM changelogs c
    WHERE c.visibility = 'published'
    AND c.published_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM changelog_views cv
      WHERE cv.user_id = p_user_id
      AND cv.changelog_id = c.id
      AND cv.dismissed_at IS NOT NULL
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
