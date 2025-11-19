-- Create table for tracking processed Stripe webhook events
-- This prevents replay attacks by storing event IDs

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for fast event_id lookup (critical for webhook performance)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id
  ON public.stripe_webhook_events(event_id);

-- Index for cleanup queries (remove old events)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON public.stripe_webhook_events(processed_at);

-- Add comment for documentation
COMMENT ON TABLE public.stripe_webhook_events IS
  'Tracks processed Stripe webhook events to prevent replay attacks and duplicate processing';

-- Enable Row Level Security (RLS)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read webhook events (no public access)
CREATE POLICY "Service role only" ON public.stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');
