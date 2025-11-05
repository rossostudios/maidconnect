/**
 * Fix extension_in_public warnings - SKIP THIS MIGRATION
 *
 * Issue: Extensions in public schema trigger warnings
 * Recommendation: SKIP - This is a WARN level issue, not critical
 *
 * Why skip:
 * 1. Moving extensions requires CASCADE drops of dependent objects
 * 2. Many production apps keep extensions in public schema
 * 3. Benefit is minimal compared to risk
 * 4. Would require recreating all PostGIS geometry columns and indexes
 *
 * Alternative: Accept the warnings or apply in development environment first
 *
 * If you still want to proceed:
 * 1. Test thoroughly in development
 * 2. Backup production database
 * 3. Run during low-traffic period
 * 4. Have rollback plan ready
 */

-- Commented out - DO NOT RUN without thorough testing

/*
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;

-- This would require CASCADE and rebuilding all dependent objects
-- DROP EXTENSION IF EXISTS pg_trgm CASCADE;
-- CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- DROP EXTENSION IF EXISTS postgis CASCADE;
-- CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
*/

-- ============================================
-- SUMMARY
-- ============================================

COMMENT ON SCHEMA public IS 'Skipped moving extensions from public schema - accept WARN level advisor notices';
