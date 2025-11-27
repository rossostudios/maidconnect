-- Create unified webhook_events table for PayPal and Background Check webhooks
-- SECURITY: Prevents double-processing of webhook events (Epic H-2.3)
-- NOTE: Stripe uses its own stripe_webhook_events table

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,              -- Provider event ID (e.g., WH-xxx for PayPal)
  event_type TEXT NOT NULL,            -- Event type (e.g., PAYMENT.PAYOUTS-ITEM.SUCCEEDED)
  provider TEXT NOT NULL,              -- Provider name (paypal, checkr, truora)
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  payload JSONB,                       -- Full event payload for debugging
  error_message TEXT,                  -- Error message if failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,            -- When processing completed

  -- Unique constraint per provider+event_id (idempotency key)
  UNIQUE (provider, event_id)
);

-- Index for fast duplicate lookups (primary idempotency check)
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event_id ON webhook_events(provider, event_id);

-- Index for cleanup queries (remove old completed events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Index for monitoring (find stuck/failed events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Index for provider-specific queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider);

-- RLS: Only admin/service role can access
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No public access - only service role (supabaseAdmin) can read/write
CREATE POLICY "Service role only - webhook_events"
  ON webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events for idempotency. Prevents double-processing from retries. Used by PayPal and Background Check webhooks.';
COMMENT ON COLUMN webhook_events.provider IS 'Webhook provider: paypal, checkr, truora';
COMMENT ON COLUMN webhook_events.status IS 'processing = in-progress, completed = success, failed = error occurred';
