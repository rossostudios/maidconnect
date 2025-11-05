-- Create changelogs table for storing sprint updates
CREATE TABLE IF NOT EXISTS changelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL, -- Markdown or HTML
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  categories TEXT[] DEFAULT '{}', -- ['features', 'fixes', 'improvements', 'security', 'design']
  tags TEXT[] DEFAULT '{}',
  target_audience TEXT[] DEFAULT '{all}', -- ['customer', 'professional', 'admin', 'all']
  featured_image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'published', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS changelogs_published_at_idx ON changelogs(published_at DESC) WHERE visibility = 'published';
CREATE INDEX IF NOT EXISTS changelogs_sprint_number_idx ON changelogs(sprint_number DESC);
CREATE INDEX IF NOT EXISTS changelogs_slug_idx ON changelogs(slug);
CREATE INDEX IF NOT EXISTS changelogs_visibility_idx ON changelogs(visibility);
CREATE INDEX IF NOT EXISTS changelogs_created_by_idx ON changelogs(created_by);

-- Enable RLS
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published changelogs
CREATE POLICY "Anyone can view published changelogs"
  ON changelogs
  FOR SELECT
  USING (visibility = 'published');

-- Policy: Admins can view all changelogs (including drafts)
CREATE POLICY "Admins can view all changelogs"
  ON changelogs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can create changelogs
CREATE POLICY "Admins can create changelogs"
  ON changelogs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update changelogs
CREATE POLICY "Admins can update changelogs"
  ON changelogs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete changelogs
CREATE POLICY "Admins can delete changelogs"
  ON changelogs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION set_changelog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER changelogs_set_updated_at
  BEFORE UPDATE ON changelogs
  FOR EACH ROW
  EXECUTE FUNCTION set_changelog_updated_at();
