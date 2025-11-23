# Casaora - Architecture Documentation

## Project Structure

```
casaora/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── (auth)/        # Auth routes (login, register)
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── professional/  # Professional dashboard
│   │   │   └── user/          # User dashboard
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global Tailwind styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components (Tailwind)
│   │   ├── sections/          # Page sections
│   │   └── [feature]/         # Feature-specific components
│   ├── lib/                   # Utilities and helpers (see below)
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   ├── actions/               # Server actions
│   └── i18n/                  # Internationalization config
├── public/                    # Static assets
├── supabase/                  # Supabase migrations and functions
│   ├── migrations/           # Database migrations
│   └── functions/            # Edge functions
└── tests/                    # Test files
```

## Library (`src/lib/`) Organization

The `src/lib/` folder follows a **clean, layered architecture** for maintainability and scalability. Each layer has a specific responsibility and import pattern.

### Architecture Layers (Top to Bottom)

```
┌─────────────────────────────────────┐
│     1. Services (Business Logic)    │  ← Orchestrates workflows
├─────────────────────────────────────┤
│     2. Repositories (Data Access)   │  ← Database queries
├─────────────────────────────────────┤
│     3. Integrations (External APIs) │  ← Third-party services
├─────────────────────────────────────┤
│     4. Utils (Pure Functions)       │  ← Helper functions
├─────────────────────────────────────┤
│     5. Shared (Cross-Cutting)       │  ← Auth, config, validation
└─────────────────────────────────────┘
```

---

## 1. Services Layer (`services/`)

**Purpose:** Business logic and workflows. Services orchestrate operations, validate business rules, and coordinate between repositories and integrations.

**Directory Structure:**
```
services/
├── account/          # Account management (data export, settings)
├── admin/            # Admin operations (user management, reviews, queue)
├── analytics/        # Analytics calculations and metrics
├── bookings/         # Booking workflows (creation, cancellation, pricing)
├── feedback/         # Feedback submission and admin handling
├── notifications/    # Notification sending and alerts
├── reviews/          # Review validation and management
├── roadmap/          # Roadmap list and management
├── search/           # Search services (Sanity CMS search)
└── stats/            # Real-time statistics calculations
```

**Import Example:**
```typescript
import { createBooking } from '@/lib/services/bookings/booking-creation-service';
import { validateReview } from '@/lib/services/reviews/review-validation-service';
```

**Naming Convention:** `*-service.ts` (e.g., `booking-creation-service.ts`)

---

## 2. Repositories Layer (`repositories/`)

**Purpose:** Data access layer. Handles all database queries and data fetching. Keeps SQL/database logic separate from business logic.

**Directory Structure:**
```
repositories/
├── professionals/    # Professional data queries
├── bookings/         # Booking data queries
└── users/            # User data queries
```

**Import Example:**
```typescript
import { getProfessionalsByLocation } from '@/lib/repositories/professionals/queries';
```

**Naming Convention:** `queries.ts` or `*-queries.ts`

---

## 3. Integrations Layer (`integrations/`)

**Purpose:** All third-party service integrations. Each service has its own folder with client setup and utilities.

**Directory Structure:**
```
integrations/
├── supabase/         # Database, auth, storage, realtime
├── stripe/           # Payment processing
├── sanity/           # Headless CMS
├── email/            # Email service (Resend)
├── amara/            # AI assistant (Claude)
├── posthog/          # Product analytics and feature flags
└── background-checks/# Background check providers (Checkr, Truora)
```

**Import Example:**
```typescript
import { createServerClient } from '@/lib/integrations/supabase/server-client';
import { stripe } from '@/lib/integrations/stripe/client';
import { sendEmail } from '@/lib/integrations/email/send';
import { trackEvent, bookingTracking } from '@/lib/integrations/posthog';
```

**Naming Convention:** `client.ts` for clients, descriptive names for utilities

---

## 4. Utils Layer (`utils/`)

**Purpose:** Pure utility functions organized by domain. No side effects, easily testable.

**Directory Structure:**
```
utils/
├── admin/            # Admin-specific helpers
├── analytics/        # Analytics transformers
├── bookings/         # Booking field mappers, builders
├── calendar/         # Calendar calculations
├── matching/         # Smart matching algorithms
├── onboarding/       # Onboarding data transformers
├── professionals/    # Professional data mappers
├── roadmap/          # Roadmap field mappers
├── availability.ts   # Availability calculations
├── format.ts         # Formatting utilities
├── sanitize.ts       # HTML/URL sanitization (XSS prevention)
└── core.ts           # Core utilities (cn, etc.)
```

**Import Example:**
```typescript
import { formatCurrency } from '@/lib/utils/format';
import { calculateAvailability } from '@/lib/utils/availability';
```

**Naming Convention:** Descriptive names (`format.ts`, `availability.ts`)

---

## 5. Shared Layer (`shared/`)

**Purpose:** Cross-cutting concerns. Code used across multiple layers - auth, API utilities, configuration, validations.

**Directory Structure:**
```
shared/
├── api/              # API middleware, auth helpers, response utilities
├── auth/             # Authentication routes, session management
├── config/           # App configuration
│   ├── content.ts    # Content configuration
│   ├── design-system.ts  # Design system config
│   ├── design-tokens.ts  # Design tokens
│   ├── feature-flags.ts  # Feature flags
│   └── motion.ts     # Animation config
├── validations/      # Zod schemas for API/form validation
├── error-handler.ts  # Error handling utilities
├── errors.ts         # Error definitions
├── logger.ts         # Logging utilities
├── monitoring.ts     # Application monitoring
└── rate-limit.ts     # Rate limiting
```

**Import Example:**
```typescript
import { withAuth } from '@/lib/shared/api/middleware';
import { AUTH_ROUTES } from '@/lib/shared/auth';
import { bookingSchema } from '@/lib/shared/validations/booking';
```

**Naming Convention:** Descriptive names based on purpose

---

## When to Create New Files

### Create a New Service When:
- You have complex business logic that orchestrates multiple operations
- You need to enforce business rules or workflows
- The operation involves multiple steps or external services

**Example:** `booking-creation-service.ts` orchestrates availability checking, payment processing, notification sending, and database updates.

### Create a New Repository When:
- You need to query a new database table or entity
- You want to centralize data access for a specific domain

**Example:** `professional-queries.ts` centralizes all database queries related to professional profiles.

### Create a New Integration When:
- Adding a new third-party service (payment, email, CMS, etc.)
- Need to wrap an external API with typed interfaces

**Example:** `stripe/client.ts` wraps Stripe SDK with type-safe methods for payment processing.

### Create a New Util When:
- You have a pure function used in multiple places
- The function has no side effects and is easily testable

**Example:** `formatCurrency()` in `format.ts` - pure function with no dependencies.

---

## Key Features Architecture

### Authentication Flow
- Email/password with Supabase Auth
- OAuth providers (Google, Facebook)
- Role-based access control (user, professional, admin)
- Password reset and email verification

**Entry Point:** `src/lib/shared/auth/`

### Booking System
- Service selection and configuration
- Real-time availability checking
- Payment processing with Stripe
- Booking confirmation and notifications

**Entry Point:** `src/lib/services/bookings/`

### Professional Dashboard
- Profile management
- Service listings
- Booking calendar
- Earnings tracking

**Entry Point:** `src/app/[locale]/professional/`

### Admin Dashboard
- User management
- Professional verification
- Booking oversight
- Analytics and reporting

**Entry Point:** `src/app/[locale]/admin/`

### Internationalization
- English and Spanish support
- URL-based locale switching (`/en/*`, `/es/*`)
- Localized content and formatting

**Entry Point:** `src/i18n/`

---

## Multi-Country Architecture

Casaora operates as a **multi-country domestic staffing platform** across Latin America, with unique configurations per market.

### Market Definition

**Market** = Country + City combination
- Example: `CO-bogota`, `PY-asuncion`, `UY-montevideo`, `AR-buenos-aires`
- Each market has its own:
  - Currency (COP, PYG, UYU, ARS)
  - Pricing structure and commission rates
  - Payment processor (Stripe or PayPal)
  - Local regulations and compliance requirements

**Supported Countries:**
- **Colombia (CO)** - 7 cities: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira
- **Paraguay (PY)** - 3 cities: Asunción, Ciudad del Este, Encarnación
- **Uruguay (UY)** - 3 cities: Montevideo, Salto, Paysandú
- **Argentina (AR)** - 4 cities: Buenos Aires, Córdoba, Rosario, Mendoza

**Configuration Files:**
- Markets: [`src/lib/shared/config/territories.ts`](../src/lib/shared/config/territories.ts)
- Pricing: [`src/lib/shared/config/pricing.ts`](../src/lib/shared/config/pricing.ts)

### Marketplace Model

**Marketplace** = Self-service platform connecting households with vetted professionals

Casaora operates as a pure marketplace - customers browse, compare, and book professionals directly with automated workflows.

**Platform Features:**
- **Professional Vetting** - Automated background checks with manual video review
- **Instant Booking** - Real-time availability and direct booking flow
- **Customer Support** - Bilingual support for booking issues and disputes
- **Quality Assurance** - Automated monitoring with escalation paths
- **Market Operations** - Remote ops team for quality control

**Service Level Agreements (SLAs):**
- Video review: 48-72 hours turnaround
- Support tickets: 12-24 hours first response
- Emergency escalations: Same-day handling

**User Flow:**
- Customers browse professionals via search and filters
- Direct booking with real-time availability
- Secure messaging for coordination
- Post-service ratings and reviews

**Admin Tools:**
- Today's bookings by market (dashboard view)
- Pending video reviews queue
- Professional quality scores and flags

### Currency & Payment Processing

**Multi-Currency Support:**
- Customers see prices in **local currency** (COP, PYG, UYU, ARS)
- Professionals receive payouts in **local currency**
- Platform commissions calculated in **local currency**
- Database stores amounts in minor units (cents/centavos)

**Payment Processor Routing:**
- **Stripe** - Colombia (CO) only
  - Supports COP (Colombian Peso)
  - Credit/debit cards, PSE bank transfers
- **PayPal** - Paraguay, Uruguay, Argentina (PY/UY/AR)
  - Supports PYG, UYU, ARS
  - PayPal Checkout, bank transfers, local payment methods

**Commission Structure:**
- **Marketplace Bookings:** 15% commission
- **Direct Hire Placements:** 15% placement fee (one-time)
- Rates configurable per country in [`pricing.ts`](../src/lib/shared/config/pricing.ts)

### Database Schema for Multi-Country

**Country-Aware Tables:**
- `countries` - Master list of supported countries (CO, PY, UY, AR)
- `cities` - All 17 cities across markets with country foreign keys
- `neighborhoods` - City neighborhoods (currently Colombia only)

**Foreign Key Relationships:**
- `profiles.country_code` → `countries.code` (customer location)
- `profiles.city_id` → `cities.id` (customer city)
- `professional_profiles.country_code` → `countries.code` (service area)
- `professional_profiles.city_id` → `cities.id` (service city)
- `bookings.country_code` → `countries.code` (booking location)
- `bookings.city_id` → `cities.id` (booking city)

**Multi-Currency Columns:**
- All currency amounts use `_cents` suffix (e.g., `amount_cents`, `commission_cents`)
- Stored as `bigint` in database (minor units)
- Migration path: Original `_cop` columns for backward compatibility

**Example Query:**
```typescript
// Get all professionals in a specific market
const professionals = await supabase
  .from('professional_profiles')
  .select('*, cities(name, countries(code))')
  .eq('country_code', 'CO')
  .eq('city_id', cityId)
  .eq('is_active', true);
```

### Feature Flags by Market

Use PostHog feature flags to enable/disable features per country:

```typescript
import { isFeatureEnabled } from '@/lib/integrations/posthog';

// Example: Enable intro videos only in Colombia
const showIntroVideo = await isFeatureEnabled('intro-videos', {
  country_code: 'CO',
});
```

**Common Feature Flags:**
- `intro-videos-{country_code}` - Intro video upload feature
- `direct-hire-{country_code}` - Direct hire placement service
- `background-checks-{country_code}` - Background check requirement

---

## Database Schema (Supabase PostgreSQL)

### Core Tables
- `users` - User accounts and profiles
- `professionals` - Professional profiles and services
- `bookings` - Booking records and status
- `reviews` - Customer reviews and ratings
- `payments` - Payment transactions (Stripe integration)
- `notifications` - User notifications and alerts

### Migrations
All database changes are version-controlled in `supabase/migrations/`. Use Drizzle ORM for type-safe queries.

**Create Migration:**
```bash
supabase migration new <descriptive-name>
```

**Apply Migrations:**
```bash
supabase db push
```

---

## API Routes Architecture

### Endpoint Structure
```
src/app/api/
├── auth/              # Authentication endpoints
├── bookings/          # Booking management
├── professionals/     # Professional queries
├── payments/          # Stripe webhooks and processing
├── admin/             # Admin operations
└── webhooks/          # External service webhooks
```

### Route Handler Pattern
```typescript
// src/app/api/example/route.ts
import { withAuth } from '@/lib/shared/api/middleware';
import { exampleSchema } from '@/lib/shared/validations/example';
import { exampleService } from '@/lib/services/example/example-service';

export const POST = withAuth(async (request, context) => {
  // 1. Parse and validate input
  const body = await request.json();
  const validated = exampleSchema.parse(body);

  // 2. Call service layer
  const result = await exampleService(validated);

  // 3. Return response
  return Response.json(result);
});
```

---

## Component Architecture

### UI Components (`src/components/ui/`)
Reusable, atomic components following Lia Design System:
- Built with Radix UI primitives for accessibility
- Styled with Tailwind CSS (NO rounded corners!)
- Documented in Storybook

**Import Example:**
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### Feature Components (`src/components/[feature]/`)
Feature-specific components organized by domain:
- `bookings/` - Booking forms, calendars, confirmations
- `professionals/` - Profile cards, search, filters
- `admin/` - Dashboard tables, charts, moderation tools

---

## State Management

### Server State (Recommended)
- Use React Server Components for data fetching
- Server Actions for mutations
- Supabase Realtime for live updates

### Client State (When Needed)
- React `useState` for local UI state
- React Context for shared client state (avoid overuse)
- PostHog Feature Flags for A/B testing

---

## Type Safety

### TypeScript Configuration
- Strict mode enabled (`strict: true`)
- Path aliases configured (`@/*` → `src/*`)
- Type-safe database queries with Drizzle ORM

### Shared Types (`src/types/`)
```
types/
├── booking.ts        # Booking-related types
├── professional.ts   # Professional profile types
├── user.ts           # User account types
└── database.ts       # Database schema types (auto-generated)
```

---

## Performance Optimization

### Code Splitting
- Automatic route-based splitting via Next.js App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Caching Strategy
- Static generation for marketing pages
- Incremental Static Regeneration (ISR) for dynamic content
- Server-side caching with Supabase Edge Functions

### Image Optimization
- Next.js Image component for automatic optimization
- WebP format with fallbacks
- Lazy loading below the fold

---

## Security Architecture

### Input Sanitization
**ALWAYS sanitize user input** before rendering to prevent XSS attacks:

```typescript
import { sanitizeHTML, sanitizeRichContent, sanitizeURL } from '@/lib/utils/sanitize';

// For user-generated content (reviews, comments)
const safeContent = sanitizeHTML(userInput);

// For admin-created rich content (articles, changelog)
const safeRichContent = sanitizeRichContent(adminContent);

// For URLs from external sources
const safeUrl = sanitizeURL(externalUrl);
```

### Authentication & Authorization
- Supabase Auth for session management
- Row-Level Security (RLS) policies in PostgreSQL
- Role-based access control (RBAC) via JWT claims

### CSRF Protection
- Enabled by default via Next.js middleware
- CSRF tokens for sensitive mutations

### Rate Limiting
- API endpoints rate-limited via `@/lib/shared/rate-limit.ts`
- Progressive backoff for repeated failures

---

## Monitoring & Observability

### Application Logging
- Better Stack (Logtail) for structured logging
- Log levels: `debug`, `info`, `warn`, `error`
- Automatic error tracking

### Analytics
- PostHog for product analytics and feature flags
- Custom event tracking for user flows
- Session recording for debugging

### Performance Monitoring
- Vercel Analytics for Core Web Vitals
- Real User Monitoring (RUM) data
- Error rate and latency tracking

---

## Deployment Architecture

### Vercel Platform
- Automatic deployments from `main` branch
- Preview deployments for pull requests
- Edge Functions for serverless compute

### Environment Variables
Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `DATABASE_URL`

### Branch Strategy
- `main` - Production branch (protected, auto-deploys)
- `develop` - Integration branch (preview deployments)
- `feature/*` - Feature branches (merge to develop)
- `hotfix/*` - Emergency fixes (merge to main + develop)

---

**Last Updated:** 2025-01-17
**Version:** 1.3.0
