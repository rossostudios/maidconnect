-- Migration: Add missing foreign key indexes
-- Purpose: Improve JOIN performance on FK relationships (10-100x speedup)
-- Tables: 9 tables identified with missing indexes on FK columns
-- Applied: 2025-11-24 via execute_sql (CONCURRENTLY outside transaction)

-- 1. customer_profiles.profile_id -> profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_profile_id
ON customer_profiles(profile_id);

-- 2. disputes.assigned_to -> profiles
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_to
ON disputes(assigned_to);

-- 3. disputes.resolved_by -> profiles
CREATE INDEX IF NOT EXISTS idx_disputes_resolved_by
ON disputes(resolved_by);

-- 4. help_search_analytics.clicked_article_id -> help_articles
CREATE INDEX IF NOT EXISTS idx_help_search_analytics_clicked_article
ON help_search_analytics(clicked_article_id);

-- 5. professional_performance_metrics.profile_id -> profiles
CREATE INDEX IF NOT EXISTS idx_professional_performance_metrics_profile
ON professional_performance_metrics(profile_id);

-- 6. professional_profiles.profile_id -> profiles
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profile_id
ON professional_profiles(profile_id);

-- 7. professional_revenue_snapshots.profile_id -> profiles
CREATE INDEX IF NOT EXISTS idx_professional_revenue_snapshots_profile
ON professional_revenue_snapshots(profile_id);

-- 8. professional_services.category_id -> service_categories
CREATE INDEX IF NOT EXISTS idx_professional_services_category
ON professional_services(category_id);

-- 9. user_blocks.blocker_id -> profiles
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker
ON user_blocks(blocker_id);

-- Update statistics for query planner optimization
ANALYZE customer_profiles;
ANALYZE disputes;
ANALYZE help_search_analytics;
ANALYZE professional_performance_metrics;
ANALYZE professional_profiles;
ANALYZE professional_revenue_snapshots;
ANALYZE professional_services;
ANALYZE user_blocks;
