-- Week 7-8: Safety Package - Add acceptance rate calculation
-- Extends list_active_professionals to include acceptance rate metrics

-- Drop existing function to replace it
drop function if exists public.list_active_professionals(numeric);

-- Recreate function with acceptance rate metrics
create or replace function public.list_active_professionals(
  p_customer_lat numeric default null,
  p_customer_lon numeric default null
)
returns table (
  profile_id uuid,
  full_name text,
  bio text,
  specialties text[],
  hourly_rate_min numeric,
  hourly_rate_max numeric,
  languages text[],
  service_radius_km numeric,
  rating numeric,
  review_count bigint,
  avatar_url text,
  service_areas text[],
  distance_km numeric,
  verified boolean,
  verification_level text,
  on_time_rate numeric,
  acceptance_rate numeric,
  total_completed_bookings bigint
)
language plpgsql
as $$
begin
  return query
  select
    pp.profile_id,
    pp.full_name,
    pp.bio,
    pp.specialties,
    pp.hourly_rate_min,
    pp.hourly_rate_max,
    pp.languages,
    pp.service_radius_km,
    coalesce(
      (select avg(rating)::numeric
       from public.reviews
       where professional_id = pp.profile_id),
      0
    ) as rating,
    coalesce(
      (select count(*)
       from public.reviews
       where professional_id = pp.profile_id),
      0
    ) as review_count,
    pp.avatar_url,
    pp.service_areas,
    case
      when p_customer_lat is not null and p_customer_lon is not null and pp.location_latitude is not null and pp.location_longitude is not null then
        -- Haversine formula for distance in km
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
    end as distance_km,
    pp.verified,
    coalesce(pp.verification_level, 'none') as verification_level,

    -- On-time rate calculation (Week 3-4)
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

    -- Acceptance rate calculation (Week 7-8)
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

    -- Total completed bookings (Week 7-8)
    coalesce(
      (select count(*)
       from bookings
       where professional_id = pp.profile_id
         and status = 'completed'),
      0
    ) as total_completed_bookings

  from public.professional_profiles pp
  inner join public.profiles p on pp.profile_id = p.id
  where p.account_status = 'active'
  order by rating desc nulls last, review_count desc;
end;
$$;

-- Grant execute permission
grant execute on function public.list_active_professionals(numeric, numeric) to authenticated;

-- Comments
comment on function public.list_active_professionals is 'Week 7-8: Lists active professionals with safety metrics (on-time rate, acceptance rate)';
