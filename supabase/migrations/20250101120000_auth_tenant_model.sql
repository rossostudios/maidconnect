-- Auth & tenant schema for Casaora SaaS
-- Run via Supabase CLI or dashboard SQL editor.

begin;

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('customer', 'professional', 'admin')),
    locale text not null default 'en-US',
    phone text,
    country text,
    city text,
    onboarding_status text not null default 'application_pending',
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.professional_profiles (
    profile_id uuid primary key references public.profiles(id) on delete cascade,
    status text not null default 'draft',
    bio text,
    services jsonb not null default '[]'::jsonb,
    verification_level text not null default 'none',
    onboarding_completed_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customer_profiles (
    profile_id uuid primary key references public.profiles(id) on delete cascade,
    verification_tier text not null default 'basic',
    property_preferences jsonb not null default '{}'::jsonb,
    default_address jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, role, locale, onboarding_status)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'role', 'customer'),
        coalesce(new.raw_user_meta_data->>'locale', 'en-US'),
        case when coalesce(new.raw_user_meta_data->>'role', 'customer') = 'professional'
             then 'application_pending'
             else 'active'
        end
    );
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.customer_profiles enable row level security;

create policy "Public profiles are viewable by the role owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "Profile owners can update their profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Professional profile visible to owner"
on public.professional_profiles
for select using (auth.uid() = profile_id);

create policy "Professional profile editable by owner"
on public.professional_profiles
for update using (auth.uid() = profile_id);

create policy "Customer profile visible to owner"
on public.customer_profiles
for select using (auth.uid() = profile_id);

create policy "Customer profile editable by owner"
on public.customer_profiles
for update using (auth.uid() = profile_id);

commit;
