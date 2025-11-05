-- Add dispute tracking for bookings
-- Week 3-4: Dispute window messaging feature

begin;

-- Add completed_at timestamp to bookings
alter table public.bookings
  add column if not exists completed_at timestamptz;

-- Create booking_disputes table
create table if not exists public.booking_disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Enable RLS
alter table public.booking_disputes enable row level security;

-- Customers can view their own disputes
create policy "Customers can view their own disputes"
on public.booking_disputes
for select
using (auth.uid() = customer_id);

-- Customers can create disputes for their bookings within 48 hours
create policy "Customers can create disputes within 48 hours"
on public.booking_disputes
for insert
with check (
  auth.uid() = customer_id
  and exists (
    select 1 from public.bookings
    where id = booking_id
      and customer_id = auth.uid()
      and status = 'completed'
      and completed_at is not null
      and completed_at >= timezone('utc', now()) - interval '48 hours'
  )
);

-- Professionals can view disputes about them
create policy "Professionals can view disputes about them"
on public.booking_disputes
for select
using (auth.uid() = professional_id);

-- Admins can view all disputes
create policy "Admins can view all disputes"
on public.booking_disputes
for select
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Admins can update disputes
create policy "Admins can update disputes"
on public.booking_disputes
for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Create indexes
create index if not exists booking_disputes_booking_id_idx on public.booking_disputes(booking_id);
create index if not exists booking_disputes_customer_id_idx on public.booking_disputes(customer_id);
create index if not exists booking_disputes_professional_id_idx on public.booking_disputes(professional_id);
create index if not exists booking_disputes_status_idx on public.booking_disputes(status);
create index if not exists booking_disputes_created_at_idx on public.booking_disputes(created_at);

-- Trigger to update completed_at when booking status changes to completed
create or replace function public.set_completed_at()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = timezone('utc', now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_completed_at_trigger on public.bookings;

create trigger set_completed_at_trigger
before update on public.bookings
for each row
execute function public.set_completed_at();

commit;
