-- ============================================
-- CASAORA RLS PERFORMANCE ANALYSIS
-- ============================================
-- Analyzes Row-Level Security policies for performance issues
-- RLS can be a major bottleneck if not optimized properly
-- ============================================

\echo '============================================'
\echo 'RLS PERFORMANCE ANALYSIS'
\echo '============================================'

-- ============================================
-- 1. TABLES WITH RLS ENABLED
-- ============================================
\echo ''
\echo '1. Tables with RLS Enabled:'
\echo '----------------------------------------'

SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = true
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 2. RLS POLICIES PER TABLE
-- ============================================
\echo ''
\echo '2. RLS Policies Per Table:'
\echo '----------------------------------------'

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS command,
    qual AS using_clause,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 3. COMPLEX RLS POLICIES (Performance Risk)
-- ============================================
\echo ''
\echo '3. Complex RLS Policies (Potential Performance Issues):'
\echo '----------------------------------------'
\echo 'Policies with subqueries or function calls can be slow'

SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN qual LIKE '%SELECT%' THEN 'Contains Subquery'
        WHEN qual LIKE '%()%' THEN 'Contains Function Call'
        ELSE 'Simple Expression'
    END AS complexity,
    qual AS using_clause
FROM pg_policies
WHERE schemaname = 'public'
    AND (qual LIKE '%SELECT%' OR qual LIKE '%()%')
ORDER BY tablename, policyname;

-- ============================================
-- 4. RECOMMENDED INDEXES FOR RLS POLICIES
-- ============================================
\echo ''
\echo '4. Common RLS Pattern Index Recommendations:'
\echo '----------------------------------------'

\echo 'Creating indexes for common RLS patterns (auth.uid() checks)...'

-- Bookings - customer and professional access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer_id_rls
ON bookings(customer_id)
WHERE customer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_professional_id_rls
ON bookings(professional_id)
WHERE professional_id IS NOT NULL;

-- Professional profiles - owner access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professional_profiles_user_id_rls
ON professional_profiles(user_id)
WHERE user_id IS NOT NULL;

-- Profiles - self access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_rls
ON profiles(id)
WHERE id IS NOT NULL;

-- Payment intents - customer and professional access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_intents_customer_id_rls
ON payment_intents(customer_id)
WHERE customer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_intents_professional_id_rls
ON payment_intents(professional_id)
WHERE professional_id IS NOT NULL;

-- Reviews - professional and customer access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_reviews_professional_id_rls
ON customer_reviews(professional_id)
WHERE professional_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_reviews_customer_id_rls
ON customer_reviews(customer_id)
WHERE customer_id IS NOT NULL;

\echo '✓ RLS indexes created'

-- ============================================
-- 5. RLS BYPASS RECOMMENDATION
-- ============================================
\echo ''
\echo '5. RLS Bypass Recommendation for Service Role:'
\echo '----------------------------------------'
\echo 'For API routes using service role key, RLS is automatically bypassed'
\echo 'Consider using service role for:'
\echo '  - Admin operations'
\echo '  - Background jobs (cron)'
\echo '  - Webhooks'
\echo '  - Analytics queries'
\echo ''
\echo 'RLS should be used for:'
\echo '  - Direct client queries'
\echo '  - User-facing features'
\echo '  - Data security requirements'

-- ============================================
-- 6. PRIVATE SCHEMA HELPER FUNCTIONS
-- ============================================
\echo ''
\echo '6. Creating Private Schema Helper Functions:'
\echo '----------------------------------------'
\echo 'These functions can improve RLS performance by caching auth.uid()'

-- Create private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Helper function to get current user ID (cached within transaction)
CREATE OR REPLACE FUNCTION private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
    SELECT auth.uid();
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    );
$$;

-- Helper function to check if user is professional
CREATE OR REPLACE FUNCTION private.is_professional()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM professional_profiles
        WHERE user_id = auth.uid()
        AND verification_status = 'approved'
    );
$$;

\echo '✓ Private schema helper functions created'

\echo ''
\echo '============================================'
\echo 'RLS PERFORMANCE ANALYSIS COMPLETE'
\echo '============================================'
\echo ''
\echo 'Recommendations:'
\echo '  1. Replace auth.uid() with private.current_user_id() in RLS policies'
\echo '  2. Create indexes on all columns used in RLS policies'
\echo '  3. Use service role for admin/background operations'
\echo '  4. Simplify complex RLS policies with helper functions'
\echo '  5. Test RLS policy performance with EXPLAIN ANALYZE'
\echo ''
\echo 'Example Optimized RLS Policy:'
\echo '  CREATE POLICY "Users can view their own bookings"'
\echo '    ON bookings FOR SELECT'
\echo '    USING (customer_id = private.current_user_id());'
\echo '============================================'
