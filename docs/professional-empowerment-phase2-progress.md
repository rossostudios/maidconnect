# Professional Empowerment - Phase 2: Digital CV Progress

## Overview

Phase 2 focuses on making professional profiles public-facing with SEO optimization, social sharing capabilities, and optional earnings badges.

---

## ✅ Completed Features

### 1. Vanity URL System

**Database Changes** ([migration](../supabase/migrations/20250119000001_add_vanity_url_and_public_profile.sql)):
- Added `slug` column - unique, SEO-friendly URL identifier
- Added `profile_visibility` column - controls public/private access
- Added `share_earnings_badge` column - opt-in earnings display
- Added earnings tracking columns: `total_earnings_cop`, `total_bookings_completed`, `earnings_last_updated_at`
- Created `generate_professional_slug()` function for slug generation
- Added unique index on slug and public visibility index
- Auto-generates slugs from `full_name` field

**Utilities** ([slug.ts](../src/lib/utils/slug.ts)):
- `generateSlug()` - converts text to URL-safe slug
- `generateUniqueSlug()` - adds hash suffix for uniqueness
- `isValidSlug()` - validates slug format
- `sanitizeSlugInput()` - XSS prevention for user input
- `extractSlugFromUrl()` - parses slug from URLs
- `buildVanityUrl()` - creates full vanity URL

**API Endpoints** ([/api/pro/slug](../src/app/api/pro/slug/route.ts)):
- `GET /api/pro/slug` - get current slug and suggested slug
- `PUT /api/pro/slug` - update professional's slug
- `POST /api/pro/slug/check` - check slug availability

**Public Profile Route** ([/pro/[slug]](../src/app/[locale]/pro/[slug]/page.tsx)):
- Accessible via `/pro/{slug}` (e.g., `/pro/maria-garcia-abc123`)
- Only shows `profile_visibility = 'public'` profiles
- Includes verification badges
- Supports earnings badges (if opted in)
- Fully server-rendered for SEO

---

### 2. Open Graph Tags & SEO Metadata

**Features**:
- Dynamic Open Graph metadata for social media previews
- Twitter Card support (summary_large_image)
- Profile-specific title and description
- Locale-aware metadata
- Professional name, service, location in meta description

**Implementation** ([/pro/[slug]/page.tsx](../src/app/[locale]/pro/[slug]/page.tsx:227-307)):
```typescript
{
  title: `${professional.name} · Casaora`,
  description: `${professional.name}${serviceSnippet}${locationSnippet}`,
  openGraph: {
    title: `${professional.name} · Casaora`,
    description: `...`,
    url: `${SITE_URL}/pro/${slug}`,
    siteName: "Casaora",
    type: "profile",
    locale: locale,
    images: [{ url: ogImageUrl, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImageUrl],
  },
}
```

---

### 3. Dynamic OG Image Generation

**API Endpoint** ([/api/og/pro/[slug]](../src/app/api/og/pro/[slug]/route.tsx)):
- Generates 1200x630px Open Graph images
- Uses Next.js ImageResponse (Edge Runtime)
- Personalized with professional's data
- Displays:
  - Casaora branding
  - Professional name (large, bold)
  - Primary service
  - Location badge
  - Verification badge (if verified/background checked)
  - Experience/bookings badge
- Airbnb-inspired design with rounded corners
- Cool neutral color palette (#F7F7F7, #222222, #FF385C)

**Design**:
- Background: `#F7F7F7` (neutral-50 Airbnb)
- Text: `#222222` (neutral-900 Airbnb)
- Accent: `#FF385C` (rausch-500 Airbnb coral)
- Verification: `#788C5D` (green-500) or `#00A699` (babu-500 Airbnb teal)
- Rounded badges with `borderRadius: '9999px'`

**Example URL**: `https://casaora.co/api/og/pro/maria-garcia-abc123`

---

### 4. Social Share Buttons

**Component** ([social-share-buttons.tsx](../src/components/professionals/social-share-buttons.tsx)):
- `SocialShareButtons` - Multiple platform buttons (WhatsApp, Facebook, Twitter/X, LinkedIn)
- `ShareButton` - Individual platform share button
- `ShareSection` - Full share CTA with vanity URL display
- Copy-to-clipboard functionality with toast notifications
- PostHog analytics tracking (`trackSocialShareClicked`)

**Integration** ([/pro/[slug]/page.tsx](../src/app/[locale]/pro/[slug]/page.tsx)):
- ShareSection integrated at bottom of public profile
- Passes vanityUrl, professionalName, service props

---

### 5. Earnings Badge System

**Badge Tiers** ([earnings-badges.ts](../src/lib/professionals/earnings-badges.ts)):
- Bronze: 1-10 bookings (🥉)
- Silver: 11-50 bookings (🥈)
- Gold: 51-100 bookings (🥇)
- Platinum: 100+ bookings (💎)

**Utility Functions**:
- `calculateBadgeTier()` - Determine tier from bookings
- `getBadgeFromBookings()` - Get full badge info
- `calculateTierProgress()` - Progress to next tier (0-100%)
- `formatEarningsForBadge()` - Format currency for display
- `getBadgeColorClasses()` - Lia Design System colors

**Components** ([earnings-badge.tsx](../src/components/professionals/earnings-badge.tsx)):
- `EarningsBadge` - Full badge with optional earnings display
- `EarningsBadgeCompact` - Minimal display (icon + tier)
- `EarningsBadgeTooltip` - Hover tooltip with progress info

---

### 6. Earnings Visibility Toggle

**API Endpoint** ([/api/pro/settings/earnings-badge](../src/app/api/pro/settings/earnings-badge/route.ts)):
- `GET` - Fetch current setting and stats
- `PUT` - Update `share_earnings_badge` setting

**Settings Component** ([earnings-badge-settings.tsx](../src/components/professionals/earnings-badge-settings.tsx)):
- Toggle switch for public visibility
- Current badge preview with progress
- Optimistic updates with rollback
- PostHog analytics tracking

**Dashboard Integration** ([/dashboard/pro/profile](../src/app/[locale]/dashboard/pro/profile/page.tsx)):
- `<EarningsBadgeSettings />` component included

---

### 7. Earnings Badges on Public Profile

**Implementation** ([professional-profile-view.tsx](../src/components/professionals/professional-profile-view.tsx:247-260)):
- Displays `EarningsBadge` when `shareEarningsBadge = true`
- Requires `totalBookingsCompleted > 0`
- Shows earnings amount (optional based on preference)
- PostHog tracking: `trackEarningsBadgeViewed`

---

### 8. Wallet/Earnings Summary Component

**Component** ([wallet-earnings-summary.tsx](../src/components/professionals/wallet-earnings-summary.tsx)):
- Total lifetime earnings display
- Current badge tier with progress
- Completed bookings count
- Average earnings per booking
- Link to public profile
- Badge visibility indicator

**API Endpoint** ([/api/pro/wallet/summary](../src/app/api/pro/wallet/summary/route.ts)):
- Returns totalEarningsCOP, totalBookingsCompleted
- Returns shareEarningsBadge preference
- Returns slug for profile link

---

### 9. PostHog Analytics

**Professional Events** ([professional-events.ts](../src/lib/analytics/professional-events.ts)):
- `trackVanityUrlViewed` - Profile page visits
- `trackEarningsBadgeViewed` - Badge display on public profile
- `trackEarningsBadgeEnabled` - Toggle enabled
- `trackEarningsBadgeDisabled` - Toggle disabled
- `trackSocialShareClicked` - Share button interactions

---

## ✅ Recently Completed Tasks

### 1. Automatic Stats Updates ✅
Update earnings stats on booking completion (completed 2025-11-24):
- Created `increment_professional_earnings_stats` RPC function for atomic updates
- Increments `total_bookings_completed` by 1
- Adds captured amount to `total_earnings_cents`
- Updates `earnings_last_updated_at` to current timestamp
- Non-blocking (doesn't fail check-out if stats update fails)
- Migration: `20251124210000_add_increment_earnings_stats_rpc.sql`

**Implementation:**
- Service: `updateProfessionalEarningsStats()` in `src/lib/bookings/check-out-service.ts`
- API Route: Called after `completeBookingCheckOut()` in `/api/bookings/check-out/route.ts`

### 2. E2E Tests ✅
Comprehensive Playwright tests for Digital CV (completed 2025-11-24):
- **Slug Management**: Earnings badge toggle visibility and interaction
- **Public Profile Display**: Profile container, avatar, name heading, social share buttons, OG meta tags, earnings badge
- **Social Sharing**: WhatsApp share link format, Facebook share link format, copy URL button
- **OG Image Generation**: API endpoint response, Twitter Card meta tags
- **Accessibility**: ARIA labels on share buttons, heading hierarchy, keyboard navigation
- **Responsive Design**: Mobile viewport (390px), tablet viewport (768px), touch targets

**Test File:** `tests/playwright/e2e/digital-cv-sharing.spec.ts`

---

## Key Files Created

### Database
- [20250119000001_add_vanity_url_and_public_profile.sql](../supabase/migrations/20250119000001_add_vanity_url_and_public_profile.sql)

### Utilities
- [src/lib/utils/slug.ts](../src/lib/utils/slug.ts)
- [src/lib/professionals/earnings-badges.ts](../src/lib/professionals/earnings-badges.ts)

### Components
- [src/components/professionals/social-share-buttons.tsx](../src/components/professionals/social-share-buttons.tsx)
- [src/components/professionals/earnings-badge.tsx](../src/components/professionals/earnings-badge.tsx)
- [src/components/professionals/earnings-badge-settings.tsx](../src/components/professionals/earnings-badge-settings.tsx)
- [src/components/professionals/wallet-earnings-summary.tsx](../src/components/professionals/wallet-earnings-summary.tsx)
- [src/components/professionals/professional-profile-view.tsx](../src/components/professionals/professional-profile-view.tsx)

### API Routes
- [src/app/api/pro/slug/route.ts](../src/app/api/pro/slug/route.ts)
- [src/app/api/og/pro/[slug]/route.tsx](../src/app/api/og/pro/[slug]/route.tsx)
- [src/app/api/pro/settings/earnings-badge/route.ts](../src/app/api/pro/settings/earnings-badge/route.ts)
- [src/app/api/pro/wallet/summary/route.ts](../src/app/api/pro/wallet/summary/route.ts)

### Pages
- [src/app/[locale]/pro/[slug]/page.tsx](../src/app/[locale]/pro/[slug]/page.tsx)
- [src/app/[locale]/dashboard/pro/profile/page.tsx](../src/app/[locale]/dashboard/pro/profile/page.tsx)

### Analytics
- [src/lib/analytics/professional-events.ts](../src/lib/analytics/professional-events.ts)

---

## Testing Vanity URLs

### Prerequisites
1. Run migrations: `supabase db push --include-all`
2. Ensure professional has `profile_visibility = 'public'`

### Test Cases

**1. Auto-Generated Slug**:
```sql
INSERT INTO professional_profiles (profile_id, full_name, status)
VALUES ('uuid-here', 'María García', 'active');

-- Auto-generates slug: "maria-garcia-abc123" (first 6 chars of UUID)
```

**2. Manual Slug Update**:
```bash
curl -X PUT https://casaora.co/api/pro/slug \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "maria-garcia-cleaning-expert"}'
```

**3. Check Availability**:
```bash
curl -X POST https://casaora.co/api/pro/slug/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "maria-garcia"}'

# Response: {"available": true, "slug": "maria-garcia", "isOwnSlug": false}
```

**4. Access Public Profile**:
```
https://casaora.co/pro/maria-garcia-abc123
```

**5. View OG Image**:
```
https://casaora.co/api/og/pro/maria-garcia-abc123
```

---

## SEO Benefits

1. **Human-Readable URLs**: `/pro/maria-garcia-cleaner` vs `/professionals/uuid-abc123`
2. **Social Sharing**: Beautiful OG images for WhatsApp, Facebook, Twitter
3. **Search Engine Discovery**: Public profiles indexed by Google
4. **Professional Branding**: Pros can share their unique URL
5. **Trust Signals**: Verification badges visible in OG images

---

## Next Steps

1. ~~Create social share buttons component~~ ✅
2. ~~Add share section to profile page~~ ✅
3. ~~Implement earnings badge tiers~~ ✅
4. ~~Build earnings visibility toggle~~ ✅
5. ~~Add earnings badges to public profile~~ ✅
6. ~~Create wallet/earnings summary~~ ✅
7. ~~Add PostHog analytics tracking~~ ✅
8. ~~Update stats on booking completion~~ ✅
9. ~~Write E2E tests~~ ✅

---

**Last Updated**: 2025-11-24
**Status**: Phase 2 - 100% Complete ✅ (9 of 9 tasks)

## Summary

**Phase 2 (Digital CV) is COMPLETE!** 🎉

All features have been implemented and deployed:

| Feature | Status | Description |
|---------|--------|-------------|
| Vanity URL System | ✅ | SEO-friendly slugs with auto-generation |
| Open Graph Tags | ✅ | Dynamic OG metadata for social sharing |
| OG Image Generation | ✅ | Personalized 1200x630 images via Edge Runtime |
| Social Share Buttons | ✅ | WhatsApp, Facebook, Twitter, LinkedIn, Copy URL |
| Earnings Badge System | ✅ | Bronze/Silver/Gold/Platinum tiers |
| Visibility Toggle | ✅ | Opt-in earnings display on public profile |
| Wallet Summary | ✅ | Dashboard component with stats |
| PostHog Analytics | ✅ | Event tracking for all interactions |
| Automatic Stats Updates | ✅ | Atomic increment on booking completion |
| E2E Tests | ✅ | Comprehensive Playwright test suite |

**Production Ready**: All features are live and can be used by professionals immediately.
