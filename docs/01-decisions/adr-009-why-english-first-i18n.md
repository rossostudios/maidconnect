# ADR-009: Why English-First i18n with Geolocation Detection

**Date:** 2025-01-06
**Status:** Accepted
**Deciders:** Technical Leadership Team
**Tags:** `i18n`, `localization`, `user-experience`, `market-strategy`

---

## Context

Casaora operates primarily in **Colombia** but is built as a **global platform** with potential expansion to multiple markets. Our target users are:

1. **Colombian homeowners** (70% Spanish-speaking, 30% bilingual/English-speaking expats)
2. **International expats in Colombia** (English speakers)
3. **Colombian cleaning professionals** (primarily Spanish-speaking)
4. **Future international markets** (US, Europe, other Latin American countries)

We needed to decide:
- **Primary language** (English vs Spanish)
- **i18n strategy** (English-first vs Spanish-first)
- **Locale detection** (automatic geolocation-based vs manual selection)
- **Default fallback** (what language when detection fails)

We evaluated three approaches:
1. **English-first with geolocation detection** (English default, Spanish in Spanish-speaking countries)
2. **Spanish-first** (Spanish default, English secondary)
3. **English-only** (no i18n, assume English literacy)

---

## Decision

**We use an English-first internationalization strategy with automatic geolocation-based locale detection.**

Implementation:
- ✅ **Default locale:** English (`en`)
- ✅ **Secondary locale:** Spanish (`es`)
- ✅ **Automatic detection** via geolocation (Vercel edge headers)
- ✅ **Fallback to Accept-Language** headers if geolocation unavailable
- ✅ **Locale-based routing:** `/en/about`, `/es/about`
- ✅ **next-intl** for i18n framework

---

## Consequences

### Positive

#### 1. **Global Platform Positioning**

**English-first signals international reach:**
- **Professional appearance** for global investors and partners
- **Easier international expansion** (most countries have English as secondary language)
- **Technology industry standard** (English is the lingua franca of tech)
- **Developer-friendly** (most documentation and open-source is in English)

**vs. Spanish-first:**
- Spanish-first would position Casaora as "Colombia-only"
- Harder to attract international talent and investment
- Limits expansion opportunities to Spanish-speaking markets only

#### 2. **Intelligent Geolocation-Based Detection**

Our proxy.ts automatically detects user location and serves appropriate language:

```typescript
// proxy.ts
const SPANISH_SPEAKING_COUNTRIES = [
  "CO", // Colombia
  "MX", // Mexico
  "ES", // Spain
  "AR", // Argentina
  "CL", // Chile
  "PE", // Peru
  // ... 15+ more countries
];

function detectLocaleFromHeaders(request: NextRequest): string {
  // 1. Check Vercel geolocation header (most accurate)
  const country = request.headers.get("x-vercel-ip-country");

  if (country && SPANISH_SPEAKING_COUNTRIES.includes(country)) {
    return "es"; // Show Spanish for users in Spanish-speaking countries
  }

  // 2. Fallback to Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse and find first supported locale (es or en)
    const preferredLocale = parseAcceptLanguage(acceptLanguage);
    if (LOCALES.includes(preferredLocale)) {
      return preferredLocale;
    }
  }

  // 3. Default to English (global default)
  return "en";
}
```

**User experience by location:**
- **Colombian user in Bogotá** → Sees Spanish automatically
- **American expat in Medellín** → Sees English (if browser is set to English)
- **Mexican user in Mexico City** → Sees Spanish automatically
- **User in London** → Sees English automatically
- **User in Paris** → Sees English by default (can switch to Spanish if needed)

#### 3. **Best of Both Worlds**

**English-first with geolocation = perfect balance:**
- ✅ **Colombian users see Spanish** (no friction)
- ✅ **International users see English** (professional)
- ✅ **No language selection popup** (automatic detection)
- ✅ **Manual switching available** (if detection is wrong)

**This solves the problems of both extremes:**
- **Spanish-only:** Excludes international users, limits growth
- **English-only:** Alienates Colombian majority

#### 4. **SEO Optimized for Multi-Market**

```typescript
// app/[locale]/page.tsx
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return {
    title: locale === 'es'
      ? 'Encuentra profesionales verificados para tu hogar'
      : 'Find verified professionals for your home',
    description: locale === 'es'
      ? 'Perfiles comprobados, precios transparentes y soporte bilingüe en Colombia.'
      : 'Verified profiles, transparent pricing, and bilingual support in Colombia.',
    alternates: {
      canonical: `https://casaora.co/${locale}`,
      languages: {
        'en': 'https://casaora.co/en', // Primary
        'es': 'https://casaora.co/es', // Secondary
      },
    },
  };
}
```

**SEO benefits:**
- **Google.com (US)** ranks English content higher → English version indexed first
- **Google.co (Colombia)** ranks Spanish content higher → Spanish version shown to Colombians
- **hreflang tags** signal both language versions to search engines
- **Canonical URLs** prevent duplicate content issues

#### 5. **Developer Experience & Open Source Readiness**

**English-first makes development easier:**
- ✅ **Code comments in English** (industry standard)
- ✅ **Documentation in English** (easier for contributors)
- ✅ **Error messages in English** (easier debugging)
- ✅ **Open source compatibility** (if we open-source later)

```typescript
// ✅ What developers expect (English-first)
const t = useTranslations('en'); // Default

// Translation files
// messages/en.json (PRIMARY - written first)
// messages/es.json (SECONDARY - translated from English)
```

#### 6. **Future-Proof for International Expansion**

**Markets we can easily expand to with English-first:**
- 🇺🇸 United States (360M English speakers)
- 🇬🇧 United Kingdom (68M English speakers)
- 🇦🇺 Australia (26M English speakers)
- 🇨🇦 Canada (38M people, English majority)
- 🇮🇳 India (125M English speakers, huge domestic help market)
- 🇵🇭 Philippines (70M English speakers, large cleaning workforce)
- 🇿🇦 South Africa (60M people, English widely spoken)

**Total addressable English-speaking market:** 750M+ people globally

**And we still cover Spanish markets:**
- 🇨🇴 Colombia (51M people)
- 🇲🇽 Mexico (130M people)
- 🇪🇸 Spain (48M people)
- 🇦🇷 Argentina (46M people)
- 🇨🇱 Chile (19M people)

**Total addressable Spanish-speaking market:** 400M+ people

**English-first gives us access to BOTH markets.**

---

### Negative

#### 1. **Perception Risk in Colombian Market**

Some Colombian users may perceive English-first as:
- ❌ "Not for Colombians" (foreign platform)
- ❌ "Only for expats" (excluding locals)
- ❌ "More expensive" (international = premium pricing assumption)

**Mitigation:**
- ✅ **Geolocation auto-switches to Spanish** for Colombian users (they never see English unless they want to)
- ✅ **Marketing emphasizes "hecho en Colombia"** (made in Colombia)
- ✅ **Local payment methods** (PSE, Nequi, Daviplata)
- ✅ **Prices in COP** (Colombian pesos, not USD)
- ✅ **Colombian phone support** (+57 numbers)

**Reality:** Colombian users **won't notice** English-first because they'll automatically see Spanish.

#### 2. **Translation Maintenance Overhead**

Every new feature requires **two translations**:

```json
// messages/en.json (PRIMARY - written first by developers)
{
  "bookings": {
    "title": "My bookings",
    "empty": "You have no active bookings"
  }
}

// messages/es.json (SECONDARY - translated from English)
{
  "bookings": {
    "title": "Mis reservas",
    "empty": "No tienes reservas activas"
  }
}
```

**Mitigation:**
- Use ChatGPT/DeepL for initial EN→ES translations
- Colombian team member reviews translations for cultural accuracy
- Build translation automation into CI/CD pipeline

#### 3. **Spanish Translation Quality Must Be High**

Since Colombian market is critical, Spanish translations **cannot be literal**:

```json
// ❌ BAD: Literal translation
"book_now": "Reservar ahora"  // Correct but formal

// ✅ GOOD: Natural Colombian Spanish
"book_now": "Reservar ya"  // More natural in Colombian context
```

**Mitigation:**
- Native Colombian Spanish speaker reviews all translations
- Use Colombian colloquialisms where appropriate
- A/B test messaging with Colombian users

---

## Alternatives Considered

### 1. Spanish-First (Spanish default, English secondary)

**Why we didn't choose it:**
- ❌ **Limits global expansion** (signals "Colombia-only platform")
- ❌ **Harder to attract international investment** (VCs prefer global platforms)
- ❌ **Developer friction** (most developers prefer English codebases)
- ❌ **Open source challenges** (if we open-source, English is expected)
- ❌ **International hiring harder** (job posts in Spanish limit talent pool)

**When this WOULD make sense:**
- If Casaora was Colombia-only forever
- If target market was 100% Spanish monolingual
- If we had no international expansion plans

### 2. English-Only (no i18n)

**Why we didn't choose it:**
- ❌ **Excludes majority of Colombian professionals** (95% Spanish monolingual)
- ❌ **High bounce rate** (60% of Colombians abandon English-only sites)
- ❌ **Competitive disadvantage** (local competitors offer Spanish)
- ❌ **SEO penalty in Colombia** (Google.co ranks Spanish content higher)
- ❌ **Cultural mismatch** (English-only signals "not for locals")

### 3. Manual Language Selection (no automatic detection)

**Why we didn't choose it:**
- ❌ **Extra friction** (users have to find and click language selector)
- ❌ **Poor mobile UX** (language selector often hidden in mobile menus)
- ❌ **Higher bounce rate** (users leave before finding language option)
- ❌ **Accessibility issues** (non-English speakers can't read "Select Language")

**Geolocation detection is objectively better** - users see the right language immediately.

---

## Technical Implementation

### next-intl Configuration

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));

export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en'; // ← English-first
```

### proxy.ts Locale Detection

```typescript
// proxy.ts
export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Check if user already has locale preference (cookie)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

  // 2. Detect locale from geolocation + Accept-Language
  const detectedLocale = localeCookie || detectLocaleFromHeaders(request);

  // 3. Get locale from pathname (if already localized)
  const locale = getLocaleFromPathname(pathname) || detectedLocale;

  // 4. Set/update locale cookie (1-year expiration)
  if (!localeCookie || localeCookie !== locale) {
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    });
  }

  // 5. Redirect root path to detected locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 6. If path doesn't have locale prefix, add it
  if (!getLocaleFromPathname(pathname) && !isApiOrStatic(pathname)) {
    const localizedPath = `/${locale}${pathname}`;
    const url = new URL(localizedPath, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  return response;
}
```

### Usage in Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

export function BookingCard({ booking }: Props) {
  const t = useTranslations('bookings');

  return (
    <Card>
      <h3>{t('title')}</h3>  {/* "My bookings" (en) or "Mis reservas" (es) */}
      <p>{t('status.confirmed')}</p>
    </Card>
  );
}
```

### Message Files

```json
// messages/en.json (PRIMARY - developers write this first)
{
  "common": {
    "search": "Search professionals",
    "bookNow": "Book now",
    "cancel": "Cancel"
  },
  "bookings": {
    "title": "My bookings",
    "empty": "You have no active bookings",
    "status": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "completed": "Completed"
    }
  }
}

// messages/es.json (SECONDARY - translated from English)
{
  "common": {
    "search": "Buscar profesionales",
    "bookNow": "Reservar ahora",
    "cancel": "Cancelar"
  },
  "bookings": {
    "title": "Mis reservas",
    "empty": "No tienes reservas activas",
    "status": {
      "pending": "Pendiente",
      "confirmed": "Confirmada",
      "completed": "Completada"
    }
  }
}
```

---

## Success Metrics

1. **Market Reach**
   - > 95% Colombian users see Spanish automatically via geolocation
   - > 95% international users see English automatically
   - < 5% incorrect locale detection rate
   - > 90% users stay in detected locale (don't manually switch)

2. **User Experience**
   - < 3% manual language switches (indicates good detection)
   - < 2% bounce rate due to language issues
   - > 90% satisfaction with language experience
   - Zero friction (no language selection popup)

3. **SEO Performance**
   - Top 10 Google.com rankings for English keywords (international market)
   - Top 10 Google.co rankings for Spanish keywords (Colombian market)
   - Proper hreflang implementation (0 errors in Google Search Console)
   - Higher conversion from organic traffic in both languages

4. **Business Metrics**
   - International investor interest (English = global platform signal)
   - Ability to hire international talent (English codebase)
   - Successful expansion to non-Spanish markets
   - Maintained Colombian market share (Spanish UX is seamless)

---

## References

1. **next-intl Documentation**
   https://next-intl.dev/docs/getting-started

2. **Vercel Edge Geolocation**
   https://vercel.com/docs/concepts/edge-network/headers#x-vercel-ip-country

3. **Accept-Language Header Parsing**
   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language

4. **International i18n Best Practices**
   https://www.w3.org/International/questions/qa-i18n

5. **Google hreflang Implementation**
   https://developers.google.com/search/docs/specialty/international/localized-versions

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-06 | 1.0.0 | Initial ADR created | Technical Leadership Team |

---

**Related ADRs:**
- [ADR-001: Why Next.js 16](./adr-001-why-nextjs-16.md)
- [ADR-002: Why proxy.ts Pattern](./adr-002-why-proxy-ts-pattern.md) *(Locale detection happens in proxy.ts)*
