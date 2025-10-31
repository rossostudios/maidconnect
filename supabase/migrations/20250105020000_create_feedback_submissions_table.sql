-- Create feedback_submissions table for user feedback
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL = anonymous
  user_email TEXT,  -- For anonymous users who want follow-up
  user_role TEXT CHECK (user_role IN ('customer', 'professional', 'admin', 'anonymous')),

  -- Feedback content
  feedback_type TEXT NOT NULL CHECK (
    feedback_type IN ('bug', 'feature_request', 'improvement', 'complaint', 'praise', 'other')
  ),
  subject TEXT,  -- Optional short title (max 200 chars)
  message TEXT NOT NULL,

  -- Technical context
  page_url TEXT NOT NULL,  -- Full URL where feedback was submitted
  page_path TEXT NOT NULL,  -- Route path (e.g., /dashboard/customer/bookings)
  user_agent TEXT,  -- Browser/device info
  viewport_size JSONB,  -- { width: 1920, height: 1080, pixelRatio: 2 }

  -- Optional attachments
  screenshot_url TEXT,  -- Supabase Storage URL (future enhancement)

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'in_review', 'resolved', 'closed', 'spam')
  ),
  priority TEXT DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'critical')
  ),

  -- Admin fields
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback_submissions(user_id);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON feedback_submissions(feedback_type);
CREATE INDEX IF NOT EXISTS feedback_priority_idx ON feedback_submissions(priority);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_assigned_to_idx ON feedback_submissions(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS feedback_page_path_idx ON feedback_submissions(page_path);

-- Enable RLS
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feedback
CREATE POLICY "Users view own feedback"
  ON feedback_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can submit feedback
CREATE POLICY "Authenticated users submit feedback"
  ON feedback_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins view all feedback"
  ON feedback_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all feedback
CREATE POLICY "Admins update feedback"
  ON feedback_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete feedback (spam)
CREATE POLICY "Admins delete feedback"
  ON feedback_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION set_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_set_updated_at
  BEFORE UPDATE ON feedback_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_feedback_updated_at();

-- Function to get feedback stats for admin dashboard
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
  total_count BIGINT,
  new_count BIGINT,
  in_review_count BIGINT,
  resolved_count BIGINT,
  bug_count BIGINT,
  feature_request_count BIGINT,
  average_resolution_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_count,
    COUNT(*) FILTER (WHERE status = 'in_review')::BIGINT as in_review_count,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_count,
    COUNT(*) FILTER (WHERE feedback_type = 'bug')::BIGINT as bug_count,
    COUNT(*) FILTER (WHERE feedback_type = 'feature_request')::BIGINT as feature_request_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::NUMERIC, 2) as average_resolution_hours
  FROM feedback_submissions
  WHERE status != 'spam';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
