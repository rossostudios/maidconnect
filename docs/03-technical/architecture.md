# System Architecture

Comprehensive architecture documentation for MaidConnect, covering system design, components, data flow, and integrations.

## Table of Contents

- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Third-Party Integrations](#third-party-integrations)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## Overview

MaidConnect is a two-sided marketplace platform connecting customers with cleaning professionals in Colombia. The platform is built as a modern web application using Next.js 16 with React 19, deployed on Vercel Edge Network for global performance.

### Key Characteristics

- **Architecture Pattern**: Serverless, Edge-first
- **Rendering Strategy**: Hybrid (SSR, SSG, ISR, CSR)
- **Database**: PostgreSQL (Supabase)
- **API Style**: RESTful (Edge Functions)
- **Authentication**: Supabase Auth (JWT-based)
- **Payments**: Stripe (Connect for payouts)
- **Hosting**: Vercel (Edge Network)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │   Mobile   │  │  Desktop   │  │    PWA     │                │
│  │  Browser   │  │  Browser   │  │ (Service   │                │
│  │            │  │            │  │  Worker)   │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
└────────┼───────────────┼───────────────┼────────────────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    HTTPS/TLS
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                 VERCEL EDGE NETWORK                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Next.js 16 Application (Edge Runtime)           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │  │
│  │  │   Pages    │  │ API Routes │  │  Middleware     │   │  │
│  │  │ (App Dir)  │  │ (42 total) │  │  (Auth, RBAC)   │   │  │
│  │  └─────┬──────┘  └─────┬──────┘  └────────┬────────┘   │  │
│  └────────┼───────────────┼──────────────────┼────────────┘  │
│           │               │                  │                │
│  ┌────────┼───────────────┼──────────────────┼────────────┐  │
│  │        │               │                  │            │  │
│  │   ┌────▼────┐    ┌─────▼─────┐     ┌─────▼──────┐    │  │
│  │   │  React  │    │  Server   │     │   Server   │    │  │
│  │   │Components│   │  Actions  │     │ Components │    │  │
│  │   │ (RSC)   │    │  (Forms)  │     │   (SSR)    │    │  │
│  │   └─────────┘    └───────────┘     └────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────┬────────────────┬────────────────┬─────────────────────┘
          │                │                │
     ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
     │Supabase │      │ Stripe  │     │ Better  │
     │(Postgres│      │ (Payments│    │  Stack  │
     │ + Auth) │      │ +Connect)│    │ (Logs)  │
     └─────────┘      └─────────┘     └─────────┘
```

---

## Technology Stack

### Frontend

**Framework**: Next.js 16.0.1
- App Router (React Server Components)
- Turbopack for development
- React 19 (useOptimistic, useActionState)

**UI Library**: React 19
- Server Components (RSC)
- Client Components
- Streaming SSR

**Styling**: Tailwind CSS 3
- Custom design system
- Mobile-first responsive design
- Dark mode support

**State Management**:
- React Context API
- useOptimistic for instant UI updates
- Server Actions for mutations

**Icons**: Lucide React

**Forms**:
- React Hook Form
- Zod validation
- useActionState for server-side validation

### Backend

**Runtime**: Vercel Edge Runtime (V8 isolates)
- ~41 endpoints on Edge
- ~1 endpoint on Node.js (web-push)

**API Pattern**: RESTful
- 42 total endpoints
- Edge Functions for low latency
- Rate limiting (Upstash Redis)

**Database**: PostgreSQL (Supabase)
- 21 tables
- Row Level Security (RLS)
- Real-time subscriptions
- pg_cron for scheduled jobs

**Authentication**: Supabase Auth
- JWT-based
- Email/password
- Social providers (Google, Facebook - future)
- MFA support (future)

### Infrastructure

**Hosting**: Vercel
- Edge Network (global CDN)
- Automatic deployments (Git-based)
- Preview environments
- Serverless Functions

**Database**: Supabase
- Managed PostgreSQL
- Real-time subscriptions
- Storage (S3-compatible)
- Edge Functions

**Payments**: Stripe
- Payment Intents API
- Stripe Connect (payouts)
- Webhook processing

**Monitoring**: Better Stack (Logtail)
- Error tracking
- Log aggregation
- Performance monitoring
- Alerting

**Rate Limiting**: Upstash Redis
- Distributed rate limiting
- Edge-compatible
- 10,000 commands/day free tier

---

## Component Architecture

### Application Layers

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Pages     │  │  Layouts    │  │   UI Components      │ │
│  │  (Routes)   │  │ (Shared)    │  │  (Buttons, Cards,    │ │
│  │             │  │             │  │   Forms, Modals)     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘ │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
┌─────────┼────────────────┼────────────────────┼──────────────┐
│         │      BUSINESS LOGIC LAYER           │              │
├─────────┼────────────────┼────────────────────┼──────────────┤
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────────▼──────────┐  │
│  │   Server    │  │  API Routes │  │   Custom Hooks      │  │
│  │  Components │  │  (Backend)  │  │  (Client Logic)     │  │
│  │   (RSC)     │  │             │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼──────────────┘
          │                │                    │
┌─────────┼────────────────┼────────────────────┼──────────────┐
│         │         DATA ACCESS LAYER           │              │
├─────────┼────────────────┼────────────────────┼──────────────┤
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────────▼──────────┐  │
│  │  Supabase   │  │   Stripe    │  │  External APIs      │  │
│  │   Client    │  │    SDK      │  │  (Better Stack,     │  │
│  │             │  │             │  │   Upstash, etc.)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Component Organization

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── (auth)/              # Auth routes (login, signup)
│   │   ├── (marketing)/         # Public marketing pages
│   │   ├── dashboard/           # Authenticated dashboards
│   │   │   ├── customer/        # Customer dashboard
│   │   │   ├── pro/             # Professional dashboard
│   │   │   └── admin/           # Admin dashboard
│   │   └── layout.tsx           # Root layout
│   │
│   ├── api/                     # API Routes (42 endpoints)
│   │   ├── account/             # Account management
│   │   ├── admin/               # Admin operations
│   │   ├── bookings/            # Booking CRUD & lifecycle
│   │   ├── customer/            # Customer-specific
│   │   ├── messages/            # Messaging system
│   │   ├── notifications/       # Push notifications
│   │   ├── payments/            # Payment processing
│   │   ├── professional/        # Professional-specific
│   │   ├── professionals/       # Public professional data
│   │   ├── pro/                 # Professional dashboard APIs
│   │   ├── cron/                # Scheduled jobs
│   │   └── webhooks/            # Webhook handlers
│   │
│   └── middleware.ts            # Edge middleware (auth, i18n)
│
├── components/                  # React components
│   ├── ui/                      # Base UI components
│   ├── navigation/              # Navigation components
│   ├── bookings/                # Booking-related
│   ├── professionals/           # Professional-related
│   ├── forms/                   # Form components
│   └── providers/               # Context providers
│
├── lib/                         # Shared utilities
│   ├── supabase/                # Supabase clients
│   ├── stripe/                  # Stripe utilities
│   ├── logger.ts                # Better Stack logger
│   ├── rate-limit.ts            # Rate limiting
│   └── utils.ts                 # Helpers
│
└── hooks/                       # Custom React hooks
    ├── use-auth.ts              # Authentication
    ├── use-bookings.ts          # Booking management
    └── use-optimistic.ts        # Optimistic updates
```

---

## Data Flow

### Booking Creation Flow

```
┌─────────┐
│ Customer│
│ (Client)│
└────┬────┘
     │ 1. Fill booking form
     ▼
┌─────────────────┐
│  Booking Form   │
│  Component      │
└────┬────────────┘
     │ 2. Submit via Server Action
     ▼
┌──────────────────────┐
│ POST /api/bookings   │ ◄── Edge Function
└────┬─────────────────┘
     │ 3. Validate input
     ▼
┌──────────────────────┐
│  Create booking      │
│  (status:            │
│   pending_payment)   │
└────┬─────────────────┘
     │ 4. Initialize Stripe PaymentIntent
     ▼
┌──────────────────────┐
│  Stripe API          │
│  (Create PI)         │
└────┬─────────────────┘
     │ 5. Return clientSecret
     ▼
┌──────────────────────┐
│  Return to client:   │
│  {bookingId,         │
│   clientSecret}      │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│  Customer completes  │
│  payment (Stripe.js) │
└────┬─────────────────┘
     │ 6. Payment successful
     ▼
┌──────────────────────┐
│ POST                 │
│ /api/bookings/       │
│ authorize            │
└────┬─────────────────┘
     │ 7. Update booking status
     │    (status: authorized)
     ▼
┌──────────────────────┐
│  Send notification   │
│  to professional     │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│  Professional        │
│  receives booking    │
│  request             │
└──────────────────────┘
```

### Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Login request
     ▼
┌─────────────────┐
│ POST /auth/login│
│ (Supabase Auth) │
└────┬────────────┘
     │ 2. Validate credentials
     ▼
┌─────────────────┐
│  Supabase Auth  │
│  verifies       │
└────┬────────────┘
     │ 3. Returns JWT token + refresh token
     ▼
┌─────────────────┐
│  Set cookies:   │
│  - access_token │
│  - refresh_token│
└────┬────────────┘
     │ 4. Store in httpOnly cookies
     ▼
┌─────────────────┐
│  Redirect to    │
│  dashboard      │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  All subsequent │
│  API requests   │
│  include JWT    │
│  via cookies    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Middleware     │
│  validates JWT  │
│  on each request│
└────┬────────────┘
     │ Valid: Continue
     │ Invalid: Redirect to login
     ▼
┌─────────────────┐
│  API Route      │
│  executes with  │
│  user context   │
└─────────────────┘
```

### Real-Time Messaging Flow

```
┌─────────────┐                    ┌──────────────┐
│  Customer   │                    │ Professional │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. Send message                 │
       │                                  │
       ▼                                  │
┌──────────────────────┐                 │
│ POST /api/messages/  │                 │
│ conversations/[id]   │                 │
└──────┬───────────────┘                 │
       │ 2. Insert message               │
       │    into database                │
       ▼                                  │
┌──────────────────────┐                 │
│  Supabase inserts    │                 │
│  message             │                 │
└──────┬───────────────┘                 │
       │ 3. Trigger fires:               │
       │    - Update last_message_at     │
       │    - Increment unread_count     │
       ▼                                  │
┌──────────────────────┐                 │
│  Real-time           │                 │
│  subscription        │                 │
│  broadcasts change   │────────────────►│
└──────────────────────┘                 │
                                          │ 4. UI updates
                                          │    instantly
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ New message  │
                                   │ appears +    │
                                   │ unread badge │
                                   └──────────────┘
```

### Payout Processing Flow

```
┌──────────────┐
│ Cron Job     │
│ (Tue/Fri)    │
└──────┬───────┘
       │ 1. Trigger payout processing
       ▼
┌──────────────────────┐
│ POST /api/admin/     │
│ payouts/process      │
└──────┬───────────────┘
       │ 2. Fetch professionals with
       │    complete Stripe Connect
       ▼
┌──────────────────────┐
│  Query bookings:     │
│  - status: completed │
│  - amount_captured   │
│  - NOT included in   │
│    previous payout   │
└──────┬───────────────┘
       │ 3. Calculate for each professional
       ▼
┌──────────────────────┐
│  Calculate:          │
│  - Gross amount      │
│  - Commission (18%)  │
│  - Net amount        │
└──────┬───────────────┘
       │ 4. Create payout record
       ▼
┌──────────────────────┐
│  INSERT INTO payouts │
│  (status: pending)   │
└──────┬───────────────┘
       │ 5. Create Stripe transfer
       ▼
┌──────────────────────┐
│  Stripe Connect API  │
│  (Create Transfer)   │
└──────┬───────────────┘
       │ 6. Transfer successful
       ▼
┌──────────────────────┐
│  Update payout:      │
│  - status: paid      │
│  - stripe_payout_id  │
└──────┬───────────────┘
       │ 7. Mark bookings as
       │    included_in_payout_id
       ▼
┌──────────────────────┐
│  Send notification   │
│  to professional     │
└──────────────────────┘
```

---

## Third-Party Integrations

### Supabase (Database & Auth)

**Purpose**: Database, authentication, real-time subscriptions, storage

**Features Used**:
- PostgreSQL database (21 tables)
- Row Level Security (RLS)
- Authentication (JWT-based)
- Real-time subscriptions (messaging)
- Storage (portfolio images, documents)
- Edge Functions (future)

**Integration Points**:
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server-client.ts` - Server-side Supabase client
- Middleware for auth validation

**Connection**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

---

### Stripe (Payments & Payouts)

**Purpose**: Payment processing and professional payouts

**Features Used**:
- Payment Intents API (authorize + capture)
- Stripe Connect (professional payouts)
- Webhooks (payment status updates)
- Refunds API

**Integration Points**:
- `lib/stripe/client.ts` - Stripe client utilities
- `app/api/payments/*` - Payment API routes
- `app/api/webhooks/stripe/route.ts` - Webhook handler
- `app/api/pro/stripe/*` - Stripe Connect onboarding

**Workflow**:
1. Customer books service → Create PaymentIntent
2. Customer completes payment → Authorize payment (manual capture)
3. Professional completes service → Capture payment
4. Bi-weekly payout → Transfer to professional via Stripe Connect

**Connection**:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

---

### Better Stack (Logtail) - Monitoring

**Purpose**: Error tracking, log aggregation, performance monitoring

**Features Used**:
- Real-time log streaming
- Error alerting
- Custom log levels
- Structured logging

**Integration Points**:
- `lib/logger.ts` - Winston logger with Better Stack transport
- `withLogging()` wrapper for API routes
- Global error boundary (React)

**Connection**:
```typescript
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
```

---

### Upstash Redis (Rate Limiting)

**Purpose**: Distributed rate limiting for API endpoints

**Features Used**:
- Sliding window rate limiting
- Edge-compatible
- Low latency

**Integration Points**:
- `lib/rate-limit.ts` - Rate limiting utilities
- `withRateLimit()` wrapper for sensitive endpoints

**Connection**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

---

## Security Architecture

### Authentication & Authorization

```
┌────────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                          │
├────────────────────────────────────────────────────────────┤
│  Layer 1: Transport Security                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ HTTPS/TLS 1.3                                     │ │
│  │  ✓ Strict-Transport-Security header                  │ │
│  │  ✓ Secure cookies (httpOnly, sameSite: lax)          │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ JWT-based (Supabase Auth)                         │ │
│  │  ✓ Middleware validates on every request             │ │
│  │  ✓ Refresh token rotation                            │ │
│  │  ✓ Email verification required                       │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Layer 3: Authorization (RBAC)                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ Role-based (customer, professional, admin)        │ │
│  │  ✓ Resource-based (user owns resource)               │ │
│  │  ✓ Row Level Security (RLS) in database              │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Layer 4: Input Validation                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ Zod schema validation                              │ │
│  │  ✓ SQL injection prevention (parameterized queries)  │ │
│  │  ✓ XSS prevention (sanitized output)                 │ │
│  │  ✓ CSRF protection (tokens, sameSite cookies)        │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Layer 5: Rate Limiting                                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ IP-based rate limits                              │ │
│  │  ✓ Endpoint-specific limits                          │ │
│  │  ✓ Distributed (Upstash Redis)                       │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Layer 6: Content Security Policy (CSP)                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ✓ Strict CSP headers                                │ │
│  │  ✓ No unsafe-eval in production                      │ │
│  │  ✓ Whitelisted domains only                          │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

All database tables have RLS enabled:

**profiles**: Users can only view/edit their own profile
**bookings**: Users can only access bookings they're involved in
**messages**: Users can only access conversations they're part of
**payouts**: Professionals can only view their own payouts
**documents**: Professionals can only view their own documents

### Secrets Management

- Environment variables stored in Vercel
- `.env` files never committed to Git
- Separate keys for dev/staging/production
- Secrets rotated every 90 days (API keys) or 180 days (DB passwords)

---

## Deployment Architecture

### Vercel Edge Network

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBAL EDGE NETWORK                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │  US-East  │  │  EU-West  │  │ APAC-SG   │  ... (50+)   │
│  │  (Edge)   │  │  (Edge)   │  │  (Edge)   │              │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘              │
└────────┼──────────────┼──────────────┼──────────────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
                   Geo-routing
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼────┐                  ┌─────▼─────┐
    │  Edge   │                  │   Node.js │
    │Function │                  │  Function │
    │ (RSC)   │                  │ (web-push)│
    └────┬────┘                  └───────────┘
         │
         │ Database queries
         ▼
┌─────────────────────────────────────────┐
│          Supabase (US-East-1)           │
│  ┌─────────────┐    ┌─────────────┐    │
│  │  PostgreSQL │    │   Storage   │    │
│  │  (Primary)  │    │ (Portfolio) │    │
│  └─────────────┘    └─────────────┘    │
└─────────────────────────────────────────┘
```

### Deployment Flow

```
┌─────────────┐
│ Git Push to │
│   GitHub    │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Vercel detects│
│   new commit │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Build Process   │
│  1. Install deps │
│  2. Type check   │
│  3. Build app    │
│  4. Run tests    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Deploy to Edge  │
│  Network         │
│  (~50 regions)   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Update DNS &    │
│  SSL certs       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Deployment      │
│  Complete        │
│  (2-3 minutes)   │
└──────────────────┘
```

### Environment Strategy

**Development** (`dev` branch):
- Local dev server (`npm run dev`)
- `.env.local` for secrets
- Test Stripe keys
- Sandbox Supabase project

**Staging** (`staging` branch):
- Vercel preview deployment
- Staging environment variables
- Test Stripe keys
- Staging Supabase project

**Production** (`main` branch):
- Vercel production deployment
- Production environment variables
- Live Stripe keys
- Production Supabase project

---

## Scalability Considerations

### Current Architecture Strengths

1. **Serverless/Edge-first**: No servers to manage, auto-scales
2. **Global CDN**: Low latency worldwide via Vercel Edge Network
3. **Database Connection Pooling**: Supabase handles connection pooling
4. **Stateless API**: No session state on servers, scales horizontally

### Scaling Strategies

#### Database Scaling

**Current**: Single PostgreSQL instance (Supabase)

**Scaling Options**:
1. **Vertical scaling**: Upgrade Supabase plan (up to 16GB RAM, 8 cores)
2. **Read replicas**: Add read replicas for query-heavy operations
3. **Connection pooling**: Pgbouncer (already included in Supabase)
4. **Caching**: Add Redis cache for hot data (professional profiles, reviews)

#### API Scaling

**Current**: Serverless Edge Functions (auto-scaling)

**Optimization**:
- Edge Functions already scale automatically
- Rate limiting prevents abuse
- Upstash Redis distributes rate limit state

#### Storage Scaling

**Current**: Supabase Storage (S3-compatible)

**Scaling**:
- Supabase Storage scales automatically
- Consider CDN for portfolio images (Cloudflare R2, ImageKit.io)

### Performance Targets

- **Time to First Byte (TTFB)**: < 200ms (Edge Network)
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **API Response Time**: < 500ms (p95)
- **Database Query Time**: < 100ms (p95)

### Monitoring & Alerting

**Metrics Tracked**:
- API error rates (5xx responses)
- API latency (p50, p95, p99)
- Database query performance
- Stripe webhook failures
- User sign-up conversion rates

**Alerts**:
- Error rate > 1% (15-minute window)
- API latency p95 > 1s
- Payment failures > 5% of attempts
- Database connection errors

---

## Disaster Recovery

### Backup Strategy

**Database**:
- Daily automated backups (Supabase)
- 7-day retention (Pro plan)
- Point-in-time recovery available

**Storage**:
- S3-compatible storage (Supabase)
- Versioning enabled
- Cross-region replication (future)

**Code**:
- Git version control (GitHub)
- Automated deployments
- Rollback capability via Vercel

### Recovery Time Objective (RTO)

- **Database failure**: < 1 hour (restore from backup)
- **Application failure**: < 5 minutes (rollback deployment)
- **Third-party service failure**: Graceful degradation (cached data)

### Recovery Point Objective (RPO)

- **Database**: < 24 hours (daily backups)
- **Application**: 0 hours (Git version control)
- **Uploads**: < 1 hour (S3-compatible storage)

---

## Shared Component Patterns

### Overview

The codebase uses standardized patterns for common UI and API concerns, reducing code duplication by 30-80% across different areas.

### Modal System

**Components**: `/src/components/shared/`
- `BaseModal` - Foundation with accessibility, keyboard nav, focus management
- `FormModal` - Form-specific wrapper with submit handling
- `ConfirmationModal` - Simple yes/no dialogs

**Hooks**: `/src/hooks/`
- `useModalForm` - Form state with auto-reset, loading/error states
- `useApiMutation` - API calls with automatic state management

**Benefits**:
- 84% fewer hooks (45 → 7 across 9 modals)
- 100% elimination of duplicate loading/error states
- Consistent accessibility (ARIA, keyboard nav, focus management)
- 9.6% code reduction

**Example**:
```typescript
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";
import { useApiMutation } from "@/hooks/use-api-mutation";

const form = useModalForm({ initialData, resetOnClose: true });
const mutation = useApiMutation({ url: "/api/endpoint", method: "POST" });

<FormModal
  isOpen={isOpen}
  onClose={onClose}
  title="My Form"
  onSubmit={() => mutation.mutate(form.formData)}
  isSubmitting={mutation.isLoading}
>
  {/* Form inputs */}
</FormModal>
```

### Calendar System

**Components**: `/src/components/shared/`
- `AvailabilityCalendar` - Unified, highly configurable calendar

**Hooks**: `/src/hooks/`
- `useCalendarMonth` - Month navigation state
- `useAvailabilityData` - API data fetching
- `useCalendarGrid` - Calendar grid generation

**Configuration**:
- **Size variants**: `compact`, `medium`, `large`
- **Theme variants**: `default`, `professional`, `customer`
- **Data sources**: API-based or props-based
- **Feature toggles**: Time slots, legend, today button

**Benefits**:
- 6 duplicate calendars → 1 unified component
- 33% code reduction (1,469 → 981 lines long-term)
- Single source of truth for calendar logic
- Consistent behavior across all calendars

**Example**:
```typescript
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";

<AvailabilityCalendar
  dataSource={{ type: "api", professionalId }}
  size="large"
  theme="professional"
  showTimeSlots={false}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
/>
```

### API Middleware System

**Library**: `/src/lib/api/`
- `auth.ts` - Authentication and authorization helpers
- `response.ts` - Consistent response formatting
- `middleware.ts` - Higher-order functions for route handlers
- `index.ts` - Unified exports

**Middleware Functions**:
- `withAuth` - Require any authenticated user
- `withProfessional` / `withCustomer` / `withAdmin` - Role-based
- `withValidation` - Zod schema validation

**Auth Helpers**:
- `requireProfessionalOwnership` - Verify booking ownership
- `requireCustomerOwnership` - Verify booking ownership
- `requireProfessionalProfile` - Verify profile exists

**Response Helpers**:
- `ok(data)` - 200 OK
- `created(data)` - 201 Created
- `noContent()` - 204 No Content
- `paginated(options)` - Paginated response

**Benefits**:
- 48% average code reduction per route
- ~3,500 lines of duplicated code eliminated
- Consistent error handling and logging
- Type-safe with Zod validation

**Example**:
```typescript
import { withProfessional, ok, requireProfessionalOwnership } from "@/lib/api";
import { z } from "zod";

const schema = z.object({
  bookingId: z.string().uuid()
});

export const POST = withProfessional(async ({ user, supabase }, request) => {
  const body = await request.json();
  const { bookingId } = schema.parse(body);

  const booking = await requireProfessionalOwnership(
    supabase,
    user.id,
    bookingId
  );

  // Business logic...

  return ok({ data: result });
});
```

### Formatting Utilities

**Library**: `/src/lib/utils/formatting.ts`

**Functions**:
- `formatCurrency(amount, currency)` - Locale-aware currency formatting
- `formatDate(date, options)` - Date formatting with i18n
- `formatDateTime(date)` - Date + time formatting
- `formatRelativeTime(date)` - "2 hours ago" style
- `formatPhoneNumber(number, country)` - International phone formatting
- `truncate(text, length)` - Smart text truncation
- `capitalize(text)` - First letter capitalization
- `pluralize(count, word)` - Smart pluralization

**Benefits**:
- Consistent formatting across entire app
- i18n-ready (Spanish/English support)
- Type-safe with TypeScript

**Example**:
```typescript
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

formatCurrency(50000, "COP")    // "$50.000"
formatDate(date, { locale: "es-CO" })  // "3 nov 2025"
```

### Custom Hooks Strategy

**Purpose**: Extract reusable logic from components

**Common Hooks**:
- `useModalForm` - Modal form state management
- `useApiMutation` - API call wrapper with states
- `useCalendarMonth` - Month navigation
- `useAvailabilityData` - Calendar data fetching
- `useAuth` - Authentication state
- `useBookings` - Booking management

**Benefits**:
- Reusable business logic
- Easier testing
- Cleaner components
- Type-safe

### Standards & Best Practices

1. **Prefer Server Components**
   - Default to RSC (React Server Components)
   - Only use Client Components when needed (interactivity, hooks)

2. **Shared Components Over Duplication**
   - Check `/src/components/shared/` before creating new components
   - Use props for configuration, not new components

3. **Use Middleware for API Routes**
   - Never manually check auth - use middleware
   - Throw typed errors - middleware handles formatting

4. **Validate All Inputs**
   - Use Zod schemas for validation
   - Validate on both client and server

5. **Type Safety**
   - TypeScript strict mode enabled
   - No `any` types
   - Zod for runtime validation

---

## Future Architecture Enhancements

### Short-term (3-6 months)

1. **Redis Caching**: Add caching layer for hot data
2. **Image CDN**: Optimize portfolio image delivery
3. **Background Jobs**: Add job queue (BullMQ + Redis)
4. **Real-time Chat**: Upgrade to Supabase Realtime (WebSockets)

### Medium-term (6-12 months)

1. **Mobile Apps**: React Native apps (iOS/Android)
2. **GraphQL API**: Add GraphQL layer for complex queries
3. **Elasticsearch**: Add search engine for professionals
4. **Analytics Pipeline**: Add data warehouse (BigQuery, Snowflake)

### Long-term (12+ months)

1. **Microservices**: Extract high-traffic services (payments, notifications)
2. **Multi-region Database**: Add regional replicas for low latency
3. **Machine Learning**: Recommendation engine for professional matching
4. **Event Sourcing**: Add event store for audit trail and analytics

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
- [Deployment Guide](../05-deployment/deployment-guide.md)

---

**Last Updated**: January 2025
**Version**: 1.0.0
