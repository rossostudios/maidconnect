# PostHog PMF Tracking - Implementation Guide

**Epic D-2: PMF Core Metrics Dashboard**
**Dashboard URL:** https://us.posthog.com/project/247938/dashboard/771678

This guide explains where to add PostHog tracking calls to populate the PMF Core Metrics dashboard.

---

## 📊 Dashboard Insights Created

All 8 insights have been created and added to the dashboard:

1. **Briefs Submitted (Daily Trend)** - Line graph (90 days)
2. **Concierge Requests by Type** - Breakdown by request type
3. **Bookings Completed (Weekly)** - Bar chart with 100/week goal
4. **Household Activation Funnel** - Signup → First → Second booking
5. **Brief-to-Booking Conversion** - 30-day funnel
6. **Revenue: New vs Repeat** - Stacked area chart (40%+ repeat = healthy)
7. **PMF Scorecard** - Big numbers (30-day totals)
8. **60-Day Rebooking Rate** - Weekly retention tracking (>40% = PMF)

---

## 🎯 Event Tracking Implementation

### Import Statement

```typescript
import { pmfTracking } from '@/lib/integrations/posthog';
```

---

### 1. Track Brief Submissions

**Event:** `Brief Submitted`
**Location:** When user submits a service request/brief form
**File:** Likely in a form submission handler (brief form, service request, etc.)

```typescript
// Example: After brief form submission succeeds
pmfTracking.briefSubmitted({
  serviceType: formData.serviceType,           // e.g., "cleaning", "nanny", "chef"
  location: formData.location,                 // e.g., "Bogotá", "Medellín"
  estimatedBudget: formData.budget,            // Optional: COP amount
  urgency: formData.urgency || "flexible",     // "immediate", "flexible", "scheduled"
});
```

**Where to add:**
- Brief submission form `onSubmit` handler
- Service request API route success response
- Any "Request Service" or "Get a Quote" form

---

### 2. Track Concierge Requests

**Event:** `Concierge Request`
**Location:** When user opens chat widget or requests human help
**File:** Amara chat widget, help modals, "Contact Us" forms

```typescript
// Example: When user clicks "Get Help" or opens Amara chat
pmfTracking.conciergeRequest({
  requestType: "help_with_booking",     // "help_with_booking", "custom_service", "pricing_question", "other"
  fromPage: window.location.pathname,   // e.g., "/professionals/search"
  userMessage: chatMessage,             // Optional: first message text
});
```

**Where to add:**
- Amara chat widget initialization
- "Contact Support" button clicks
- "Need Help?" modal opens
- Custom service request forms

---

### 3. Track Booking Completions (CRITICAL for PMF)

**Event:** `Booking Completed`
**Location:** After booking status changes to "completed"
**File:** Booking completion webhook handler or status update logic

**IMPORTANT:** This event MUST include `isRepeatBooking` and `daysSinceLastBooking` for retention metrics.

```typescript
// Example: After booking completes (checkout or service finished)
import { supabaseAdmin } from '@/lib/supabase/admin-client';

// Query user's previous bookings to detect repeats
const { data: previousBookings } = await supabaseAdmin
  .from('bookings')
  .select('completed_at')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false })
  .limit(2);

const isRepeatBooking = previousBookings.length > 1;
const daysSinceLastBooking = isRepeatBooking && previousBookings[1]
  ? Math.floor((new Date().getTime() - new Date(previousBookings[1].completed_at).getTime()) / (1000 * 60 * 60 * 24))
  : undefined;

pmfTracking.bookingCompleted({
  bookingId: booking.id,
  professionalId: booking.professional_id,
  serviceType: booking.service_type,
  amount: booking.amount_captured,
  currency: booking.currency,
  isRepeatBooking: isRepeatBooking,
  daysSinceLastBooking: daysSinceLastBooking,
});
```

**Where to add:**
- Booking completion webhook handler (`/api/webhooks/stripe/route.ts` or Supabase realtime)
- Booking status update to `completed` in database
- Checkout success page (if booking immediately completes)

---

### 4. Track Account Creation

**Event:** `Account Created`
**Location:** After successful signup/registration
**File:** Authentication success handler

```typescript
// Example: After Supabase auth signup succeeds
pmfTracking.accountCreated({
  userId: user.id,
  email: user.email,
  signupMethod: "email",  // "email", "google", "facebook"
});
```

**Where to add:**
- Signup form success handler
- OAuth callback success (Google/Facebook signup)
- Supabase auth `onAuthStateChange` for new users

---

### 5. Identify Users for Segmentation

**Event:** User identification (PostHog `identify` call)
**Location:** After login or profile updates
**File:** Auth state change handler, profile update success

```typescript
// Example: After successful login or profile load
pmfTracking.identifyUserForPMF(user.id, {
  email: user.email,
  totalBookings: user.total_bookings || 0,
  firstBookingDate: user.first_booking_date,
  lastBookingDate: user.last_booking_date,
  totalSpent: user.lifetime_value || 0,
  preferredServiceTypes: ["cleaning", "nanny"],
  location: user.city,
});
```

**Where to add:**
- Login success handler
- User profile fetch/load
- After completing first booking

---

## 🔍 Testing Your Implementation

### Local Testing

1. Open browser console
2. Perform tracked actions (submit brief, request help, complete booking, signup)
3. Check PostHog in real-time:
   - Visit: https://us.posthog.com/project/247938/events
   - Look for events: `Brief Submitted`, `Concierge Request`, `Booking Completed`, `Account Created`
   - Verify event properties are correct

### Production Validation

After deploying:

1. Visit dashboard: https://us.posthog.com/project/247938/dashboard/771678
2. Wait 5-10 minutes for data to populate
3. Verify each insight shows data:
   - ✅ Briefs Submitted trending upward
   - ✅ Concierge Requests showing breakdown by type
   - ✅ Bookings Completed weekly counts
   - ✅ Activation funnel showing conversion rates
   - ✅ Repeat booking revenue increasing

---

## 🎯 PMF Success Metrics

The dashboard tracks these key PMF indicators:

| Metric | Target | What It Means |
|--------|--------|---------------|
| **Briefs Submitted** | Increasing trend | User demand signal |
| **Concierge Requests** | <10% of briefs | Users can self-serve |
| **Bookings/Week** | 100+ | Market traction |
| **Activation Rate** | >20% signup→booking | Effective onboarding |
| **60-Day Rebooking** | >40% | Strong retention |
| **Repeat Revenue** | >40% | Business sustainability |

**PMF Achieved When:**
- 100+ bookings/week sustained for 4+ weeks
- >40% of customers rebook within 60 days
- >40% of revenue from repeat customers
- NPS score >50 (track separately)

---

## 📝 Example Integration Locations

Based on Casaora codebase structure:

### Brief Submission
- **File:** `src/components/brief/BriefForm.tsx` (or similar)
- **When:** `onSubmit` success callback
- **Code:**
  ```tsx
  const handleSubmit = async (data: BriefFormData) => {
    const response = await fetch('/api/briefs', { method: 'POST', body: JSON.stringify(data) });
    if (response.ok) {
      pmfTracking.briefSubmitted({
        serviceType: data.serviceType,
        location: data.location,
        estimatedBudget: data.budget,
        urgency: data.urgency,
      });
    }
  };
  ```

### Concierge Request
- **File:** `src/components/amara/AmaraChatWidget.tsx` (or help modal)
- **When:** User opens chat or clicks "Get Help"
- **Code:**
  ```tsx
  const handleOpenChat = () => {
    pmfTracking.conciergeRequest({
      requestType: "help_with_booking",
      fromPage: window.location.pathname,
    });
    setIsChatOpen(true);
  };
  ```

### Booking Completion
- **File:** `src/app/api/webhooks/stripe/route.ts` (webhook handler)
- **When:** Stripe payment succeeded AND booking status = completed
- **Code:**
  ```ts
  // In webhook handler after updating booking status to "completed"
  if (booking.status === 'completed') {
    // Query previous bookings for repeat detection
    const { data: previousBookings } = await supabase
      .from('bookings')
      .select('completed_at')
      .eq('user_id', booking.user_id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(2);

    const isRepeat = previousBookings.length > 1;
    const daysSince = isRepeat && previousBookings[1]
      ? Math.floor((Date.now() - new Date(previousBookings[1].completed_at).getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    pmfTracking.bookingCompleted({
      bookingId: booking.id,
      professionalId: booking.professional_id,
      serviceType: booking.service_type,
      amount: booking.amount_captured,
      currency: booking.currency,
      isRepeatBooking: isRepeat,
      daysSinceLastBooking: daysSince,
    });
  }
  ```

### Account Creation
- **File:** `src/lib/shared/auth/session.ts` or auth callback
- **When:** New user signs up successfully
- **Code:**
  ```ts
  // After Supabase signup succeeds
  const { data: { user } } = await supabase.auth.signUp({ email, password });
  if (user) {
    pmfTracking.accountCreated({
      userId: user.id,
      email: user.email!,
      signupMethod: 'email',
    });
  }
  ```

---

## 🚨 Common Pitfalls

1. **Missing `isRepeatBooking` Property**
   - Dashboards "60-Day Rebooking Rate" and "Revenue: New vs Repeat" will show no data
   - **Fix:** Always query previous bookings before tracking `Booking Completed`

2. **Tracking Before Database Write**
   - Events fire but database rollback happens → incorrect counts
   - **Fix:** Track AFTER successful database update/webhook confirmation

3. **Not Identifying Users**
   - Can't segment by customer properties or track retention
   - **Fix:** Call `identifyUserForPMF` on login and after first booking

4. **Incorrect Event Names**
   - Dashboard queries expect exact event names
   - **Fix:** Use `pmfTracking.*` functions (NOT custom `trackEvent` calls)

---

## ✅ Next Steps

1. **Implement tracking calls** in the locations above
2. **Test in development** - Check browser console and PostHog live events
3. **Deploy to production**
4. **Verify data flow** - Check dashboard after 24 hours
5. **Set up alerts** - Create PostHog alerts for key metrics drops

---

**Dashboard Link:** https://us.posthog.com/project/247938/dashboard/771678
**Questions?** Check existing `bookingTracking` implementation in `src/lib/integrations/posthog/booking-tracking-client.ts` for patterns.
