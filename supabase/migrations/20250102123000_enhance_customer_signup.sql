-- Enhance profile metadata handling for customer sign-up
begin;

alter table public.profiles
  add column if not exists full_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  role text := coalesce(new.raw_user_meta_data->>'role', 'customer');
  locale text := coalesce(new.raw_user_meta_data->>'locale', 'en-US');
  onboarding text := case when role = 'professional' then 'application_pending' else 'active' end;
  phone text := new.raw_user_meta_data->>'phone';
  country text := coalesce(new.raw_user_meta_data->>'country', 'Colombia');
  city text := new.raw_user_meta_data->>'city';
  full_name text := new.raw_user_meta_data->>'full_name';
  property_preferences jsonb := coalesce(new.raw_user_meta_data->'property_preferences', '{}'::jsonb);
begin
  insert into public.profiles (id, role, locale, onboarding_status, phone, country, city, full_name)
  values (new.id, role, locale, onboarding, phone, country, city, full_name);

  if role = 'customer' then
    insert into public.customer_profiles (profile_id, property_preferences)
    values (new.id, property_preferences)
    on conflict (profile_id) do update set property_preferences = excluded.property_preferences;
  end if;

  return new;
end;
$$;

commit;
