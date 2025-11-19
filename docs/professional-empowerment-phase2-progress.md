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
- Anthropic-inspired design with rounded corners
- Warm neutral color palette (#FAF9F5, #141413, #D97757)

**Design**:
- Background: `#FAF9F5` (neutral-50)
- Text: `#141413` (neutral-900)
- Accent: `#D97757` (orange-500)
- Verification: `#788C5D` (green-500) or `#6A9BCC` (blue-500)
- Rounded badges with `borderRadius: '9999px'`

**Example URL**: `https://casaora.com/api/og/pro/maria-garcia-abc123`

---

## 🚧 Remaining Phase 2 Tasks

### 1. Social Share Buttons Component
Create reusable share buttons for:
- WhatsApp
- Facebook
- Twitter/X
- LinkedIn
- Copy link

### 2. Share Section on Profile Page
Add share CTA section to public profile with:
- Share buttons
- Copy vanity URL
- Share count/social proof

### 3. Earnings Badge System
Implement tiered earnings badges:
- Bronze: 1-10 bookings
- Silver: 11-50 bookings
- Gold: 51-100 bookings
- Platinum: 100+ bookings

Or earnings-based tiers:
- Starter: <$1,000 USD total
- Rising: $1,000-$5,000
- Established: $5,000-$20,000
- Elite: $20,000+

### 4. Earnings Visibility Toggle
Add toggle in pro dashboard settings:
- Enable/disable `share_earnings_badge`
- Preview how badge appears
- Privacy explanation

### 5. Display Earnings Badges on Profile
Show earnings badge on public profile when:
- `profile_visibility = 'public'`
- `share_earnings_badge = true`
- `total_bookings_completed > 0`

### 6. Wallet/Earnings Summary Component
Create earnings summary widget for pro dashboard:
- Total lifetime earnings
- Current earnings tier
- Progress to next tier
- Earnings breakdown (instant payouts vs batch)

### 7. Automatic Stats Updates
Update earnings stats on booking completion:
- Increment `total_bookings_completed`
- Add to `total_earnings_cop`
- Update `earnings_last_updated_at`
- Trigger in booking completion webhook

### 8. E2E Tests
- Test instant payout flow
- Test digital CV sharing
- Test slug generation
- Test OG image generation

### 9. PostHog Analytics
Track events:
- `profile_made_public`
- `slug_updated`
- `vanity_url_shared`
- `earnings_badge_enabled`
- `earnings_badge_displayed`

---

## Key Files Created

### Database
- [20250119000001_add_vanity_url_and_public_profile.sql](../supabase/migrations/20250119000001_add_vanity_url_and_public_profile.sql)

### Utilities
- [src/lib/utils/slug.ts](../src/lib/utils/slug.ts)

### API Routes
- [src/app/api/pro/slug/route.ts](../src/app/api/pro/slug/route.ts)
- [src/app/api/og/pro/[slug]/route.tsx](../src/app/api/og/pro/[slug]/route.tsx)

### Pages
- [src/app/[locale]/pro/[slug]/page.tsx](../src/app/[locale]/pro/[slug]/page.tsx)

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
curl -X PUT https://casaora.com/api/pro/slug \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "maria-garcia-cleaning-expert"}'
```

**3. Check Availability**:
```bash
curl -X POST https://casaora.com/api/pro/slug/check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "maria-garcia"}'

# Response: {"available": true, "slug": "maria-garcia", "isOwnSlug": false}
```

**4. Access Public Profile**:
```
https://casaora.com/pro/maria-garcia-abc123
```

**5. View OG Image**:
```
https://casaora.com/api/og/pro/maria-garcia-abc123
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

1. Create social share buttons component
2. Add share section to profile page
3. Implement earnings badge tiers
4. Build earnings visibility toggle
5. Add earnings badges to public profile
6. Create wallet/earnings summary
7. Update stats on booking completion
8. Write E2E tests
9. Add PostHog analytics tracking

---

**Last Updated**: 2025-01-19
**Status**: Phase 2 - 33% Complete (3 of 9 tasks)
