-- Create table for tracking processed Sanity webhook events
-- This prevents replay attacks and duplicate processing by storing event IDs
-- Epic H-2.3: Implement webhook idempotency checks

CREATE TABLE IF NOT EXISTS public.sanity_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  revision TEXT NOT NULL, -- Sanity _rev field (unique per document version)
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  -- Prevent same document revision from being processed twice
  UNIQUE(document_id, revision)
);

-- Index for fast document_id + revision lookup (critical for webhook performance)
CREATE INDEX IF NOT EXISTS idx_sanity_webhook_events_doc_rev
  ON public.sanity_webhook_events(document_id, revision);

-- Index for cleanup queries (remove old events)
CREATE INDEX IF NOT EXISTS idx_sanity_webhook_events_processed_at
  ON public.sanity_webhook_events(processed_at);

-- Index for querying by document type
CREATE INDEX IF NOT EXISTS idx_sanity_webhook_events_doc_type
  ON public.sanity_webhook_events(document_type);

-- Add comment for documentation
COMMENT ON TABLE public.sanity_webhook_events IS
  'Tracks processed Sanity CMS webhook events to prevent replay attacks and duplicate Algolia syncs. Uses Sanity revision field (_rev) for idempotency.';

COMMENT ON COLUMN public.sanity_webhook_events.revision IS
  'Sanity document revision (e.g., "1-abc123", "2-def456"). Increments on each document update.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.sanity_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read webhook events (no public access)
CREATE POLICY "Service role only" ON public.sanity_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');
