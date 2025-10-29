-- Create payouts table to track professional earnings and platform payouts
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  stripe_connect_account_id text not null,
  stripe_payout_id text unique, -- Stripe payout ID after transfer

  -- Amounts in cents (same currency as bookings)
  gross_amount integer not null, -- Total from bookings before commission
  commission_amount integer not null, -- 18% platform fee
  net_amount integer not null, -- Amount paid to professional (gross - commission)
  currency text not null default 'COP',

  -- Payout details
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'canceled')),
  payout_date timestamptz, -- When payout was initiated
  arrival_date timestamptz, -- Expected arrival date (from Stripe)
  failure_reason text, -- If status = 'failed'

  -- Metadata
  booking_ids uuid[] not null, -- Array of booking IDs included in this payout
  period_start timestamptz not null, -- Start of payout period
  period_end timestamptz not null, -- End of payout period
  notes text,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes for efficient queries
create index if not exists idx_payouts_professional_id on public.payouts(professional_id);
create index if not exists idx_payouts_status on public.payouts(status);
create index if not exists idx_payouts_payout_date on public.payouts(payout_date);
create index if not exists idx_payouts_stripe_payout_id on public.payouts(stripe_payout_id) where stripe_payout_id is not null;

-- RLS policies
alter table public.payouts enable row level security;

-- Professionals can only view their own payouts
create policy "Professionals can view their own payouts"
  on public.payouts
  for select
  using (
    auth.uid() = professional_id
  );

-- Only service role can insert/update payouts (backend only)
create policy "Service role can manage all payouts"
  on public.payouts
  for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Create updated_at trigger function
create or replace function public.set_payouts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Create updated_at trigger
drop trigger if exists payouts_set_updated_at on public.payouts;
create trigger payouts_set_updated_at
  before update on public.payouts
  for each row
  execute procedure public.set_payouts_updated_at();

-- Add payout tracking to bookings table
alter table public.bookings
  add column if not exists included_in_payout_id uuid references public.payouts(id) on delete set null;

create index if not exists idx_bookings_included_in_payout_id
  on public.bookings(included_in_payout_id)
  where included_in_payout_id is not null;

-- Comment
comment on table public.payouts is 'Tracks payouts to professionals with commission calculations';
comment on column public.payouts.gross_amount is 'Total earnings from bookings before 18% commission';
comment on column public.payouts.commission_amount is '18% platform fee deducted from gross';
comment on column public.payouts.net_amount is 'Amount actually paid to professional (gross - commission)';
