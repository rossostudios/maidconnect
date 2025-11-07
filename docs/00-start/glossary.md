# Glossary

**Comprehensive definitions of technical terms, acronyms, and project-specific concepts used throughout Casaora documentation and codebase.**

---

## A

**ADR (Architecture Decision Record)**
Document that captures an important architectural decision along with its context and consequences. See [ADR Template](./adr-template.md).

**Amara**
AI booking assistant powered by Anthropic's Claude Haiku 4.5, used for guided onboarding and chat support.

**ANON Key (Supabase)**
Publicly-safe Supabase API key that respects RLS policies. Safe to expose in client-side code.

**API Route**
Next.js server-side endpoint in `src/app/api/`. Currently 42 total endpoints handling bookings, payments, messaging, etc.

**App Router**
Next.js 16 routing system based on file-system conventions in `src/app/` directory. Replaces Pages Router.

---

## B

**Better Stack (Logtail)**
Cloud logging and monitoring service used for error tracking, log aggregation, and performance monitoring.

**Biome**
Fast linting and formatting tool replacing ESLint/Prettier. Configuration in `biome.json`.

**Booking**
Core entity representing a service reservation. States: `pending_payment` → `authorized` → `in_progress` → `completed` | `cancelled`.

**Bun**
Fast JavaScript runtime and package manager. Used instead of npm/yarn/pnpm. Commands: `bun install`, `bun run dev`.

**Bundle**
Package of multiple services offered at discounted rate by professionals (e.g., "Weekly Cleaning Package").

---

## C

**Cache Components**
Next.js 16 feature using `"use cache"` directive for explicit component/page caching. See [Next.js 16 Features](../03-technical/nextjs-16-features.md).

**CSRF (Cross-Site Request Forgery)**
Security attack prevented by validating request origin in `proxy.ts`. See [Security Architecture](../03-technical/architecture.md#security-architecture).

**CSP (Content Security Policy)**
HTTP header that prevents XSS attacks by whitelisting content sources.

**Client Component**
React component marked with `"use client"` directive that runs in browser. Used for interactivity, hooks, event handlers.

**Colombian Peso (COP)**
Official currency of Colombia. All prices stored in cents (e.g., 50000 = $50.000 COP).

---

## D

**Database Migration**
SQL file in `supabase/migrations/` that modifies database schema. Named `YYYYMMDDHHMMSS_description.sql`.

**Deno**
JavaScript/TypeScript runtime used by Supabase Edge Functions (if used in future).

**Dynamic Route**
Next.js route using brackets like `[id]`, `[...slug]`, `[[...slug]]` for parameterized URLs.

---

## E

**Edge Function**
Serverless function running on Vercel Edge Network (V8 isolates) for low latency. ~41 of 42 API routes run on Edge.

**Edge Runtime**
Lightweight JavaScript runtime used by Vercel Edge Functions. Faster cold starts than Node.js but limited APIs.

**Environment Variable**
Configuration value stored in `.env.local` (dev) or Vercel dashboard (production). Prefixed with `NEXT_PUBLIC_` if exposed to client.

---

## F

**Feature Flag**
Runtime toggle controlling UI/feature rollout. Prefixed `NEXT_PUBLIC_FEATURE_*` (e.g., `NEXT_PUBLIC_FEATURE_AMARA_ENABLED=true`).

**Motion One**
Lightweight animation library (5KB) built on Web Animations API. Used for all UI animations. See [Motion Guidelines](../02-design/motion-guidelines.md).

---

## G

**GDPR (General Data Protection Regulation)**
European privacy regulation. Applies to any Colombian users with European citizenship/residence.

**Geolocation**
IP-based location detection using Vercel headers (`x-vercel-ip-country`) to detect Spanish-speaking countries for locale selection.

---

## H

**Help Center**
Bilingual knowledge base with search and feedback at `src/app/[locale]/help/*`. Features i18n, full-text search, and analytics.

**Hugeicons**
Icon library used throughout the UI. Import: `import { Icon } from "hugeicons-react"`.

---

## I

**i18n (Internationalization)**
Multi-language support using `next-intl`. Primary: English (en), Secondary: Spanish (es). Geolocation auto-detects locale. Messages in `messages/`.

**ISR (Incremental Static Regeneration)**
Next.js feature that updates static pages in background. Used with `revalidate` option.

---

## J

**JWT (JSON Web Token)**
Token-based authentication format used by Supabase Auth. Stored in httpOnly cookies for security.

---

## K

**Kebab-case**
File naming convention using hyphens: `booking-card.tsx`, `use-bookings.ts`. Required by project style guide.

---

## L

**Law 1581**
Colombian data protection law (Habeas Data). Requires explicit consent for personal data processing.

**Locale**
Language/region code (e.g., `en`, `es`, `es-CO`). Determines UI language and date/number formatting.

**Logtail**
See **Better Stack**.

---

## M

**Middleware (API Route)**
Higher-order functions in `/src/lib/api/middleware.ts` for wrapping API routes with auth, validation, logging. Different from `proxy.ts`.

**Migration**
See **Database Migration**.

**Modal**
Overlay UI component (dialog, popup). See `src/components/shared/base-modal.tsx` for standardized pattern.

**Reduced Motion**
Accessibility preference (`prefers-reduced-motion`) to disable animations. Motion One automatically respects this setting. See [Motion Guidelines](../02-design/motion-guidelines.md).

---

## N

**Next.js 16**
React framework version used by Casaora. Key features: App Router, Turbopack, `proxy.ts`, Cache Components.

**Node.js Runtime**
JavaScript runtime for server-side code. Used for 1 API endpoint (`/api/notifications/register` with web-push).

---

## O

**Onboarding**
Multi-step process for professionals to complete profile, upload documents, and connect Stripe for payouts.

---

## P

**PCI DSS (Payment Card Industry Data Security Standard)**
Security standard for handling card payments. Casaora is PCI compliant by using Stripe (Level 1 certified).

**Payout**
Transfer of money from platform to professional via Stripe Connect. Processed bi-weekly (Tuesdays/Fridays).

**pg_cron**
PostgreSQL extension for scheduled tasks. Used for payout processing, notification cleanup, etc.

**Playwright**
End-to-end testing framework. Config in `playwright.config.ts`, tests in `tests/`.

**PostgREST**
REST API automatically generated from PostgreSQL schema. Powers Supabase API.

**PPR (Partial Pre-Rendering)**
Next.js 16 feature combining static shell with streaming dynamic content using `<Suspense>`.

**Professional**
Service provider user role. Requires onboarding, background check, Stripe Connect account.

**Proxy (proxy.ts)**
Next.js 16 request interceptor in root `proxy.ts` (replaces `middleware.ts`). Handles auth, RBAC, i18n, CSRF protection.

---

## Q

**Query**
Database read operation. Uses Supabase client: `supabase.from('bookings').select('*')`.

---

## R

**RBAC (Role-Based Access Control)**
Authorization system with roles: `customer`, `professional`, `admin`. Enforced in `proxy.ts` and RLS policies.

**React 19**
React version used (19.2.0). Features: Server Components, `useActionState`, `useOptimistic`, React Compiler.

**React Server Components (RSC)**
React components that run only on server, fetching data directly without client bundle bloat. Default in App Router.

**Realtime Subscriptions**
Supabase feature for live database changes. Used for messaging system to push new messages instantly.

**Scroll Animation**
Viewport-triggered animations using Motion One's `inView()` and `scroll()` functions. See [Motion Guidelines](../02-design/motion-guidelines.md#scroll-based-animations).

**revalidateTag()**
Next.js 16 API to invalidate cached data by tag with stale-while-revalidate. Requires `cacheLife` profile.

**RLS (Row Level Security)**
PostgreSQL security policies restricting data access per-user. Every table has RLS enabled. Examples: users can only view their own bookings.

**RPC (Remote Procedure Call)**
PostgreSQL function exposed via Supabase to clients (e.g., `search_help_articles`, `increment_article_view_count`).

**RSC**
See **React Server Components**.

---

## S

**Server Action**
React function marked with `"use server"` for mutations. Replaces API routes for forms. Example: `createBooking()`.

**Server Component**
See **React Server Components**.

**Service Role Key**
Supabase admin key that bypasses RLS. **NEVER expose to client!** Server-side only. Used in API routes for admin operations.

**SSG (Static Site Generation)**
Next.js rendering strategy where pages are built at build time. Used for marketing pages.

**SSR (Server-Side Rendering)**
Next.js rendering strategy where pages are rendered on each request. Used for dynamic pages (dashboards).

**Stagger Animation**
Sequential reveal of list items with delay using Motion One's `stagger()`. See [Motion Guidelines](../02-design/motion-guidelines.md#stagger-animations).

**Stripe**
Payment processor. Features: Payment Intents (card processing), Stripe Connect (professional payouts), Webhooks (event handling).

**Stripe Connect**
Stripe feature for marketplace payouts. Professionals onboard to receive direct transfers (18% platform commission).

**Supabase**
Backend-as-a-Service providing PostgreSQL, Auth, Storage, Realtime. Hosted database with automatic REST API.

**SWR (Stale-While-Revalidate)**
Caching strategy that serves cached data immediately while fetching fresh data in background. Used with `revalidateTag()`.

---

## T

**Tailwind CSS 4.1**
Utility-first CSS framework used exclusively for ALL styling. Configuration in `tailwind.config.ts`. NO custom CSS or CSS variables allowed.

**Turbopack**
Next.js 16 bundler (default). 2-5x faster builds, up to 10x faster Fast Refresh vs Webpack.

**TypeScript Strict Mode**
Enabled in `tsconfig.json`. Enforces `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`. **Never use `as any`!**

---

## U

**updateTag()**
Next.js 16 Server Actions-only API for immediate cache expiration with read-your-writes semantics. Use in forms for instant user feedback.

**Upstash Redis**
Serverless Redis provider used for distributed rate limiting. Edge-compatible.

---

## V

**VAPID Keys**
Public/private key pair for Web Push notifications. Generate with `web-push generate-vapid-keys`.

**Vercel**
Hosting platform for Next.js apps. Features: Edge Network, automatic deployments, preview environments.

**View Count**
Help article analytics counter incremented via `increment_article_view_count` RPC. Tracks article popularity.

---

## W

**WCAG (Web Content Accessibility Guidelines)**
Accessibility standard (version 2.2). Casaora targets AA compliance. See [Motion Guidelines](../02-design/motion-guidelines.md#accessibility).

**Webhook**
HTTP callback for event notifications. Stripe webhooks notify us of payment events at `/api/webhooks/stripe`.

**Web Push**
Browser notification API for push messages. Requires user permission. Implementation in `/api/notifications/`.

---

## X

**XSS (Cross-Site Scripting)**
Security vulnerability prevented by sanitizing user input with DOMPurify. See [Security Best Practices](../03-technical/security-best-practices.md).

---

## Z

**Zod**
TypeScript-first schema validation library (v4). Used for validating API inputs, forms, environment variables.

```typescript
const BookingSchema = z.object({
  service_id: z.string().uuid(),
  date: z.string().datetime(),
});

type Booking = z.infer<typeof BookingSchema>; // Type-safe!
```

---

## Project-Specific Terms

**Casaora**
Platform name. Means "Home Hour" in Spanish (Casa + Hora). Marketplace connecting customers with cleaning professionals in Colombia.

**MaidConnect**
Internal codename for the project. Used in repository name and some documentation.

**Colombian Market**
Primary target market. English-first UI with automatic Spanish for Colombian users via geolocation. COP currency, Law 1581 compliance.

**English-First i18n**
Design principle where English (en) is primary language, Spanish (es) secondary. Geolocation auto-detects locale based on country (Spanish for Colombia/LatAm, English elsewhere).

**Trust & Safety**
Platform systems for background checks, ID verification, professional vetting, dispute resolution.

**Two-Sided Marketplace**
Business model with two user types: customers (demand) and professionals (supply). Platform facilitates transactions between them.

---

## Related Resources

- **Next.js 16 Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **React 19 Documentation**: [https://react.dev](https://react.dev)
- **Framer Motion**: [https://motion.dev](https://motion.dev)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)

---

**Total Terms:** 80
**Last Updated:** January 2025
**Maintained By:** Casaora Documentation Team

---

## Contributing

To add a term to the glossary:

1. **Alphabetical order** - Insert in correct position
2. **Bold term** - Use `**Term**` syntax
3. **Concise definition** - 1-3 sentences maximum
4. **Code examples** - Only if it aids understanding
5. **Cross-references** - Link to related docs when applicable
6. **Update count** - Increment "Total Terms" at bottom
