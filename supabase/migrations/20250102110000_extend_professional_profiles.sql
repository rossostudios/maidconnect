-- Extend professional profiles to persist onboarding data

begin;

alter table public.professional_profiles
  add column if not exists full_name text,
  add column if not exists id_number text,
  add column if not exists experience_years integer,
  add column if not exists primary_services text[] default '{}'::text[],
  add column if not exists rate_expectations jsonb default '{}'::jsonb,
  add column if not exists languages text[] default '{}'::text[],
  add column if not exists availability jsonb default '{}'::jsonb,
  add column if not exists references_data jsonb default '[]'::jsonb,
  add column if not exists consent_background_check boolean default false;

create table if not exists public.professional_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.professional_profiles(profile_id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status text not null default 'uploaded',
  uploaded_at timestamptz not null default timezone('utc', now()),
  metadata jsonb default '{}'::jsonb
);

alter table public.professional_documents enable row level security;

create policy "Professional documents are visible to owner"
on public.professional_documents
for select
using (auth.uid() = profile_id);

create policy "Professional documents can be inserted by owner"
on public.professional_documents
for insert
with check (auth.uid() = profile_id);

create policy "Professional documents can be deleted by owner"
on public.professional_documents
for delete
using (auth.uid() = profile_id);

commit;
