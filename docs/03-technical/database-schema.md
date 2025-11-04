# Database Schema Documentation

Complete database schema for Casaora, documenting all tables, relationships, functions, and compliance requirements.

## Overview

**Database Type**: PostgreSQL (Supabase)
**Total Tables**: 21
**Total Functions**: 20+
**Extensions**: uuid-ossp, pg_cron, pg_net

---

## Table of Contents

- [Core Tables](#core-tables)
- [Messaging & Communication](#messaging--communication)
- [Notification Tables](#notification-tables)
- [Admin & Moderation](#admin--moderation)
- [Recurring Bookings](#recurring-bookings)
- [System Tables](#system-tables)
- [Stored Functions & Triggers](#stored-functions--triggers)
- [Relationships Diagram](#relationships-diagram)
- [Enums & Types](#enums--types)
- [JSONB Field Structures](#jsonb-field-structures)
- [Compliance & Security](#compliance--security)

---

## Core Tables

### profiles
**Purpose**: Base user profile table for all users (customers, professionals, admins)

**Primary Key**: `id` (UUID, references `auth.users.id`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK: auth.users.id ON DELETE CASCADE | User ID from Supabase Auth |
| role | TEXT | NOT NULL, CHECK('customer', 'professional', 'admin') | User role |
| locale | TEXT | NOT NULL, DEFAULT 'en-US' | Language/locale preference |
| phone | TEXT | | Phone number |
| country | TEXT | | Country of residence |
| city | TEXT | | City of residence |
| full_name | TEXT | | User's full name |
| avatar_url | TEXT | | Profile avatar URL (Supabase Storage) |
| onboarding_status | TEXT | NOT NULL, DEFAULT 'application_pending' | Onboarding progress |
| stripe_customer_id | TEXT | UNIQUE | Stripe customer ID |
| privacy_policy_accepted | BOOLEAN | DEFAULT FALSE | Ley 1581 compliance |
| privacy_policy_accepted_at | TIMESTAMPTZ | | Acceptance timestamp |
| terms_accepted | BOOLEAN | DEFAULT FALSE | Terms of service acceptance |
| terms_accepted_at | TIMESTAMPTZ | | Acceptance timestamp |
| data_processing_consent | BOOLEAN | DEFAULT FALSE | Data processing consent |
| data_processing_consent_at | TIMESTAMPTZ | | Consent timestamp |
| marketing_consent | BOOLEAN | DEFAULT FALSE | Marketing opt-in |
| marketing_consent_at | TIMESTAMPTZ | | Consent timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `profiles_stripe_customer_id_idx` - Stripe lookups
- `idx_profiles_marketing_consent` - Marketing queries

**RLS Policies**:
- SELECT: Users view own profile only
- UPDATE: Users update own profile only

**Triggers**:
- `protect_required_consents_trigger` - Prevents revoking privacy/terms/data consents

---

### professional_profiles
**Purpose**: Specialized profile for cleaning professionals

**Primary Key**: `profile_id` (UUID, references `profiles.id`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| profile_id | UUID | PK, FK: profiles.id ON DELETE CASCADE | Professional's profile ID |
| status | TEXT | DEFAULT 'draft' | draft, profile_submitted, approved, active |
| bio | TEXT | | Professional bio |
| full_name | TEXT | | Full name |
| id_number | TEXT | | Government ID number |
| experience_years | INTEGER | | Years of experience |
| primary_services | TEXT[] | DEFAULT '{}' | Service categories |
| rate_expectations | JSONB | DEFAULT '{}' | Expected hourly rates |
| languages | TEXT[] | DEFAULT '{}' | Languages spoken |
| references_data | JSONB | DEFAULT '[]' | Client references |
| consent_background_check | BOOLEAN | DEFAULT FALSE | Background check consent |
| verification_level | TEXT | DEFAULT 'none' | none, basic, verified, professional |
| onboarding_completed_at | TIMESTAMPTZ | | Completion timestamp |
| services | JSONB | DEFAULT '[]' | Available services |
| portfolio_images | JSONB | DEFAULT '[]' | Portfolio images |
| featured_work | TEXT | | Featured work description |
| stripe_connect_account_id | TEXT | | Stripe Connect account ID |
| stripe_connect_onboarding_status | TEXT | DEFAULT 'not_started' | Onboarding status |
| stripe_connect_last_refresh | TIMESTAMPTZ | | Last refresh timestamp |
| instant_booking_enabled | BOOLEAN | DEFAULT FALSE | Enable instant booking |
| instant_booking_settings | JSONB | DEFAULT '{}' | Instant booking rules |
| availability_settings | JSONB | DEFAULT '{}' | Working hours, buffer times |
| blocked_dates | JSONB | DEFAULT '[]' | Unavailable dates |
| specialties | TEXT[] | | Specialties |
| hourly_rate_min | NUMERIC | | Minimum hourly rate |
| hourly_rate_max | NUMERIC | | Maximum hourly rate |
| service_radius_km | NUMERIC | | Service area radius |
| location_latitude | NUMERIC | | Latitude for distance calc |
| location_longitude | NUMERIC | | Longitude for distance calc |
| service_areas | TEXT[] | | Service area names |
| verified | BOOLEAN | | Verification status |
| notification_preferences | JSONB | DEFAULT '{"newBookingRequest": true}' | Notification prefs |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_professional_portfolio` (GIN) - Portfolio queries
- `idx_professional_status` - Status queries

**RLS Policies**:
- SELECT: Users view own professional profile
- UPDATE: Users update own professional profile
- INSERT: Professionals create own profile

---

### customer_profiles
**Purpose**: Specialized profile for customers

**Primary Key**: `profile_id` (UUID, references `profiles.id`)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| profile_id | UUID | PK, FK: profiles.id ON DELETE CASCADE | Customer's profile ID |
| verification_tier | TEXT | DEFAULT 'basic' | Verification level |
| property_preferences | JSONB | DEFAULT '{}' | Property-specific prefs |
| default_address | JSONB | | Default service address |
| saved_addresses | JSONB | DEFAULT '[]' | Saved addresses array |
| booking_preferences | JSONB | DEFAULT '{}' | Default booking prefs |
| favorite_professionals | UUID[] | DEFAULT '{}' | Favorite professional IDs |
| notification_preferences | JSONB | DEFAULT '{"bookingConfirmed": true}' | Notification prefs |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_customer_favorites` (GIN) - Favorite professional queries

**RLS Policies**:
- SELECT: Users view own customer profile
- UPDATE: Users update own customer profile

---

### bookings
**Purpose**: Track all booking requests, payments, and service execution

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Booking ID |
| customer_id | UUID | NOT NULL, FK: profiles.id ON DELETE CASCADE | Customer |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id RESTRICT | Professional |
| status | TEXT | NOT NULL, DEFAULT 'pending_payment' | Booking status |
| scheduled_start | TIMESTAMPTZ | | Scheduled start time |
| scheduled_end | TIMESTAMPTZ | | Scheduled end time |
| duration_minutes | INTEGER | | Planned duration |
| actual_duration_minutes | INTEGER | | Actual duration |
| currency | TEXT | NOT NULL, DEFAULT 'cop' | Currency code |
| amount_estimated | INTEGER | | Estimated cost (cents) |
| amount_authorized | INTEGER | | Authorized amount |
| amount_captured | INTEGER | | Captured amount |
| service_name | TEXT | | Service name/type |
| service_hourly_rate | INTEGER | | Hourly rate |
| address | JSONB | | Service address |
| special_instructions | TEXT | | Special requests |
| selected_addons | JSONB | DEFAULT '[]' | Service add-ons |
| addons_total_amount | INTEGER | DEFAULT 0 | Add-ons total |
| checked_in_at | TIMESTAMPTZ | | Check-in timestamp |
| checked_out_at | TIMESTAMPTZ | | Check-out timestamp |
| check_in_latitude | DECIMAL(10,7) | | GPS latitude at check-in |
| check_in_longitude | DECIMAL(10,7) | | GPS longitude at check-in |
| check_out_latitude | DECIMAL(10,7) | | GPS latitude at check-out |
| check_out_longitude | DECIMAL(10,7) | | GPS longitude at check-out |
| time_extension_minutes | INTEGER | DEFAULT 0 | Extension time |
| time_extension_amount | INTEGER | DEFAULT 0 | Extension charge |
| completion_notes | TEXT | | Completion notes |
| declined_reason | TEXT | | Decline reason |
| declined_at | TIMESTAMPTZ | | Decline timestamp |
| canceled_reason | TEXT | | Cancel reason |
| canceled_at | TIMESTAMPTZ | | Cancel timestamp |
| canceled_by | UUID | FK: profiles.id | Who canceled |
| completed_at | TIMESTAMPTZ | | Completion timestamp |
| is_recurring | BOOLEAN | DEFAULT FALSE | Part of recurring series |
| recurrence_pattern | JSONB | | Recurrence pattern |
| parent_booking_id | UUID | FK: bookings.id SET NULL | Parent recurring booking |
| recurrence_instance_number | INTEGER | | Occurrence number |
| recurrence_status | TEXT | CHECK('active', 'paused', 'cancelled') | Series status |
| included_in_payout_id | UUID | FK: payouts.id SET NULL | Payout reference |
| stripe_payment_intent_id | TEXT | UNIQUE (WHERE NOT NULL) | Stripe payment ID |
| stripe_payment_status | TEXT | | Stripe payment status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Booking Statuses**:
- `pending_payment` - Awaiting payment
- `authorized` - Payment authorized, awaiting professional acceptance
- `confirmed` - Professional confirmed
- `in_progress` - Service in progress
- `completed` - Service completed
- `declined` - Professional declined
- `canceled` - Customer canceled

**Indexes**:
- `bookings_customer_id_idx`, `bookings_professional_id_idx` - User queries
- `bookings_status_idx` - Status queries
- `bookings_stripe_payment_intent_id_idx` (UNIQUE) - Stripe matching
- `idx_bookings_recurring` - Recurring booking queries
- `idx_bookings_included_in_payout_id` - Payout tracking

**Triggers**:
- `bookings_set_updated_at` - Auto-updates `updated_at`
- `set_completed_at_trigger` - Sets `completed_at` on completion

---

### professional_documents
**Purpose**: Store uploaded verification documents (IDs, certifications, background checks)

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Document ID |
| profile_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| document_type | TEXT | NOT NULL | 'id', 'certification', 'background_check' |
| storage_path | TEXT | NOT NULL | Supabase Storage path |
| status | TEXT | NOT NULL, DEFAULT 'uploaded' | uploaded, verified, rejected, expired |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| uploaded_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Upload timestamp |

**RLS Policies**:
- SELECT: Professionals view own documents
- INSERT/DELETE: Professionals manage own documents

---

### professional_reviews
**Purpose**: Customer ratings and reviews for professionals

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Review ID |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| customer_id | UUID | NOT NULL, FK: profiles.id CASCADE | Customer |
| reviewer_name | TEXT | | Reviewer name |
| rating | INTEGER | NOT NULL, CHECK(1-5) | Star rating |
| title | TEXT | | Review title |
| comment | TEXT | | Review text |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**RLS Policies**:
- SELECT: Anyone can view reviews
- INSERT: Customers who had booking can leave review

---

### customer_reviews
**Purpose**: Professional reviews of customer behavior

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Review ID |
| customer_id | UUID | NOT NULL, FK: profiles.id CASCADE | Customer |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| booking_id | UUID | NOT NULL, FK: bookings.id CASCADE | Associated booking |
| rating | INTEGER | NOT NULL, CHECK(1-5) | Overall rating |
| title | TEXT | | Review title |
| comment | TEXT | | Review text |
| punctuality_rating | INTEGER | CHECK(1-5) | Punctuality rating |
| communication_rating | INTEGER | CHECK(1-5) | Communication rating |
| respectfulness_rating | INTEGER | CHECK(1-5) | Respectfulness rating |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Unique Constraint**: One review per booking per professional

**Triggers**:
- `customer_reviews_set_updated_at` - Auto-updates `updated_at`

---

### payouts
**Purpose**: Track professional earnings and payout processing

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Payout ID |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| stripe_connect_account_id | TEXT | NOT NULL | Stripe Connect account |
| stripe_payout_id | TEXT | UNIQUE | Stripe payout ID |
| gross_amount | INTEGER | NOT NULL | Total before commission |
| commission_amount | INTEGER | NOT NULL | Platform commission (18%) |
| net_amount | INTEGER | NOT NULL | Amount paid to professional |
| currency | TEXT | NOT NULL, DEFAULT 'COP' | Currency |
| status | TEXT | NOT NULL, DEFAULT 'pending' | pending, processing, paid, failed, canceled |
| payout_date | TIMESTAMPTZ | | Payout initiation date |
| arrival_date | TIMESTAMPTZ | | Expected arrival date |
| failure_reason | TEXT | | Failure reason |
| booking_ids | UUID[] | NOT NULL | Included bookings |
| period_start | TIMESTAMPTZ | NOT NULL | Period start |
| period_end | TIMESTAMPTZ | NOT NULL | Period end |
| notes | TEXT | | Admin notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_payouts_professional_id`, `idx_payouts_status`, `idx_payouts_payout_date`

**Triggers**:
- `payouts_set_updated_at` - Auto-updates `updated_at`

**RLS Policies**:
- SELECT: Professionals view own payouts
- ALL: Service role manages payouts

---

### service_addons
**Purpose**: Optional add-on services professionals can offer

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Add-on ID |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| name | TEXT | NOT NULL | Add-on name |
| description | TEXT | | Description |
| price_cop | INTEGER | NOT NULL, CHECK >= 0 | Price in cents |
| duration_minutes | INTEGER | DEFAULT 0, CHECK >= 0 | Duration |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| display_order | INTEGER | DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_service_addons_professional_id`, `idx_service_addons_active`

**Triggers**:
- `service_addons_set_updated_at` - Auto-updates `updated_at`

---

## Messaging & Communication

### conversations
**Purpose**: Conversation threads between customers and professionals for specific booking

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Conversation ID |
| booking_id | UUID | NOT NULL UNIQUE, FK: bookings.id CASCADE | Associated booking |
| customer_id | UUID | NOT NULL, FK: profiles.id CASCADE | Customer |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| last_message_at | TIMESTAMPTZ | | Last message timestamp |
| customer_unread_count | INTEGER | DEFAULT 0 | Customer unread count |
| professional_unread_count | INTEGER | DEFAULT 0 | Professional unread count |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_conversations_booking` (UNIQUE) - One conversation per booking
- `idx_conversations_customer`, `idx_conversations_professional`

**Triggers**:
- `conversations_set_updated_at` - Auto-updates `updated_at`
- `update_conversation_on_message` - Updates on new message

---

### messages
**Purpose**: Individual messages within conversations

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Message ID |
| conversation_id | UUID | NOT NULL, FK: conversations.id CASCADE | Conversation |
| sender_id | UUID | NOT NULL, FK: profiles.id CASCADE | Sender |
| message | TEXT | NOT NULL | Message content |
| attachments | TEXT[] | DEFAULT '{}' | Attachment URLs |
| read_at | TIMESTAMPTZ | | Read timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_messages_conversation` (conversation_id, created_at DESC)
- `idx_messages_unread` (WHERE read_at IS NULL)

---

## Notification Tables

### notification_subscriptions
**Purpose**: Store web push notification subscriptions (PWA)

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Subscription ID |
| user_id | UUID | NOT NULL, FK: auth.users.id CASCADE | User |
| endpoint | TEXT | NOT NULL | Push service endpoint |
| p256dh | TEXT | NOT NULL | ECDH public key |
| auth | TEXT | NOT NULL | Authentication key |
| user_agent | TEXT | | Browser/device user agent |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Unique Constraint**: `UNIQUE(user_id, endpoint)`

**Triggers**:
- `update_notification_subscriptions_updated_at` - Auto-updates `updated_at`

---

### notifications
**Purpose**: Notification history for users

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Notification ID |
| user_id | UUID | NOT NULL, FK: auth.users.id CASCADE | Recipient |
| title | TEXT | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Notification message |
| url | TEXT | | Deep link URL |
| tag | TEXT | | Notification tag |
| read_at | TIMESTAMPTZ | | Read timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `notifications_user_id_idx`, `notifications_created_at_idx`, `notifications_user_read_idx`

---

## Admin & Moderation

### admin_audit_logs
**Purpose**: Audit trail of all administrative actions

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Log ID |
| admin_id | UUID | NOT NULL, FK: profiles.id CASCADE | Admin |
| action_type | TEXT | NOT NULL | Action type |
| target_user_id | UUID | FK: profiles.id SET NULL | Affected user |
| target_resource_type | TEXT | | Resource type |
| target_resource_id | UUID | | Resource ID |
| details | JSONB | | Action-specific data |
| notes | TEXT | | Admin notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Action timestamp |

**Action Types**: approve_professional, reject_professional, suspend_user, unsuspend_user, ban_user, verify_document, reject_document, resolve_dispute, update_professional_status, manual_payout, other

**Indexes**:
- `idx_admin_audit_logs_admin_id`, `idx_admin_audit_logs_target_user_id`, `idx_admin_audit_logs_action_type`

---

### user_suspensions
**Purpose**: Track suspended and banned users

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Suspension ID |
| user_id | UUID | NOT NULL, FK: profiles.id CASCADE | Suspended user |
| suspended_by | UUID | NOT NULL, FK: profiles.id CASCADE | Admin |
| suspension_type | TEXT | NOT NULL | temporary, permanent, ban |
| reason | TEXT | NOT NULL | Suspension reason |
| details | JSONB | | Additional context |
| suspended_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Suspension timestamp |
| expires_at | TIMESTAMPTZ | | Expiration date |
| lifted_at | TIMESTAMPTZ | | Lift timestamp |
| lifted_by | UUID | FK: profiles.id SET NULL | Admin who lifted |
| lift_reason | TEXT | | Lift reason |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_user_suspensions_user_id`, `idx_user_suspensions_active`

---

### admin_professional_reviews
**Purpose**: Track professional vetting process and approvals

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Review ID |
| professional_id | UUID | NOT NULL, FK: professional_profiles.profile_id CASCADE | Professional |
| reviewed_by | UUID | NOT NULL, FK: profiles.id CASCADE | Admin |
| review_type | TEXT | NOT NULL | application, document, background_check, periodic |
| status | TEXT | NOT NULL | pending, approved, rejected, needs_info |
| documents_verified | BOOLEAN | DEFAULT FALSE | Documents verified |
| background_check_passed | BOOLEAN | | Background check result |
| references_verified | BOOLEAN | | References verified |
| interview_completed | BOOLEAN | | Interview completed |
| notes | TEXT | | Public notes |
| internal_notes | TEXT | | Internal notes |
| rejection_reason | TEXT | | Rejection reason |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |
| reviewed_at | TIMESTAMPTZ | | Review completion date |

---

### disputes
**Purpose**: Customer/professional dispute resolution system

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Dispute ID |
| booking_id | UUID | NOT NULL, FK: bookings.id CASCADE | Booking |
| opened_by | UUID | NOT NULL, FK: profiles.id CASCADE | User who opened |
| opened_by_role | TEXT | NOT NULL | customer or professional |
| dispute_type | TEXT | NOT NULL | Dispute type |
| status | TEXT | NOT NULL, DEFAULT 'open' | open, investigating, resolved, closed |
| priority | TEXT | NOT NULL, DEFAULT 'medium' | low, medium, high, urgent |
| description | TEXT | NOT NULL | Description |
| customer_statement | TEXT | | Customer statement |
| professional_statement | TEXT | | Professional statement |
| evidence_urls | TEXT[] | | Evidence links |
| assigned_to | UUID | FK: profiles.id SET NULL | Assigned admin |
| resolution_notes | TEXT | | Resolution details |
| resolution_action | TEXT | | Action taken |
| refund_amount | INTEGER | | Refund amount |
| resolved_at | TIMESTAMPTZ | | Resolution timestamp |
| resolved_by | UUID | FK: profiles.id SET NULL | Admin who resolved |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Dispute Types**: service_quality, payment, cancellation, no_show, damage, safety, other

---

### booking_disputes
**Purpose**: Post-booking dispute resolution (48-hour window)

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Dispute ID |
| booking_id | UUID | NOT NULL, FK: bookings.id CASCADE | Booking |
| customer_id | UUID | NOT NULL, FK: profiles.id CASCADE | Customer |
| professional_id | UUID | NOT NULL, FK: profiles.id CASCADE | Professional |
| reason | TEXT | NOT NULL | Dispute reason |
| description | TEXT | NOT NULL | Description |
| status | TEXT | NOT NULL, DEFAULT 'pending' | pending, investigating, resolved, dismissed |
| resolution_notes | TEXT | | Resolution details |
| resolved_at | TIMESTAMPTZ | | Resolution timestamp |
| resolved_by | UUID | FK: profiles.id | Resolving admin |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

---

## Recurring Bookings

### recurring_plans
**Purpose**: Manage recurring service bookings with discounts

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Plan ID |
| customer_id | UUID | NOT NULL, FK: profiles.id CASCADE | Customer |
| professional_id | UUID | NOT NULL, FK: profiles.id CASCADE | Professional |
| service_name | TEXT | NOT NULL | Service name |
| duration_minutes | INTEGER | NOT NULL | Duration |
| frequency | TEXT | NOT NULL | weekly, biweekly, monthly |
| day_of_week | INTEGER | NOT NULL | 0=Sunday, 6=Saturday |
| preferred_time | TIME | NOT NULL | Preferred time |
| base_amount | INTEGER | NOT NULL | Amount before discount |
| discount_percentage | INTEGER | NOT NULL, DEFAULT 10, CHECK(0-30) | Discount % |
| final_amount | INTEGER | NOT NULL | Amount after discount |
| currency | TEXT | NOT NULL, DEFAULT 'COP' | Currency |
| status | TEXT | NOT NULL, DEFAULT 'active' | active, paused, cancelled |
| pause_start_date | DATE | | Pause start |
| pause_end_date | DATE | | Pause end |
| next_booking_date | DATE | NOT NULL | Next scheduled date |
| total_bookings_completed | INTEGER | NOT NULL, DEFAULT 0 | Completed count |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `recurring_plans_next_booking_date_idx` (WHERE status = 'active')

---

### recurring_plan_holidays
**Purpose**: Track skipped dates for recurring plans

**Primary Key**: `id` (UUID)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Holiday ID |
| recurring_plan_id | UUID | NOT NULL, FK: recurring_plans.id CASCADE | Plan |
| skip_date | DATE | NOT NULL | Date to skip |
| reason | TEXT | | Skip reason |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Unique Constraint**: `UNIQUE(recurring_plan_id, skip_date)`

---

## System Tables

### cron_config
**Purpose**: Store cron job configuration

**Primary Key**: `id` (INTEGER, always 1)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, DEFAULT 1, CHECK(id = 1) | Single row constraint |
| api_url | TEXT | | API URL for cron |
| cron_secret | TEXT | | Secret token |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

---

## Stored Functions & Triggers

### Trigger Functions

#### handle_new_user()
Creates profile record when new auth user is created.

**Trigger**: `on_auth_user_created` - AFTER INSERT on auth.users

**Logic**:
- Extracts role and locale from user metadata
- Creates profiles entry with appropriate onboarding_status
- Stores consent data (privacy policy, terms, data processing, marketing)

---

#### Auto-Update Triggers
These triggers automatically update `updated_at` timestamps:

- `set_booking_updated_at()` - bookings
- `set_customer_review_updated_at()` - customer_reviews
- `set_payouts_updated_at()` - payouts
- `set_service_addons_updated_at()` - service_addons
- `set_conversations_updated_at()` - conversations
- `update_notification_subscriptions_updated_at()` - notification_subscriptions
- `set_user_suspensions_updated_at()` - user_suspensions
- `set_admin_professional_reviews_updated_at()` - admin_professional_reviews
- `set_disputes_updated_at()` - disputes

---

#### update_conversation_on_message()
Updates conversation metadata when message is sent.

**Trigger**: AFTER INSERT on messages

**Logic**:
- Sets `last_message_at` to message creation time
- Increments appropriate unread count (customer or professional)

---

#### set_completed_at()
Sets booking's `completed_at` when status changes to 'completed'.

**Trigger**: BEFORE UPDATE on bookings

---

#### protect_required_consents()
Prevents revoking privacy policy, terms, or data processing consents.

**Trigger**: `protect_required_consents_trigger` - BEFORE UPDATE on profiles

**Logic**:
- Prevents changing privacy_policy_accepted from TRUE to FALSE
- Prevents changing terms_accepted from TRUE to FALSE
- Prevents changing data_processing_consent from TRUE to FALSE
- Allows marketing_consent to be changed freely (GDPR)

---

### Public Functions

#### list_active_professionals(p_customer_lat NUMERIC, p_customer_lon NUMERIC)
List active professionals with trust signals (ratings, on-time rate, acceptance rate).

**Returns**: Table with professional details, ratings, and trust metrics

**Security**: SECURITY DEFINER, executable by anon and authenticated users

**Features**:
- Calculates average rating and review count
- Calculates on-time rate (check-ins within 15 min of scheduled start)
- Calculates acceptance rate (confirmed/completed vs. all bookings)
- Calculates distance using Haversine formula if coordinates provided
- Orders by rating DESC, review count DESC

---

#### get_professional_profile(p_profile_id UUID)
Get details of a specific professional with trust signals.

**Returns**: Single professional's profile details

**Security**: SECURITY DEFINER, executable by anon and authenticated users

---

#### update_user_consent(p_user_id UUID, p_consent_type TEXT, p_accepted BOOLEAN)
Update user consent for privacy, terms, data processing, or marketing.

**Parameters**:
- `p_user_id` - User ID
- `p_consent_type` - 'privacy_policy', 'terms', 'data_processing', 'marketing'
- `p_accepted` - Consent status

**Security**: SECURITY DEFINER, executable by authenticated users

**Note**: Marketing consent can be changed freely; others protected by trigger

---

#### calculate_next_booking_date(current_date DATE, frequency_type TEXT, day_of_week INTEGER)
Calculate next booking date for recurring plans.

**Parameters**:
- `current_date` - Starting date
- `frequency_type` - 'weekly', 'biweekly', 'monthly'
- `day_of_week` - Target day (0=Sunday, 6=Saturday)

**Returns**: DATE

---

#### trigger_auto_decline_cron()
Trigger auto-decline of expired bookings via HTTP request.

**Scheduling**: Runs every hour at minute 0 (UTC)

**Logic**:
- Reads api_url and cron_secret from cron_config
- Makes HTTP GET request to `/api/cron/auto-decline-bookings`

**Security**: SECURITY DEFINER

---

## Relationships Diagram

```
auth.users (1) ──→ (1) profiles
                    │
                    ├──→ (0..1) professional_profiles
                    │        ├──→ (many) professional_documents
                    │        ├──→ (many) service_addons
                    │        ├──→ (many) payouts
                    │        ├──→ (many) professional_reviews (as professional_id)
                    │        └──→ (many) customer_reviews (as professional_id)
                    │
                    ├──→ (0..1) customer_profiles
                    │        ├──→ (many) bookings (as customer_id)
                    │        └──→ (many) customer_reviews (as customer_id)
                    │
                    ├──→ (many) notification_subscriptions
                    ├──→ (many) notifications
                    ├──→ (many) user_suspensions (as user_id)
                    └──→ (many) admin_audit_logs (as admin_id or target_user_id)

bookings (1) ──→ (1) customer_id (profiles)
         ├──→ (1) professional_id (professional_profiles)
         ├──→ (0..1) included_in_payout_id (payouts)
         ├──→ (0..1) parent_booking_id (bookings, self-referential)
         ├──→ (0..1) conversations
         ├──→ (many) booking_disputes
         ├──→ (many) disputes
         └──→ (many) customer_reviews

conversations (1) ──→ (many) messages
              ├──→ (1) booking_id (bookings)
              ├──→ (1) customer_id (profiles)
              └──→ (1) professional_id (professional_profiles)

payouts (1) ──→ (many) bookings (via included_in_payout_id)
        └──→ (1) professional_id (professional_profiles)

recurring_plans (1) ──→ (many) recurring_plan_holidays
                ├──→ (1) customer_id (profiles)
                └──→ (1) professional_id (professional_profiles)

disputes (1) ──→ (1) booking_id (bookings)
         ├──→ (1) opened_by (profiles)
         ├──→ (0..1) assigned_to (profiles)
         └──→ (0..1) resolved_by (profiles)
```

---

## Enums & Types

### Profile Roles
- `customer` - End user/customer
- `professional` - Cleaning professional
- `admin` - Platform administrator

### Booking Statuses
- `pending_payment` - Awaiting payment
- `authorized` - Payment authorized
- `confirmed` - Professional confirmed
- `in_progress` - Service in progress
- `completed` - Service completed
- `declined` - Professional declined
- `canceled` - Customer canceled

### Professional Status
- `draft` - Incomplete profile
- `profile_submitted` - Application submitted
- `approved` - Approved by admin
- `active` - Fully active professional

### Verification Levels
- `none` - No verification
- `basic` - Basic verification
- `verified` - Enhanced verification
- `professional` - Full professional verification

### Document Status
- `uploaded` - Awaiting review
- `verified` - Verified by admin
- `rejected` - Rejected
- `expired` - Expired

### Suspension Types
- `temporary` - Temporary suspension
- `permanent` - Permanent suspension
- `ban` - Account ban

### Dispute Types
- `service_quality` - Quality issue
- `payment` - Payment dispute
- `cancellation` - Cancellation dispute
- `no_show` - No-show dispute
- `damage` - Property damage
- `safety` - Safety concern
- `other` - Other dispute

### Recurring Frequencies
- `weekly` - Every week
- `biweekly` - Every two weeks
- `monthly` - Every month

---

## JSONB Field Structures

### professional_profiles.availability_settings
```json
{
  "working_hours": {
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}]
  },
  "buffer_time_minutes": 30,
  "max_bookings_per_day": 3,
  "advance_booking_days": 60
}
```

### professional_profiles.instant_booking_settings
```json
{
  "min_notice_hours": 24,
  "max_booking_duration_hours": 8,
  "auto_accept_recurring": true,
  "only_verified_customers": false
}
```

### professional_profiles.portfolio_images
```json
[
  {
    "id": "uuid",
    "url": "https://...",
    "thumbnail_url": "https://...",
    "caption": "Before and after kitchen clean",
    "order": 0,
    "created_at": "2025-10-29T..."
  }
]
```

### customer_profiles.saved_addresses
```json
[
  {
    "id": "uuid",
    "label": "Home",
    "is_default": true,
    "street": "Calle 123 #45-67",
    "neighborhood": "Chapinero",
    "city": "Bogotá",
    "postal_code": "110111",
    "building_access": "Ring apartment 301",
    "parking_info": "Visitor parking",
    "special_notes": "Gate code: 1234"
  }
]
```

### bookings.selected_addons
```json
[
  {
    "addon_id": "uuid",
    "name": "Inside refrigerator",
    "price_cop": 10000,
    "duration_minutes": 30
  }
]
```

### notification_preferences
```json
{
  "bookingConfirmed": true,
  "bookingAccepted": true,
  "bookingDeclined": true,
  "serviceStarted": true,
  "serviceCompleted": true,
  "newMessage": true,
  "reviewReminder": true,
  "newBookingRequest": true,
  "bookingCanceled": true,
  "paymentReceived": true,
  "reviewReceived": true
}
```

---

## Compliance & Security

### Ley 1581 de 2012 (Colombian Data Protection Law)

The following fields track consent for Colombian data protection compliance:

**profiles table**:
- `privacy_policy_accepted` & `privacy_policy_accepted_at`
- `terms_accepted` & `terms_accepted_at`
- `data_processing_consent` & `data_processing_consent_at`
- `marketing_consent` & `marketing_consent_at`

**Protections**:
- Required consents (privacy policy, terms, data processing) cannot be revoked once accepted
- Marketing consent can be changed freely (GDPR requirement)
- Protected by `protect_required_consents()` trigger

### Row Level Security (RLS)

All tables with user data have RLS enabled:

**Principles**:
- Users can only view/edit their own data
- Admins have full access to data relevant to their role
- Service role (backend) can manage system data
- Anonymous users can view public professional listings only

### Audit Logging

All admin actions logged to `admin_audit_logs` with:
- Admin who performed action
- Action type
- Affected user/resource
- Timestamp and optional notes

---

## Database Extensions

1. **uuid-ossp** - UUID generation
2. **pg_cron** - Scheduled jobs (auto-decline cron)
3. **pg_net** - HTTP requests from database

---

## Summary Statistics

- **Total Tables**: 21
- **Total Columns**: 300+
- **Total Indexes**: 70+
- **Total Triggers**: 15+
- **Total Functions**: 20+
- **RLS Policies**: 100+
- **Foreign Keys**: 50+

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [API Reference](./api-reference.md)
- [Architecture Overview](./architecture.md)
- [Compliance Guide](../07-compliance/compliance-overview.md)

---

**Last Updated**: January 2025
**Version**: 1.0.0
