-- =====================================================
-- Validation Queries for Multi-Country Data Model
-- =====================================================
-- Run these queries after applying migrations to verify data integrity

-- =====================================================
-- 1. Verify all profiles have country_code and city_id
-- =====================================================

-- Check profiles table
SELECT
  'profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(country_code) as with_country,
  COUNT(city_id) as with_city,
  COUNT(*) - COUNT(country_code) as missing_country,
  COUNT(*) - COUNT(city_id) as missing_city
FROM profiles;

-- Check professional_profiles table
SELECT
  'professional_profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(country_code) as with_country,
  COUNT(city_id) as with_city,
  COUNT(*) - COUNT(country_code) as missing_country,
  COUNT(*) - COUNT(city_id) as missing_city
FROM professional_profiles;

-- Check bookings table
SELECT
  'bookings' as table_name,
  COUNT(*) as total_rows,
  COUNT(country_code) as with_country,
  COUNT(city_id) as with_city,
  COUNT(*) - COUNT(country_code) as missing_country,
  COUNT(*) - COUNT(city_id) as missing_city
FROM bookings;

-- =====================================================
-- 2. Verify currency matches country for all bookings
-- =====================================================

SELECT
  'currency_mismatch' as check_name,
  COUNT(*) as violations,
  ARRAY_AGG(id) FILTER (WHERE violations > 0) as booking_ids
FROM (
  SELECT
    id,
    CASE
      WHEN (country_code = 'CO' AND currency != 'COP') THEN 1
      WHEN (country_code = 'PY' AND currency != 'PYG') THEN 1
      WHEN (country_code = 'UY' AND currency != 'UYU') THEN 1
      WHEN (country_code = 'AR' AND currency != 'ARS') THEN 1
      ELSE 0
    END as violations
  FROM bookings
) sub;

-- =====================================================
-- 3. Check for cross-country bookings
-- =====================================================

SELECT
  'cross_country_bookings' as check_name,
  COUNT(*) as violations,
  ARRAY_AGG(b.id) as booking_ids
FROM bookings b
JOIN profiles p ON p.id = b.customer_id
WHERE
  b.customer_id IS NOT NULL
  AND p.country_code != b.country_code;

-- =====================================================
-- 4. Verify payout tables have correct structure
-- =====================================================

-- Check payout_batches
SELECT
  'payout_batches' as table_name,
  COUNT(*) as total_rows,
  COUNT(country_code) as with_country,
  COUNT(currency_code) as with_currency,
  COUNT(*) - COUNT(country_code) as missing_country,
  COUNT(*) - COUNT(currency_code) as missing_currency
FROM payout_batches;

-- Check payout_transfers
SELECT
  'payout_transfers' as table_name,
  COUNT(*) as total_rows,
  COUNT(country_code) as with_country,
  COUNT(currency_code) as with_currency,
  COUNT(*) - COUNT(country_code) as missing_country,
  COUNT(*) - COUNT(currency_code) as missing_currency
FROM payout_transfers;

-- =====================================================
-- 5. Verify admin assigned_countries
-- =====================================================

SELECT
  'admin_assigned_countries' as check_name,
  COUNT(*) FILTER (WHERE role = 'admin' AND assigned_countries IS NULL) as admins_without_countries,
  COUNT(*) FILTER (WHERE role = 'admin' AND assigned_countries IS NOT NULL) as admins_with_countries,
  COUNT(*) FILTER (WHERE role != 'admin' AND assigned_countries IS NOT NULL) as non_admins_with_countries
FROM profiles;

-- =====================================================
-- 6. Distribution by country
-- =====================================================

-- Profiles by country
SELECT
  'profiles' as table_name,
  country_code,
  COUNT(*) as count
FROM profiles
GROUP BY country_code
ORDER BY count DESC;

-- Professional profiles by country
SELECT
  'professional_profiles' as table_name,
  country_code,
  COUNT(*) as count
FROM professional_profiles
GROUP BY country_code
ORDER BY count DESC;

-- Bookings by country
SELECT
  'bookings' as table_name,
  country_code,
  COUNT(*) as count,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
FROM bookings
GROUP BY country_code
ORDER BY count DESC;

-- =====================================================
-- 7. Check for orphaned data (cities without countries)
-- =====================================================

SELECT
  'orphaned_cities' as check_name,
  COUNT(*) as violations,
  ARRAY_AGG(c.id) as city_ids
FROM cities c
LEFT JOIN countries co ON co.code = c.country_code
WHERE co.code IS NULL;

-- =====================================================
-- 8. Verify RLS policies are working
-- =====================================================

-- This query should be run as different users to test RLS
-- For now, just check that policies exist

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual IS NOT NULL as has_using_clause,
  with_check IS NOT NULL as has_with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'professional_profiles', 'bookings', 'payout_batches', 'payout_transfers')
ORDER BY tablename, policyname;

-- =====================================================
-- 9. Expected Results Summary
-- =====================================================

/*
Expected Results After Migration:

1. All rows in profiles, professional_profiles, bookings should have country_code and city_id
2. Zero currency mismatches in bookings
3. Zero cross-country bookings (customer and professional in different countries)
4. All payout_batches and payout_transfers have country_code and currency_code
5. All admin users have assigned_countries (defaulted to all 4 countries)
6. No orphaned cities (all cities have valid country_code FK)
7. RLS policies exist for all tables with "country_aware" suffix

If any violations are found, investigate before proceeding to drop legacy columns.
*/
