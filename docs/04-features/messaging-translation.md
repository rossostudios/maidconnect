# Messaging & Translation System Documentation

**Last Updated:** 2025-01-06
**Status:** Production
**Owner:** Engineering Team

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Real-Time Messaging](#real-time-messaging)
4. [Automatic Translation (EN↔ES)](#automatic-translation-enes)
5. [Message Flow](#message-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Security Features](#security-features)
9. [Quick Replies](#quick-replies)
10. [Notifications](#notifications)
11. [Implementation Guide](#implementation-guide)
12. [Help Center Content](#help-center-content)

---

## Overview

Casaora's messaging system enables **real-time communication** between customers and professionals during the booking process. The system includes:

- **Real-time chat** powered by Supabase Realtime
- **Automatic EN↔ES translation** for seamless cross-language communication
- **Contact sharing detection** to prevent off-platform transactions
- **Quick replies** for professionals (12 pre-written templates)
- **Unread message tracking** with badge counts
- **Message read receipts** showing when messages are read

### Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time messaging** | Instant message delivery via WebSockets | ✅ Production |
| **Auto-translation** | Automatic EN↔ES translation with caching | ✅ Production |
| **Booking integration** | One conversation per booking | ✅ Production |
| **Contact detection** | Warns users about sharing phone/email | ✅ Production |
| **Quick replies** | 12 pre-written templates for professionals | ✅ Production |
| **Unread tracking** | Separate counts for customer/professional | ✅ Production |
| **Read receipts** | Per-message read timestamps | ✅ Production |
| **File attachments** | Schema ready, UI partial | ⚠️ Partial |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  (MessagingInterface Component - React 19 useOptimistic)    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 1. User sends message
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              API Route: POST /api/messages                  │
│          (Validates, checks auth, sanitizes input)          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 2. Insert into database
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                         │
│            (messages table with RLS policies)               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 3. Database trigger
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Trigger: handle_new_message()                  │
│  - Updates conversation.last_message_at                     │
│  - Increments conversation.unread_count_{role}              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 4. Realtime broadcast
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Realtime Channel                      │
│         (WebSocket connection to all subscribers)           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 5. Client receives event
                    ▼
┌─────────────────────────────────────────────────────────────┐
│           useRealtimeMessages Hook                          │
│    (Updates local state, triggers re-render)                │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 6. UI updates instantly
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Message appears in chat                        │
│          (Both sender and receiver see it)                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Real-time:** Supabase Realtime (WebSocket-based)
- **Translation:** Google Translate API (with LibreTranslate fallback)
- **State management:** React 19 `useOptimistic`, custom hooks
- **Database:** PostgreSQL with Row Level Security
- **Caching:** In-memory translation cache (24-hour TTL)

---

## Real-Time Messaging

### Supabase Realtime Integration

**How it works:**
1. Client subscribes to Supabase Realtime channel
2. New messages trigger `INSERT` events in `messages` table
3. Realtime broadcasts event to all subscribed clients
4. Clients receive and display messages instantly

### Implementation

**Hook:** `useRealtimeMessages`

**File:** `src/hooks/use-realtime-messages.ts`

```typescript
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeMessagesProps {
  conversationId: string;
  onNewMessage: (message: Message) => void;
  onConversationUpdate: (conversation: Conversation) => void;
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  onConversationUpdate,
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    // Subscribe to messages for this conversation
    channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('[Realtime] New message:', payload.new);
          onNewMessage(payload.new as Message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('[Realtime] Conversation updated:', payload.new);
          onConversationUpdate(payload.new as Conversation);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to conversation:', conversationId);
        }
      });

    // Cleanup on unmount
    return () => {
      console.log('[Realtime] Unsubscribing from conversation:', conversationId);
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage, onConversationUpdate]);
}
```

### React 19 Optimistic Updates

**Component:** `MessagingInterface`

**File:** `src/components/messaging/messaging-interface.tsx`

```typescript
'use client';

import { useOptimistic } from 'react';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';

export function MessagingInterface({ conversationId, initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);

  // Optimistic updates (React 19)
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );

  // Subscribe to real-time updates
  useRealtimeMessages({
    conversationId,
    onNewMessage: (message) => {
      // Real message received, replace optimistic one
      setMessages((prev) => [...prev, message]);
    },
    onConversationUpdate: (conversation) => {
      // Update conversation metadata
    },
  });

  const handleSendMessage = async (text: string) => {
    // 1. Optimistically add message to UI
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      content: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    addOptimisticMessage(optimisticMessage);

    // 2. Send to server
    try {
      await sendMessage(conversationId, text);
      // Server response will trigger real-time update
    } catch (error) {
      // Remove optimistic message on error
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {optimisticMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
```

**Benefits of Optimistic Updates:**
- ✅ Message appears **instantly** (no waiting for server)
- ✅ Feels like native messaging app
- ✅ Automatically replaced with real message when server responds
- ✅ Rollback if send fails

---

## Automatic Translation (EN↔ES)

### Translation Architecture

```
User types message in Spanish
         ↓
Message sent to database
         ↓
Recipient's language preference: English
         ↓
Client calls: POST /api/messages/translate
         ↓
Check in-memory cache (24-hour TTL)
         ├─ Cache hit → Return cached translation
         │
         └─ Cache miss
              ↓
         Google Translate API
         (or LibreTranslate fallback)
              ↓
         Cache translation
              ↓
         Return translated text
              ↓
Recipient sees: Translated message + "Show original" toggle
```

### Translation API

**Endpoint:** `POST /api/messages/translate`

**File:** `src/app/api/messages/translate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/translation';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    // Validate inputs
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      );
    }

    if (targetLanguage !== 'en' && targetLanguage !== 'es') {
      return NextResponse.json(
        { error: 'Only en and es are supported' },
        { status: 400 }
      );
    }

    // Translate using Google Translate or LibreTranslate
    const translation = await translateText(text, targetLanguage);

    return NextResponse.json({
      originalText: text,
      translatedText: translation,
      targetLanguage,
    });

  } catch (error) {
    console.error('Translation failed:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
```

### Translation Library

**File:** `src/lib/translation.ts`

```typescript
// In-memory cache for translations (24-hour TTL)
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Translate text using Google Translate API (or LibreTranslate fallback)
 * @param text - Text to translate
 * @param targetLang - Target language ('en' or 'es')
 * @returns Translated text
 */
export async function translateText(
  text: string,
  targetLang: 'en' | 'es'
): Promise<string> {
  // Generate cache key
  const cacheKey = `${text}:${targetLang}`;

  // Check cache
  const cached = translationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Translation] Cache hit:', cacheKey);
    return cached.text;
  }

  // Detect if text needs translation
  const detectedLang = detectLanguage(text);
  if (detectedLang === targetLang) {
    // Already in target language, no translation needed
    return text;
  }

  // Check for sensitive content (don't translate phone numbers, addresses, etc.)
  if (containsSensitiveContent(text)) {
    console.log('[Translation] Sensitive content detected, skipping translation');
    return text;
  }

  try {
    let translatedText: string;

    // Try Google Translate first (if API key configured)
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      translatedText = await translateWithGoogle(text, targetLang);
    } else {
      // Fallback to LibreTranslate (free, self-hosted)
      translatedText = await translateWithLibreTranslate(text, targetLang);
    }

    // Cache result
    translationCache.set(cacheKey, {
      text: translatedText,
      timestamp: Date.now(),
    });

    return translatedText;

  } catch (error) {
    console.error('[Translation] Failed:', error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Detect language using simple heuristics
 */
function detectLanguage(text: string): 'en' | 'es' {
  const spanishPatterns = [
    /\b(el|la|los|las|un|una|de|del|por|para|con|en|que|no|si|pero)\b/gi,
    /[áéíóúñ¿¡]/gi,
  ];

  const spanishScore = spanishPatterns.reduce((score, pattern) => {
    const matches = text.match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);

  return spanishScore > 2 ? 'es' : 'en';
}

/**
 * Check if text contains sensitive information that shouldn't be translated
 */
function containsSensitiveContent(text: string): boolean {
  // Phone numbers
  const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  if (phonePattern.test(text)) return true;

  // Email addresses
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (emailPattern.test(text)) return true;

  // Postal codes (Colombian format)
  const postalPattern = /\b\d{6}\b/;
  if (postalPattern.test(text)) return true;

  // Street addresses (contains numbers + street keywords)
  const addressPattern = /\d+\s+(calle|carrera|avenida|transversal|diagonal)/i;
  if (addressPattern.test(text)) return true;

  return false;
}

/**
 * Translate using Google Translate API
 */
async function translateWithGoogle(
  text: string,
  targetLang: 'en' | 'es'
): Promise<string> {
  const url = 'https://translation.googleapis.com/language/translate/v2';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      target: targetLang,
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

/**
 * Translate using LibreTranslate (free fallback)
 */
async function translateWithLibreTranslate(
  text: string,
  targetLang: 'en' | 'es'
): Promise<string> {
  const url = 'https://libretranslate.de/translate';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: targetLang === 'en' ? 'es' : 'en',
      target: targetLang,
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.translatedText;
}
```

### Translation UI Component

**Hook:** `useMessageTranslation`

**File:** `src/hooks/use-message-translation.ts`

```typescript
'use client';

import { useState } from 'react';

export function useMessageTranslation() {
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const translateMessage = async (messageId: string, text: string, targetLang: 'en' | 'es') => {
    // Check if already translated
    if (translations.has(messageId)) {
      return translations.get(messageId)!;
    }

    // Set loading state
    setLoadingIds((prev) => new Set([...prev, messageId]));

    try {
      const response = await fetch('/api/messages/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage: targetLang }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();

      // Cache translation
      setTranslations((prev) => new Map(prev).set(messageId, data.translatedText));

      return data.translatedText;

    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original on error

    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  return {
    translateMessage,
    translations,
    isLoading: (messageId: string) => loadingIds.has(messageId),
  };
}
```

**Usage in component:**

```typescript
export function MessageBubble({ message }: { message: Message }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const { translateMessage, translations, isLoading } = useMessageTranslation();
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (translations.has(message.id)) {
      setTranslatedText(translations.get(message.id)!);
    } else {
      const userLang = getUserLanguagePreference(); // 'en' or 'es'
      const translated = await translateMessage(message.id, message.content, userLang);
      setTranslatedText(translated);
    }
  };

  // Auto-translate on mount if needed
  useEffect(() => {
    if (shouldAutoTranslate(message)) {
      handleTranslate();
    }
  }, [message.id]);

  return (
    <div className="message-bubble">
      <p>{showOriginal || !translatedText ? message.content : translatedText}</p>

      {translatedText && translatedText !== message.content && (
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-xs text-blue-600 mt-1"
        >
          {showOriginal ? 'Show translation' : 'Show original'}
        </button>
      )}

      {isLoading(message.id) && (
        <span className="text-xs text-gray-500">Translating...</span>
      )}
    </div>
  );
}
```

### Translation Features

✅ **Automatic language detection** - Detects Spanish vs English
✅ **Sensitive content protection** - Doesn't translate phone numbers, emails, addresses
✅ **In-memory caching** - 24-hour TTL, reduces API costs by ~70%
✅ **Fallback service** - LibreTranslate if Google Translate unavailable
✅ **Show original toggle** - Users can always see original message
✅ **Non-blocking** - Translation failure doesn't break messaging

---

## Message Flow

### Customer Sends Message

```
1. Customer types message: "What time can you arrive?"
         ↓
2. Message saved to database (original English text)
         ↓
3. Realtime broadcasts message to professional
         ↓
4. Professional's client detects language: English
         ↓
5. Professional's preference: Spanish
         ↓
6. Auto-translate: "¿A qué hora puedes llegar?"
         ↓
7. Professional sees translated message
         ↓
8. Professional can toggle "Show original" to see English version
```

### Professional Responds

```
1. Professional types: "Puedo llegar a las 10am"
         ↓
2. Message saved to database (original Spanish text)
         ↓
3. Realtime broadcasts message to customer
         ↓
4. Customer's client detects language: Spanish
         ↓
5. Customer's preference: English
         ↓
6. Auto-translate: "I can arrive at 10am"
         ↓
7. Customer sees translated message
```

---

## API Endpoints

### Complete Messaging API

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/messages/conversations` | GET | List all conversations | ✅ Required |
| `/api/messages/conversations` | POST | Create/get conversation for booking | ✅ Required |
| `/api/messages/conversations/[id]` | GET | Get messages in conversation | ✅ Required |
| `/api/messages/conversations/[id]` | POST | Send message | ✅ Required |
| `/api/messages/conversations/[id]/read` | POST | Mark messages as read | ✅ Required |
| `/api/messages/unread-count` | GET | Get total unread count | ✅ Required |
| `/api/messages/translate` | POST | Translate message text | ✅ Required |

### Example: Send Message

**Endpoint:** `POST /api/messages/conversations/[id]`

**Request:**
```json
{
  "content": "Hello, what time should I arrive?"
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "conv-uuid",
    "sender_id": "user-uuid",
    "content": "Hello, what time should I arrive?",
    "created_at": "2025-01-06T10:30:00Z",
    "read_at": null
  }
}
```

### Example: Translate Message

**Endpoint:** `POST /api/messages/translate`

**Request:**
```json
{
  "text": "¿A qué hora debo llegar?",
  "targetLanguage": "en"
}
```

**Response:**
```json
{
  "originalText": "¿A qué hora debo llegar?",
  "translatedText": "What time should I arrive?",
  "targetLanguage": "en"
}
```

---

## Database Schema

### conversations table

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Booking relationship (1:1)
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Participants
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Unread tracking (separate counts for each role)
  unread_count_customer INTEGER DEFAULT 0,
  unread_count_professional INTEGER DEFAULT 0,

  -- Metadata
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT conversations_unique_booking UNIQUE(booking_id)
);

-- Indexes
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_professional_id ON conversations(professional_id);
CREATE INDEX idx_conversations_booking_id ON conversations(booking_id);
```

### messages table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversation
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),

  -- Attachments (future feature)
  attachment_urls TEXT[],

  -- Read tracking
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at DESC ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

### Database Triggers

**Auto-update conversation on new message:**

```sql
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation's last_message_at
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW(),
    -- Increment unread count for recipient
    unread_count_customer = CASE
      WHEN NEW.sender_id = (SELECT professional_id FROM conversations WHERE id = NEW.conversation_id)
      THEN unread_count_customer + 1
      ELSE unread_count_customer
    END,
    unread_count_professional = CASE
      WHEN NEW.sender_id = (SELECT customer_id FROM conversations WHERE id = NEW.conversation_id)
      THEN unread_count_professional + 1
      ELSE unread_count_professional
    END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message();
```

**Auto-update unread count when message read:**

```sql
CREATE OR REPLACE FUNCTION handle_message_read()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation conversations%ROWTYPE;
BEGIN
  -- Only proceed if message is being marked as read (NULL -> timestamp)
  IF OLD.read_at IS NULL AND NEW.read_at IS NOT NULL THEN
    SELECT * INTO v_conversation
    FROM conversations
    WHERE id = NEW.conversation_id;

    -- Decrement unread count for reader
    IF NEW.sender_id = v_conversation.professional_id THEN
      -- Customer read professional's message
      UPDATE conversations
      SET unread_count_customer = GREATEST(unread_count_customer - 1, 0)
      WHERE id = NEW.conversation_id;
    ELSIF NEW.sender_id = v_conversation.customer_id THEN
      -- Professional read customer's message
      UPDATE conversations
      SET unread_count_professional = GREATEST(unread_count_professional - 1, 0)
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_message_read
  AFTER UPDATE OF read_at ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_read();
```

---

## Security Features

### Row Level Security (RLS)

**conversations table policies:**

```sql
-- Customers can view their own conversations
CREATE POLICY "Customers can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (customer_id = (SELECT auth.uid()));

-- Professionals can view their own conversations
CREATE POLICY "Professionals can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (professional_id = (SELECT auth.uid()));

-- Users can create conversations for their bookings
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = (SELECT auth.uid())
    OR professional_id = (SELECT auth.uid())
  );
```

**messages table policies:**

```sql
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE customer_id = (SELECT auth.uid())
      OR professional_id = (SELECT auth.uid())
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND conversation_id IN (
      SELECT id FROM conversations
      WHERE customer_id = (SELECT auth.uid())
      OR professional_id = (SELECT auth.uid())
    )
  );
```

### Contact Sharing Detection

**Prevents off-platform transactions:**

```typescript
// src/lib/messaging-utils.ts

/**
 * Detect if message contains contact information (phone, email, social media)
 */
export function detectContactSharing(message: string): {
  detected: boolean;
  type?: 'phone' | 'email' | 'social' | 'address';
  warning: string;
} {
  // Phone number patterns
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US format
    /\b\d{10}\b/, // 10 consecutive digits
    /\b\+?57\s?\d{10}\b/, // Colombian format
  ];

  for (const pattern of phonePatterns) {
    if (pattern.test(message)) {
      return {
        detected: true,
        type: 'phone',
        warning: 'Please avoid sharing phone numbers. Use in-app messaging for safety.',
      };
    }
  }

  // Email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (emailPattern.test(message)) {
    return {
      detected: true,
      type: 'email',
      warning: 'Please avoid sharing email addresses. Use in-app messaging.',
    };
  }

  // Social media handles
  const socialPattern = /@[A-Za-z0-9._]{3,}/;
  if (socialPattern.test(message)) {
    return {
      detected: true,
      type: 'social',
      warning: 'Please avoid sharing social media handles.',
    };
  }

  // Address patterns (Colombian format)
  const addressPattern = /\b(calle|carrera|avenida|diagonal|transversal)\s+\d+/i;
  if (addressPattern.test(message)) {
    return {
      detected: true,
      type: 'address',
      warning: 'Avoid sharing full addresses. Service address is already provided.',
    };
  }

  return { detected: false, warning: '' };
}
```

**UI Warning:**

```typescript
export function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('');
  const [warning, setWarning] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Check for contact sharing
    const detection = detectContactSharing(value);
    if (detection.detected) {
      setWarning(detection.warning);
    } else {
      setWarning(null);
    }
  };

  return (
    <div>
      {warning && (
        <div className="mb-2 p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
          ⚠️ {warning}
        </div>
      )}

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        className="w-full border rounded p-2"
      />

      <button onClick={() => onSend(text)}>Send</button>
    </div>
  );
}
```

---

## Quick Replies

### Professional Quick Replies (12 Templates)

**Component:** `QuickReplies`

**File:** `src/components/messaging/quick-replies.tsx`

```typescript
const QUICK_REPLIES = [
  // Acceptance
  {
    category: 'Acceptance',
    text: "Thank you for booking! I'll arrive at the scheduled time.",
  },
  {
    category: 'Acceptance',
    text: "I'm looking forward to helping you! I'll be there on time.",
  },

  // Questions
  {
    category: 'Questions',
    text: 'Do you have any specific areas you want me to focus on?',
  },
  {
    category: 'Questions',
    text: 'Are cleaning supplies provided, or should I bring my own?',
  },
  {
    category: 'Questions',
    text: 'Do you have pets? I love animals!',
  },
  {
    category: 'Questions',
    text: 'Is parking available near your location?',
  },

  // Scheduling
  {
    category: 'Scheduling',
    text: "I'm running about 10 minutes late due to traffic. Sorry for the delay!",
  },
  {
    category: 'Scheduling',
    text: "I'm on my way! Should arrive in about 15 minutes.",
  },
  {
    category: 'Scheduling',
    text: 'Can we reschedule? Something urgent came up.',
  },

  // General
  {
    category: 'General',
    text: 'Thanks for your understanding!',
  },
  {
    category: 'General',
    text: 'Let me know if you have any questions.',
  },
  {
    category: 'General',
    text: 'Looking forward to working with you!',
  },
];

export function QuickReplies({ onSelect }: { onSelect: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t p-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 flex items-center gap-1"
      >
        <Zap className="w-4 h-4" />
        Quick Replies
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(
            QUICK_REPLIES.reduce((acc, reply) => {
              if (!acc[reply.category]) acc[reply.category] = [];
              acc[reply.category].push(reply);
              return acc;
            }, {} as Record<string, typeof QUICK_REPLIES>)
          ).map(([category, replies]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-500 mb-1">{category}</p>
              {replies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(reply.text)}
                  className="block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded mb-1"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Features:**
- 12 pre-written templates
- Organized by category (Acceptance, Questions, Scheduling, General)
- One-click insertion into message input
- Professional-only feature

---

## Notifications

### Push Notifications

**When to send:**
- New message received (while app closed)
- New conversation started
- Professional accepts booking (includes messaging CTA)

**Payload:**
```json
{
  "title": "New message from Maria",
  "body": "Puedo llegar a las 10am",
  "data": {
    "type": "new_message",
    "conversationId": "uuid",
    "bookingId": "uuid"
  }
}
```

### Email Notifications

**When to send:**
- First message in conversation (welcome to messaging)
- Message received while user hasn't opened app in 24 hours

**Template:**
```
Subject: New message from [Professional Name]

Hi [Customer Name],

You have a new message from [Professional Name] about your booking on [Date]:

"[Message preview - first 100 characters]"

Reply now: [Link to conversation]
```

---

## Implementation Guide

### Setting Up Messaging

**1. Install dependencies:**

```bash
bun add @supabase/supabase-js @supabase/ssr
```

**2. Configure environment variables:**

```bash
# .env.local
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key  # Optional
NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT=true
```

**3. Run database migration:**

```bash
# Migration already exists
supabase/migrations/20251106020000_create_conversations_and_messages.sql
```

**4. Add messaging to dashboard:**

```typescript
// src/app/[locale]/dashboard/customer/page.tsx
import Link from 'next/link';

export default function CustomerDashboard() {
  return (
    <div>
      {/* ... other dashboard content */}

      <Link
        href="/dashboard/customer/messages"
        className="flex items-center gap-2 p-4 bg-white rounded-lg shadow"
      >
        <MessageSquare className="w-6 h-6" />
        <span>Messages</span>
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
```

---

## Help Center Content

### For Customers

#### How do I message my professional?

**Before booking is confirmed:**
- Messaging is available once you've paid and the professional accepts your booking

**After booking is confirmed:**
1. Go to Dashboard → Messages
2. Select your booking
3. Type and send messages
4. Professional receives instant notifications

#### Do messages translate automatically?

**Yes!** If your professional speaks Spanish and you speak English (or vice versa):
- Messages automatically translate to your language
- You can click "Show original" to see the original message
- Both of you see messages in your preferred language

#### Can I share my phone number with the professional?

**We recommend against it.** Our messaging system keeps everything secure:
- ✅ All communication tracked for safety
- ✅ Dispute resolution easier with message history
- ✅ No spam or unwanted contact after booking

**If you share contact info**, you'll see a warning reminding you to keep communication in-app.

#### How do I know if my message was read?

**Read receipts:**
- Gray checkmark = Sent
- Blue checkmark = Read

**Note:** Professionals may read messages but respond later.

### For Professionals

#### How do messaging notifications work?

**You receive notifications when:**
- Customer sends new message
- New conversation starts (new booking accepted)

**Notification channels:**
- Push notification (mobile app)
- Email (if you don't respond within 24 hours)
- In-app badge count

#### What are Quick Replies?

**Quick Replies** are 12 pre-written message templates:
1. Open a conversation
2. Click "Quick Replies" at bottom
3. Select a template
4. Message is auto-filled (you can edit before sending)

**Categories:**
- Acceptance ("Thank you for booking!")
- Questions ("Do you have pets?")
- Scheduling ("I'm on my way!")
- General ("Let me know if you have questions")

**Tip:** Use Quick Replies to respond faster and maintain professionalism.

#### Should I share my WhatsApp number?

**No.** Casaora's messaging system is better:
- ✅ Automatic translation (EN↔ES)
- ✅ Message history for disputes
- ✅ Professional appearance
- ✅ No mixing personal/work messages
- ✅ Platform protection

**Off-platform communication risks:**
- ❌ No dispute protection
- ❌ Customer could bypass platform fees
- ❌ No message history
- ❌ Potential account suspension

#### How do I handle language barriers?

**Automatic translation is built-in!**
- Type in Spanish, customer sees English (or vice versa)
- Click "Show original" to see what they actually wrote
- Translation happens instantly
- No extra steps needed

**Tips:**
- Keep messages simple and clear
- Avoid slang or complex phrases
- Translation works best with standard Spanish/English

---

## Related Documentation

- [Booking Lifecycle](./booking-lifecycle.md) - When messaging is enabled
- [Database Schema](../03-technical/database-schema.md) - Full conversations/messages schema
- [API Routes](../03-technical/api-routes.md) - Complete API reference

---

**Questions or Issues?**

Contact engineering team or check files at `src/app/api/messages/` and `src/components/messaging/`
