-- Add trust signals to list_active_professionals function
-- Week 3-4: Enhanced trust badges feature

begin;

-- Drop old function
drop function if exists public.list_active_professionals();

-- Recreate with trust signals
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
  updated_at timestamptz,
  -- New trust signal fields
  verification_level text,
  rating numeric,
  review_count bigint,
  on_time_rate numeric
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
    pp.updated_at,
    -- Trust signals
    pp.verification_level,
    -- Average rating from reviews (rounded to 1 decimal)
    round(coalesce(
      (select avg(rating) from professional_reviews where professional_id = pp.profile_id),
      0
    ), 1) as rating,
    -- Review count
    coalesce(
      (select count(*) from professional_reviews where professional_id = pp.profile_id),
      0
    ) as review_count,
    -- On-time rate (percentage of bookings checked in within 15 minutes of scheduled start)
    -- Only count completed bookings with check-in data
    round(coalesce(
      (select
        case
          when count(*) = 0 then 0
          else (count(*) filter (
            where checked_in_at <= scheduled_start + interval '15 minutes'
          )::numeric / count(*)::numeric) * 100
        end
       from bookings
       where professional_id = pp.profile_id
         and status = 'completed'
         and checked_in_at is not null
         and scheduled_start is not null
      ),
      0
    ), 0) as on_time_rate
  from professional_profiles pp
  join profiles prof on prof.id = pp.profile_id
  where prof.onboarding_status in ('active', 'approved')
    and pp.status in ('profile_submitted', 'approved', 'active');
$$;

grant execute on function public.list_active_professionals() to anon, authenticated;

commit;
