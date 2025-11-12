# PostHog Integration

Product analytics, feature flags, and session recording for Casaora.

## Setup

### 1. Get Your PostHog API Key

1. Sign up at [https://posthog.com](https://posthog.com) (free tier available)
2. Create a new project or use an existing one
3. Go to **Project Settings** → **Project API Key**
4. Copy your API key (starts with `phc_`)

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # or https://eu.i.posthog.com for EU
```

### 3. PostHog Provider (Already Configured)

The `PostHogProvider` is already integrated in `src/app/[locale]/layout.tsx` and automatically:
- ✅ Initializes PostHog on app load
- ✅ Tracks pageviews on route changes
- ✅ Respects privacy settings (masks sensitive inputs)

## Usage Examples

### Client-Side Tracking

```typescript
import { trackEvent, identifyUser, bookingEvents } from "@/lib/integrations/posthog";

// Track custom event
trackEvent("Button Clicked", {
  buttonName: "Book Now",
  page: "/professionals"
});

// Identify user after login
identifyUser("user_123", {
  email: "user@example.com",
  plan: "premium",
  signupDate: "2025-01-15"
});

// Track booking events
bookingEvents.started({
  service: "cleaning",
  city: "Bogotá"
});

bookingEvents.completed({
  bookingId: "bk_123",
  amount: 50000,
  service: "cleaning"
});
```

### Server-Side Tracking

```typescript
import { trackServerEvent } from "@/lib/integrations/posthog";

// In API routes or server actions
export async function POST(request: Request) {
  const userId = "user_123";

  await trackServerEvent(userId, "Payment Processed", {
    amount: 50000,
    currency: "COP",
    method: "card"
  });

  return Response.json({ success: true });
}
```

### Feature Flags

```typescript
import { isFeatureEnabled, getFeatureFlag } from "@/lib/integrations/posthog";

// Check if feature is enabled
if (isFeatureEnabled("new-checkout-flow")) {
  // Show new checkout UI
}

// Get feature flag variant
const variant = getFeatureFlag("pricing-experiment");
if (variant === "variant-a") {
  // Show pricing variant A
} else if (variant === "variant-b") {
  // Show pricing variant B
}
```

### Pre-built Event Tracking

```typescript
import { searchEvents, professionalEvents, funnelEvents } from "@/lib/integrations/posthog";

// Search tracking
searchEvents.performed({
  query: "housekeeper in Bogotá",
  resultCount: 15,
  locale: "es"
});

// Professional tracking
professionalEvents.viewed({
  professionalId: "prof_123",
  source: "search_results"
});

// Conversion funnel
funnelEvents.viewedLanding();
funnelEvents.clickedCTA("Get Started");
funnelEvents.startedSignup();
funnelEvents.completedSignup("google");
```

### Error Tracking

```typescript
import { trackError } from "@/lib/integrations/posthog";

try {
  await riskyOperation();
} catch (error) {
  trackError(error as Error, {
    context: "checkout",
    userId: "user_123",
    step: "payment"
  });
}
```

## Privacy & Compliance

PostHog is configured with privacy-first defaults:

- ✅ **Masked Inputs**: All form inputs are masked by default
- ✅ **GDPR Compliant**: Respects Do Not Track headers
- ✅ **Session Recording**: Only records after consent
- ✅ **Data Location**: Choose US or EU hosting

### Marking Sensitive Data

Add `data-sensitive` attribute to hide specific elements:

```tsx
<div data-sensitive>
  <input name="credit-card" />
</div>
```

### Enabling Autocapture for Specific Elements

Add `data-ph-capture` to elements you want to track automatically:

```tsx
<button data-ph-capture>Track This Click</button>
```

## PostHog Dashboard

Access your analytics at: [https://us.posthog.com](https://us.posthog.com)

### Key Features:
- 📊 **Funnels**: Track conversion flows
- 🔄 **Retention**: Measure user engagement
- 🎯 **Cohorts**: Group users by behavior
- 🧪 **A/B Testing**: Run experiments with feature flags
- 🎥 **Session Recordings**: Watch user sessions
- 📈 **Dashboards**: Create custom analytics dashboards

## Integration with Existing Analytics

PostHog complements your existing tracking in `src/lib/analytics/trackEvent.ts`. Consider:

1. **Client Events** → PostHog (user behavior, feature usage)
2. **Business Events** → Your existing system (bookings, revenue)
3. **Server Events** → Both (for complete visibility)

## Useful Links

- [PostHog Docs](https://posthog.com/docs)
- [Feature Flags Guide](https://posthog.com/docs/feature-flags)
- [Session Recording](https://posthog.com/docs/session-replay)
- [JavaScript SDK](https://posthog.com/docs/libraries/js)
