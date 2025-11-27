-- Create stripe_webhook_events table for webhook idempotency
-- SECURITY: Prevents double-processing of webhook events (Epic H-2.3)

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,  -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,        -- Event type (e.g., payment_intent.succeeded)
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  payload JSONB,                   -- Full event payload for debugging
  error_message TEXT,              -- Error message if failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ         -- When processing completed
);

-- Index for fast duplicate lookups (primary idempotency check)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);

-- Index for cleanup queries (remove old completed events)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at ON stripe_webhook_events(created_at);

-- Index for monitoring (find stuck/failed events)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_status ON stripe_webhook_events(status);

-- RLS: Only admin/service role can access
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No public access - only service role (supabaseAdmin) can read/write
CREATE POLICY "Service role only - stripe_webhook_events"
  ON stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events for idempotency. Prevents double-processing from retries.';
COMMENT ON COLUMN stripe_webhook_events.status IS 'processing = in-progress, completed = success, failed = error occurred';
