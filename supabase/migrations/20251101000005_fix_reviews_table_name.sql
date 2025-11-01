-- Fix reviews table name in list_active_professionals function
-- The function was referencing 'public.reviews' but the actual table is 'public.professional_reviews'

drop function if exists public.list_active_professionals(numeric, numeric);

create or replace function public.list_active_professionals(
  p_customer_lat numeric default null,
  p_customer_lon numeric default null
)
returns table (
  profile_id uuid,
  full_name text,
  bio text,
  experience_years integer,
  languages text[],
  services jsonb,
  primary_services text[],
  city text,
  country text,
  availability jsonb,
  professional_status text,
  verification_level text,
  rating numeric,
  review_count bigint,
  on_time_rate numeric,
  acceptance_rate numeric,
  total_completed_bookings bigint,
  total_earnings numeric,
  favorites_count bigint,
  distance_km numeric
)
language plpgsql
as $$
begin
  return query
  select
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.experience_years,
    pp.languages,
    pp.services,
    pp.primary_services,
    pp.city,
    pp.country,
    pp.availability,
    p.onboarding_status as professional_status,
    coalesce(pp.verification_level, 'none') as verification_level,

    -- Rating calculation (using correct table name: professional_reviews)
    coalesce(
      (select avg(r.rating)::numeric
       from public.professional_reviews r
       where r.professional_id = pp.profile_id),
      0
    ) as rating,

    -- Review count (using correct table name: professional_reviews)
    coalesce(
      (select count(*)
       from public.professional_reviews r
       where r.professional_id = pp.profile_id),
      0
    ) as review_count,

    -- On-time rate calculation
    round(coalesce(
      (select
        case
          when count(*) = 0 then 0
          else (count(*) filter (
            where b.checked_in_at <= b.scheduled_start + interval '15 minutes'
          )::numeric / count(*)::numeric) * 100
        end
       from bookings b
       where b.professional_id = pp.profile_id
         and b.status = 'completed'
         and b.checked_in_at is not null
         and b.scheduled_start is not null
      ),
      0
    ), 0) as on_time_rate,

    -- Acceptance rate calculation
    round(coalesce(
      (select
        case
          when count(*) = 0 then 0
          else (count(*) filter (
            where b.status = 'confirmed' or b.status = 'in_progress' or b.status = 'completed'
          )::numeric / count(*)::numeric) * 100
        end
       from bookings b
       where b.professional_id = pp.profile_id
         and (b.status = 'confirmed' or b.status = 'declined' or b.status = 'in_progress' or b.status = 'completed')
      ),
      0
    ), 0) as acceptance_rate,

    -- Total completed bookings
    coalesce(
      (select count(*)
       from bookings b
       where b.professional_id = pp.profile_id
         and b.status = 'completed'),
      0
    ) as total_completed_bookings,

    -- Total earnings
    coalesce(pp.total_earnings, 0) as total_earnings,

    -- Favorites count
    coalesce(pp.favorites_count, 0) as favorites_count,

    -- Distance calculation (optional, based on customer location)
    case
      when p_customer_lat is not null and p_customer_lon is not null
           and pp.location_latitude is not null and pp.location_longitude is not null then
        (
          6371 * acos(
            cos(radians(p_customer_lat)) *
            cos(radians(pp.location_latitude)) *
            cos(radians(pp.location_longitude) - radians(p_customer_lon)) +
            sin(radians(p_customer_lat)) *
            sin(radians(pp.location_latitude))
          )
        )
      else
        null
    end as distance_km

  from public.professional_profiles pp
  inner join public.profiles p on pp.profile_id = p.id
  where p.account_status = 'active'
    and p.onboarding_status = 'active'
  -- Order by rating (column 13) and review count (column 14)
  order by 13 desc nulls last, 14 desc;
end;
$$;

-- Grant execute permission to both anon and authenticated
grant execute on function public.list_active_professionals(numeric, numeric) to anon, authenticated;

-- Add comment
comment on function public.list_active_professionals is
  'Lists active professionals with complete profile data and safety metrics (on-time rate, acceptance rate).
   Optionally filters by distance when customer lat/lon provided.
   Fixed to use correct table name: professional_reviews instead of reviews.';
