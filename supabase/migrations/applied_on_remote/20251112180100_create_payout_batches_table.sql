-- Migration: Create payout_batches table for idempotency
-- Created: 2025-11-12
-- Purpose: Prevent double-payouts by tracking batch IDs and ensuring each transfer is processed exactly once

-- Create payout_batches table
CREATE TABLE IF NOT EXISTS public.payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_amount_cop BIGINT NOT NULL DEFAULT 0,
  total_transfers INTEGER NOT NULL DEFAULT 0,
  successful_transfers INTEGER NOT NULL DEFAULT 0,
  failed_transfers INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payout_batches_batch_id ON public.payout_batches (batch_id);
CREATE INDEX IF NOT EXISTS idx_payout_batches_run_date ON public.payout_batches (run_date DESC);
CREATE INDEX IF NOT EXISTS idx_payout_batches_status ON public.payout_batches (status);

-- Create payout_transfers table (links transfers to batches)
CREATE TABLE IF NOT EXISTS public.payout_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.payout_batches(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount_cop BIGINT NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure each booking is only paid out once
  CONSTRAINT unique_booking_payout UNIQUE (booking_id)
);

-- Add indexes for payout_transfers
CREATE INDEX IF NOT EXISTS idx_payout_transfers_batch_id ON public.payout_transfers (batch_id);
CREATE INDEX IF NOT EXISTS idx_payout_transfers_booking_id ON public.payout_transfers (booking_id);
CREATE INDEX IF NOT EXISTS idx_payout_transfers_professional_id ON public.payout_transfers (professional_id);
CREATE INDEX IF NOT EXISTS idx_payout_transfers_status ON public.payout_transfers (status);
CREATE INDEX IF NOT EXISTS idx_payout_transfers_stripe_id ON public.payout_transfers (stripe_transfer_id);

-- Enable RLS
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service role (cron/admin) can access
CREATE POLICY "Service role full access to payout_batches"
  ON public.payout_batches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view payout_batches"
  ON public.payout_batches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service role full access to payout_transfers"
  ON public.payout_transfers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view payout_transfers"
  ON public.payout_transfers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Professionals can view their own payout_transfers"
  ON public.payout_transfers
  FOR SELECT
  TO authenticated
  USING (professional_id = auth.uid());

-- Add updated_at trigger for payout_batches
CREATE OR REPLACE FUNCTION update_payout_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_batches_updated_at
  BEFORE UPDATE ON public.payout_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_batches_updated_at();

-- Add updated_at trigger for payout_transfers
CREATE OR REPLACE FUNCTION update_payout_transfers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_transfers_updated_at
  BEFORE UPDATE ON public.payout_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_transfers_updated_at();

-- Add comments
COMMENT ON TABLE public.payout_batches IS 'Tracks payout batch runs for idempotency and audit trail';
COMMENT ON TABLE public.payout_transfers IS 'Tracks individual payout transfers within a batch, ensures each booking is paid exactly once';
COMMENT ON COLUMN public.payout_batches.batch_id IS 'Unique batch identifier (e.g., "payout-2025-11-12-tue")';
COMMENT ON COLUMN public.payout_transfers.booking_id IS 'Booking this payout is for (unique constraint prevents double-payout)';
