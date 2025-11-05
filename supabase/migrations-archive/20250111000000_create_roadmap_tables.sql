-- =============================================
-- Roadmap System Database Schema
-- =============================================
-- Description: Creates tables for public product roadmap with voting
-- Created: 2025-01-11
-- =============================================

-- Create roadmap_items table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL, -- Rich HTML content

  -- Status and categorization
  status TEXT NOT NULL DEFAULT 'under_consideration'
    CHECK (status IN ('under_consideration', 'planned', 'in_progress', 'shipped')),
  category TEXT NOT NULL
    CHECK (category IN ('features', 'infrastructure', 'ui_ux', 'security', 'integrations')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),

  -- Timeline
  target_quarter TEXT, -- e.g., 'Q1 2025', 'Q2 2025'

  -- Visibility and targeting
  visibility TEXT NOT NULL DEFAULT 'draft'
    CHECK (visibility IN ('draft', 'published', 'archived')),
  target_audience TEXT[] DEFAULT ARRAY['all'], -- Array: ['all', 'customer', 'professional']

  -- Engagement
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Organization
  tags TEXT[],
  featured_image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Relationships
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changelog_id UUID REFERENCES public.changelogs(id) ON DELETE SET NULL, -- Link when shipped

  -- Timestamps
  published_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roadmap_votes table
CREATE TABLE IF NOT EXISTS public.roadmap_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_item_id UUID NOT NULL REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one vote per user per item
  UNIQUE(user_id, roadmap_item_id)
);

-- Create roadmap_comments table (for user feedback)
CREATE TABLE IF NOT EXISTS public.roadmap_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_item_id UUID NOT NULL REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false, -- Moderation flag
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Performance indexes for roadmap_items
CREATE INDEX idx_roadmap_items_status ON public.roadmap_items(status) WHERE visibility = 'published';
CREATE INDEX idx_roadmap_items_category ON public.roadmap_items(category);
CREATE INDEX idx_roadmap_items_visibility ON public.roadmap_items(visibility);
CREATE INDEX idx_roadmap_items_slug ON public.roadmap_items(slug);
CREATE INDEX idx_roadmap_items_published_at ON public.roadmap_items(published_at DESC) WHERE visibility = 'published';
CREATE INDEX idx_roadmap_items_vote_count ON public.roadmap_items(vote_count DESC);
CREATE INDEX idx_roadmap_items_created_by ON public.roadmap_items(created_by);

-- Performance indexes for roadmap_votes
CREATE INDEX idx_roadmap_votes_roadmap_item_id ON public.roadmap_votes(roadmap_item_id);
CREATE INDEX idx_roadmap_votes_user_id ON public.roadmap_votes(user_id);

-- Performance indexes for roadmap_comments
CREATE INDEX idx_roadmap_comments_roadmap_item_id ON public.roadmap_comments(roadmap_item_id);
CREATE INDEX idx_roadmap_comments_user_id ON public.roadmap_comments(user_id);
CREATE INDEX idx_roadmap_comments_approved ON public.roadmap_comments(is_approved);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_comments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for roadmap_items
-- =============================================

-- Anyone can view published roadmap items
CREATE POLICY "Public can view published roadmap items"
  ON public.roadmap_items
  FOR SELECT
  USING (visibility = 'published');

-- Admins can view all roadmap items
CREATE POLICY "Admins can view all roadmap items"
  ON public.roadmap_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can create roadmap items
CREATE POLICY "Admins can create roadmap items"
  ON public.roadmap_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update roadmap items
CREATE POLICY "Admins can update roadmap items"
  ON public.roadmap_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete roadmap items
CREATE POLICY "Admins can delete roadmap items"
  ON public.roadmap_items
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
-- RLS Policies for roadmap_votes
-- =============================================

-- Authenticated users can view votes
CREATE POLICY "Authenticated users can view votes"
  ON public.roadmap_votes
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create votes (only their own)
CREATE POLICY "Users can create their own votes"
  ON public.roadmap_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON public.roadmap_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- RLS Policies for roadmap_comments
-- =============================================

-- Anyone can view approved comments
CREATE POLICY "Public can view approved comments"
  ON public.roadmap_comments
  FOR SELECT
  USING (is_approved = true);

-- Users can view their own comments (even if not approved)
CREATE POLICY "Users can view their own comments"
  ON public.roadmap_comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
  ON public.roadmap_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.roadmap_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments (within 15 minutes)
CREATE POLICY "Users can update their own comments"
  ON public.roadmap_comments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND created_at > NOW() - INTERVAL '15 minutes'
  );

-- Admins can update any comment (for moderation)
CREATE POLICY "Admins can update any comment"
  ON public.roadmap_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.roadmap_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.roadmap_comments
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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roadmap_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for roadmap_items updated_at
CREATE TRIGGER set_roadmap_items_updated_at
  BEFORE UPDATE ON public.roadmap_items
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_items_updated_at();

-- Function to automatically update updated_at for comments
CREATE OR REPLACE FUNCTION update_roadmap_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for roadmap_comments updated_at
CREATE TRIGGER set_roadmap_comments_updated_at
  BEFORE UPDATE ON public.roadmap_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_comments_updated_at();

-- Function to update vote_count on roadmap_items
CREATE OR REPLACE FUNCTION update_roadmap_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.roadmap_items
    SET vote_count = vote_count + 1
    WHERE id = NEW.roadmap_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.roadmap_items
    SET vote_count = GREATEST(0, vote_count - 1)
    WHERE id = OLD.roadmap_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote_count
CREATE TRIGGER update_vote_count_on_insert
  AFTER INSERT ON public.roadmap_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_vote_count();

CREATE TRIGGER update_vote_count_on_delete
  AFTER DELETE ON public.roadmap_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_vote_count();

-- Function to update comment_count on roadmap_items
CREATE OR REPLACE FUNCTION update_roadmap_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.roadmap_items
    SET comment_count = comment_count + 1
    WHERE id = NEW.roadmap_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.roadmap_items
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.roadmap_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update comment_count
CREATE TRIGGER update_comment_count_on_insert
  AFTER INSERT ON public.roadmap_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_comment_count();

CREATE TRIGGER update_comment_count_on_delete
  AFTER DELETE ON public.roadmap_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_comment_count();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to check if user has voted on an item
CREATE OR REPLACE FUNCTION has_user_voted(item_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.roadmap_votes
    WHERE roadmap_item_id = item_id
    AND roadmap_votes.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote count
CREATE OR REPLACE FUNCTION get_user_roadmap_vote_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.roadmap_votes
    WHERE roadmap_votes.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE public.roadmap_items IS 'Stores public product roadmap items with voting and comments';
COMMENT ON TABLE public.roadmap_votes IS 'Tracks user votes on roadmap items';
COMMENT ON TABLE public.roadmap_comments IS 'Stores user comments and feedback on roadmap items';

COMMENT ON COLUMN public.roadmap_items.status IS 'Current status: under_consideration, planned, in_progress, or shipped';
COMMENT ON COLUMN public.roadmap_items.category IS 'Type of roadmap item: features, infrastructure, ui_ux, security, or integrations';
COMMENT ON COLUMN public.roadmap_items.priority IS 'Internal priority: low, medium, or high';
COMMENT ON COLUMN public.roadmap_items.visibility IS 'Publication status: draft, published, or archived';
COMMENT ON COLUMN public.roadmap_items.target_audience IS 'Who sees this item: all, customer, or professional';
COMMENT ON COLUMN public.roadmap_items.changelog_id IS 'Link to changelog entry when item is shipped';
