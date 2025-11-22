-- Migration: Drop Trial Credits Table
-- Description: Remove the trial_credits table and related objects as the trial credits feature has been removed
-- Date: 2025-11-21

-- Drop the trial_credits table if it exists
DROP TABLE IF EXISTS public.trial_credits CASCADE;

-- Drop any related functions if they exist
DROP FUNCTION IF EXISTS public.mark_trial_credit_used(uuid, uuid, uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_customer_trial_credits(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_trial_discount(uuid, uuid) CASCADE;

-- Note: This migration removes the trial credits feature entirely
-- Any existing trial credit data will be lost
