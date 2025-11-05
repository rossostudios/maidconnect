-- Add total earnings and favorites count to list_active_professionals function
-- This enhances the professionals directory with more comprehensive stats

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
  total_earnings bigint,
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

    -- Rating calculation
    coalesce(
      (select avg(rating)::numeric
       from public.customer_reviews
       where professional_id = pp.profile_id),
      0
    ) as rating,

    -- Review count
    coalesce(
      (select count(*)
       from public.customer_reviews
       where professional_id = pp.profile_id),
      0
    ) as review_count,

    -- On-time rate calculation
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
    ), 0) as on_time_rate,

    -- Acceptance rate calculation
    round(coalesce(
      (select
        case
          when count(*) = 0 then 0
          else (count(*) filter (
            where status = 'confirmed' or status = 'in_progress' or status = 'completed'
          )::numeric / count(*)::numeric) * 100
        end
       from bookings
       where professional_id = pp.profile_id
         and (status = 'confirmed' or status = 'declined' or status = 'in_progress' or status = 'completed')
      ),
      0
    ), 0) as acceptance_rate,

    -- Total completed bookings
    coalesce(
      (select count(*)
       from bookings
       where professional_id = pp.profile_id
         and status = 'completed'),
      0
    ) as total_completed_bookings,

    -- Total earnings (sum of captured amounts from completed bookings)
    coalesce(
      (select sum(amount_captured)
       from bookings
       where professional_id = pp.profile_id
         and status = 'completed'
         and amount_captured is not null),
      0
    ) as total_earnings,

    -- Favorites count (how many customers favorited this professional)
    coalesce(
      (select count(*)
       from public.customer_profiles
       where pp.profile_id = any(favorite_professionals)),
      0
    ) as favorites_count,

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
  where p.onboarding_status = 'active'
  order by 13 desc nulls last, 14 desc;
end;
$$;

-- Grant execute permission to both anon and authenticated
grant execute on function public.list_active_professionals(numeric, numeric) to anon, authenticated;

-- Add comment
comment on function public.list_active_professionals is
  'Lists active professionals with complete profile data including earnings, favorites, and trust metrics.
   Optionally filters by distance when customer lat/lon provided.';
