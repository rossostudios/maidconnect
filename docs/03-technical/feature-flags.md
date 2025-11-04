# Feature Flags Guide

## Overview

Casaora uses a feature flag system to enable:
- **A/B Testing**: Test different pricing strategies and UI variations
- **Gradual Rollouts**: Release features to a percentage of users
- **Environment Control**: Enable features in staging before production
- **Beta Testing**: Give specific users early access to features

## Quick Start

### Client-Side Usage (React Components)

```tsx
import { useFeatureFlag } from "@/hooks/use-feature-flag";

function SearchPage({ userId }: { userId: string }) {
  const showMatchWizard = useFeatureFlag("show_match_wizard", userId);

  if (showMatchWizard) {
    return <MatchWizard />;
  }

  return <TraditionalSearch />;
}
```

### Server-Side Usage (API Routes, Server Components)

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";

export async function GET(request: Request) {
  const userId = "user-123";

  if (isFeatureEnabled("show_platform_fee", userId)) {
    // Include platform fee in response
  }

  return NextResponse.json({ ... });
}
```

### Check Multiple Flags

```tsx
import { useFeatureFlags } from "@/hooks/use-feature-flag";

function PricingDisplay({ userId }: { userId: string }) {
  const flags = useFeatureFlags([
    "show_platform_fee",
    "enable_tipping",
    "subscription_discount_badges"
  ], userId);

  return (
    <div>
      {flags.show_platform_fee && <PlatformFeeBreakdown />}
      {flags.enable_tipping && <TipOption />}
      {flags.subscription_discount_badges && <SaveBadge />}
    </div>
  );
}
```

## Environment Variable Overrides

Enable features via environment variables (overrides default config):

```bash
# .env.local
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=true
NEXT_PUBLIC_FEATURE_ENABLE_WEB_VITALS=true
NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT=true
```

Format: `NEXT_PUBLIC_FEATURE_<FLAG_NAME_UPPERCASE>=true`

## Available Feature Flags

### Week 1-2 Features (Foundations)
- `show_match_wizard` - Concierge match wizard for first booking
- `enable_web_vitals` - Web Vitals reporting and monitoring

### Week 3-4 Features (Trust & Conversion)
- `enhanced_trust_badges` - Show verification badges on professional cards
- `live_price_breakdown` - Real-time price calculation with fees
- `show_on_time_metrics` - Display professional arrival reliability

### Week 5-6 Features (Communications & Retention)
- `auto_translate_chat` - Auto-translate messages ES/EN
- `one_tap_rebook` - Quick rebook from notification
- `recurring_plans` - Weekly/biweekly subscription plans

### Week 7-8 Features (Safety Package)
- `gps_check_in_out` - GPS verification (✅ already implemented)
- `arrival_notifications` - Notify customer when pro is nearby
- `time_extension_ui` - In-booking time extension requests

### Week 9-12 Features (Ops & Scale)
- `admin_verification_queue` - Admin moderation UI (✅ already implemented)
- `payout_ledger` - Financial reconciliation dashboard
- `city_landing_pages` - SEO-optimized city pages

### Pricing Experiments
- `show_platform_fee` - Display platform fee separately
- `enable_tipping` - Allow customers to tip professionals
- `subscription_discount_badges` - Highlight savings with plans

### Beta Features
- `caregiver_profiles` - Specialized caregiver/childcare profiles
- `maintenance_reminders` - Auto-remind for deep clean every 90 days
- `referral_program` - Referral credits system

## Beta Testing

Add user IDs to beta tester list in `src/lib/feature-flags.ts`:

```typescript
const betaTesters: Partial<Record<FeatureFlag, string[]>> = {
  show_match_wizard: [
    "user-id-1",
    "user-id-2",
  ],
  recurring_plans: [
    "user-id-3",
  ],
};
```

## Percentage-Based Rollouts

Gradually enable features for a percentage of users:

```typescript
import { isFeatureEnabled, isInRollout } from "@/lib/feature-flags";

// Enable for 25% of users
if (isInRollout(25, userId)) {
  // Show new feature
}
```

Rollout is deterministic - same user always gets the same result.

## Analytics Integration

Include feature flags in Better Stack logs:

```typescript
import { getFeatureFlagContext } from "@/lib/feature-flags";
import { logger } from "@/lib/logger";

await logger.info("User action", {
  userId,
  action: "booking_created",
  features: getFeatureFlagContext(userId), // Include all enabled flags
});
```

This helps correlate feature usage with errors and performance.

## Best Practices

### 1. Use Descriptive Flag Names
```typescript
// Good
"show_match_wizard"
"enable_tipping"

// Bad
"new_feature_1"
"test_thing"
```

### 2. Clean Up Old Flags
Remove flags after features are fully rolled out:
```typescript
// Before
if (isFeatureEnabled("old_feature", userId)) {
  return <NewComponent />;
}
return <OldComponent />;

// After full rollout
return <NewComponent />;
```

### 3. Document Flag Purpose
Add comments explaining what each flag does:
```typescript
const flags = {
  // Enables GPS check-in/out with 150m radius verification
  gps_check_in_out: true,
};
```

### 4. Test Both States
Always test with flag enabled AND disabled:
```bash
# Test with feature enabled
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=true npm run dev

# Test with feature disabled
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=false npm run dev
```

## Migration to External Service

This system can be easily migrated to LaunchDarkly, Flagsmith, or similar:

```typescript
// Current
import { isFeatureEnabled } from "@/lib/feature-flags";

// After migration (same API)
import { isFeatureEnabled } from "@/lib/launchdarkly";

// No component changes needed!
const enabled = isFeatureEnabled("show_match_wizard", userId);
```

## Debugging

View all enabled flags in development:

```tsx
import { useEnabledFlags } from "@/hooks/use-feature-flag";

function DevPanel({ userId }: { userId: string }) {
  const flags = useEnabledFlags(userId);

  return (
    <div>
      <h3>Enabled Features</h3>
      <pre>{JSON.stringify(flags, null, 2)}</pre>
    </div>
  );
}
```

## Examples

### Example 1: A/B Test Pricing Display
```tsx
function PricingCard({ userId, basePrice }: Props) {
  const showPlatformFee = useFeatureFlag("show_platform_fee", userId);

  if (showPlatformFee) {
    return (
      <div>
        <div>Service: ${basePrice}</div>
        <div>Platform Fee: ${basePrice * 0.15}</div>
        <div>Total: ${basePrice * 1.15}</div>
      </div>
    );
  }

  return (
    <div>
      <div>Total: ${basePrice * 1.15}</div>
    </div>
  );
}
```

### Example 2: Gradual Rollout
```tsx
// Enable match wizard for 50% of users
function SearchPage({ userId }: { userId: string }) {
  const baseEnabled = useFeatureFlag("show_match_wizard", userId);
  const inRollout = isInRollout(50, userId);

  const showWizard = baseEnabled && inRollout;

  return showWizard ? <MatchWizard /> : <TraditionalSearch />;
}
```

### Example 3: Environment-Specific Features
```bash
# Staging - enable all new features
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=true
NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES=true
NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT=true

# Production - conservative rollout
NEXT_PUBLIC_FEATURE_SHOW_MATCH_WIZARD=false
NEXT_PUBLIC_FEATURE_ENHANCED_TRUST_BADGES=true
NEXT_PUBLIC_FEATURE_AUTO_TRANSLATE_CHAT=false
```

## Support

For questions or issues with feature flags, check:
- [Feature Flags Source Code](../src/lib/feature-flags.ts)
- [React Hook](../src/hooks/use-feature-flag.ts)
- [Gameplan](./gameplan.md) for feature roadmap
