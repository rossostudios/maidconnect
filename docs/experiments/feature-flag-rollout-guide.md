# Feature Flag Rollout Guide

**Epic G: Feature Flags & Experiments**
**Date:** 2025-01-14

## Overview

This guide documents the standard process for rolling out new features using PostHog feature flags at Casaora. Feature flags enable gradual rollouts, A/B testing, and quick rollbacks without code deployments.

## When to Use Feature Flags

### ✅ Use Feature Flags For:

1. **New Features** - Large features that need gradual rollout
2. **A/B Tests** - Testing different variants to optimize conversion
3. **Risky Changes** - Changes that might break production
4. **Beta Features** - Features available to select users first
5. **Kill Switches** - Ability to disable features instantly

### ❌ Don't Use Feature Flags For:

1. **Simple Bug Fixes** - Deploy directly, no flag needed
2. **Copy Changes** - Use CMS (Sanity) instead
3. **Internal Tools** - Use environment variables
4. **One-Time Migrations** - Use migration scripts
5. **Security Patches** - Deploy immediately

## Feature Flag Types

### 1. Boolean Flags

**Use Case:** Simple on/off toggle

**Example:**
```typescript
import { isFeatureEnabled } from '@/lib/integrations/posthog';

if (isFeatureEnabled('match_wizard_enabled')) {
  return <MatchWizard />;
}
return <ProfessionalsBrowse />;
```

**PostHog Configuration:**
```
Key: match_wizard_enabled
Type: Boolean
Default: false
Rollout: 0% → 100% gradually
```

### 2. Multivariate Flags

**Use Case:** A/B/C testing with multiple variants

**Example:**
```typescript
import { getHeroVariant } from '@/lib/integrations/posthog';

const variant = getHeroVariant(); // "control" | "variant_a"

if (variant === 'variant_a') {
  return <HeroVariantA />;
}
return <HeroControl />;
```

**PostHog Configuration:**
```
Key: hero_variant
Type: Multivariate
Variants:
  - control (50%)
  - variant_a (50%)
Rollout: 100% of all users
```

### 3. String Flags (with Payloads)

**Use Case:** Configuration values (colors, thresholds, URLs)

**Example:**
```typescript
import { getFeatureFlag } from '@/lib/integrations/posthog';

const ctaColor = getFeatureFlag('cta_color') || 'orange-500';
<Button className={`bg-${ctaColor}`}>Book Now</Button>
```

**PostHog Configuration:**
```
Key: cta_color
Type: String
Values: orange-500, blue-500, green-500
Rollout: A/B test with 33% split
```

## Step-by-Step Rollout Process

### Phase 1: Planning & Design

**1. Define Feature & Hypothesis**

Document in `docs/experiments/[feature-name].md`:
```markdown
## Feature: Match Wizard

### Hypothesis
A guided wizard will increase booking conversion by 20%
by reducing choice paralysis.

### Variants
- Control: Standard professional browse
- Treatment: Guided match wizard

### Success Metrics
- Primary: Booking completion rate
- Secondary: Time to first booking
```

**2. Add Feature Flag to Configuration**

Edit `src/lib/shared/config/feature-flags.ts`:
```typescript
export const FEATURE_FLAGS = {
  // ... existing flags
  MATCH_WIZARD_ENABLED: "match_wizard_enabled",
} as const;

export const FEATURE_FLAG_METADATA: Record<FeatureFlagKey, FeatureFlagMetadata> = {
  // ... existing metadata
  [FEATURE_FLAGS.MATCH_WIZARD_ENABLED]: {
    key: FEATURE_FLAGS.MATCH_WIZARD_ENABLED,
    name: "Match Wizard Enabled",
    description: "Enable guided wizard for finding professionals",
    defaultValue: false,
    type: "boolean",
  },
};
```

**3. Create Helper Functions (Optional)**

For complex flags, add helper in `src/lib/integrations/posthog/feature-flags.ts`:
```typescript
export function isMatchWizardEnabled(): boolean {
  return isFeatureEnabled(FEATURE_FLAGS.MATCH_WIZARD_ENABLED, false);
}
```

### Phase 2: Implementation

**1. Implement Feature Behind Flag**

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isMatchWizardEnabled } from "@/lib/integrations/posthog";

export default function MatchWizardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isMatchWizardEnabled()) {
      router.push("/professionals");
    }
  }, [router]);

  if (!isMatchWizardEnabled()) {
    return null; // Or loading state
  }

  return <MatchWizard />;
}
```

**2. Add Tracking Events**

Create tracking module in `src/lib/integrations/posthog/[feature]-tracking.ts`:
```typescript
export const matchWizardTracking = {
  started: (props: { source: string }) => {
    trackEvent("Match Wizard Started", props);
  },

  completed: (props: { timeSpent: number; data: any }) => {
    trackEvent("Match Wizard Completed", {
      ...props,
      value: 1, // Conversion event
    });
  },
};
```

**3. Write Tests**

```typescript
import { setPlaywrightFeatureFlags } from '@/lib/integrations/posthog/testing';

test('match wizard is hidden when flag is disabled', async ({ page }) => {
  await setPlaywrightFeatureFlags(page, {
    match_wizard_enabled: false
  });

  await page.goto('/match-wizard');
  await expect(page).toHaveURL('/professionals'); // Redirected
});

test('match wizard is shown when flag is enabled', async ({ page }) => {
  await setPlaywrightFeatureFlags(page, {
    match_wizard_enabled: true
  });

  await page.goto('/match-wizard');
  await expect(page.getByText('Find Your Perfect Match')).toBeVisible();
});
```

**4. Code Review Checklist**

Before merging:
- [ ] Feature works with flag enabled
- [ ] Feature is hidden with flag disabled
- [ ] Default fallback behavior is safe
- [ ] No errors when flag is disabled
- [ ] Tracking events are implemented
- [ ] Tests cover both flag states
- [ ] Type safety is maintained

### Phase 3: PostHog Configuration

**1. Create Feature Flag**

1. Go to [PostHog → Feature Flags](https://us.posthog.com/feature_flags)
2. Click "New Feature Flag"
3. Configure:
   ```
   Key: match_wizard_enabled (must match code)
   Type: Boolean
   Description: Enable guided wizard for finding professionals
   Rollout: 0% initially (for safety)
   ```

**2. Create Experiment (for A/B tests only)**

1. Go to [PostHog → Experiments](https://us.posthog.com/experiments)
2. Click "New Experiment"
3. Configure:
   ```
   Name: Homepage Hero - Speed Test
   Feature Flag: hero_variant
   Variants: control (50%), variant_a (50%)
   Primary Metric: Brief Start Rate
   Secondary Metrics: Completion Rate
   ```

**3. Create Funnels/Insights**

Document all required funnels in `docs/experiments/[feature-name]-funnel-setup.md`.

Example funnel:
```
Step 1: Match Wizard Started
Step 2: Location Step Completed
Step 3: Service Step Completed
Step 4: Results Viewed
Step 5: Match Selected (conversion)

Conversion Window: 30 minutes
Breakdown: serviceType
```

### Phase 4: Gradual Rollout

**Week 1: Internal Testing (0-5%)**

**Target:** Team members only (use email filter in PostHog)

**Configuration:**
```
Rollout: 5%
Match conditions:
  - email ends with @casaora.com
```

**Goals:**
- [ ] Feature works without errors
- [ ] All events are tracked correctly
- [ ] No performance degradation

**Monitoring:**
- Check PostHog Activity tab for events
- Monitor error rates in Better Stack
- Review session recordings

**Decision:** Ship to beta users OR fix bugs

---

**Week 2-3: Beta Users (5-25%)**

**Target:** Power users and early adopters

**Configuration:**
```
Rollout: 25%
Match conditions:
  - user_segment = "power_users" OR
  - signup_date < 30 days ago
```

**Goals:**
- [ ] Gather user feedback
- [ ] Validate UX and flows
- [ ] Measure early metrics

**Success Criteria:**
- Completion rate ≥50%
- No increase in support tickets
- Positive qualitative feedback

**Decision:** Continue rollout OR iterate on feedback

---

**Week 4: 50% Rollout**

**Target:** Half of all users (random)

**Configuration:**
```
Rollout: 50%
Match conditions: None (random 50%)
```

**Goals:**
- [ ] Measure metrics at scale
- [ ] Compare to control group
- [ ] Monitor infrastructure

**Success Criteria:**
- Primary metric meets target
- No degradation in secondary metrics
- Infrastructure handles load

**Decision:** Ship to 100% OR adjust based on data

---

**Week 5-6: 75% Rollout**

**Configuration:**
```
Rollout: 75%
```

**Goals:**
- [ ] Final validation before full launch
- [ ] Monitor edge cases

**Decision:** Ship to 100% OR investigate issues

---

**Week 7: 100% Rollout**

**Configuration:**
```
Rollout: 100%
```

**Goals:**
- [ ] Full launch
- [ ] Monitor closely for 1 week
- [ ] Prepare to remove flag from code

**Decision:** Keep as permanent feature OR roll back

### Phase 5: Cleanup

**After 2 weeks at 100%:**

1. **Remove Feature Flag from Code**
   ```typescript
   // Before (with flag)
   if (isMatchWizardEnabled()) {
     return <MatchWizard />;
   }
   return <ProfessionalsBrowse />;

   // After (permanent)
   return <MatchWizard />;
   ```

2. **Archive Flag in PostHog**
   - Don't delete (preserves analytics history)
   - Mark as "Archived"

3. **Update Documentation**
   - Add outcome to experiment docs
   - Document learnings

## Emergency Rollback

### When to Roll Back

Roll back immediately if:
- ❌ Critical bugs affecting core functionality
- ❌ Performance degradation (page load >3s)
- ❌ Crash rate increase >5%
- ❌ Primary metric drops >20%
- ❌ Negative user feedback spike

### How to Roll Back

**Option 1: PostHog Flag (Instant)**

1. Go to PostHog → Feature Flags
2. Find the flag
3. Set rollout to 0%
4. Save

⏱️ **Takes effect:** Immediately (next page load)

**Option 2: Code Deployment (15-30 min)**

1. Revert the feature flag merge commit:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. Deploy to production

⏱️ **Takes effect:** After deployment

### Post-Rollback Actions

1. **Investigate Root Cause**
   - Check error logs in Better Stack
   - Review session recordings in PostHog
   - Gather user feedback

2. **Document Issue**
   - Add to `docs/experiments/[feature]-post-mortem.md`
   - Share learnings with team

3. **Plan Fix**
   - Create GitHub issue with details
   - Prioritize fix
   - Test thoroughly before re-launch

## Best Practices

### 1. Start Small, Move Slow

- Never launch to 100% immediately
- Use 5% → 25% → 50% → 75% → 100% progression
- Wait at least 3-7 days between increases

### 2. Monitor Metrics Daily

During rollout, check daily:
- Primary success metric
- Error rates (Better Stack)
- Support ticket volume
- User feedback (surveys, reviews)

### 3. Track Everything

Every feature flag should track:
- Feature usage (enabled users)
- Conversion events (success)
- Error events (failures)
- Time spent (engagement)

### 4. Use Type Safety

Always use typed feature flag keys:
```typescript
// ✅ Good - Type-safe
isFeatureEnabled(FEATURE_FLAGS.MATCH_WIZARD_ENABLED)

// ❌ Bad - Runtime errors possible
isFeatureEnabled('match_wizard_enabeld') // Typo!
```

### 5. Default to Safe Behavior

Feature flags should default to the safe, stable state:
```typescript
// ✅ Good - Defaults to stable experience
isFeatureEnabled('experimental_feature', false)

// ❌ Bad - Defaults to experimental
isFeatureEnabled('experimental_feature', true)
```

### 6. Clean Up After Launch

Don't accumulate technical debt:
- Remove flags within 2 weeks of 100% launch
- Archive flags in PostHog
- Update documentation

### 7. Document Decisions

For every flag, document:
- Why it was created
- Rollout timeline
- Success criteria
- Final outcome (shipped/killed)

## Common Patterns

### Pattern 1: Entry Point Gate

**Use Case:** Hide entire page/feature

```typescript
export default function NewFeaturePage() {
  const router = useRouter();

  useEffect(() => {
    if (!isFeatureEnabled('new_feature')) {
      router.push('/fallback');
    }
  }, [router]);

  if (!isFeatureEnabled('new_feature')) {
    return null;
  }

  return <NewFeature />;
}
```

### Pattern 2: Component Swap

**Use Case:** A/B test two variants

```typescript
export function Hero() {
  const variant = getHeroVariant();

  if (variant === 'variant_a') {
    return <HeroVariantA />;
  }

  return <HeroControl />;
}
```

### Pattern 3: Conditional Render

**Use Case:** Add optional section

```typescript
export function Dashboard() {
  return (
    <div>
      <Stats />
      <Charts />

      {isFeatureEnabled('premium_features') && (
        <PremiumInsights />
      )}

      <RecentActivity />
    </div>
  );
}
```

### Pattern 4: Server-Side Gate

**Use Case:** API endpoint or server component

```typescript
export async function GET(request: Request) {
  const userId = await getAuthUserId();

  const isEnabled = await getFeatureFlagServer(
    'new_api_endpoint',
    userId,
    false
  );

  if (!isEnabled) {
    return new Response('Feature not available', { status: 404 });
  }

  // Feature logic...
}
```

## Troubleshooting

### Issue: Flag not updating in browser

**Cause:** PostHog caches flags in browser

**Solution:**
1. Hard refresh (Cmd/Ctrl + Shift + R)
2. Clear PostHog override: `posthog.featureFlags.override(false)`
3. Check flag in PostHog UI is actually changed

### Issue: Different users see different behavior

**Cause:** Flag rollout is percentage-based

**Solution:** This is expected! Use consistent user ID for testing:
```typescript
posthog.identify('test-user-123'); // Same user always gets same variant
```

### Issue: Flag value undefined

**Cause:** PostHog not initialized or user not identified

**Solution:** Check initialization:
```typescript
if (typeof window !== 'undefined') {
  console.log('PostHog initialized:', window.posthog?._loaded);
}
```

### Issue: Tests failing with flag errors

**Cause:** PostHog not mocked in tests

**Solution:** Use testing utilities:
```typescript
import { setPlaywrightFeatureFlags } from '@/lib/integrations/posthog/testing';

await setPlaywrightFeatureFlags(page, {
  match_wizard_enabled: true
});
```

## Related Documentation

- [PostHog Feature Flag Configuration](../../src/lib/shared/config/feature-flags.ts)
- [PostHog Integration Guide](../../src/lib/integrations/posthog/README.md)
- [Hero A/B Test Implementation](./hero-ab-test-implementation.md)
- [Match Wizard Funnel Setup](./match-wizard-funnel-setup.md)

---

**Last Updated:** 2025-01-14
**Version:** 1.0
**Owner:** Product & Engineering Team
