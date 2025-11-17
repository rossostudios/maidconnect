-- CMS Migration Cleanup - Drop Migrated Tables
--
-- Run this SQL in Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- Tables being dropped:
-- - help_search_analytics (analytics moved to PostHog)
-- - help_article_tags (tags migrated to Sanity)
-- - changelog_entries (changelog migrated to Sanity)
--
-- Tables PRESERVED:
-- - help_articles (stores engagement metrics: view_count, helpful_count, not_helpful_count)

DROP TABLE IF EXISTS help_search_analytics CASCADE;
DROP TABLE IF EXISTS help_article_tags CASCADE;
DROP TABLE IF EXISTS changelog_entries CASCADE;
