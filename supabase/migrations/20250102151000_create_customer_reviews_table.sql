begin;

-- Create customer_reviews table for professionals to rate customers
-- This completes the mutual rating system (customers already rate professionals)
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  -- Review categories specific to customer behavior
  punctuality_rating integer check (punctuality_rating between 1 and 5),
  communication_rating integer check (communication_rating between 1 and 5),
  respectfulness_rating integer check (respectfulness_rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Indexes for common queries
create index if not exists customer_reviews_customer_id_idx on public.customer_reviews(customer_id);
create index if not exists customer_reviews_professional_id_idx on public.customer_reviews(professional_id);
create index if not exists customer_reviews_booking_id_idx on public.customer_reviews(booking_id);

-- Ensure one review per booking (professional can only review customer once per booking)
create unique index if not exists customer_reviews_booking_professional_unique_idx
  on public.customer_reviews(booking_id, professional_id);

-- Trigger to update updated_at timestamp
create or replace function public.set_customer_review_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists customer_reviews_set_updated_at on public.customer_reviews;
create trigger customer_reviews_set_updated_at
  before update on public.customer_reviews
  for each row execute procedure public.set_customer_review_updated_at();

-- Row-level security policies
alter table public.customer_reviews enable row level security;

-- Customers can view reviews about themselves (for transparency)
create policy "Customers can view their own reviews"
on public.customer_reviews
for select
using (auth.uid() = customer_id);

-- Professionals can view reviews they've written
create policy "Professionals can view reviews they wrote"
on public.customer_reviews
for select
using (auth.uid() = professional_id);

-- Professionals can insert reviews for their completed bookings
create policy "Professionals can insert reviews for completed bookings"
on public.customer_reviews
for insert
with check (
  auth.uid() = professional_id
  and exists (
    select 1 from public.bookings
    where id = booking_id
    and professional_id = auth.uid()
    and status = 'completed'
  )
);

-- Professionals can update their own reviews (within reason)
create policy "Professionals can update their own reviews"
on public.customer_reviews
for update
using (auth.uid() = professional_id);

-- Add helpful comment
comment on table public.customer_reviews is 'Reviews written by professionals about customers after completing services';

commit;
