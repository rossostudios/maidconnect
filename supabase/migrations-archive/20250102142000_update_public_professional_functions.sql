-- Update public professional functions to expose references data

begin;

drop function if exists public.list_active_professionals();

create function public.list_active_professionals()
returns table (
  profile_id uuid,
  full_name text,
  bio text,
  experience_years integer,
  languages text[],
  services jsonb,
  primary_services text[],
  availability jsonb,
  references_data jsonb,
  portfolio_images jsonb,
  city text,
  country text,
  onboarding_status text,
  professional_status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    coalesce(pp.languages, '{}'),
    coalesce(pp.services, '[]'::jsonb),
    coalesce(pp.primary_services, '{}'),
    coalesce(pp.availability, '{}'::jsonb),
    coalesce(pp.references_data, '[]'::jsonb),
    coalesce(pp.portfolio_images, '[]'::jsonb),
    prof.city,
    prof.country,
    prof.onboarding_status,
    pp.status as professional_status,
    pp.created_at,
    pp.updated_at
  from professional_profiles pp
  join profiles prof on prof.id = pp.profile_id
  where prof.onboarding_status in ('active', 'approved')
    and pp.status in ('profile_submitted', 'approved', 'active');
$$;

-- ensure detail function returns latest shape (no change needed if already defined)

grant execute on function public.list_active_professionals() to anon, authenticated;

commit;
