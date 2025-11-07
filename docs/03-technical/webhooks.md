# Webhook Integration Guide

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Providers:** Stripe, Checkr, Truora

## Table of Contents

- [Overview](#overview)
- [Stripe Webhooks](#stripe-webhooks)
- [Background Check Webhooks](#background-check-webhooks)
- [Security & Validation](#security--validation)
- [Error Handling](#error-handling)
- [Testing Webhooks](#testing-webhooks)
- [Monitoring & Debugging](#monitoring--debugging)
- [Best Practices](#best-practices)

---

## Overview

### What are Webhooks?

Webhooks allow external services (Stripe, Checkr, Truora) to notify our application about events in real-time. This is more efficient than polling APIs.

**Webhook Flow:**
```
External Service (e.g., Stripe)
    ↓ (Payment Succeeded)
HTTP POST Request
    ↓
/api/webhooks/stripe
    ↓
Signature Verification
    ↓
Event Processing
    ↓
Database Update
    ↓
Return 200 OK
```

### Webhook Endpoints

| Provider | Endpoint | Events |
|----------|----------|--------|
| **Stripe** | `POST /api/webhooks/stripe` | Payment intents, charges, refunds |
| **Checkr** | `POST /api/webhooks/checkr` | Background check updates |
| **Truora** | `POST /api/webhooks/truora` | Background check updates |

---

## Stripe Webhooks

### Purpose

Stripe webhooks notify our application about payment events, enabling us to:
- Update booking status when payment succeeds
- Handle payment failures gracefully
- Process refunds automatically
- Manage disputes and chargebacks

### Webhook Endpoint

**Location:** [`src/app/api/webhooks/stripe/route.ts`](../../src/app/api/webhooks/stripe/route.ts)

**URL:** `https://maidconnect.com/api/webhooks/stripe`

**Method:** `POST`

**Authentication:** Stripe signature verification

---

### Supported Events

#### 1. `payment_intent.succeeded`

**Triggered:** Payment successfully authorized or captured

**Use Case:** Mark booking as confirmed/completed after payment

**Handler:**
```typescript
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) {
    console.error('No booking_id in payment intent metadata');
    return;
  }

  const supabaseAdmin = createAdminClient();

  // Update booking status
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({
      stripe_payment_status: paymentIntent.status,
      amount_captured: paymentIntent.amount_received,
      status: paymentIntent.capture_method === 'manual'
        ? 'authorized'  // Authorization only
        : 'confirmed'   // Immediate capture
    })
    .eq('id', bookingId);

  if (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }

  // Send confirmation notifications
  await sendBookingConfirmationEmail(bookingId);
  await sendPushNotification(bookingId, 'Payment confirmed');
}
```

---

#### 2. `payment_intent.payment_failed`

**Triggered:** Payment authorization or capture failed

**Use Case:** Update booking status and notify customer

**Handler:**
```typescript
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) return;

  const supabaseAdmin = createAdminClient();

  await supabaseAdmin
    .from('bookings')
    .update({
      status: 'payment_failed',
      stripe_payment_status: paymentIntent.status,
      payment_failure_reason: paymentIntent.last_payment_error?.message
    })
    .eq('id', bookingId);

  // Notify customer
  await sendPaymentFailureEmail(bookingId);
}
```

---

#### 3. `payment_intent.canceled`

**Triggered:** Payment intent was canceled

**Use Case:** Update booking status, release professional's availability

**Handler:**
```typescript
async function handlePaymentIntentCanceled(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) return;

  const supabaseAdmin = createAdminClient();

  await supabaseAdmin
    .from('bookings')
    .update({
      status: 'canceled',
      stripe_payment_status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('id', bookingId);
}
```

---

#### 4. `charge.refunded`

**Triggered:** Refund was issued for a charge

**Use Case:** Update booking payment status, track refund

**Handler:**
```typescript
async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = charge.payment_intent as string;

  const supabaseAdmin = createAdminClient();

  // Find booking by payment intent
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!booking) {
    console.error('Booking not found for payment intent:', paymentIntentId);
    return;
  }

  // Update refund status
  await supabaseAdmin
    .from('bookings')
    .update({
      refund_amount: charge.amount_refunded,
      refund_status: charge.refunded ? 'refunded' : 'partially_refunded',
      stripe_payment_status: charge.status
    })
    .eq('id', booking.id);

  // Notify customer
  await sendRefundConfirmationEmail(booking.id);
}
```

---

### Implementation

**Full Stripe Webhook Handler:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 3. Handle event type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

---

### Stripe Configuration

**1. Create Webhook Endpoint in Stripe Dashboard:**

```
Dashboard > Developers > Webhooks > Add endpoint

Endpoint URL: https://maidconnect.com/api/webhooks/stripe

Events to send:
- payment_intent.succeeded
- payment_intent.payment_failed
- payment_intent.canceled
- charge.refunded
```

**2. Get Webhook Secret:**

After creating the endpoint, Stripe provides a webhook signing secret (starts with `whsec_`).

**3. Add to Environment Variables:**

```bash
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

---

## Background Check Webhooks

### Checkr Webhooks

**Purpose:** Receive updates on professional background checks

**Endpoint:** `POST /api/webhooks/checkr`

**Supported Events:**
- `report.created` - Background check initiated
- `report.completed` - Background check completed
- `report.disputed` - Candidate disputed results

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Checkr signature
    const body = await request.text();
    const signature = request.headers.get('x-checkr-signature');

    if (!signature || !verifyCheckrSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // 2. Handle event
    switch (event.type) {
      case 'report.completed':
        await handleReportCompleted(event);
        break;

      case 'report.disputed':
        await handleReportDisputed(event);
        break;

      default:
        console.log(`Unhandled Checkr event: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Checkr webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function verifyCheckrSignature(body: string, signature: string): boolean {
  const secret = process.env.CHECKR_WEBHOOK_SECRET!;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}

async function handleReportCompleted(event: any) {
  const supabaseAdmin = createAdminClient();
  const reportId = event.data.object.id;
  const status = event.data.object.status;
  const result = event.data.object.result; // 'clear', 'consider'

  // Update background check record
  await supabaseAdmin
    .from('background_checks')
    .update({
      status: 'completed',
      clear: result === 'clear',
      completion_date: new Date().toISOString(),
      report_data: event.data.object
    })
    .eq('report_id', reportId);

  // Update professional profile
  const { data: bgCheck } = await supabaseAdmin
    .from('background_checks')
    .select('professional_id')
    .eq('report_id', reportId)
    .single();

  if (bgCheck) {
    await supabaseAdmin
      .from('professional_profiles')
      .update({
        background_check_status: result === 'clear' ? 'approved' : 'rejected',
        background_check_completed_at: new Date().toISOString()
      })
      .eq('user_id', bgCheck.professional_id);

    // Notify professional
    await sendBackgroundCheckResultEmail(bgCheck.professional_id, result);
  }
}
```

---

### Truora Webhooks

**Purpose:** Alternative background check provider (Latin America)

**Endpoint:** `POST /api/webhooks/truora`

**Events:**
- `validation.completed` - Verification completed
- `validation.rejected` - Verification failed

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Truora API key
    const apiKey = request.headers.get('x-api-key');

    if (apiKey !== process.env.TRUORA_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const event = await request.json();

    // 2. Handle validation completed
    if (event.type === 'validation.completed') {
      await handleTruoraValidationCompleted(event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Truora webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTruoraValidationCompleted(event: any) {
  const supabaseAdmin = createAdminClient();
  const validationId = event.resource_id;
  const score = event.score; // 0-100

  const approved = score >= 70; // Threshold

  await supabaseAdmin
    .from('background_checks')
    .update({
      status: 'completed',
      clear: approved,
      completion_date: new Date().toISOString(),
      report_data: event
    })
    .eq('report_id', validationId);

  // Update professional profile
  const { data: bgCheck } = await supabaseAdmin
    .from('background_checks')
    .select('professional_id')
    .eq('report_id', validationId)
    .single();

  if (bgCheck) {
    await supabaseAdmin
      .from('professional_profiles')
      .update({
        background_check_status: approved ? 'approved' : 'rejected'
      })
      .eq('user_id', bgCheck.professional_id);
  }
}
```

---

## Security & Validation

### Signature Verification

**Why?** Ensures webhooks are genuinely from the provider, not a malicious actor.

#### Stripe Signature Verification

Stripe uses HMAC SHA256 signatures with a timestamp to prevent replay attacks.

```typescript
import Stripe from 'stripe';

function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    throw new Error('Invalid signature');
  }
}
```

**Components of Stripe Signature:**
```
stripe-signature: t=1609459200,v1=abc123...,v0=def456...

t  = Timestamp
v1 = Signature using current secret
v0 = Signature using previous secret (during key rotation)
```

**Replay Attack Prevention:**
Stripe includes a timestamp. Reject events older than 5 minutes:

```typescript
const timestamp = Number(signatureParts.find(p => p.startsWith('t='))?.slice(2));
const currentTime = Math.floor(Date.now() / 1000);

if (currentTime - timestamp > 300) { // 5 minutes
  throw new Error('Timestamp too old - possible replay attack');
}
```

---

#### Checkr Signature Verification

Checkr uses HMAC SHA256 with webhook secret.

```typescript
import crypto from 'crypto';

function verifyCheckrSignature(body: string, signature: string): boolean {
  const secret = process.env.CHECKR_WEBHOOK_SECRET!;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}
```

**Timing-Safe Comparison:**
Prevents timing attacks by comparing buffers in constant time.

---

### CSRF Exemption

Webhooks are exempt from CSRF validation in `proxy.ts` because they use signature verification instead.

```typescript
// proxy.ts
const CSRF_EXEMPT_ROUTES = [
  /^\/api\/webhooks\/stripe$/,
  /^\/api\/webhooks\/checkr$/,
  /^\/api\/webhooks\/truora$/
];
```

---

### Rate Limiting

Webhooks have higher rate limits (1000 requests/minute) to handle burst traffic.

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const webhookRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true
});

export async function POST(request: NextRequest) {
  const identifier = `webhook:stripe:${request.headers.get('x-forwarded-for')}`;
  const { success } = await webhookRateLimiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process webhook...
}
```

---

## Error Handling

### Idempotency

**Problem:** Webhook might be sent multiple times by provider

**Solution:** Use event ID or idempotency key to prevent duplicate processing

```typescript
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const supabaseAdmin = createAdminClient();

  // Check if event already processed
  const { data: existing } = await supabaseAdmin
    .from('processed_webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existing) {
    console.log('Event already processed:', event.id);
    return; // Skip duplicate
  }

  // Process event
  await processPaymentIntent(event);

  // Mark event as processed
  await supabaseAdmin
    .from('processed_webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString()
    });
}
```

**Database Table:**
```sql
CREATE TABLE public.processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_processed_events_event_id ON public.processed_webhook_events(event_id);
CREATE INDEX idx_processed_events_created_at ON public.processed_webhook_events(created_at);

-- Clean up old events (older than 30 days)
DELETE FROM public.processed_webhook_events
WHERE created_at < now() - INTERVAL '30 days';
```

---

### Retry Logic

**Stripe Retry Behavior:**
- Retries failed webhooks automatically
- Exponential backoff (increasing intervals)
- Retries for up to 3 days
- Marks endpoint as disabled after multiple failures

**Best Practices:**
1. **Always return 200 OK** if event received (even if processing fails)
2. **Log errors** for manual review
3. **Use background jobs** for long-running operations

```typescript
export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    // 1. Verify signature (fast)
    event = await verifyStripeSignature(request);

    // 2. Acknowledge receipt immediately
    // Don't wait for processing to complete
  } catch (err) {
    // Signature verification failed - reject
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 3. Process asynchronously (don't block response)
  processWebhookAsync(event).catch(error => {
    console.error('Async webhook processing failed:', error);
    // Log to error tracking service (Sentry, Logtail, etc.)
  });

  // 4. Return 200 OK immediately
  return NextResponse.json({ received: true });
}

async function processWebhookAsync(event: Stripe.Event) {
  // This runs in the background
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event);
      break;
    // ... other handlers
  }
}
```

---

### Error Logging

**Use Better Stack (Logtail) for webhook errors:**

```typescript
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

export async function POST(request: NextRequest) {
  try {
    // Process webhook...
  } catch (error) {
    // Log error with context
    logtail.error('Stripe webhook processing failed', {
      error: error instanceof Error ? error.message : String(error),
      eventType: event.type,
      eventId: event.id,
      timestamp: new Date().toISOString()
    });

    // Flush logs
    await logtail.flush();

    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

---

## Testing Webhooks

### Local Development with Stripe CLI

**1. Install Stripe CLI:**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
```

**2. Login to Stripe:**
```bash
stripe login
```

**3. Forward Webhooks to Local Server:**
```bash
# Start Next.js dev server
bun run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook signing secret (starts with whsec_)
# Add to .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

**4. Trigger Test Events:**
```bash
# Trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Trigger payment_intent.payment_failed
stripe trigger payment_intent.payment_failed

# Trigger charge.refunded
stripe trigger charge.refunded
```

**5. Watch Logs:**
```bash
# In your Next.js terminal, you'll see:
[stripe-webhook] Received event: payment_intent.succeeded
[stripe-webhook] Processing booking: abc-123
[stripe-webhook] Updated booking status to: confirmed
```

---

### Testing with cURL

**Create a test webhook payload:**
```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=1609459200,v1=abc123..." \
  -d '{
    "id": "evt_test_webhook",
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 50000,
        "currency": "cop",
        "status": "succeeded",
        "metadata": {
          "booking_id": "test-booking-123"
        }
      }
    }
  }'
```

---

### Checkr Test Events

**Checkr provides a test mode for webhook testing:**

```bash
curl -X POST http://localhost:3000/api/webhooks/checkr \
  -H "Content-Type: application/json" \
  -H "x-checkr-signature: <calculated-signature>" \
  -d '{
    "id": "evt_checkr_test",
    "type": "report.completed",
    "data": {
      "object": {
        "id": "report_test_123",
        "status": "complete",
        "result": "clear"
      }
    }
  }'
```

---

## Monitoring & Debugging

### Stripe Dashboard

**View Webhook Logs:**
1. Go to Stripe Dashboard
2. Developers > Webhooks
3. Click on your endpoint
4. View request/response logs

**Webhook Health:**
- Success rate percentage
- Failed requests with error messages
- Recent delivery attempts

---

### Database Queries

**Check processed events:**
```sql
SELECT event_id, event_type, processed_at
FROM public.processed_webhook_events
WHERE event_type = 'payment_intent.succeeded'
ORDER BY processed_at DESC
LIMIT 20;
```

**Find unprocessed payments:**
```sql
SELECT id, stripe_payment_intent_id, stripe_payment_status, status
FROM public.bookings
WHERE stripe_payment_intent_id IS NOT NULL
  AND stripe_payment_status IS NULL
ORDER BY created_at DESC;
```

---

### Logging Best Practices

**1. Log All Webhook Receipts:**
```typescript
console.log(`[webhook:${provider}] Received ${event.type} (${event.id})`);
```

**2. Log Processing Steps:**
```typescript
console.log(`[webhook:${provider}] Processing booking ${bookingId}`);
console.log(`[webhook:${provider}] Updated booking status to ${newStatus}`);
```

**3. Log Errors with Context:**
```typescript
console.error(`[webhook:${provider}] Failed to process ${event.type}`, {
  eventId: event.id,
  error: error.message,
  bookingId
});
```

**4. Use Structured Logging:**
```typescript
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

logtail.info('Webhook received', {
  provider: 'stripe',
  eventType: event.type,
  eventId: event.id,
  bookingId: event.data.object.metadata.booking_id
});
```

---

## Best Practices

### 1. Always Verify Signatures

```typescript
// ❌ WRONG: Trusting webhook without verification
export async function POST(request: NextRequest) {
  const event = await request.json();
  // Process event without verification - DANGEROUS!
}

// ✅ CORRECT: Always verify signature first
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  // Now safe to process
}
```

---

### 2. Return 200 OK Quickly

```typescript
// ❌ WRONG: Blocking response while processing
export async function POST(request: NextRequest) {
  const event = await verifySignature(request);

  // This takes 5+ seconds...
  await processBooking(event);
  await sendEmails(event);
  await updateAnalytics(event);

  return NextResponse.json({ received: true }); // Provider times out!
}

// ✅ CORRECT: Acknowledge immediately, process async
export async function POST(request: NextRequest) {
  const event = await verifySignature(request);

  // Process in background
  processWebhookAsync(event);

  // Return immediately
  return NextResponse.json({ received: true });
}
```

---

### 3. Implement Idempotency

```typescript
// ✅ CORRECT: Track processed events
async function handleEvent(event: Stripe.Event) {
  const { data: existing } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existing) {
    console.log('Event already processed');
    return;
  }

  // Process event...

  // Mark as processed
  await supabase
    .from('processed_webhook_events')
    .insert({ event_id: event.id, event_type: event.type });
}
```

---

### 4. Handle All Event Types Gracefully

```typescript
// ✅ CORRECT: Log unhandled events
switch (event.type) {
  case 'payment_intent.succeeded':
    await handlePaymentIntentSucceeded(event);
    break;

  case 'payment_intent.payment_failed':
    await handlePaymentIntentFailed(event);
    break;

  default:
    // Don't fail - just log
    console.log(`Unhandled event type: ${event.type}`);
}
```

---

### 5. Monitor Webhook Health

**Set up alerts for:**
- High failure rate (>5%)
- Webhook endpoint disabled
- Processing time >1 second
- Database update failures

**Use Better Stack for monitoring:**
```typescript
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN!);

// Track webhook health
logtail.info('Webhook processed successfully', {
  provider: 'stripe',
  eventType: event.type,
  processingTimeMs: Date.now() - startTime
});

// Alert on failures
if (error) {
  logtail.error('Webhook processing failed', {
    provider: 'stripe',
    eventType: event.type,
    error: error.message
  });
}
```

---

### 6. Test Webhooks Thoroughly

**Checklist:**
- [x] Test signature verification with invalid signatures
- [x] Test idempotency (send same event twice)
- [x] Test all event types
- [x] Test error scenarios (database down, invalid data)
- [x] Test with Stripe CLI locally
- [x] Test with actual events in staging
- [x] Monitor production webhooks after deployment

---

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Checkr Webhooks Guide](https://docs.checkr.com/webhooks)
- [Truora API Documentation](https://docs.truora.com/)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Better Stack Logging](https://betterstack.com/docs)
- [API Reference](./api-reference.md)
- [Database Schema](./database-schema.md)

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
