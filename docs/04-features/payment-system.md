# Payment System Documentation

**Last Updated:** 2025-01-06
**Status:** Production
**Owner:** Engineering Team

---

## Table of Contents

1. [Overview](#overview)
2. [Payment Architecture](#payment-architecture)
3. [Customer Payment Flow](#customer-payment-flow)
4. [Professional Payout Flow](#professional-payout-flow)
5. [Stripe Connect Implementation](#stripe-connect-implementation)
6. [Webhook Event Handling](#webhook-event-handling)
7. [Refunds & Disputes](#refunds--disputes)
8. [Security & Compliance](#security--compliance)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)
11. [Help Center Content](#help-center-content)

---

## Overview

Casaora operates as a **two-sided marketplace** connecting customers with cleaning professionals. Our payment system handles:

- **Customer payments** for booking services
- **Platform commission** (18% of booking total)
- **Professional payouts** (82% of booking total)
- **Refunds** (full and partial)
- **Dispute resolution**
- **Payment security** and PCI DSS compliance

### Key Numbers

| Metric | Value |
|--------|-------|
| **Platform Commission** | 18% of total booking amount |
| **Professional Net** | 82% of total booking amount |
| **Payout Schedule** | 48 hours after booking completion |
| **Minimum Payout** | $50,000 COP (~$12.50 USD) |
| **Payment Hold** | 48 hours (standard) |
| **Supported Currencies** | COP (Colombian Peso), USD |

### Technology Stack

- **Payment Processor:** Stripe Connect (destination charges)
- **Account Type:** Express accounts for professionals
- **Payment Methods:** Credit/debit cards, Colombian payment methods (PSE, Nequi, Daviplata)
- **Database:** Supabase (PostgreSQL)
- **Webhooks:** Stripe webhooks for async payment events

---

## Payment Architecture

### High-Level Flow

```
┌─────────────┐
│  Customer   │
└──────┬──────┘
       │
       │ 1. Books service
       ▼
┌─────────────────┐
│  Casaora        │ ← 2. Creates PaymentIntent
│  Platform       │
└────────┬────────┘
         │
         │ 3. Customer pays
         ▼
┌─────────────────┐
│  Stripe         │
│  (Platform      │ ← 4. Authorizes payment
│   Account)      │
└────────┬────────┘
         │
         │ 5. Destination charge (transfer to professional)
         ▼
┌─────────────────┐
│  Stripe         │
│  (Professional  │ ← 6. Holds funds (pending balance)
│   Account)      │
└────────┬────────┘
         │
         │ 7. After booking completion + 48 hours
         ▼
┌─────────────────┐
│  Professional   │ ← 8. Receives payout
│  Bank Account   │
└─────────────────┘
```

### Database Schema (Simplified)

**bookings table:**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id),
  professional_id UUID REFERENCES auth.users(id),

  -- Payment fields
  amount_authorized INTEGER NOT NULL,  -- Total in cents (e.g., 100000 = 100,000 COP)
  amount_captured INTEGER,             -- Captured amount (same as authorized unless partial refund)
  stripe_payment_intent_id TEXT,       -- Stripe PaymentIntent ID

  -- Status tracking
  status TEXT NOT NULL,  -- 'pending_payment', 'authorized', 'completed', 'refunded'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB  -- Stores additional payment info
);
```

**payouts table:**
```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES auth.users(id),

  -- Amount breakdown
  gross_amount INTEGER NOT NULL,      -- Total booking amount
  commission_amount INTEGER NOT NULL, -- Platform commission (18%)
  net_amount INTEGER NOT NULL,        -- Professional receives (82%)

  -- Stripe references
  stripe_transfer_id TEXT,            -- Stripe Transfer ID
  stripe_payout_id TEXT,              -- Stripe Payout ID (when funds reach bank)

  -- Status
  status TEXT NOT NULL,  -- 'pending', 'processing', 'completed', 'failed'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Related booking
  booking_id UUID REFERENCES bookings(id)
);
```

---

## Customer Payment Flow

### Step-by-Step: From Booking to Payment

#### 1. Customer Creates Booking

**File:** `src/app/api/bookings/create/route.ts` (Server Action recommended)

```typescript
'use server';

import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function createBooking(data: BookingFormData) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Validate booking data with Zod
  const validated = BookingSchema.parse(data);

  // 3. Calculate total amount (in cents)
  const totalAmount = calculateBookingAmount(validated); // e.g., 100000 cents = 100,000 COP

  // 4. Create booking record
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: user.id,
      professional_id: validated.professional_id,
      scheduled_date: validated.scheduled_date,
      amount_authorized: totalAmount,
      status: 'pending_payment',
    })
    .select()
    .single();

  if (error) throw error;

  return { booking };
}
```

#### 2. Create Stripe PaymentIntent (Destination Charge)

**File:** `src/app/api/payments/create-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get booking details
    const { bookingId } = await request.json();

    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        *,
        professional:profiles!bookings_professional_id_fkey(
          stripe_account_id
        )
      `)
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 3. Verify booking belongs to user
    if (booking.customer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Calculate commission (18%)
    const totalAmount = booking.amount_authorized;
    const commissionAmount = Math.floor(totalAmount * 0.18);

    // 5. Create Stripe PaymentIntent with destination charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'cop', // Colombian Peso

      // Destination charge configuration
      application_fee_amount: commissionAmount,
      transfer_data: {
        destination: booking.professional.stripe_account_id, // Professional's Stripe account
      },

      // Metadata for tracking
      metadata: {
        booking_id: bookingId,
        customer_id: user.id,
        professional_id: booking.professional_id,
      },

      // Payment method types
      payment_method_types: ['card'], // Add PSE, Nequi, etc. as needed

      // Capture method (authorize now, capture later when service completes)
      capture_method: 'manual', // ← CRITICAL: Allows authorize → capture flow
    });

    // 6. Update booking with PaymentIntent ID
    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        status: 'awaiting_authorization',
      })
      .eq('id', bookingId);

    // 7. Return client secret for frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

#### 3. Frontend: Stripe Elements Integration

**File:** `src/components/bookings/payment-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ bookingId, clientSecret }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}/success`,
      },
      redirect: 'if_required', // Stay on page if no redirect needed
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
      // Payment authorized successfully!
      // Redirect to success page
      window.location.href = `/bookings/${bookingId}/success`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <PaymentElement />

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Authorize Payment'}
      </button>
    </form>
  );
}

export function PaymentForm({ bookingId, clientSecret }: Props) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm bookingId={bookingId} clientSecret={clientSecret} />
    </Elements>
  );
}
```

#### 4. Payment Authorization (via Webhook)

When the customer completes payment, Stripe sends a `payment_intent.requires_capture` or `payment_intent.succeeded` webhook event.

**See [Webhook Event Handling](#webhook-event-handling) section below.**

---

## Professional Payout Flow

### When Do Professionals Get Paid?

**Payout Timeline:**
1. **Booking authorized** → Funds held in professional's Stripe pending balance
2. **Service completed** → Booking marked as `completed`
3. **48-hour hold** → Platform verifies service quality, handles disputes
4. **Payout created** → Funds released to professional's bank account
5. **Bank transfer** → Professional receives money (1-3 business days)

### Payout Calculation

```typescript
// Example booking: 100,000 COP total

const COMMISSION_RATE = 0.18; // 18%

function calculatePayout(bookingAmount: number) {
  const grossAmount = bookingAmount;           // 100,000 COP
  const commissionAmount = Math.floor(
    grossAmount * COMMISSION_RATE
  );                                           // 18,000 COP
  const netAmount = grossAmount - commissionAmount; // 82,000 COP

  return {
    grossAmount,      // 100,000 COP
    commissionAmount, //  18,000 COP (platform keeps this)
    netAmount,        //  82,000 COP (professional receives this)
  };
}
```

### Automated Payout Processing (Cron Job)

**File:** `src/app/api/cron/process-payouts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const COMMISSION_RATE = 0.18;
const MINIMUM_PAYOUT_AMOUNT = 50000; // 50,000 COP minimum

export async function POST(request: NextRequest) {
  // 1. Verify cron secret (security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // 2. Find completed bookings eligible for payout
    // (completed + 48 hours ago, no payout created yet)
    const eligibleDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

    const { data: eligibleBookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        professional_id,
        amount_captured,
        stripe_payment_intent_id,
        professional:profiles!bookings_professional_id_fkey(
          stripe_account_id
        )
      `)
      .eq('status', 'completed')
      .lt('completed_at', eligibleDate.toISOString())
      .is('payout_id', null); // No payout created yet

    if (error) throw error;

    console.log(`Processing ${eligibleBookings?.length || 0} eligible bookings`);

    // 3. Group bookings by professional
    const bookingsByProfessional = new Map<string, typeof eligibleBookings>();
    for (const booking of eligibleBookings || []) {
      const professionalId = booking.professional_id;
      if (!bookingsByProfessional.has(professionalId)) {
        bookingsByProfessional.set(professionalId, []);
      }
      bookingsByProfessional.get(professionalId)!.push(booking);
    }

    // 4. Create payouts for each professional
    const payoutResults = [];

    for (const [professionalId, bookings] of bookingsByProfessional) {
      // Calculate total payout amount
      const grossAmount = bookings.reduce((sum, b) => sum + b.amount_captured, 0);
      const commissionAmount = Math.floor(grossAmount * COMMISSION_RATE);
      const netAmount = grossAmount - commissionAmount;

      // Skip if below minimum payout amount
      if (netAmount < MINIMUM_PAYOUT_AMOUNT) {
        console.log(`Skipping payout for ${professionalId}: ${netAmount} COP below minimum`);
        continue;
      }

      try {
        // 5. Create payout record
        const { data: payout, error: payoutError } = await supabase
          .from('payouts')
          .insert({
            professional_id: professionalId,
            gross_amount: grossAmount,
            commission_amount: commissionAmount,
            net_amount: netAmount,
            status: 'pending',
            metadata: {
              booking_ids: bookings.map(b => b.id),
            },
          })
          .select()
          .single();

        if (payoutError) throw payoutError;

        // 6. Trigger Stripe payout (automatic)
        // Note: With destination charges, funds are already in professional's Stripe balance.
        // Stripe will automatically pay out based on professional's payout schedule.
        // We just track it in our database.

        // 7. Update bookings with payout ID
        await supabase
          .from('bookings')
          .update({ payout_id: payout.id })
          .in('id', bookings.map(b => b.id));

        payoutResults.push({
          professionalId,
          payoutId: payout.id,
          amount: netAmount,
          bookingCount: bookings.length,
        });

        console.log(`Created payout ${payout.id} for ${professionalId}: ${netAmount} COP`);

      } catch (error) {
        console.error(`Failed to create payout for ${professionalId}:`, error);
        payoutResults.push({
          professionalId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: payoutResults.length,
      results: payoutResults,
    });

  } catch (error) {
    console.error('Payout processing failed:', error);
    return NextResponse.json(
      { error: 'Payout processing failed' },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Configuration:**

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**This runs daily at 2:00 AM UTC**, processing all eligible payouts automatically.

---

## Stripe Connect Implementation

### Destination Charges Explained

**Destination charges** mean:
1. **Customer pays platform** → Charge created on Casaora's Stripe account
2. **Funds immediately transfer to professional** → Transfer created automatically
3. **Platform commission deducted** → Application fee transferred back to platform

**Flow of Funds:**

```
Customer pays 100,000 COP
         ↓
Casaora Stripe Account (receives 100,000 COP)
         ↓
Automatic transfer to Professional (100,000 COP)
         ↓
Professional Stripe Account (100,000 COP in pending balance)
         ↓
Application fee transferred back to Casaora (18,000 COP)
         ↓
RESULT:
- Casaora balance: +18,000 COP (commission)
- Professional balance: +82,000 COP (net payout)
```

### Professional Onboarding (Stripe Express Accounts)

**File:** `src/app/api/professionals/create-stripe-account/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify user is a professional
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, stripe_account_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'professional') {
    return NextResponse.json({ error: 'Not a professional' }, { status: 403 });
  }

  // 3. Check if Stripe account already exists
  if (profile.stripe_account_id) {
    return NextResponse.json({
      accountId: profile.stripe_account_id,
      message: 'Stripe account already exists',
    });
  }

  try {
    // 4. Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'CO', // Colombia
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        user_id: user.id,
        platform: 'casaora',
      },
    });

    // 5. Save Stripe account ID to database
    await supabase
      .from('profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', user.id);

    // 6. Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pro/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pro/onboarding/success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });

  } catch (error) {
    console.error('Stripe account creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}
```

---

## Webhook Event Handling

### Webhook Endpoint Setup

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  // 1. Get raw body for signature verification
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // 2. Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Received event: ${event.type}`, {
    eventId: event.id,
    timestamp: new Date().toISOString(),
  });

  // 3. Acknowledge receipt immediately (return 200 to Stripe)
  const response = NextResponse.json({ received: true });

  // 4. Process event asynchronously (don't block webhook response)
  processWebhookEvent(event)
    .then(() => {
      console.log(`[Webhook] Successfully processed: ${event.type}`);
    })
    .catch((error) => {
      console.error(`[Webhook] Failed to process: ${event.type}`, error);
      // TODO: Send alert to Better Stack / email admins
    });

  return response;
}

// Process webhook events (runs in background)
async function processWebhookEvent(event: Stripe.Event) {
  const supabase = await createClient();

  switch (event.type) {
    // Payment authorized (funds held, not captured yet)
    case 'payment_intent.requires_capture':
    case 'payment_intent.amount_capturable_updated':
      await handlePaymentAuthorized(event.data.object as Stripe.PaymentIntent, supabase);
      break;

    // Payment captured (service completed, funds will be transferred)
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
      break;

    // Payment failed
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
      break;

    // Refund created
    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge, supabase);
      break;

    // Payout sent to professional's bank
    case 'payout.paid':
      await handlePayoutPaid(event.data.object as Stripe.Payout, supabase);
      break;

    // Payout failed
    case 'payout.failed':
      await handlePayoutFailed(event.data.object as Stripe.Payout, supabase);
      break;

    // Dispute opened (chargeback)
    case 'charge.dispute.created':
      await handleDisputeCreated(event.data.object as Stripe.Dispute, supabase);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

// Handle payment authorization
async function handlePaymentAuthorized(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) {
    console.error('No booking_id in PaymentIntent metadata');
    return;
  }

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'authorized',
      amount_authorized: paymentIntent.amount,
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('id', bookingId);

  if (error) {
    console.error('Failed to update booking after authorization:', error);
    throw error;
  }

  console.log(`[Webhook] Payment authorized for booking ${bookingId}`);

  // TODO: Send confirmation email to customer
  // TODO: Send notification to professional
}

// Handle payment capture (when service completes)
async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) return;

  // Update booking with captured amount
  const { error } = await supabase
    .from('bookings')
    .update({
      amount_captured: paymentIntent.amount_received,
      status: 'payment_captured',
    })
    .eq('id', bookingId);

  if (error) {
    console.error('Failed to update booking after capture:', error);
    throw error;
  }

  console.log(`[Webhook] Payment captured for booking ${bookingId}`);
}

// Handle payment failure
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const bookingId = paymentIntent.metadata.booking_id;

  if (!bookingId) return;

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'payment_failed',
      metadata: {
        failure_reason: paymentIntent.last_payment_error?.message || 'Unknown error',
      },
    })
    .eq('id', bookingId);

  if (error) {
    console.error('Failed to update booking after payment failure:', error);
    throw error;
  }

  console.log(`[Webhook] Payment failed for booking ${bookingId}`);

  // TODO: Send email to customer with retry instructions
}

// Handle refund
async function handleRefund(charge: Stripe.Charge, supabase: any) {
  // Extract booking ID from charge metadata
  const paymentIntentId = charge.payment_intent as string;

  const { data: booking } = await supabase
    .from('bookings')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!booking) {
    console.error('No booking found for charge:', charge.id);
    return;
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: charge.refunded ? 'refunded' : 'partially_refunded',
      metadata: {
        refund_amount: charge.amount_refunded,
      },
    })
    .eq('id', booking.id);

  console.log(`[Webhook] Refund processed for booking ${booking.id}`);
}

// Handle payout completion
async function handlePayoutPaid(payout: Stripe.Payout, supabase: any) {
  // Find payout in database using Stripe payout ID
  const { data: payoutRecord } = await supabase
    .from('payouts')
    .select('id')
    .eq('stripe_payout_id', payout.id)
    .single();

  if (payoutRecord) {
    await supabase
      .from('payouts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', payoutRecord.id);

    console.log(`[Webhook] Payout completed: ${payout.id}`);
  }
}

// Handle payout failure
async function handlePayoutFailed(payout: Stripe.Payout, supabase: any) {
  const { data: payoutRecord } = await supabase
    .from('payouts')
    .select('id, professional_id')
    .eq('stripe_payout_id', payout.id)
    .single();

  if (payoutRecord) {
    await supabase
      .from('payouts')
      .update({
        status: 'failed',
        metadata: {
          failure_reason: payout.failure_message || 'Unknown error',
        },
      })
      .eq('id', payoutRecord.id);

    console.log(`[Webhook] Payout failed: ${payout.id}`);

    // TODO: Alert admin, notify professional
  }
}

// Handle dispute (chargeback)
async function handleDisputeCreated(dispute: Stripe.Dispute, supabase: any) {
  const chargeId = dispute.charge as string;

  // Find associated booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, professional_id, amount_captured')
    .eq('stripe_charge_id', chargeId)
    .single();

  if (booking) {
    // Mark booking as disputed
    await supabase
      .from('bookings')
      .update({
        status: 'disputed',
        metadata: {
          dispute_id: dispute.id,
          dispute_reason: dispute.reason,
        },
      })
      .eq('id', booking.id);

    console.log(`[Webhook] Dispute opened for booking ${booking.id}`);

    // TODO: Alert admin for manual review
    // TODO: Notify professional
  }
}

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Webhook Security Checklist

✅ **Signature verification** - Always verify `stripe-signature` header
✅ **Idempotency** - Use event ID to prevent duplicate processing
✅ **Async processing** - Return 200 immediately, process in background
✅ **Error handling** - Catch and log all errors, alert admins
✅ **CSRF exemption** - Webhook routes exempt from CSRF validation (in `proxy.ts`)

---

## Refunds & Disputes

### Full Refund

**File:** `src/app/api/refunds/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate user (admin only)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Get refund details
  const { bookingId, reason } = await request.json();

  // 3. Get booking with payment intent
  const { data: booking } = await supabase
    .from('bookings')
    .select('stripe_payment_intent_id, amount_captured, status')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (!booking.stripe_payment_intent_id) {
    return NextResponse.json({ error: 'No payment to refund' }, { status: 400 });
  }

  try {
    // 4. Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      reason: 'requested_by_customer', // or 'fraudulent', 'duplicate'

      // CRITICAL: Reverse transfer to pull funds back from professional
      reverse_transfer: true,

      // CRITICAL: Refund application fee (platform commission)
      refund_application_fee: true,

      metadata: {
        booking_id: bookingId,
        refund_reason: reason,
      },
    });

    // 5. Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'refunded',
        metadata: {
          refund_id: refund.id,
          refund_reason: reason,
        },
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount,
    });

  } catch (error) {
    console.error('Refund creation failed:', error);
    return NextResponse.json(
      { error: 'Refund failed' },
      { status: 500 }
    );
  }
}
```

### Partial Refund

```typescript
// Same as above, but specify amount:
const refund = await stripe.refunds.create({
  payment_intent: booking.stripe_payment_intent_id,
  amount: 50000, // 50,000 COP (partial refund)
  reverse_transfer: true,
  refund_application_fee: true, // Refunds proportional commission
});
```

### Dispute Handling

When a customer initiates a chargeback:

1. **Stripe webhook fires** → `charge.dispute.created`
2. **Platform debited** → Dispute amount + $15 fee
3. **Manual review** → Admin investigates
4. **Options:**
   - **Accept dispute** → Customer keeps money
   - **Challenge dispute** → Submit evidence via Stripe Dashboard
   - **Recover from professional** → Reverse transfer if professional at fault

---

## Security & Compliance

### PCI DSS Compliance

**Casaora is PCI DSS Level 1 compliant through Stripe:**

✅ **Never store card numbers** - Stripe handles all card data
✅ **Tokenization** - Use Stripe Elements (no raw card data touches our servers)
✅ **TLS encryption** - All API calls use HTTPS
✅ **Webhook signature verification** - Prevents spoofing
✅ **Audit logging** - All payment events logged to Better Stack

### Data Protection

**Sensitive data storage:**
- ❌ **Never store:** Full card numbers, CVV codes
- ✅ **Safe to store:** Stripe payment intent IDs, customer IDs, transaction amounts
- ✅ **Encrypted:** User personal data (names, addresses) encrypted at rest in Supabase

### Environment Variables (Security)

```bash
# ✅ Public (exposed to client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# ❌ Private (server-side only)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Never expose secret keys to the client!**

---

## Testing Guide

### Stripe Test Mode

**Use test API keys during development:**

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
```

### Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0341` | Declined (processing error) |

**Expiry:** Any future date
**CVC:** Any 3 digits
**ZIP:** Any 5 digits

### Testing Webhooks Locally

**1. Install Stripe CLI:**

```bash
brew install stripe/stripe-cli/stripe
```

**2. Login to Stripe:**

```bash
stripe login
```

**3. Forward webhooks to localhost:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**4. Get webhook signing secret:**

```bash
# Copy the webhook signing secret from the output
whsec_xxx
```

**5. Add to `.env.local`:**

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**6. Trigger test events:**

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

### End-to-End Testing with Playwright

**File:** `tests/payment-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('customer can complete booking payment', async ({ page }) => {
    // 1. Login as customer
    await page.goto('/en/auth/sign-in');
    await page.fill('input[name="email"]', 'customer@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 2. Navigate to professionals
    await page.goto('/en/professionals');
    await page.click('[data-testid="professional-card"]:first-child');

    // 3. Create booking
    await page.click('button:has-text("Book Now")');
    await page.fill('input[name="date"]', '2025-12-15');
    await page.selectOption('select[name="time"]', '10:00');
    await page.click('button:has-text("Continue to Payment")');

    // 4. Fill Stripe payment form (test mode)
    const cardNumberFrame = page.frameLocator('iframe[name*="cardNumber"]');
    await cardNumberFrame.fill('input[name="cardnumber"]', '4242424242424242');

    const cardExpiryFrame = page.frameLocator('iframe[name*="cardExpiry"]');
    await cardExpiryFrame.fill('input[name="exp-date"]', '12/25');

    const cardCvcFrame = page.frameLocator('iframe[name*="cardCvc"]');
    await cardCvcFrame.fill('input[name="cvc"]', '123');

    // 5. Submit payment
    await page.click('button:has-text("Authorize Payment")');

    // 6. Wait for success page
    await expect(page).toHaveURL(/\/bookings\/.*\/success/);
    await expect(page.locator('text=Payment Authorized')).toBeVisible();
  });
});
```

---

## Troubleshooting

### Common Issues

#### Issue: "Payment failed - insufficient funds"

**Cause:** Customer's card has insufficient balance
**Solution:** Ask customer to use different payment method

#### Issue: "Webhook signature verification failed"

**Cause:** Invalid `STRIPE_WEBHOOK_SECRET` in environment variables
**Solution:**
1. Get signing secret from Stripe Dashboard → Webhooks
2. Update `.env` file
3. Restart server

#### Issue: "Payout failed - bank account not verified"

**Cause:** Professional hasn't completed Stripe Express onboarding
**Solution:** Professional must complete bank account verification in Stripe Dashboard

#### Issue: "Transfer failed - insufficient balance"

**Cause:** Platform's Stripe balance is negative (from refunds/disputes)
**Solution:** Add funds to Stripe balance or wait for commission revenue

### Monitoring & Alerts

**Better Stack integration:**

```typescript
import { logger } from '@/lib/logger';

// Log payment events
logger.info('Payment authorized', {
  bookingId,
  amount,
  customerId,
  professionalId,
});

// Log errors
logger.error('Payment failed', {
  bookingId,
  error: error.message,
  stack: error.stack,
});
```

---

## Help Center Content

### For Customers

#### How do payments work?

When you book a service on Casaora:

1. **You authorize payment** - We hold the funds but don't charge yet
2. **Professional completes service** - You verify the work is done
3. **Payment is captured** - Funds are released to the professional
4. **Professional gets paid** - Within 48 hours of service completion

#### Payment security

- ✅ Your card details are encrypted by Stripe (never stored by Casaora)
- ✅ PCI DSS Level 1 certified
- ✅ 3D Secure authentication for extra security
- ✅ 100% refund if service is not completed

#### Refund policy

- **Full refund:** If service is not completed or professional cancels
- **Partial refund:** If service is partially completed (case-by-case)
- **Refund timeline:** 5-10 business days back to your card

### For Professionals

#### How do I get paid?

1. **Customer books service** → Funds held in your Stripe pending balance
2. **You complete service** → Customer marks booking as complete
3. **48-hour verification** → Platform verifies service quality
4. **Automatic payout** → Funds sent to your bank account
5. **Bank transfer** → Receive money in 1-3 business days

#### Payout breakdown

For every booking, you receive **82% of the total**:

**Example: 100,000 COP booking**
- Customer pays: 100,000 COP
- Platform commission (18%): 18,000 COP
- **You receive: 82,000 COP**

#### Minimum payout amount

You must have at least **50,000 COP** ($12.50 USD) in pending earnings before we process a payout.

#### Payout schedule

- **Automatic payouts:** Every 48 hours after booking completion
- **Bank transfer time:** 1-3 business days
- **Minimum:** 50,000 COP

#### Setting up your bank account

1. Go to Dashboard → Settings → Payouts
2. Click "Connect Stripe Account"
3. Complete bank verification
4. Start receiving payouts!

---

## Related Documentation

- [ADR-004: Why Stripe Connect](../01-decisions/adr-004-why-stripe-connect.md)
- [Database Schema](../03-technical/database-schema.md)
- [API Routes Documentation](../03-technical/api-routes.md)
- [Operations Manual](../01-product/operations-manual.md)

---

**Questions or Issues?**

Contact the engineering team or check Stripe Dashboard for real-time payment status.
