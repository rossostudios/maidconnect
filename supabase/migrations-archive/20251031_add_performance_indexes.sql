-- Add performance indexes for common query patterns
-- This migration creates indexes to optimize frequently queried tables
-- Based on performance analysis showing 200+ unnecessary API calls

-- =====================================================
-- BOOKINGS TABLE INDEXES
-- =====================================================

-- Index for customer bookings queries (dashboard, history)
-- Covers: WHERE customer_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_bookings_customer_created
ON bookings(customer_id, created_at DESC);

-- Index for professional bookings queries (dashboard, schedule)
-- Covers: WHERE professional_id = ? ORDER BY scheduled_start DESC
CREATE INDEX IF NOT EXISTS idx_bookings_professional_scheduled
ON bookings(professional_id, scheduled_start DESC);

-- Index for bookings by status (for analytics, filtering)
-- Covers: WHERE status = ? AND (customer_id or professional_id)
CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings(status, created_at DESC);


-- =====================================================
-- MESSAGES TABLE INDEXES
-- =====================================================

-- Note: Messages table structure:
-- - conversation_id (FK to conversations)
-- - sender_id (FK to profiles)
-- - message (text)
-- - read_at (timestamptz, null = unread)
-- - created_at (timestamptz)

-- The existing idx_messages_conversation and idx_messages_unread indexes
-- from the original migration are sufficient. Adding complementary indexes:

-- Index for sender's message history
-- Covers: WHERE sender_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_sender_history
ON messages(sender_id, created_at DESC);


-- =====================================================
-- CONVERSATIONS TABLE INDEXES
-- =====================================================

-- Index for customer's conversations
-- Covers: WHERE customer_id = ? ORDER BY last_message_at DESC
CREATE INDEX IF NOT EXISTS idx_conversations_customer_recent
ON conversations(customer_id, last_message_at DESC);

-- Index for professional's conversations
-- Covers: WHERE professional_id = ? ORDER BY last_message_at DESC
CREATE INDEX IF NOT EXISTS idx_conversations_professional_recent
ON conversations(professional_id, last_message_at DESC);

-- Index for conversations by booking
-- Already exists as unique index from original migration


-- =====================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================

-- The existing notifications_user_id_idx and notifications_user_read_idx
-- from the original migration cover most queries. Adding specific unread index:

-- Index for unread notifications count (CRITICAL - fixes excessive API calls)
-- Covers: WHERE user_id = ? AND read_at IS NULL
CREATE INDEX IF NOT EXISTS idx_notifications_unread_count
ON notifications(user_id, read_at)
WHERE read_at IS NULL;


-- =====================================================
-- PROFESSIONAL_PROFILES TABLE INDEXES
-- =====================================================

-- Note: professional_profiles table structure:
-- - profile_id (PK, FK to profiles)
-- - status (text: 'draft', 'active', etc.)
-- - bio, services, verification_level, etc.
-- - No deleted_at column

-- Index for active professionals (professionals directory)
-- Covers: WHERE status = 'active' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_professional_profiles_active
ON professional_profiles(status, created_at DESC)
WHERE status = 'active';

-- Index for professional lookup by profile_id (already have PK, this is redundant)
-- No additional index needed


-- =====================================================
-- PROFESSIONAL_REVIEWS TABLE INDEXES
-- (Reviews written by customers about professionals)
-- =====================================================

-- Index for professional's reviews
-- Covers: WHERE professional_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_professional_reviews_by_pro
ON professional_reviews(professional_id, created_at DESC);

-- Index for customer's review history
-- Covers: WHERE customer_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_professional_reviews_by_customer
ON professional_reviews(customer_id, created_at DESC);


-- =====================================================
-- CUSTOMER_REVIEWS TABLE INDEXES
-- (Reviews written by professionals about customers)
-- =====================================================

-- Index for customer's reviews (written about them)
-- Covers: WHERE customer_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_customer_reviews_by_customer
ON customer_reviews(customer_id, created_at DESC);

-- Index for professional's review history (written by them)
-- Covers: WHERE professional_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_customer_reviews_by_professional
ON customer_reviews(professional_id, created_at DESC);


-- =====================================================
-- ANALYTICS AND MONITORING
-- =====================================================

-- Add comments for documentation
COMMENT ON INDEX idx_notifications_unread_count IS
'Critical performance index for unread notification counts. Part of TanStack Query optimization. Reduces API calls from 200+ to <10.';

COMMENT ON INDEX idx_bookings_customer_created IS
'Optimizes customer dashboard bookings queries with WHERE customer_id + ORDER BY created_at.';

COMMENT ON INDEX idx_bookings_professional_scheduled IS
'Optimizes professional schedule queries with WHERE professional_id + ORDER BY scheduled_start.';

COMMENT ON INDEX idx_professional_profiles_active IS
'Optimizes professionals directory listing for active professionals.';

COMMENT ON INDEX idx_professional_reviews_by_pro IS
'Optimizes loading reviews for a professional profile page.';

COMMENT ON INDEX idx_customer_reviews_by_customer IS
'Optimizes loading reviews about a specific customer.';

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename IN ('bookings', 'messages', 'conversations', 'notifications', 'professional_profiles', 'professional_reviews', 'customer_reviews')
ORDER BY tablename, indexname;
