# Homepage Hero A/B Test

**Epic G-2: First A/B Test - Homepage Hero CTA Optimization**

## Test Hypothesis

**Hypothesis:** Changing the hero messaging to emphasize speed and ease will increase brief completion rate by highlighting the quick turnaround time (5 business days) more prominently.

**Target Metric:** Brief start rate (users who click "Start Your Brief" or "Find Your Match")

## Variants

### Control (hero_variant = 'control')

**Current hero section:**

- **Overline:** "Domestic Staffing for Expats in Colombia"
- **Headline:** "Find trusted household staff in Colombia—entirely in English."
- **Subtitle:** Long-form description emphasizing trust, vetting, and insurance
- **Primary CTA:** "Start Your Brief" (orange button)
- **Secondary CTA:** "Learn More" (ghost button)
- **Additional Link:** "Speak with a concierge →"

**Value Proposition:** Trust, quality, comprehensive vetting

### Variant A (hero_variant = 'variant_a')

**Alternative messaging:**

- **Overline:** "Staff Your Home in 5 Business Days"
- **Headline:** "Trusted household staff, matched to your needs—in English."
- **Subtitle:** Shorter, benefit-focused copy emphasizing speed and ease
- **Primary CTA:** "Find Your Match" (orange button)
- **Secondary CTA:** "See How It Works" (ghost button)
- **Additional Link:** "Speak with a concierge →" (unchanged)

**Value Proposition:** Speed, ease, personalization

**Changes from control:**
1. Overline emphasizes speed (5 business days)
2. Headline leads with "Trusted" but focuses on matching
3. Shorter subtitle (reduce cognitive load)
4. Primary CTA: "Find Your Match" vs "Start Your Brief" (more action-oriented)
5. Secondary CTA: "See How It Works" vs "Learn More" (more specific)

## Tracking Events

All hero CTA clicks tracked via:

```typescript
conversionTracking.heroCTAClicked({
  ctaType: "start_brief" | "learn_more" | "concierge",
  location: "hero" | "banner",
  ctaText: string,
  variant: "control" | "variant_a" // NEW
});
```

## Conversion Funnel

**Primary Conversion Path:**
1. View homepage (hero impression)
2. Click "Start Your Brief" / "Find Your Match"
3. Complete brief form (step 1)
4. Complete brief form (step 2)
5. Brief submitted

**PostHog Funnel Setup:**
- Funnel Name: "Hero to Brief Completion"
- Events:
  1. `Hero CTA Clicked` (ctaType = "start_brief")
  2. `Brief Started` (step 1 viewed)
  3. `Brief Step Completed` (step 1)
  4. `Brief Step Completed` (step 2)
  5. `Brief Submitted`

## Success Criteria

**Primary Metric:**
- Brief start rate increase of ≥10% (statistically significant)

**Secondary Metrics:**
- Brief completion rate (started → submitted)
- Time to first CTA click
- Secondary CTA click rate (Learn More)
- Bounce rate

**Guardrail Metrics (must not degrade):**
- Overall conversion rate to booking
- Brand perception (qualitative surveys)

## Traffic Allocation

**Phase 1: Initial Test (50/50 split)**
- Control: 50% of users
- Variant A: 50% of users

**Sample Size Calculation:**
- Current brief start rate: ~5% (baseline)
- Minimum detectable effect: 10% relative improvement (5% → 5.5%)
- Statistical power: 80%
- Significance level: 95%
- Estimated sample size: ~15,000 visitors per variant
- Expected duration: 7-14 days (depending on traffic)

**Phase 2: Rollout (if winning)**
- Gradual rollout to 100% if Variant A wins

## Implementation Checklist

### Code Implementation

- [x] Create feature flag configuration (`FEATURE_FLAGS.HERO_VARIANT`)
- [x] Create typed feature flag wrapper
- [ ] Create `HeroVariantA` component
- [ ] Modify `HeroSection` to use feature flag
- [ ] Add `variant` parameter to conversion tracking
- [ ] Create Storybook stories for both variants

### PostHog Configuration

- [ ] Create PostHog feature flag: `hero_variant`
  - Type: Multivariate
  - Variants: `control`, `variant_a`
  - Rollout: 50% each
- [ ] Create PostHog experiment: "Hero CTA Optimization"
  - Feature flag: `hero_variant`
  - Goal metric: `Brief Started` event count
- [ ] Set up conversion funnel in PostHog
- [ ] Configure experiment dashboard

### Testing

- [ ] Unit test: Hero renders correct variant based on flag
- [ ] E2E test: Variant A shows alternative messaging
- [ ] E2E test: Conversion tracking includes variant parameter
- [ ] Visual regression test: Both variants render correctly

## PostHog Setup Instructions

### 1. Create Feature Flag

1. Go to PostHog → Feature Flags → New Feature Flag
2. Configure:
   ```
   Name: Hero Variant
   Key: hero_variant
   Type: Multivariate
   Variants:
     - control (50%)
     - variant_a (50%)
   Rollout: 100% of users
   ```

### 2. Create Experiment

1. Go to PostHog → Experiments → New Experiment
2. Configure:
   ```
   Name: Hero CTA Optimization
   Description: Test alternative hero messaging emphasizing speed
   Feature flag: hero_variant
   Control variant: control
   Test variant: variant_a

   Goal metric: Brief Started (count)
   Secondary metrics:
     - Brief Submitted (count)
     - Hero CTA Clicked (count)

   Exposure: Users who view homepage
   ```

### 3. Set Up Funnel

1. Go to PostHog → Insights → New Funnel
2. Configure:
   ```
   Name: Hero to Brief Completion
   Steps:
     1. Hero CTA Clicked (ctaType = "start_brief")
     2. Brief Started
     3. Brief Step Completed (step = 1)
     4. Brief Step Completed (step = 2)
     5. Brief Submitted

   Breakdown by: variant (from event properties)
   ```

## Monitoring & Analysis

### Daily Checks (Days 1-3)

- Check traffic split is 50/50
- Verify tracking events are firing correctly
- Monitor for any errors or anomalies

### Weekly Review (End of Week 1)

- Review preliminary results
- Check statistical significance
- Assess secondary and guardrail metrics

### Final Analysis (End of Test)

**Questions to Answer:**
1. Does Variant A significantly improve brief start rate?
2. Does Variant A maintain or improve brief completion rate?
3. Are there any negative impacts on secondary metrics?
4. Does the improvement justify a full rollout?

**Decision Matrix:**

| Brief Start Rate | Statistical Significance | Decision |
|------------------|--------------------------|----------|
| +10% or more | p < 0.05 | Ship Variant A to 100% |
| +5% to +10% | p < 0.05 | Continue test 1 more week |
| +5% to +10% | p >= 0.05 | Continue test 1 more week |
| -5% to +5% | Any | Keep Control, try new variant |
| Less than -5% | p < 0.05 | Stop test, keep Control |

## Rollout Plan

**If Variant A Wins:**

1. **Phase 1: Gradual Rollout (Week 1)**
   - 50% → 75% over 3 days
   - Monitor metrics daily

2. **Phase 2: Full Rollout (Week 2)**
   - 75% → 100% over 2 days
   - Update default variant in code

3. **Phase 3: Deprecate Control (Week 3)**
   - Remove feature flag after 1 week of 100% rollout
   - Make Variant A the new default

**If Control Wins:**

1. Keep current hero
2. Document learnings
3. Design new hypothesis for next test

## Learnings & Next Tests

**Potential Follow-Up Tests:**

1. **Hero Image Variation:** Test different images (professional vs family)
2. **Social Proof:** Test customer testimonials in hero
3. **CTA Design:** Test button color, size, or position
4. **Value Props:** Test different benefit highlights

**Documentation:**
- Record results in `/docs/experiments/hero-ab-test-results.md`
- Share insights in weekly team meeting
- Update playbook with learnings

---

**Created:** 2025-01-14
**Owner:** Product Team
**Status:** Ready to implement
