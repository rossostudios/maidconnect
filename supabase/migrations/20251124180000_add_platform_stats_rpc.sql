-- Migration: Add RPC function for efficient platform stats aggregation
-- This replaces inefficient JavaScript-based AVG calculation with database-level aggregation

-- Function to get average rating efficiently using SQL AVG()
CREATE OR REPLACE FUNCTION public.get_average_professional_rating()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(ROUND(AVG(ppm.average_rating)::numeric, 1), 4.9)
  FROM public.professional_profiles pp
  JOIN public.professional_performance_metrics ppm ON pp.profile_id = ppm.profile_id
  WHERE pp.status = 'active'
    AND ppm.average_rating IS NOT NULL;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_average_professional_rating() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_average_professional_rating() TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_average_professional_rating() IS
  'Returns the average rating of all active professionals. Uses SQL AVG() for efficiency instead of fetching all rows to JavaScript.';
