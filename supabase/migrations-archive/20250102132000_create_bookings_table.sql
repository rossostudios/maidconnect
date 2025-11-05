begin;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(profile_id) on delete restrict,
  status text not null default 'pending_payment',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  duration_minutes integer,
  currency text not null default 'cop',
  amount_estimated integer,
  amount_authorized integer,
  amount_captured integer,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  address jsonb,
  special_instructions text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists bookings_professional_id_idx on public.bookings(professional_id);
create index if not exists bookings_status_idx on public.bookings(status);
create unique index if not exists bookings_stripe_payment_intent_id_idx on public.bookings(stripe_payment_intent_id) where stripe_payment_intent_id is not null;

create or replace function public.set_booking_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute procedure public.set_booking_updated_at();

commit;
