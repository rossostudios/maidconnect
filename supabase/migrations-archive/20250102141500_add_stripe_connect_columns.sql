-- Add Stripe Connect tracking columns for professionals

begin;

alter table public.professional_profiles
  add column if not exists stripe_connect_account_id text,
  add column if not exists stripe_connect_onboarding_status text default 'not_started',
  add column if not exists stripe_connect_last_refresh timestamptz;

commit;
