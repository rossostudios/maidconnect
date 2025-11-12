# PostHog Implementation Guide for Casaora

This guide shows how to implement PostHog tracking across your application for comprehensive analytics.

## ✅ What's Already Implemented

### 1. **Hero Section CTA Tracking** ✓
- Location: [src/components/sections/HeroSection.tsx](../../../components/sections/HeroSection.tsx)
- Tracks primary and secondary CTA clicks
- Events: `"Clicked CTA"` with button text

### 2. **Error Boundary Tracking** ✓
- Location: [src/components/error-boundary.tsx](../../../components/error-boundary.tsx)
- Automatically tracks React errors
- Events: `"Error Occurred"` with error details

### 3. **Automatic Pageview Tracking** ✓
- Location: [src/components/providers/posthog-provider.tsx](../../../components/providers/posthog-provider.tsx)
- Tracks every route change
- Events: `"$pageview"` with URL

---

## 📋 Recommended Implementations

### 1. **User Authentication Tracking**

Add to your auth flow (login/signup):

```typescript
import { trackSignup, trackLogin, identifyAuthenticatedUser } from '@/lib/integrations/posthog';

// After successful signup
async function handleSignup(email: string, password: string, role: 'customer' | 'professional') {
  const { user } = await supabase.auth.signUp({ email, password });

  if (user) {
    trackSignup({
      userId: user.id,
      method: 'email',
      role,
      locale: currentLocale,
    });
  }
}

// After successful login
async function handleLogin(email: string, password: string) {
  const { user } = await supabase.auth.signIn({ email, password });

  if (user) {
    identifyAuthenticatedUser(user.id, {
      email: user.email,
      role: user.user_metadata?.role,
      locale: currentLocale,
    });

    trackLogin({
      userId: user.id,
      method: 'email',
    });
  }
}

// On logout
async function handleLogout() {
  trackLogout();
  await supabase.auth.signOut();
}
```

**Files to edit:**
- Auth components in `src/app/[locale]/(auth)/`
- `src/lib/shared/auth/session.ts`

---

### 2. **Booking Flow Tracking**

Implement comprehensive booking tracking:

```typescript
import { bookingTracking, serverBookingTracking } from '@/lib/integrations/posthog';

// Step 1: Service selection
function handleServiceSelect(serviceType: string) {
  bookingTracking.started({
    serviceType,
    location: userLocation,
    source: 'search',
  });

  bookingTracking.serviceSelected({
    serviceType,
    duration: selectedDuration,
    frequency: 'one-time',
  });
}

// Step 2: Professional selection
function handleProfessionalSelect(professionalId: string) {
  bookingTracking.professionalSelected({
    professionalId,
    serviceType: selectedService,
    matchScore: professional.matchScore,
  });
}

// Step 3: Time selection
function handleTimeSelect(date: string, timeSlot: string) {
  bookingTracking.timeSelected({
    date,
    timeSlot,
    leadTime: calculateLeadTime(date, timeSlot),
  });
}

// Step 4: Checkout
function handleCheckoutStart(bookingId: string, amount: number) {
  bookingTracking.checkoutStarted({
    bookingId,
    amount,
    currency: 'COP',
  });
}

// Step 5: Payment
function handlePaymentMethodSelect(method: string, bookingId: string) {
  bookingTracking.paymentMethodSelected({ method, bookingId });
}

// Step 6: Completion (server-side)
// In your API route or server action
async function handleBookingComplete(userId: string, booking: Booking) {
  await serverBookingTracking.created(userId, {
    bookingId: booking.id,
    amount: booking.amount,
    serviceType: booking.service_type,
    professionalId: booking.professional_id,
  });

  // Client-side
  bookingTracking.completed({
    bookingId: booking.id,
    amount: booking.amount,
    currency: 'COP',
    serviceType: booking.service_type,
    professionalId: booking.professional_id,
  });
}
```

**Files to edit:**
- `src/lib/services/bookings/booking.ts`
- `src/lib/services/bookings/bookingWorkflowService.ts`
- `src/lib/services/bookings/checkOut.ts`
- `src/lib/services/bookings/cancellationService.ts`
- Booking UI components

---

### 3. **Search Tracking**

Track search queries and results:

```typescript
import { searchEvents } from '@/lib/integrations/posthog';

// In your search component
function handleSearch(query: string, results: Professional[]) {
  searchEvents.performed({
    query,
    resultCount: results.length,
    locale: currentLocale,
  });
}

// When user clicks a result
function handleResultClick(query: string, professional: Professional, position: number) {
  searchEvents.resultClicked({
    query,
    resultId: professional.id,
    position,
  });
}
```

**Files to edit:**
- `src/components/search/SearchTrigger.tsx`
- Search results components
- `src/lib/services/search/algoliaSearch.ts`

---

### 4. **Professional Profile Tracking**

Track professional profile views and interactions:

```typescript
import { professionalEvents } from '@/lib/integrations/posthog';

// When professional profile is viewed
function handleProfileView(professionalId: string, source: string) {
  professionalEvents.viewed({
    professionalId,
    source, // 'search', 'direct_link', 'recommendation'
  });
}

// When user contacts professional
function handleContact(professionalId: string, method: string) {
  professionalEvents.contacted({
    professionalId,
    method, // 'message', 'booking', 'call'
  });
}

// When user favorites professional
function handleFavorite(professionalId: string) {
  professionalEvents.favorited({
    professionalId,
  });
}
```

**Files to edit:**
- Professional profile pages
- Professional directory components
- `src/components/professionals/ProfessionalsDirectory.tsx`

---

### 5. **Conversion Funnel Tracking**

Track the complete conversion funnel:

```typescript
import { funnelEvents } from '@/lib/integrations/posthog';

// Landing page view (already tracked via pageview)
useEffect(() => {
  funnelEvents.viewedLanding();
}, []);

// CTA clicks (already implemented in Hero Section)
function handleCTAClick(ctaText: string) {
  funnelEvents.clickedCTA(ctaText);
}

// Signup start
function handleSignupStart() {
  funnelEvents.startedSignup();
}

// Signup complete
function handleSignupComplete(method: string) {
  funnelEvents.completedSignup(method);
}

// Pricing page view
useEffect(() => {
  if (isPricingPage) {
    funnelEvents.viewedPricing();
  }
}, []);
```

**Files to edit:**
- Landing pages
- Signup flow components
- Pricing page

---

### 6. **Booking Lifecycle Events**

Track the complete booking lifecycle (server-side):

```typescript
import { serverBookingTracking } from '@/lib/integrations/posthog';

// When professional confirms booking
async function handleBookingConfirm(userId: string, booking: Booking) {
  await trackServerEvent(userId, "Booking Confirmed", {
    booking_id: booking.id,
    professional_id: booking.professional_id,
    time_to_confirm_minutes: calculateConfirmTime(booking),
  });
}

// When booking is cancelled
async function handleBookingCancel(userId: string, booking: Booking, reason: string) {
  bookingTracking.cancelled({
    bookingId: booking.id,
    reason,
    cancelledBy: determineCancelledBy(userId, booking),
    refundAmount: calculateRefund(booking),
  });
}

// When payment is processed
async function handlePaymentProcess(userId: string, payment: Payment) {
  await serverBookingTracking.paymentProcessed(userId, {
    bookingId: payment.booking_id,
    amount: payment.amount,
    paymentIntentId: payment.stripe_payment_intent_id,
    status: payment.status,
  });
}

// When refund is processed
async function handleRefundProcess(userId: string, refund: Refund) {
  await serverBookingTracking.refundProcessed(userId, {
    bookingId: refund.booking_id,
    refundAmount: refund.amount,
    refundId: refund.stripe_refund_id,
  });
}
```

**Files to edit:**
- `src/lib/services/bookings/bookingWorkflowService.ts` (confirm/decline)
- `src/lib/services/bookings/cancellationService.ts` (cancellation)
- `src/lib/services/bookings/booking.ts` (payment processing)

---

### 7. **Check-in/Check-out Tracking**

Track professional check-in and check-out:

```typescript
import { bookingTracking } from '@/lib/integrations/posthog';

// When professional checks in
async function handleCheckIn(booking: Booking, onTime: boolean) {
  bookingTracking.checkedIn({
    bookingId: booking.id,
    professionalId: booking.professional_id,
    onTime,
  });
}

// When professional checks out
async function handleCheckOut(booking: Booking, actualDuration: number) {
  bookingTracking.checkedOut({
    bookingId: booking.id,
    professionalId: booking.professional_id,
    actualDurationMinutes: actualDuration,
    plannedDurationMinutes: booking.duration_minutes,
  });
}
```

**Files to edit:**
- `src/lib/services/bookings/checkOut.ts`
- Check-in/check-out UI components

---

## 🎯 PostHog Dashboard Setup

### Create Funnels

1. **Signup Funnel**
   - Step 1: Viewed Landing Page
   - Step 2: Clicked CTA
   - Step 3: Started Signup
   - Step 4: Completed Signup

2. **Booking Funnel**
   - Step 1: Booking Started
   - Step 2: Professional Selected
   - Step 3: Time Selected
   - Step 4: Checkout Started
   - Step 5: Booking Completed

3. **Professional Engagement Funnel**
   - Step 1: Search Performed
   - Step 2: Professional Viewed
   - Step 3: Booking Started
   - Step 4: Booking Completed

### Create Dashboards

**Customer Journey Dashboard:**
- Total signups (by method)
- Signup funnel conversion rate
- Average time to first booking
- Booking completion rate
- Average booking value

**Booking Performance Dashboard:**
- Booking funnel drop-off points
- Average time per funnel step
- Cancellation rate by stage
- Professional acceptance rate
- On-time check-in rate

**Professional Insights Dashboard:**
- Profile views per professional
- Booking conversion rate
- Average booking value
- Rebooking rate
- Customer satisfaction (from reviews)

---

## 🔐 Privacy Considerations

PostHog is configured with privacy-first defaults:

- ✅ All form inputs masked
- ✅ Sensitive data excluded from session recordings
- ✅ User identification only for logged-in users
- ✅ No tracking of PII without consent
- ✅ GDPR compliant

### Marking Sensitive Data

Add `data-sensitive` to hide from recordings:

```tsx
<div data-sensitive>
  <input type="text" name="credit-card" />
</div>
```

### Enabling Specific Element Tracking

Add `data-ph-capture` for autocapture:

```tsx
<button data-ph-capture>
  Important Action
</button>
```

---

## 📊 Key Metrics to Track

### Business Metrics
- **CAC (Customer Acquisition Cost)**: Track from "Signup" to total ad spend
- **LTV (Lifetime Value)**: Sum of `Booking Completed` amounts per user
- **Conversion Rate**: Signups / Landing page views
- **Booking Rate**: Bookings / Signups

### Product Metrics
- **Time to First Booking**: Time between signup and first booking
- **Funnel Drop-off**: Where users abandon the booking flow
- **Search Effectiveness**: Search result clicks / searches
- **Professional Acceptance Rate**: Confirmed / Pending bookings

### Retention Metrics
- **Rebooking Rate**: % of customers who book again
- **Professional Retention**: % of professionals active month-over-month
- **Churn Rate**: % of users who haven't booked in 90 days

---

## 🚀 Quick Wins

### Highest Impact, Lowest Effort:

1. ✅ **Hero CTA Tracking** (Already done)
2. ✅ **Error Tracking** (Already done)
3. **User Authentication** - Identify users on login/signup
4. **Booking Started** - Track when user begins booking flow
5. **Booking Completed** - Track successful bookings

Start with these 5 and expand from there!

---

## 📚 Additional Resources

- [PostHog Docs](https://posthog.com/docs)
- [Feature Flags Guide](https://posthog.com/docs/feature-flags)
- [Funnel Analysis](https://posthog.com/docs/user-guides/funnels)
- [Session Recording](https://posthog.com/docs/session-replay)
- [Main PostHog README](./README.md)

---

**Last Updated:** 2025-01-11
