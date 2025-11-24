-- Migration: Add bundle_metrics table for historical bundle size tracking
-- Description: Stores bundle size metrics from CI/CD pipeline for trending analysis
-- Author: Claude AI
-- Date: 2024-11-24

-- Create bundle_metrics table
CREATE TABLE IF NOT EXISTS bundle_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Git context
  commit_sha VARCHAR(40) NOT NULL,
  branch VARCHAR(255) NOT NULL DEFAULT 'main',

  -- Bundle sizes (in bytes)
  total_js_bytes BIGINT NOT NULL,
  total_css_bytes BIGINT NOT NULL DEFAULT 0,

  -- Chunk analysis
  chunks_count INTEGER NOT NULL DEFAULT 0,
  chunks_over_250kb INTEGER NOT NULL DEFAULT 0,
  chunks_over_300kb INTEGER NOT NULL DEFAULT 0,
  largest_chunk_name VARCHAR(255),
  largest_chunk_bytes BIGINT DEFAULT 0,

  -- Lighthouse metrics (optional, populated when available)
  lighthouse_performance INTEGER,
  lighthouse_accessibility INTEGER,
  lighthouse_best_practices INTEGER,
  lighthouse_seo INTEGER,
  lcp_ms INTEGER,  -- Largest Contentful Paint
  fcp_ms INTEGER,  -- First Contentful Paint
  cls_score DECIMAL(5,4),  -- Cumulative Layout Shift (0.0000 - 1.0000)
  tbt_ms INTEGER,  -- Total Blocking Time

  -- Raw data for detailed analysis
  raw_stats JSONB,

  -- Constraints
  CONSTRAINT bundle_metrics_commit_sha_check CHECK (char_length(commit_sha) = 40),
  CONSTRAINT bundle_metrics_branch_check CHECK (char_length(branch) > 0)
);

-- Create index for time-series queries
CREATE INDEX idx_bundle_metrics_created_at ON bundle_metrics (created_at DESC);

-- Create index for branch filtering
CREATE INDEX idx_bundle_metrics_branch ON bundle_metrics (branch);

-- Create index for commit lookups
CREATE INDEX idx_bundle_metrics_commit_sha ON bundle_metrics (commit_sha);

-- Create composite index for trending queries
CREATE INDEX idx_bundle_metrics_branch_created ON bundle_metrics (branch, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE bundle_metrics IS 'Historical bundle size metrics from CI/CD pipeline for performance trending';
COMMENT ON COLUMN bundle_metrics.commit_sha IS 'Git commit SHA (40 characters)';
COMMENT ON COLUMN bundle_metrics.total_js_bytes IS 'Total JavaScript bundle size in bytes';
COMMENT ON COLUMN bundle_metrics.total_css_bytes IS 'Total CSS bundle size in bytes';
COMMENT ON COLUMN bundle_metrics.chunks_over_250kb IS 'Number of JS chunks exceeding 250KB soft limit';
COMMENT ON COLUMN bundle_metrics.chunks_over_300kb IS 'Number of JS chunks exceeding 300KB hard limit';
COMMENT ON COLUMN bundle_metrics.lcp_ms IS 'Lighthouse Largest Contentful Paint in milliseconds';
COMMENT ON COLUMN bundle_metrics.cls_score IS 'Lighthouse Cumulative Layout Shift score (0-1)';
COMMENT ON COLUMN bundle_metrics.raw_stats IS 'Full JSON output from bundle-stats.sh for detailed analysis';

-- RLS Policy: Allow service role to insert (CI/CD writes via service role key)
-- Note: This table is write-only from CI/CD, read access via admin dashboard
ALTER TABLE bundle_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert new metrics
CREATE POLICY "Service role can insert bundle metrics"
  ON bundle_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can read all metrics
CREATE POLICY "Service role can read bundle metrics"
  ON bundle_metrics
  FOR SELECT
  TO service_role
  USING (true);

-- Policy: Authenticated admins can read metrics (for dashboard)
CREATE POLICY "Admins can read bundle metrics"
  ON bundle_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON bundle_metrics TO authenticated;
GRANT INSERT, SELECT ON bundle_metrics TO service_role;
