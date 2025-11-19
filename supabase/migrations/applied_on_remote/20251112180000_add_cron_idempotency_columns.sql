-- Migration: Add idempotency columns for cron job safety
-- Created: 2025-11-12
-- Purpose: Prevent double-processing in auto-decline-bookings cron and improve debugging

-- Add columns to bookings table for auto-decline cron idempotency
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS declined_reason TEXT,
  ADD COLUMN IF NOT EXISTS auto_declined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processed_by_cron BOOLEAN DEFAULT false;

-- Add index for cron query performance (status + updated_at for auto-decline lookup)
CREATE INDEX IF NOT EXISTS idx_bookings_cron_auto_decline
  ON public.bookings (status, updated_at)
  WHERE status = 'authorized';

-- Add index for debugging cron-processed bookings
CREATE INDEX IF NOT EXISTS idx_bookings_processed_by_cron
  ON public.bookings (processed_by_cron, updated_at)
  WHERE processed_by_cron = true;

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.declined_reason IS 'Reason for decline: professional_no_response, payment_failed, customer_cancelled, etc.';
COMMENT ON COLUMN public.bookings.auto_declined_at IS 'Timestamp when booking was automatically declined by cron job';
COMMENT ON COLUMN public.bookings.processed_by_cron IS 'Flag indicating this booking was processed by auto-decline cron (for debugging and metrics)';
