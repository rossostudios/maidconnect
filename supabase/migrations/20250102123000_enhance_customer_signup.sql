-- Enhance profile metadata handling for customer sign-up
begin;

alter table public.profiles
  add column if not exists full_name text;

commit;
