# New Database Tables - Schema Documentation

**Last Updated:** 2025-11-07
**Migration Date:** 2025-11-07
**Status:** ✅ Applied to Production

---

## Overview

This document provides comprehensive documentation for the 4 new tables added to the MaidConnect platform database on 2025-11-07. These tables were previously missing and caused broken features across the platform.

---

## Table of Contents

1. [Amara AI Assistant Tables](#amara-ai-assistant-tables)
   - [amara_conversations](#amara_conversations)
   - [amara_messages](#amara_messages)
2. [Guest Checkout Table](#guest-checkout-table)
   - [guest_sessions](#guest_sessions)
3. [Analytics Table](#analytics-table)
   - [platform_events](#platform_events)
4. [RLS Policies](#rls-policies)
5. [Functions & Triggers](#functions--triggers)
6. [Usage Examples](#usage-examples)

---

## Amara AI Assistant Tables

### `amara_conversations`

**Purpose:** Stores conversation sessions between users and the Amara AI assistant.

#### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique conversation identifier |
| `user_id` | uuid | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | User who owns this conversation |
| `locale` | text | NOT NULL, DEFAULT 'en' | User locale (en/es) for conversation context |
| `is_active` | boolean | NOT NULL, DEFAULT true | Whether conversation is active or archived |
| `last_message_at` | timestamptz | NOT NULL, DEFAULT now() | Timestamp of last message for sorting |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Conversation creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp (auto-updated by trigger) |

#### Indexes

- `idx_amara_conversations_user_id` - Fast lookups by user
- `idx_amara_conversations_last_message_at` - Sort by recent conversations
- `idx_amara_conversations_is_active` - Filter active conversations (partial index)

#### RLS Policies

- **SELECT**: Users can view their own conversations
- **INSERT**: Users can create their own conversations
- **UPDATE**: Users can update their own conversations
- **DELETE**: Users can delete their own conversations

#### Triggers

- `set_amara_conversations_updated_at` - Auto-updates `updated_at` on row changes

#### Usage in Code

**API Route:** [src/app/api/amara/chat/route.ts:94-103](src/app/api/amara/chat/route.ts#L94-L103)

```typescript
// Creating a new conversation
const { data: newConversation, error } = await supabase
  .from("amara_conversations")
  .insert({
    user_id: user.id,
    locale: userContext.locale,
    is_active: true,
    last_message_at: new Date().toISOString(),
  })
  .select("id")
  .single();
```

---

### `amara_messages`

**Purpose:** Stores individual messages within Amara AI conversations.

#### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| `conversation_id` | uuid | NOT NULL, REFERENCES public.amara_conversations(id) ON DELETE CASCADE | Parent conversation |
| `role` | text | NOT NULL, CHECK (role IN ('user', 'assistant', 'system')) | Message sender |
| `content` | text | NOT NULL | Text content of the message |
| `tool_calls` | jsonb | NULL | JSON array of tool calls made by assistant (if any) |
| `metadata` | jsonb | NULL | Additional metadata (model, usage stats, etc.) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Message creation timestamp |

#### Indexes

- `idx_amara_messages_conversation_id` - Fast lookups by conversation
- `idx_amara_messages_created_at` - Sort messages chronologically
- `idx_amara_messages_role` - Filter by message sender

#### RLS Policies

- **SELECT**: Users can view messages in their own conversations
- **INSERT**: Users can create messages in their own conversations
- **UPDATE**: Users can update messages in their own conversations
- **DELETE**: Users can delete messages in their own conversations

#### Usage in Code

**API Route:** [src/app/api/amara/chat/route.ts:117-127](src/app/api/amara/chat/route.ts#L117-L127)

```typescript
// Saving assistant message
await supabase.from("amara_messages").insert({
  conversation_id: currentConversationId,
  role: "assistant",
  content: text,
  tool_calls: toolCalls ? JSON.stringify(toolCalls) : null,
  metadata: {
    model: AMARA_MODEL_CONFIG.name,
    usage,
    timestamp: new Date().toISOString(),
  },
});
```

---

## Guest Checkout Table

### `guest_sessions`

**Purpose:** Stores anonymous guest checkout sessions to allow bookings without user accounts.

#### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `session_token` | text | NOT NULL, UNIQUE | Unique secure token for session identification |
| `email` | text | NOT NULL | Guest email for booking communication |
| `full_name` | text | NOT NULL | Guest name for booking |
| `phone` | text | NULL | Guest phone number (optional) |
| `metadata` | jsonb | DEFAULT '{}'::jsonb | Additional session data and conversion tracking |
| `expires_at` | timestamptz | NOT NULL, DEFAULT (now() + interval '24 hours') | Session expiration (default 24 hours) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Session creation timestamp |

#### Indexes

- `idx_guest_sessions_session_token` - Fast lookups by token
- `idx_guest_sessions_email` - Search by email
- `idx_guest_sessions_expires_at` - Cleanup expired sessions

#### RLS Policies

- **INSERT**: Anyone (anon + authenticated) can create guest sessions
- **SELECT**: Anyone can read their own guest session by token (validated in app layer)
- **ALL** (service_role): Service role can manage all sessions

#### Functions

##### `cleanup_expired_guest_sessions()`

**Purpose:** Removes expired guest sessions (called by cron job daily)

```sql
DELETE FROM public.guest_sessions WHERE expires_at < now();
```

##### `convert_guest_to_user(p_guest_session_id uuid, p_user_id uuid)`

**Purpose:** Converts guest bookings to authenticated user account

```sql
-- Updates bookings to link to new user
UPDATE public.bookings
SET customer_id = p_user_id
WHERE guest_session_id = p_guest_session_id;

-- Marks session as converted
UPDATE public.guest_sessions
SET metadata = metadata || jsonb_build_object(
  'converted_to_user_id', p_user_id,
  'converted_at', now()
)
WHERE id = p_guest_session_id;
```

#### Usage in Code

**Library:** [src/lib/guest-checkout.ts:44-76](src/lib/guest-checkout.ts#L44-L76)

```typescript
// Creating a guest session
export async function createGuestSession(data: GuestCheckoutData): Promise<GuestSession | null> {
  const supabase = createSupabaseBrowserClient();
  const sessionToken = generateGuestToken();

  const { data: session, error } = await supabase
    .from("guest_sessions")
    .insert({
      session_token: sessionToken,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone || null,
    })
    .select()
    .single();

  // Store token in localStorage for session persistence
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_TOKEN_KEY, sessionToken);
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }

  return session as GuestSession;
}
```

---

## Analytics Table

### `platform_events`

**Purpose:** Tracks platform analytics and conversion funnel events for business intelligence.

#### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event identifier |
| `event_type` | text | NOT NULL | Type of event (SearchStarted, CheckoutStarted, etc.) |
| `user_id` | uuid | REFERENCES auth.users(id) ON DELETE SET NULL | User who triggered event (null for anonymous) |
| `session_id` | text | NULL | Anonymous session ID for pre-signup tracking |
| `properties` | jsonb | DEFAULT '{}'::jsonb | Event-specific data and metadata |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Event creation timestamp |

#### Indexes

- `idx_platform_events_event_type` - Filter by event type
- `idx_platform_events_user_id` - Filter by user
- `idx_platform_events_session_id` - Track anonymous sessions
- `idx_platform_events_created_at` - Sort chronologically
- `idx_platform_events_type_date` - Composite index for analytics queries
- `idx_platform_events_user_journey` - Composite index for user journey analysis (partial: WHERE user_id IS NOT NULL)
- `idx_platform_events_properties` - GIN index for JSON property queries

#### RLS Policies

- **INSERT (authenticated)**: Users can insert their own events
- **INSERT (anon)**: Anonymous users can insert events (user_id must be NULL)
- **SELECT**: Only admins can view all events (for analytics)
- **ALL (service_role)**: Service role can manage all events

#### Functions

##### `get_event_counts_by_type(p_start_date, p_end_date)`

**Purpose:** Get event counts by type for analytics dashboard

**Parameters:**
- `p_start_date` (timestamptz, default: now() - 30 days)
- `p_end_date` (timestamptz, default: now())

**Returns:** TABLE (event_type text, event_count bigint)

```sql
SELECT
  pe.event_type,
  COUNT(*) as event_count
FROM public.platform_events pe
WHERE pe.created_at >= p_start_date
  AND pe.created_at <= p_end_date
GROUP BY pe.event_type
ORDER BY event_count DESC;
```

##### `get_conversion_funnel(p_start_date, p_end_date)`

**Purpose:** Calculate conversion funnel metrics

**Parameters:**
- `p_start_date` (timestamptz, default: now() - 30 days)
- `p_end_date` (timestamptz, default: now())

**Returns:** TABLE (stage text, unique_users bigint, conversion_rate numeric)

**Funnel Stages:**
1. SearchStarted
2. ProfessionalViewed
3. CheckoutStarted
4. BookingConfirmed

##### `cleanup_old_platform_events()`

**Purpose:** Removes events older than 90 days (called by cron job monthly)

```sql
DELETE FROM public.platform_events
WHERE created_at < now() - interval '90 days';
```

#### Usage in Code

**Library:** [src/lib/analytics/track-event.ts:118-162](src/lib/analytics/track-event.ts#L118-L162)

```typescript
// Tracking a platform event
export async function trackEvent<T extends PlatformEventType>(
  eventType: T,
  properties: EventProperties[T],
  userId?: string,
  sessionId?: string
): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  // Get current user if not provided
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    finalUserId = user?.id;
  }

  // Generate or retrieve session ID for anonymous tracking
  let finalSessionId = sessionId;
  if (!finalSessionId && typeof window !== "undefined") {
    finalSessionId = sessionStorage.getItem("analytics_session_id") ?? undefined;
    if (!finalSessionId) {
      finalSessionId = crypto.randomUUID();
      sessionStorage.setItem("analytics_session_id", finalSessionId);
    }
  }

  // Insert event
  await supabase.from("platform_events").insert({
    event_type: eventType,
    user_id: finalUserId || null,
    session_id: finalSessionId,
    properties: properties as Record<string, unknown>,
  });
}
```

**Example Usage:**

```typescript
// Customer search event
await trackEvent('SearchStarted', {
  city: 'Bogotá',
  service: 'cleaning',
  lat: 4.7110,
  lng: -74.0721,
  device: 'mobile'
});

// Checkout event
await trackEvent('CheckoutStarted', {
  pro_id: '123-456-789',
  items: ['basic_cleaning', 'ironing'],
  subtotal: 50000,
  deposit_type: 'percentage'
});

// Booking confirmation
await trackEvent('BookingConfirmed', {
  booking_id: '789-456-123',
  total: 55000,
  deposit_captured: true
});
```

---

## RLS Policies

### Security Architecture

All new tables implement Row Level Security (RLS) to ensure data isolation and security:

1. **User Isolation**: Users can only access their own data
2. **Anonymous Access**: Limited INSERT-only access for guest features
3. **Admin Access**: Admins can view all analytics data
4. **Service Role**: Full access for system operations

### Policy Patterns

#### User-Owned Data (Amara Tables)

```sql
-- Users can only view their own conversations
CREATE POLICY "Users can view their own Amara conversations"
  ON public.amara_conversations
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

#### Parent-Child Relationships (Messages → Conversations)

```sql
-- Users can view messages in their own conversations
CREATE POLICY "Users can view their own Amara messages"
  ON public.amara_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.amara_conversations
      WHERE id = amara_messages.conversation_id
      AND user_id = (SELECT auth.uid())
    )
  );
```

#### Anonymous Access (Guest Sessions)

```sql
-- Anyone can create guest sessions
CREATE POLICY "Anyone can create guest sessions"
  ON public.guest_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

#### Admin-Only Access (Analytics)

```sql
-- Only admins can view all platform events
CREATE POLICY "Admins can view all platform events"
  ON public.platform_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
```

---

## Functions & Triggers

### Auto-Update Triggers

#### `handle_updated_at()`

**Used by:** `amara_conversations`

Automatically updates the `updated_at` column on row updates:

```sql
CREATE TRIGGER set_amara_conversations_updated_at
  BEFORE UPDATE ON public.amara_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### Cleanup Functions

All cleanup functions are designed to be called by cron jobs:

1. **`cleanup_expired_guest_sessions()`** - Daily cleanup of expired sessions (24h+ old)
2. **`cleanup_old_platform_events()`** - Monthly cleanup of old analytics (90d+ old)

### Conversion Functions

#### `convert_guest_to_user()`

**Purpose:** Seamlessly converts guest bookings to authenticated user accounts

**Flow:**
1. User completes booking as guest
2. User creates account after booking
3. System calls `convert_guest_to_user(guest_session_id, user_id)`
4. All guest bookings are linked to new user account
5. Guest session is marked as converted with metadata

---

## Usage Examples

### Amara AI Assistant Integration

**Scenario:** User starts a conversation with Amara AI assistant

```typescript
// 1. User sends first message (no conversation exists)
const { messages, conversationId } = requestBody; // conversationId is null

// 2. API creates conversation and saves messages
const { data: newConversation } = await supabase
  .from("amara_conversations")
  .insert({
    user_id: user.id,
    locale: "es",
    is_active: true,
    last_message_at: new Date().toISOString(),
  })
  .select("id")
  .single();

// 3. Save user message
await supabase.from("amara_messages").insert({
  conversation_id: newConversation.id,
  role: "user",
  content: "¿Cómo puedo reservar una empleada doméstica?",
});

// 4. Save assistant response
await supabase.from("amara_messages").insert({
  conversation_id: newConversation.id,
  role: "assistant",
  content: "Te puedo ayudar a encontrar y reservar una empleada...",
  metadata: { model: "claude-haiku-4.5", tokens: 125 }
});

// 5. Update conversation timestamp
await supabase
  .from("amara_conversations")
  .update({ last_message_at: new Date().toISOString() })
  .eq("id", newConversation.id);
```

### Guest Checkout Flow

**Scenario:** Anonymous user books a service without creating an account

```typescript
// 1. User fills out guest checkout form
const guestData = {
  email: "maria@example.com",
  full_name: "María González",
  phone: "+57 300 123 4567"
};

// 2. Create guest session
const guestSession = await createGuestSession(guestData);
// Session token stored in localStorage

// 3. Create booking with guest session ID
await supabase.from("bookings").insert({
  guest_session_id: guestSession.id,
  professional_id: "pro-123",
  service_date: "2025-11-15",
  total_price: 50000,
  // ... other booking fields
});

// 4. User decides to create account after booking
const { data: { user } } = await supabase.auth.signUp({
  email: guestData.email,
  password: "secure-password"
});

// 5. Convert guest bookings to user account
await convertGuestToUser(guestSession.id, user.id);
// All guest bookings now linked to user account
```

### Analytics Tracking

**Scenario:** Track user journey through booking funnel

```typescript
// 1. User lands on search page
await trackEvent('SearchStarted', {
  city: 'Bogotá',
  service: 'cleaning',
  device: 'mobile'
});

// 2. User views a professional's profile
await trackEvent('ProfessionalViewed', {
  pro_id: 'pro-123',
  badges: ['verified', 'top-rated'],
  price: 45000,
  availability_score: 0.85
});

// 3. User starts checkout
await trackEvent('CheckoutStarted', {
  pro_id: 'pro-123',
  items: ['basic_cleaning', 'ironing'],
  subtotal: 50000,
  deposit_type: 'percentage'
});

// 4. User completes booking
await trackEvent('BookingConfirmed', {
  booking_id: 'booking-789',
  total: 55000,
  deposit_captured: true
});

// 5. Admin views conversion funnel
const funnelMetrics = await supabase.rpc('get_conversion_funnel', {
  p_start_date: '2025-11-01',
  p_end_date: '2025-11-07'
});

// Results:
// [
//   { stage: 'SearchStarted', unique_users: 1000, conversion_rate: 100.00 },
//   { stage: 'ProfessionalViewed', unique_users: 750, conversion_rate: 75.00 },
//   { stage: 'CheckoutStarted', unique_users: 300, conversion_rate: 30.00 },
//   { stage: 'BookingConfirmed', unique_users: 150, conversion_rate: 15.00 }
// ]
```

---

## Related Documentation

- [Database Schema](./database-schema.md) - Complete database schema
- [API Reference](./api-reference.md) - API endpoints documentation
- [Authentication](./authentication.md) - Auth flows and security
- [Amara AI Assistant](../04-features/amara-ai-assistant.md) - Feature documentation

---

## Migration History

| Date | Migration | Status | Description |
|------|-----------|--------|-------------|
| 2025-11-07 | `20251107180000_create_amara_conversations.sql` | ✅ Applied | Created Amara conversations table |
| 2025-11-07 | `20251107180100_create_amara_messages.sql` | ✅ Applied | Created Amara messages table |
| 2025-11-07 | `20251107180200_create_guest_sessions.sql` | ✅ Applied | Created guest sessions table |
| 2025-11-07 | `20251107180300_create_platform_events.sql` | ✅ Applied | Created platform events table |

---

## Support

For questions about these tables or their usage:
- Review the code references provided in each section
- Check the migration files in `supabase/migrations/`
- Consult the API route implementations
- Ask in #backend-help Slack channel
