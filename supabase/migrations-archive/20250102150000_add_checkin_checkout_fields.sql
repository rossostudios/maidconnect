begin;

-- Add check-in/check-out fields to bookings table for Sprint 2 Phase 1
alter table public.bookings
  -- Check-in/out timestamps
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_out_at timestamptz,

  -- GPS verification on check-in/out
  add column if not exists check_in_latitude decimal(10, 7),
  add column if not exists check_in_longitude decimal(10, 7),
  add column if not exists check_out_latitude decimal(10, 7),
  add column if not exists check_out_longitude decimal(10, 7),

  -- Service timing
  add column if not exists actual_duration_minutes integer,

  -- Time extensions
  add column if not exists time_extension_minutes integer default 0,
  add column if not exists time_extension_amount integer default 0,

  -- Professional notes
  add column if not exists completion_notes text,

  -- Decline tracking
  add column if not exists declined_reason text,
  add column if not exists declined_at timestamptz,

  -- Cancellation tracking (for customer cancellations)
  add column if not exists canceled_reason text,
  add column if not exists canceled_at timestamptz,
  add column if not exists canceled_by uuid references public.profiles(id);

-- Create indexes for common queries
create index if not exists bookings_checked_in_at_idx on public.bookings(checked_in_at);
create index if not exists bookings_checked_out_at_idx on public.bookings(checked_out_at);
create index if not exists bookings_declined_at_idx on public.bookings(declined_at);
create index if not exists bookings_canceled_at_idx on public.bookings(canceled_at);

-- Add a new booking status for active service
comment on column public.bookings.status is 'Booking status: pending_payment, authorized, confirmed, in_progress, completed, declined, canceled';

commit;
