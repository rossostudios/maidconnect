begin;

alter table public.bookings
  add column if not exists service_name text,
  add column if not exists service_hourly_rate integer;

alter table public.professional_profiles
  add column if not exists portfolio_images jsonb default '[]'::jsonb;

create table if not exists public.professional_reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_name text,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.professional_reviews enable row level security;

create policy "Reviews are readable by anyone"
on public.professional_reviews
for select
using (true);

create policy "Customers can insert their own reviews"
on public.professional_reviews
for insert
with check (auth.uid() = customer_id);

commit;
