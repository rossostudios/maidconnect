-- Add city and country columns to professional_profiles table
-- These are needed for the public professionals directory

alter table public.professional_profiles
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists location_latitude numeric,
  add column if not exists location_longitude numeric;

-- Add index for location-based queries
create index if not exists professional_profiles_location_idx
  on public.professional_profiles(city, country)
  where city is not null;
