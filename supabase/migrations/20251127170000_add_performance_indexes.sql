-- Migration: Add Performance Indexes
-- Created: 2024-11-27
-- Purpose: Optimize common dashboard and directory queries

-- ============================================================================
-- BOOKINGS TABLE INDEXES
-- ============================================================================

-- Index for dashboard queries: Filter by status, order by created_at
CREATE INDEX IF NOT EXISTS idx_bookings_status_created
  ON bookings(status, created_at DESC);

-- Index for professional-specific booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_professional_status
  ON bookings(professional_id, status);

-- Index for customer booking history
CREATE INDEX IF NOT EXISTS idx_bookings_customer_status
  ON bookings(customer_id, status);

-- Index for date range queries (availability, scheduling)
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_start
  ON bookings(scheduled_start, status);

-- Composite index for professional availability checks
CREATE INDEX IF NOT EXISTS idx_bookings_professional_start_status
  ON bookings(professional_id, scheduled_start, status);

-- ============================================================================
-- PROFESSIONAL_PROFILES TABLE INDEXES
-- ============================================================================

-- Index for directory listings (verified professionals)
CREATE INDEX IF NOT EXISTS idx_professionals_verified_status
  ON professional_profiles(status, created_at DESC)
  WHERE status = 'verified';

-- Index for city-based directory queries
CREATE INDEX IF NOT EXISTS idx_professionals_city_status
  ON professional_profiles(city_id, status)
  WHERE status = 'verified';

-- Index for profile lookup by slug (vanity URLs)
CREATE INDEX IF NOT EXISTS idx_professionals_slug
  ON professional_profiles(slug)
  WHERE slug IS NOT NULL;

-- ============================================================================
-- PROFESSIONAL_REVIEWS TABLE INDEXES
-- ============================================================================

-- Index for professional review lookups
CREATE INDEX IF NOT EXISTS idx_professional_reviews_professional_created
  ON professional_reviews(professional_id, created_at DESC);

-- Index for customer-written reviews
CREATE INDEX IF NOT EXISTS idx_professional_reviews_customer_created
  ON professional_reviews(customer_id, created_at DESC);

-- ============================================================================
-- CUSTOMER_REVIEWS TABLE INDEXES
-- ============================================================================

-- Index for customer review lookups
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_created
  ON customer_reviews(customer_id, created_at DESC);

-- Index for professional-written customer reviews
CREATE INDEX IF NOT EXISTS idx_customer_reviews_professional_created
  ON customer_reviews(professional_id, created_at DESC);

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================================================

-- Index for unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- Index for all user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- ============================================================================
-- MESSAGES TABLE INDEXES
-- ============================================================================

-- Index for conversation message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================
ANALYZE bookings;
ANALYZE professional_profiles;
ANALYZE professional_reviews;
ANALYZE customer_reviews;
ANALYZE notifications;
ANALYZE messages;
