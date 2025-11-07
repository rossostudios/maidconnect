# Booking Lifecycle Documentation

**Last Updated:** 2025-01-06
**Status:** Production
**Owner:** Engineering Team

---

## Table of Contents

1. [Overview](#overview)
2. [Booking State Machine](#booking-state-machine)
3. [Customer Booking Flow](#customer-booking-flow)
4. [Professional Booking Flow](#professional-booking-flow)
5. [State Transitions](#state-transitions)
6. [API Endpoints](#api-endpoints)
7. [GPS Verification](#gps-verification)
8. [Cancellation & Rescheduling](#cancellation--rescheduling)
9. [Time Extensions](#time-extensions)
10. [Disputes](#disputes)
11. [Security & Validation](#security--validation)
12. [Help Center Content](#help-center-content)

---

## Overview

A **booking** is the core transaction unit in Casaora, representing a scheduled cleaning service between a customer and a professional. Each booking goes through a well-defined lifecycle from creation to completion (or cancellation).

### Key Concepts

- **Duration-based pricing** - Bookings are priced by time (e.g., 100,000 COP for 4 hours)
- **GPS verification** - Check-in/check-out requires GPS within 150 meters of service address
- **Payment hold** - Payment authorized upfront, captured only after service completion
- **48-hour payout** - Professionals paid 48 hours after service completion
- **Two-sided actions** - Both customer and professional can take actions at different stages

---

## Booking State Machine

### All Possible States

```typescript
type BookingStatus =
  | 'pending_payment'    // Initial state - customer created booking, payment pending
  | 'authorized'         // Payment authorized, awaiting professional acceptance
  | 'confirmed'          // Professional accepted, service scheduled
  | 'in_progress'        // Service actively running (checked in)
  | 'completed'          // Service finished, payment captured
  | 'declined'           // Professional declined the booking
  | 'canceled';          // Customer or professional canceled
```

### State Machine Diagram

```
┌─────────────────┐
│  pending_payment│ ← Booking created
└────────┬────────┘
         │
         │ Customer pays
         ▼
┌─────────────────┐
│   authorized    │ ← Payment held, professional notified
└────┬───────┬────┘
     │       │
     │       │ Professional declines
     │       ▼
     │    ┌─────────────────┐
     │    │    declined     │ → Refund issued
     │    └─────────────────┘
     │
     │ Professional accepts
     ▼
┌─────────────────┐
│   confirmed     │ ← Scheduled, awaiting service date
└────────┬────────┘
         │
         │ Customer cancels (>24h before)
         ├──────────────────────┐
         │                      ▼
         │                   ┌─────────────────┐
         │                   │    canceled     │ → Refund issued
         │                   └─────────────────┘
         │
         │ Service date arrives, professional checks in
         ▼
┌─────────────────┐
│  in_progress    │ ← Service actively running
└────────┬────────┘
         │
         │ Professional checks out
         ▼
┌─────────────────┐
│   completed     │ → Payment captured, payout scheduled
└─────────────────┘
```

### State Transition Rules

| From State | To State | Trigger | Who Can Trigger |
|------------|----------|---------|-----------------|
| `pending_payment` | `authorized` | Payment succeeds | Stripe webhook |
| `authorized` | `confirmed` | Professional accepts | Professional |
| `authorized` | `declined` | Professional declines | Professional |
| `authorized` | `canceled` | Customer cancels | Customer |
| `confirmed` | `in_progress` | Professional checks in | Professional |
| `confirmed` | `canceled` | Customer cancels (>24h) | Customer |
| `in_progress` | `completed` | Professional checks out | Professional |
| `completed` | *(final state)* | - | - |
| `declined` | *(final state)* | - | - |
| `canceled` | *(final state)* | - | - |

---

## Customer Booking Flow

### Step-by-Step: From Search to Completion

#### 1. Browse Professionals

**Page:** `/[locale]/professionals`

**Customer actions:**
- Search by location, service type, availability
- Filter by rating, price range, verified status
- View professional profiles

**Implementation:**
```typescript
// src/app/[locale]/professionals/page.tsx
export default async function ProfessionalsPage({ searchParams }: Props) {
  const supabase = await createClient();

  const { data: professionals } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      hourly_rate,
      rating,
      total_reviews,
      verified
    `)
    .eq('role', 'professional')
    .eq('onboarding_status', 'approved')
    .order('rating', { ascending: false });

  return <ProfessionalGrid professionals={professionals} />;
}
```

#### 2. Select Professional & Time

**Page:** `/[locale]/professionals/[id]`

**Customer selects:**
- Service date & time
- Duration (minimum 2 hours, maximum 8 hours)
- Service address
- Special instructions

**Validation:**
- Date must be at least 24 hours in future
- Time slot must be available
- Duration must be in 30-minute increments

#### 3. Create Booking

**API Endpoint:** `POST /api/bookings`

**File:** `src/app/api/bookings/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { z } from 'zod';

// Zod schema for validation
const CreateBookingSchema = z.object({
  professional_id: z.string().uuid(),
  scheduled_start: z.string().datetime(),
  duration_minutes: z.number().min(120).max(480).multipleOf(30), // 2-8 hours
  service_address: z.object({
    street: z.string().min(5),
    city: z.string(),
    department: z.string(),
    postal_code: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  special_instructions: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate customer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validated = CreateBookingSchema.parse(body);

    // 3. Get professional's hourly rate
    const { data: professional } = await supabase
      .from('profiles')
      .select('hourly_rate, availability')
      .eq('id', validated.professional_id)
      .single();

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      );
    }

    // 4. Calculate total amount (SERVER-SIDE ONLY - never trust client)
    const hours = validated.duration_minutes / 60;
    const totalAmount = Math.floor(professional.hourly_rate * hours); // In cents

    // 5. Validate availability (check for conflicts)
    const scheduledStart = new Date(validated.scheduled_start);
    const scheduledEnd = new Date(
      scheduledStart.getTime() + validated.duration_minutes * 60 * 1000
    );

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('professional_id', validated.professional_id)
      .in('status', ['confirmed', 'in_progress'])
      .or(
        `and(scheduled_start.lte.${scheduledEnd.toISOString()},scheduled_end.gte.${scheduledStart.toISOString()})`
      );

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 409 }
      );
    }

    // 6. Create booking record
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        professional_id: validated.professional_id,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        duration_minutes: validated.duration_minutes,
        amount_estimated: totalAmount,
        amount_authorized: totalAmount,
        service_address: validated.service_address,
        special_instructions: validated.special_instructions,
        status: 'pending_payment',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      booking,
      totalAmount,
      message: 'Booking created successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
```

**Rate Limiting:** 20 requests per minute per user

#### 4. Authorize Payment

**API Endpoint:** `POST /api/bookings/authorize`

**See [Payment System Documentation](./payment-system.md#customer-payment-flow) for complete payment authorization flow.**

**Key points:**
- Creates Stripe PaymentIntent with `capture_method: 'manual'`
- Funds are authorized (held) but not captured yet
- Customer completes payment in Stripe-hosted form
- On success, booking status → `authorized`

#### 5. Professional Accepts

**Notification sent to professional via:**
- Push notification (mobile app)
- Email notification
- In-app notification

**Professional reviews:**
- Service details
- Customer location (distance from their area)
- Estimated earnings (82% of total)
- Schedule availability

**Professional chooses:**
- **Accept** → Booking status → `confirmed`
- **Decline** → Booking status → `declined`, customer refunded

#### 6. Service Day: Professional Checks In

**API Endpoint:** `POST /api/bookings/check-in`

**GPS Verification Required:** Professional must be within 150 meters of service address

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

const GPS_TOLERANCE_METERS = 150;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate professional
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get booking and GPS coordinates
  const { bookingId, latitude, longitude } = await request.json();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 3. Verify booking belongs to professional
  if (booking.professional_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Verify booking status
  if (booking.status !== 'confirmed') {
    return NextResponse.json(
      { error: 'Booking must be confirmed to check in' },
      { status: 400 }
    );
  }

  // 5. GPS verification (Haversine formula)
  const distance = calculateDistance(
    latitude,
    longitude,
    booking.service_address.latitude,
    booking.service_address.longitude
  );

  if (distance > GPS_TOLERANCE_METERS) {
    return NextResponse.json(
      {
        error: 'GPS verification failed',
        message: `You must be within ${GPS_TOLERANCE_METERS}m of the service address`,
        distance: Math.floor(distance),
      },
      { status: 403 }
    );
  }

  // 6. Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'in_progress',
      check_in_time: new Date().toISOString(),
      check_in_latitude: latitude,
      check_in_longitude: longitude,
    })
    .eq('id', bookingId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'Checked in successfully',
    checkedInAt: new Date().toISOString(),
  });
}

// Haversine formula for GPS distance
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
```

#### 7. Service Completion: Professional Checks Out

**API Endpoint:** `POST /api/bookings/check-out`

**GPS Verification Required:** Professional must still be within 150 meters

**Triggers:**
- Booking status → `completed`
- Payment captured (Stripe `capture` API called)
- Payout scheduled (48 hours from now)
- Customer receives completion notification
- Review request sent to customer

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1-5: Same authentication and GPS verification as check-in

  // 6. Calculate actual duration
  const checkInTime = new Date(booking.check_in_time);
  const checkOutTime = new Date();
  const actualDuration = Math.floor(
    (checkOutTime.getTime() - checkInTime.getTime()) / 60000
  ); // Minutes

  // 7. Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'completed',
      check_out_time: checkOutTime.toISOString(),
      check_out_latitude: latitude,
      check_out_longitude: longitude,
      actual_duration_minutes: actualDuration,
      completed_at: checkOutTime.toISOString(),
    })
    .eq('id', bookingId);

  // 8. Capture payment with Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);

  // 9. Send notifications
  // - Customer: "Service completed"
  // - Professional: "Payment will be sent in 48 hours"

  return NextResponse.json({
    success: true,
    message: 'Service completed successfully',
    duration: actualDuration,
  });
}
```

#### 8. Customer Reviews (Optional)

**Customer can:**
- Rate service (1-5 stars)
- Leave written review
- Add photos

**This affects professional's:**
- Average rating
- Profile visibility
- Future booking conversion rate

---

## Professional Booking Flow

### From Notification to Payout

#### 1. Receive Booking Notification

**Triggered when:** Booking status → `authorized` (customer paid)

**Notification channels:**
- **Push notification** (mobile app)
- **Email** with booking details
- **In-app notification** badge

**Notification contains:**
- Customer name (first name only for privacy)
- Service date & time
- Service address (approximate area)
- Estimated duration
- **Estimated earnings** (82% of booking total)

#### 2. Review & Accept/Decline

**Professional Dashboard:** `/[locale]/dashboard/pro/bookings`

**Professional sees:**
- Full booking details
- Map with service location
- Distance from their current location/service area
- Schedule conflicts (if any)

**Decision factors:**
- **Location** - Is it within their service area?
- **Timing** - Does it fit their schedule?
- **Earnings** - Is the rate acceptable?

**Actions:**

**Accept:** `POST /api/bookings/accept`
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate professional
  // 2. Verify booking ownership
  // 3. Update booking status to 'confirmed'
  // 4. Send confirmation to customer
  // 5. Add to professional's calendar
}
```

**Decline:** `POST /api/bookings/decline`
```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate professional
  // 2. Verify booking ownership
  // 3. Update booking status to 'declined'
  // 4. Trigger automatic refund to customer
  // 5. Notify customer (booking declined)
  // 6. Suggest alternative professionals to customer
}
```

#### 3. Prepare for Service

**Professional prepares:**
- Reviews service address and directions
- Checks special instructions from customer
- Gathers necessary cleaning supplies
- Sets reminder for service time

**System actions:**
- Sends reminder notification 24 hours before
- Sends reminder notification 1 hour before
- Professional can message customer (if questions)

#### 4. Check In (GPS Verified)

**See [GPS Verification](#gps-verification) section**

**Mobile app flow:**
1. Professional taps "Check In"
2. App requests GPS permission
3. App verifies GPS location
4. If within 150m → Check-in successful
5. If outside 150m → Error message with distance

#### 5. Complete Service

**During service:**
- Professional performs cleaning
- Time automatically tracked (check-in to check-out)
- Professional can extend time if needed (with customer approval)

**Check Out:**
- Same GPS verification as check-in
- Service marked as `completed`
- Payment captured immediately
- Customer notified

#### 6. Receive Payout

**Timeline:**
- **Immediately:** Funds appear in professional's Stripe pending balance
- **After 48 hours:** Funds released to professional's bank account
- **1-3 business days later:** Money in professional's bank

**Payout breakdown visible in dashboard:**
```
Booking Total:     100,000 COP
Platform Fee (18%): -18,000 COP
─────────────────────────────
Your Earnings:      82,000 COP
```

---

## State Transitions

### Detailed Transition Rules

#### From `pending_payment` to `authorized`

**Trigger:** Stripe webhook `payment_intent.requires_capture`
**Conditions:** Payment successfully authorized
**Side effects:**
- Professional receives notification
- Booking appears in professional's dashboard
- 24-hour acceptance window starts

#### From `authorized` to `confirmed`

**Trigger:** Professional accepts booking
**Conditions:**
- Professional must be authenticated
- Booking must belong to professional
- No schedule conflicts
**Side effects:**
- Customer receives confirmation notification
- Booking added to both calendars
- Reminder notifications scheduled

#### From `authorized` to `declined`

**Trigger:** Professional declines booking
**Conditions:**
- Professional must be authenticated
- Booking must belong to professional
**Side effects:**
- Automatic refund issued to customer
- Customer receives decline notification
- Alternative professionals suggested to customer

#### From `confirmed` to `in_progress`

**Trigger:** Professional checks in
**Conditions:**
- GPS verification passes (within 150m)
- Current time is within ±30 minutes of scheduled start
- Booking status is `confirmed`
**Side effects:**
- Customer notified (service started)
- Timer starts for actual duration tracking
- Check-in GPS coordinates saved

#### From `in_progress` to `completed`

**Trigger:** Professional checks out
**Conditions:**
- GPS verification passes (within 150m)
- Minimum service time met (at least 50% of scheduled duration)
- Booking status is `in_progress`
**Side effects:**
- Payment captured via Stripe
- Payout scheduled (48 hours)
- Customer receives completion notification
- Review request sent to customer
- Actual duration saved

#### From `confirmed` to `canceled`

**Trigger:** Customer or professional cancels
**Conditions:**
- **Customer cancellation:**
  - Must be >24 hours before scheduled time (full refund)
  - 24 hours before (50% refund)
  - <24 hours (no refund, unless professional agrees)
- **Professional cancellation:**
  - Any time (full refund to customer)
  - Professional may face penalties/account review
**Side effects:**
- Refund processed according to policy
- Both parties notified
- Booking removed from calendars

---

## API Endpoints

### Complete API Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/bookings` | POST | Create booking | Customer |
| `/api/bookings` | GET | List bookings | Customer/Pro |
| `/api/bookings/[id]` | GET | Get booking details | Customer/Pro |
| `/api/bookings/authorize` | POST | Authorize payment | Customer |
| `/api/bookings/accept` | POST | Accept booking | Professional |
| `/api/bookings/decline` | POST | Decline booking | Professional |
| `/api/bookings/cancel` | POST | Cancel booking | Customer/Pro |
| `/api/bookings/check-in` | POST | Check in (start service) | Professional |
| `/api/bookings/check-out` | POST | Check out (end service) | Professional |
| `/api/bookings/reschedule` | POST | Reschedule booking | Customer/Pro |
| `/api/bookings/extend-time` | POST | Extend service time | Professional |
| `/api/bookings/disputes` | POST | File dispute | Customer/Pro |

### Authentication Pattern

**All booking endpoints follow this pattern:**

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get booking
  const { bookingId } = await request.json();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 3. Verify ownership
  if (booking.customer_id !== user.id && booking.professional_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Validate state transition
  if (booking.status !== expectedPreviousStatus) {
    return NextResponse.json(
      { error: `Cannot perform action from status: ${booking.status}` },
      { status: 400 }
    );
  }

  // 5. Perform action
  // ...
}
```

---

## GPS Verification

### Why GPS Verification?

GPS check-in/check-out prevents fraud:
- ✅ Ensures professional is actually at service location
- ✅ Prevents "no-show" fraud
- ✅ Verifies service time accurately
- ✅ Protects both customer and professional

### GPS Tolerance

**150 meters** - Accounts for:
- GPS accuracy variations
- Large properties (e.g., apartment complexes)
- Signal interference (indoor locations)

### Implementation

**File:** `src/lib/utils/gps.ts`

```typescript
/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateGPSDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Verify GPS location is within tolerance of service address
 */
export function verifyGPSLocation(
  professionalLat: number,
  professionalLon: number,
  serviceLat: number,
  serviceLon: number,
  toleranceMeters: number = 150
): { valid: boolean; distance: number } {
  const distance = calculateGPSDistance(
    professionalLat,
    professionalLon,
    serviceLat,
    serviceLon
  );

  return {
    valid: distance <= toleranceMeters,
    distance: Math.floor(distance),
  };
}
```

### Error Handling

**GPS verification failed:**

```json
{
  "error": "GPS verification failed",
  "message": "You must be within 150m of the service address",
  "distance": 287,
  "required": 150
}
```

**Professional sees:**
- Current distance from service address
- Map showing service location
- Instructions to move closer

---

## Cancellation & Rescheduling

### Cancellation Policy

#### Customer-Initiated Cancellation

| Timeframe | Refund Amount | Fee |
|-----------|---------------|-----|
| **>48 hours before** | 100% refund | No fee |
| **24-48 hours before** | 50% refund | 50% cancellation fee |
| **<24 hours before** | No refund | Professional compensated |
| **Service in progress** | No refund | Full charge |

#### Professional-Initiated Cancellation

| Timeframe | Customer Impact | Professional Impact |
|-----------|-----------------|---------------------|
| **>48 hours before** | Full refund | No penalty |
| **24-48 hours before** | Full refund | Warning issued |
| **<24 hours before** | Full refund | Account review, possible suspension |
| **After check-in** | Full refund | Account suspension |

### Cancellation API

**File:** `src/app/api/bookings/cancel/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get cancellation details
  const { bookingId, reason } = await request.json();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 3. Verify cancellation permission
  const isCustomer = booking.customer_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!isCustomer && !isProfessional) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Calculate refund amount based on policy
  const now = new Date();
  const scheduledStart = new Date(booking.scheduled_start);
  const hoursUntilService = (scheduledStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  let refundPercentage = 0;
  let cancellationFee = 0;

  if (isProfessional) {
    // Professional cancels - always full refund to customer
    refundPercentage = 100;

    // But professional may face penalties
    if (hoursUntilService < 24) {
      // Mark for account review
      await supabase
        .from('professional_violations')
        .insert({
          professional_id: booking.professional_id,
          violation_type: 'late_cancellation',
          booking_id: bookingId,
        });
    }
  } else if (isCustomer) {
    // Customer cancellation policy
    if (hoursUntilService > 48) {
      refundPercentage = 100;
    } else if (hoursUntilService > 24) {
      refundPercentage = 50;
      cancellationFee = Math.floor(booking.amount_authorized * 0.5);
    } else {
      refundPercentage = 0;
      // Professional compensated for last-minute cancellation
    }
  }

  // 5. Issue refund via Stripe
  const refundAmount = Math.floor(booking.amount_authorized * (refundPercentage / 100));

  if (refundAmount > 0) {
    await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
      reverse_transfer: true,
      refund_application_fee: true,
      metadata: {
        booking_id: bookingId,
        canceled_by: user.id,
        cancellation_reason: reason,
      },
    });
  }

  // 6. Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'canceled',
      canceled_at: now.toISOString(),
      canceled_by: user.id,
      canceled_reason: reason,
      metadata: {
        refund_amount: refundAmount,
        cancellation_fee: cancellationFee,
        refund_percentage: refundPercentage,
      },
    })
    .eq('id', bookingId);

  // 7. Send notifications
  // - Notify the other party (customer or professional)
  // - Send refund confirmation email
  // - Update calendars

  return NextResponse.json({
    success: true,
    refundAmount,
    cancellationFee,
    message: `Booking canceled. ${refundPercentage}% refund issued.`,
  });
}
```

### Rescheduling

**API Endpoint:** `POST /api/bookings/reschedule`

**Rules:**
- Must be done >24 hours before scheduled time
- New time slot must be available
- Professional must approve new time
- No additional fees

**Process:**
1. Customer requests new time
2. Professional receives reschedule request
3. Professional accepts or declines
4. If accepted, booking updated with new time
5. Both parties notified

```typescript
export async function POST(request: NextRequest) {
  // 1. Validate requester (customer or professional)
  // 2. Verify >24 hours before service
  // 3. Check new time slot availability
  // 4. Create reschedule request
  // 5. Notify other party for approval
}
```

---

## Time Extensions

### When Can Service Time Be Extended?

**During an active booking** (`in_progress` status), professional can request additional time.

### Extension Rules

- **Maximum:** 4 hours total (240 minutes)
- **Increments:** 30-minute blocks
- **Requires:** Customer approval
- **Payment:** Additional charge calculated and authorized

### Extension API

**File:** `src/app/api/bookings/extend-time/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate professional
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get extension request
  const { bookingId, additionalMinutes } = await request.json();

  // Validate extension (must be 30-minute increments, max 240 minutes total)
  if (additionalMinutes % 30 !== 0 || additionalMinutes > 240) {
    return NextResponse.json(
      { error: 'Invalid extension duration' },
      { status: 400 }
    );
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, professional:profiles!professional_id(hourly_rate)')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.professional_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Verify booking is in progress
  if (booking.status !== 'in_progress') {
    return NextResponse.json(
      { error: 'Booking must be in progress to extend' },
      { status: 400 }
    );
  }

  // 4. Calculate additional cost
  const hourlyRate = booking.professional.hourly_rate;
  const additionalCost = Math.floor((additionalMinutes / 60) * hourlyRate);

  // 5. Create extension request
  const { data: extension, error } = await supabase
    .from('booking_extensions')
    .insert({
      booking_id: bookingId,
      additional_minutes: additionalMinutes,
      additional_cost: additionalCost,
      status: 'pending',
      requested_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // 6. Notify customer for approval
  // Customer receives push notification with:
  // - Additional time requested (e.g., "+30 minutes")
  // - Additional cost (e.g., "25,000 COP")
  // - Approve / Decline buttons

  return NextResponse.json({
    success: true,
    extensionId: extension.id,
    additionalCost,
    message: 'Extension request sent to customer',
  });
}
```

**Customer approves extension:**

```typescript
// POST /api/bookings/extension/approve
export async function POST(request: NextRequest) {
  // 1. Authenticate customer
  // 2. Create additional PaymentIntent for extension cost
  // 3. Customer authorizes additional payment
  // 4. Update booking with extended time
  // 5. Notify professional (approved)
}
```

---

## Disputes

### When Can a Dispute Be Filed?

**Customer can dispute if:**
- Service not completed
- Poor service quality
- Professional didn't show up
- Property damage

**Professional can dispute if:**
- Customer falsely claimed service not done
- Customer not present at scheduled time
- Unfair review

### Dispute API

**File:** `src/app/api/bookings/disputes/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get dispute details
  const { bookingId, reason, description, evidence } = await request.json();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 3. Verify dispute eligibility
  const isCustomer = booking.customer_id === user.id;
  const isProfessional = booking.professional_id === user.id;

  if (!isCustomer && !isProfessional) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Create dispute record
  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({
      booking_id: bookingId,
      filed_by: user.id,
      filed_by_role: isCustomer ? 'customer' : 'professional',
      reason,
      description,
      evidence_urls: evidence, // Array of photo/document URLs
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;

  // 5. Update booking status
  await supabase
    .from('bookings')
    .update({ status: 'disputed' })
    .eq('id', bookingId);

  // 6. Notify admin team for review
  // Alert sent to Better Stack / admin dashboard

  // 7. Hold payout (if professional payout pending)
  if (booking.status === 'completed') {
    await supabase
      .from('payouts')
      .update({ status: 'held', hold_reason: 'dispute' })
      .eq('booking_id', bookingId)
      .eq('status', 'pending');
  }

  return NextResponse.json({
    success: true,
    disputeId: dispute.id,
    message: 'Dispute filed successfully. Our team will review within 48 hours.',
  });
}
```

### Dispute Resolution

**Admin reviews:**
1. Booking details and timeline
2. GPS check-in/check-out data
3. Photos/evidence from both parties
4. Communication history

**Possible outcomes:**
- **Full refund to customer** - Service not completed
- **Partial refund** - Service partially completed
- **No refund** - Dispute deemed invalid
- **Professional penalized** - Account warning/suspension
- **Customer penalized** - False dispute, account review

---

## Security & Validation

### Server-Side Price Calculation

**CRITICAL:** Never trust client-sent prices!

```typescript
// ❌ WRONG: Trusting client price
const { professionalId, duration, totalAmount } = await request.json();
// Client could manipulate totalAmount!

// ✅ CORRECT: Server calculates price
const { data: professional } = await supabase
  .from('profiles')
  .select('hourly_rate')
  .eq('id', professionalId)
  .single();

const totalAmount = Math.floor((duration / 60) * professional.hourly_rate);
```

### Ownership Validation

**Every booking operation validates ownership:**

```typescript
// Verify user owns this booking (as customer or professional)
if (booking.customer_id !== user.id && booking.professional_id !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### State Transition Validation

**Prevent invalid state transitions:**

```typescript
// Example: Can only check in from 'confirmed' status
if (booking.status !== 'confirmed') {
  return NextResponse.json(
    { error: `Cannot check in from status: ${booking.status}` },
    { status: 400 }
  );
}
```

### Rate Limiting

**Booking creation rate limited:** 20 requests/minute per user

**Implemented in:** `src/app/api/bookings/route.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});

export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();

  // Rate limit by user ID
  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Continue with booking creation...
}
```

### Input Validation with Zod

**All booking inputs validated:**

```typescript
import { z } from 'zod';

const CreateBookingSchema = z.object({
  professional_id: z.string().uuid(),
  scheduled_start: z.string().datetime(),
  duration_minutes: z
    .number()
    .min(120, 'Minimum 2 hours')
    .max(480, 'Maximum 8 hours')
    .multipleOf(30, 'Must be 30-minute increments'),
  service_address: z.object({
    street: z.string().min(5),
    city: z.string(),
    department: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  special_instructions: z.string().max(500).optional(),
});

// Usage
try {
  const validated = CreateBookingSchema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: 400 }
    );
  }
}
```

---

## Help Center Content

### For Customers

#### How do bookings work?

**Creating a booking:**
1. Browse professionals by location and service type
2. Select a professional and view their profile
3. Choose your service date, time, and duration
4. Provide your service address
5. Authorize payment (we hold but don't charge yet)
6. Wait for professional to accept

**After booking:**
- Professional has 24 hours to accept or decline
- If accepted, service is confirmed
- If declined, you're automatically refunded

#### Booking cancellation policy

| When you cancel | Refund |
|-----------------|--------|
| More than 48 hours before | 100% refund |
| 24-48 hours before | 50% refund |
| Less than 24 hours before | No refund* |

*Unless professional agrees to cancel with full refund

#### What if the professional doesn't show up?

You receive a **full automatic refund** if:
- Professional doesn't check in within 30 minutes of scheduled time
- Professional cancels on service day
- Professional fails GPS verification

**Report no-show:** Contact support via in-app chat or email support@casaora.co

#### Can I reschedule a booking?

**Yes!** You can reschedule up to 24 hours before your service:
1. Go to "My Bookings"
2. Select the booking
3. Tap "Reschedule"
4. Choose new date/time
5. Professional receives request and can approve/decline

**No additional fees for rescheduling.**

### For Professionals

#### How do I receive bookings?

**When a customer books:**
1. You receive a push notification + email
2. Booking appears in your Dashboard → "Pending Bookings"
3. You have **24 hours** to accept or decline
4. If you don't respond, booking auto-declines

**Review before accepting:**
- Service location (is it in your area?)
- Date & time (does it fit your schedule?)
- Duration and estimated earnings

#### How does GPS check-in work?

**You must be within 150 meters** of the customer's address to check in.

**Steps:**
1. Arrive at service address
2. Open app and tap "Check In"
3. App verifies your GPS location
4. If within 150m → Check-in successful ✅
5. If outside 150m → Error shown with distance ❌

**Why GPS verification?**
- Prevents fraud
- Verifies you're actually providing service
- Protects both you and customers

**Tip:** GPS works best outdoors. If you're having trouble, step outside the building briefly.

#### What if I need more time?

**You can request a time extension during service:**
1. Tap "Request Extension" in app
2. Choose additional time (30-minute increments)
3. Customer receives request with additional cost
4. If customer approves → Time extended, additional payment authorized
5. If customer declines → Complete service as originally scheduled

**Maximum:** 4 hours total service time

#### Cancellation policy for professionals

| When you cancel | Consequences |
|-----------------|--------------|
| More than 48 hours before | No penalty |
| 24-48 hours before | Warning issued |
| Less than 24 hours before | Account review, possible suspension |
| After check-in | Account suspension |

**Customer always receives full refund** when you cancel.

**Tip:** Only accept bookings you can definitely fulfill. Late cancellations hurt your reputation and account standing.

#### When do I get paid?

**Payout timeline:**
1. **Immediately after service:** Funds appear in your Stripe pending balance
2. **48 hours later:** Funds released to your bank account
3. **1-3 business days:** Money in your bank

**Minimum payout:** 50,000 COP ($12.50 USD)

**View payouts:** Dashboard → Earnings → Payout History

---

## Related Documentation

- [Payment System](./payment-system.md) - Payment authorization and payout details
- [Database Schema](../03-technical/database-schema.md) - Bookings table structure
- [API Routes](../03-technical/api-routes.md) - Complete API reference
- [ADR-004: Stripe Connect](../01-decisions/adr-004-why-stripe-connect.md) - Payment architecture

---

**Questions or Issues?**

Contact engineering team or check the codebase at `src/app/api/bookings/`
