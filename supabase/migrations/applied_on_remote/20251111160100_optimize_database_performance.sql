-- Migration: Database Performance Optimizations
-- Description: Adds indexes for frequently queried columns and optimizes database schema
-- Performance: Improves query performance for common operations
-- Date: 2025-01-11

-- ============================================================================
-- Performance Indexes for Bookings
-- ============================================================================

-- Booking status queries (very common)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Booking date range queries (calendar, availability)
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON bookings(end_time);

-- Combined index for professional availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_pro_date_status
  ON bookings(professional_id, booking_date, status);

-- Combined index for customer booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_customer_date_status
  ON bookings(customer_id, booking_date, status);

-- Location-based queries
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location);
CREATE INDEX IF NOT EXISTS idx_bookings_city ON bookings(city);

-- Created at for chronological sorting
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- ============================================================================
-- Performance Indexes for Professionals
-- ============================================================================

-- Professional search by location
CREATE INDEX IF NOT EXISTS idx_professionals_city ON profiles(city) WHERE role = 'professional';
CREATE INDEX IF NOT EXISTS idx_professionals_status ON profiles(professional_status) WHERE role = 'professional';

-- Combined index for active professional queries
CREATE INDEX IF NOT EXISTS idx_professionals_city_status
  ON profiles(city, professional_status) WHERE role = 'professional';

-- Service type queries (if you have a services table)
-- CREATE INDEX IF NOT EXISTS idx_professional_services_service_type ON professional_services(service_type);
-- CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id ON professional_services(professional_id);

-- ============================================================================
-- Performance Indexes for Reviews
-- ============================================================================

-- Review queries by professional (most common)
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON reviews(professional_id);

-- Review status for moderation
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Combined index for approved reviews by professional
CREATE INDEX IF NOT EXISTS idx_reviews_pro_status_created
  ON reviews(professional_id, status, created_at DESC);

-- ============================================================================
-- Performance Indexes for Messages
-- ============================================================================

-- Conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Combined index for conversation messages chronologically
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages(conversation_id, created_at DESC);

-- Unread messages
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON messages(is_read);

-- ============================================================================
-- Performance Indexes for Payments
-- ============================================================================

-- Payment queries by booking
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);

-- Payment status for reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Stripe payment intent lookup
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- Payment date for reporting
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- Performance Indexes for User Profiles
-- ============================================================================

-- Email lookup (authentication)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Account status
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- ============================================================================
-- Performance Indexes for Notifications
-- ============================================================================

-- User notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(is_read);

-- Combined index for user unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- Performance Indexes for Availability
-- ============================================================================

-- Professional availability queries
CREATE INDEX IF NOT EXISTS idx_availability_professional_id ON professional_availability(professional_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON professional_availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON professional_availability(day_of_week);

-- Combined index for availability lookups
CREATE INDEX IF NOT EXISTS idx_availability_pro_date
  ON professional_availability(professional_id, date);

-- ============================================================================
-- Partial Indexes for Common Filtered Queries
-- ============================================================================

-- Active bookings only (most common query)
CREATE INDEX IF NOT EXISTS idx_bookings_active
  ON bookings(professional_id, booking_date)
  WHERE status IN ('pending', 'confirmed', 'in_progress');

-- Pending professional applications
CREATE INDEX IF NOT EXISTS idx_profiles_pending_professionals
  ON profiles(created_at DESC)
  WHERE role = 'professional' AND professional_status = 'pending';

-- Unresolved disputes
CREATE INDEX IF NOT EXISTS idx_disputes_unresolved
  ON disputes(created_at DESC)
  WHERE status IN ('open', 'investigating');

-- ============================================================================
-- Text Search Indexes (if using PostgreSQL full-text search)
-- ============================================================================

-- Professional search by name and bio
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON profiles USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_bio_trgm ON profiles USING gin(bio gin_trgm_ops);

-- Help article search
CREATE INDEX IF NOT EXISTS idx_help_articles_title_trgm ON help_articles USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_help_articles_content_trgm ON help_articles USING gin(content gin_trgm_ops);

-- ============================================================================
-- Statistics Update
-- ============================================================================

-- Analyze tables to update query planner statistics
ANALYZE bookings;
ANALYZE profiles;
ANALYZE reviews;
ANALYZE messages;
ANALYZE payments;
ANALYZE notifications;
ANALYZE professional_availability;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON INDEX idx_bookings_pro_date_status IS
  'Optimizes professional calendar and availability queries';

COMMENT ON INDEX idx_bookings_customer_date_status IS
  'Optimizes customer booking history queries';

COMMENT ON INDEX idx_reviews_pro_status_created IS
  'Optimizes approved review display on professional profiles';

COMMENT ON INDEX idx_messages_conversation_created IS
  'Optimizes message thread display with chronological ordering';

COMMENT ON INDEX idx_notifications_user_unread IS
  'Optimizes unread notification badge counts';
