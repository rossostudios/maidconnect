# Casaora - AI Development Guide

> **Note:** "MaidConnect" is the internal codebase name. The product is branded as "Casaora".

## CRITICAL COMPATIBILITY NOTE

**⚠️ IMPORTANT: We use Tailwind CSS 4.1, NOT Vanilla Extract CSS-in-JS**

Vanilla Extract is **NOT COMPATIBLE** with Next.js 16 + Turbopack. Do not attempt to migrate to Vanilla Extract or any CSS-in-JS solution. Always use Tailwind CSS 4.1 for styling.

---

## Tech Stack Essentials

### Core Framework
- **Next.js 16.0.1** with Turbopack
- **React 19** - UI library
- **TypeScript 5.7.2** - Type safety
- **Bun** - JavaScript runtime and package manager

### Styling (CRITICAL)
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **Lia Design System** - Anthropic-inspired rounded corners, Geist fonts, 4px grid, warm neutrals + three-accent palette (orange, blue, green)

**DO NOT USE:**
- ❌ Vanilla Extract (incompatible with Next.js 16 + Turbopack)
- ❌ Styled Components, Emotion, or any CSS-in-JS library

### UI Components
- **React Aria Components** - Accessible, unstyled UI primitives (Adobe)
- **Tailwind CSS 4.1** - All styling via utility classes
- **Lia Design System** - Anthropic-inspired design patterns

### Key Integrations
- **Supabase** - Database, auth, storage, realtime
- **Stripe** - Payment processing
- **Sanity** - Headless CMS
- **PostHog** - Product analytics, feature flags
- **Snyk** - Security scanning

---

## AI Agent Workflow (READ ME FIRST)

**ALWAYS use MCP servers for latest information:**

1. **Frontend Design** → Use **Exa MCP** ("frontend-design" skill) before shipping ANY UI changes
   - Pulls latest Lia design patterns, spacing rules, frontend best practices
   - If Exa unavailable, use **Context7 MCP** as fallback

2. **Framework APIs** → Use **Context7 MCP** for Next.js 16+ and React 19+ documentation
   - Ensures you're using current APIs, not outdated patterns
   - Critical for Server Components, App Router, React 19 features

3. **Design System** → Read this file + `docs/lia/` for Lia rules (static reference)

**Documentation Priority:**
- **Primary:** Exa MCP (frontend-design skill)
- **Fallback:** Context7 MCP (Next.js 16+, React 19+)
- **Static:** CLAUDE.md + docs/lia/

---

## Common Bash Commands

```bash
# Development
bun dev                   # Start dev server (localhost:3000)
bun run build             # Build for production
bun run check             # Run Biome linter
bun run check:fix         # Auto-fix linting issues

# Database (Local Supabase)
supabase start            # Start local Supabase
supabase db push          # Apply migrations
supabase db reset         # Reset database (destructive!)
supabase migration new X  # Create new migration

# Database (Docker Toolkit)
docker compose -f docker-compose.db.yml up -d  # Start pgAdmin + PgHero
./supabase/scripts/health-check.sh            # Database health report
./supabase/scripts/backup-now.sh              # Create manual backup
./supabase/scripts/vacuum-analyze.sh          # Optimize database
# See: docs/database-docker-toolkit.md for full toolkit guide

# Testing
bun test                  # Run Vitest unit tests
bun test:e2e              # Run Playwright E2E tests

# Git
git checkout develop      # Switch to develop branch
git pull origin develop   # Pull latest changes
```

---

## Backend Development Workflow (Supabase)

### Local Development Setup

**Stack:**
- PostgreSQL 17 via Docker (Supabase CLI)
- Ports: 54322 (DB), 54321 (API), 54323 (Studio), 54324 (Email testing)
- Environment: `.env.local` (not committed to git)

**Start Local Supabase:**
```bash
supabase start            # Spin up Docker containers
# DB: postgresql://postgres:postgres@localhost:54322/postgres
# API: http://localhost:54321
# Studio: http://localhost:54323
```

**Database Commands:**
```bash
supabase db reset         # Wipe local database and re-apply all migrations (destructive!)
supabase migration new <name>  # Create new migration file (YYYYMMDDHHMMSS_name.sql)
supabase db push --linked # Push pending migrations to PRODUCTION (not local!)
supabase db diff          # Generate migration from schema changes
```

**Health Check:**
```bash
./supabase/scripts/health-check.sh   # Database health report
```

### Production Deployment

**⚠️ Current State:** Production has schema but NO migration history tracked in `supabase_migrations.schema_migrations`

**Migration Workflow (Ideal - when CLI works):**
```bash
# 1. Test migration locally first
supabase db reset
bun dev                   # Verify app works

# 2. Apply to production
supabase db push --linked

# 3. Verify on production
# Check Supabase Dashboard → Database → Migrations
```

**Migration Workflow (Manual - when pooler saturated):**

If `supabase db push --linked` fails with `MaxClientsInSessionMode` error:

```bash
# 1. Test migration locally first
supabase db reset
bun dev                   # Verify app works

# 2. Apply to production manually via Supabase Dashboard
# → SQL Editor → Paste migration SQL → Run

# 3. Track migration in production (CRITICAL!)
# Run this in Dashboard SQL Editor after applying migration:
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES ('20251119HHMMSS', 'migration_name', ARRAY[]::text[]);

# 4. Mark as applied locally
cp supabase/migrations/20251119HHMMSS_migration_name.sql \
   supabase/migrations/applied_on_remote/
```

**Troubleshooting:**
- **Pooler Saturated:** Use manual workflow above (Dashboard SQL Editor)
- **Migration Already Applied:** Check `supabase_migrations.schema_migrations` table
- **Schema Mismatch:** Run queries to compare production vs local schema
- **Sync Local from Prod:** Backup local migrations, restore baseline from production

**Deployment Checklist:**
- [ ] Migration tested locally with `supabase db reset`
- [ ] No breaking changes to existing APIs
- [ ] Environment variables updated in Vercel (if needed)
- [ ] RLS policies verified for new tables
- [ ] Run `bun run build` to verify types
- [ ] Migration tracked in `supabase_migrations.schema_migrations` (if applied manually)

### Environment Variables

**Required Services (69 variables total):**
- **Supabase**: URL, anon key, service role key
- **Stripe**: Secret key, webhook secret (CO/USD/EUR markets)
- **PayPal**: Client ID, secret (PY/UY/AR markets)
- **Sanity**: Project ID, dataset, API token, webhook secret
- **PostHog**: API key, host
- **Resend**: API key (transactional email)
- **Background Checks**: Checkr API key + Truora credentials
- **Upstash Redis**: URL, token (rate limiting)
- **Cron Jobs**: CRON_SECRET (Vercel scheduled tasks)
- **Algolia**: App ID, API key (search)

**See:** `.env.example` for complete list with descriptions

### Architecture Overview

**Tech Stack:**
- **Next.js 16 API Routes** (95+ endpoints)
- **Supabase PostgreSQL 17** (69 tables, 50+ migrations)
- **TypeScript Service Layer** (40+ files in `src/lib/services/`)
- **Upstash Redis** (rate limiting via `@upstash/ratelimit`)

**Layered Architecture:**
```
API Routes (src/app/api/)
    ↓
Service Layer (src/lib/services/)
    ↓
Repository Layer (src/lib/repositories/)
    ↓
Supabase Client (src/lib/integrations/supabase/)
    ↓
PostgreSQL 17
```

**Key Domains:**
- `bookings/` - Booking lifecycle, availability, pricing
- `payments/` - Stripe/PayPal integration, payouts, refunds
- `professionals/` - Profile management, verification, services
- `admin/` - User management, moderation, analytics
- `webhooks/` - External service integrations
- `cron/` - Scheduled background tasks

**Database Schema:**
- **69 tables** across 5 schemas (public, private, auth, storage, realtime)
- **50+ migrations** tracked in `/supabase/migrations/`
- **Row-Level Security (RLS)** on all tables with role-based access
- **Private schema helper functions** for complex RLS policies
- **Multi-currency support** (COP, USD, EUR, PYG, UYU, ARS)

### Database Migrations

**Current Local Migrations (Synced with Production):**
```
supabase/migrations/
├── 00000000000000_initial_schema.sql              # Production baseline schema
├── 20251119170320_add_multi_country_support.sql   # Countries/cities tables
├── 20251119190424_add_country_city_to_profiles.sql
├── 20251119190516_add_country_city_to_professional_profiles.sql
├── 20251119190601_add_country_city_to_bookings.sql
└── 20251119190656_fix_payout_tables_multi_currency.sql  # Adds _cents columns
```

**Applied on Remote (Tracking):**
```
supabase/migrations/applied_on_remote/
└── (Copy of migrations successfully applied to production)
```

**Migration Best Practices:**
1. **Always test locally first** with `supabase db reset`
2. **Use descriptive names** - `YYYYMMDDHHMMSS_what_changed.sql`
3. **Add RLS policies** for new tables immediately
4. **Never edit applied migrations** - create a new one instead
5. **Document breaking changes** in migration comments
6. **Track production migrations manually** if using Dashboard SQL Editor

**Recent Migrations (Nov 2024):**
- Multi-country support (countries, cities, neighborhoods tables)
- Country/city fields added to profiles, professional_profiles, bookings
- Multi-currency payout tables (adds _cents columns alongside _cop columns)

**⚠️ Known State:** Production currently has both `_cop` and `_cents` currency columns (transition state)

### Scheduled Tasks (Cron Jobs)

**4 Vercel Cron Jobs:**

1. **Process Payouts** - `/api/cron/process-payouts`
   - Schedule: Tuesday & Friday 10:00 AM COT
   - Function: Batch process pending professional payouts
   - Auth: CRON_SECRET bearer token

2. **Clear Balances** - `/api/cron/clear-balances`
   - Schedule: Daily 2:00 AM COT
   - Function: Archive old balance transactions
   - Auth: CRON_SECRET bearer token

3. **Auto-Decline Bookings** - `/api/cron/auto-decline-bookings`
   - Schedule: Multiple times daily
   - Function: Auto-decline expired booking requests
   - Auth: CRON_SECRET bearer token

4. **Rebook Nudges** - `/api/cron/rebook-nudges`
   - Schedule: Configured intervals
   - Function: Send rebooking reminders to clients
   - Auth: CRON_SECRET bearer token

**Cron Configuration:**
- Defined in `vercel.json` under `crons` array
- All protected by CRON_SECRET verification
- Logs visible in Vercel Dashboard → Cron Jobs

### Webhooks

**4 Webhook Endpoints:**

1. **Stripe Webhooks** - `/api/webhooks/stripe`
   - Events: Payment intents, charges, refunds
   - Verification: HMAC signature with webhook secret
   - Idempotency: Tracked in `webhook_events` table

2. **PayPal Webhooks** - `/api/webhooks/paypal`
   - Events: Payment capture, authorization, disputes
   - Verification: PayPal signature validation
   - Idempotency: Tracked in `webhook_events` table

3. **Background Check Webhooks** - `/api/webhooks/background-check`
   - Events: Check completion, results available
   - Providers: Checkr (US) + Truora (LATAM)
   - Verification: HMAC signature

4. **Sanity Webhooks** - `/api/webhooks/sanity`
   - Events: Content publish, update, delete
   - Use Case: Invalidate Next.js cache on CMS changes
   - Verification: SANITY_WEBHOOK_SECRET

**Webhook Security:**
- All webhooks verify HMAC signatures
- Idempotent processing (webhook_events table tracks event IDs)
- Rate limited via Upstash Redis

### Why TypeScript/Next.js (Not Rust)

**Decision: Stick with TypeScript/Next.js Stack**

**Rationale:**
1. **No Performance Crisis** - Current stack handles production load without bottlenecks
2. **Production-Ready** - 95+ endpoints, 40+ services, sophisticated business logic already working
3. **Supabase Ecosystem** - TypeScript-native with excellent SDK support
4. **Team Velocity** - TypeScript enables faster iteration for marketplace features
5. **Migration Cost** - Rewriting 95+ endpoints would take months with zero business value
6. **RLS Complexity** - Complex Row-Level Security policies remain in PostgreSQL regardless of backend language

**When to Consider Rust:**
- Specific compute-intensive microservices (image processing, ML inference)
- After proving market fit and identifying clear performance bottlenecks
- As targeted optimization, not full rewrite

**Current Bottlenecks (if any):**
- RLS policy complexity (addressed via private schema helper functions)
- Cron-based payouts (consider background job queue in future)
- Limited caching layer (addressed via `unstable_cache()` for public data)

**Performance Optimizations in Place:**
- Upstash Redis for rate limiting (tier-based: booking 20/min, payment 15/min)
- Next.js `unstable_cache()` for public data (1 hour TTL)
- Database indexes on high-traffic queries
- Connection pooling via Supabase Pooler

---

## Quick File Reference

### Core Configuration
```
src/app/globals.css                           # Tailwind config, design tokens
src/app/fonts.ts                              # Geist font setup
src/lib/shared/config/design-system.ts        # Lia constants (LIA_GRID, TYPOGRAPHY_SCALE)
```

### Critical Utilities (ALWAYS USE THESE)
```
src/lib/utils/core.ts                         # cn() utility for className merging
src/lib/utils/format.ts                       # formatCurrency(), formatDate()
src/lib/utils/sanitize.ts                     # sanitizeHTML(), sanitizeURL() - XSS prevention!
```

### Key Components (Lia-Compliant)
```
src/components/ui/button.tsx                  # Anthropic rounded-lg button (CORRECT pattern)
src/components/ui/card.tsx                    # Anthropic rounded-lg card (CORRECT pattern)
src/components/ui/input.tsx                   # Anthropic rounded-lg input (CORRECT pattern)
src/components/ui/badge.tsx                   # Anthropic rounded-full badge (CORRECT pattern)
```

### Services & Repositories
```
src/lib/services/                             # Business logic layer
src/lib/repositories/                         # Data access layer
src/lib/integrations/                         # External services (Supabase, Stripe, etc.)
```

**See [docs/architecture.md](docs/architecture.md) for complete project structure.**

---

## Lia Design System Rules (CRITICAL - ANTHROPIC DESIGN)

### Core Principles
1. **ANTHROPIC ROUNDED CORNERS** - Thoughtful border radius (4px-16px, pills at 9999px)
2. **Geist Fonts Exclusively** - Geist Sans for UI, Geist Mono for data/code
3. **4px Grid System** - All spacing in multiples of 4px (Anthropic precision)
4. **24px Baseline Grid** - Typography locked to 24px vertical rhythm
5. **Three-Accent Palette** - Warm neutrals + orange (primary), blue (secondary), green (success)

### ❌ NEVER Use Sharp Corners (OLD LIA PATTERN!)

```tsx
// WRONG - Old Lia pattern, violates new Anthropic design
<div className="border border-neutral-200">...</div>         // ← Missing rounded corners
<button className="bg-orange-500 px-6 py-3">...</button>     // ← Missing rounded corners
<input className="border border-neutral-200 px-4 py-2" />    // ← Missing rounded corners
```

### ✅ ALWAYS Use Anthropic Rounded Corners

```tsx
// CORRECT - Anthropic-Inspired Lia Design System
<div className="border border-neutral-200 rounded-lg">...</div>
<button className="bg-orange-500 px-6 py-3 rounded-lg">...</button>
<input className="border border-neutral-200 px-4 py-2 rounded-lg" />
<span className="bg-orange-50 px-3 py-1 border border-orange-200 rounded-full">...</span>  // ← Pills use rounded-full
```

**⚠️ CRITICAL:** All buttons, cards, and inputs MUST use `rounded-lg` (12px). Badges and pills MUST use `rounded-full`. This is the new standard based on Anthropic design principles.

**Rationale:** Anthropic rounded corners create a warm, modern, approachable aesthetic while maintaining professional precision. The thoughtful use of border radius balances friendliness with technical sophistication.

### ❌ NEVER Use Glass Morphism

```tsx
// WRONG - Violates Lia Design System
<div className="backdrop-blur-sm bg-white/70">...</div>
<div className="backdrop-blur-lg bg-neutral-900/50">...</div>
```

### ✅ ALWAYS Use Solid Backgrounds

```tsx
// CORRECT - Lia Design System Compliant
<div className="bg-white">...</div>
<div className="bg-neutral-900">...</div>
<div className="bg-neutral-50">...</div>
```

### Color Palette

**Neutral (Anthropic Warm Grays):**
- `neutral-50` - Background (#FAF9F5) - Anthropic light
- `neutral-900` - Headings (#141413) - Anthropic dark
- `neutral-700` - Body text (#68665F)
- `neutral-500` - Mid-gray (#B0AEA5) - Anthropic
- `neutral-200` - Borders (#E8E6DC) - Anthropic light-gray
- `white` - Cards (#FFFFFF)

**Orange (Primary Accent - Anthropic):**
- `orange-500` - Primary CTA (#D97757) - Anthropic orange
- `orange-600` - Links, hover (#C56847) - Anthropic hover
- `orange-700` - Active state (#B15937)
- `orange-50` - Highlights (#FAF0ED)

**Blue (Secondary Accent - Anthropic):**
- `blue-500` - Info states (#6A9BCC) - Anthropic blue
- `blue-600` - Info hover (#5A8BBC) - Anthropic blue hover

**Green (Success Accent - Anthropic):**
- `green-500` - Success states (#788C5D) - Anthropic green
- `green-600` - Success hover (#687C4D) - Anthropic green hover

**Color Usage:**
1. Primary Actions → `orange-500`
2. Links → `orange-600` (WCAG AA compliant)
3. Info/Secondary → `blue-500` and `blue-600`
4. Success → `green-500` and `green-600`
5. Backgrounds → `neutral-50` for pages, `white` for cards
6. Text → `neutral-900` headings, `neutral-700` body, `neutral-500` muted
7. Borders → `neutral-200`

**See [docs/lia/](docs/lia/) for complete design system documentation.**

---

## React Aria Component Patterns (CRITICAL)

### Why React Aria?

We migrated from Radix UI to **React Aria Components** (Adobe) for better:
- **Accessibility** - ARIA implementation built by Adobe Accessibility team
- **Flexibility** - Unstyled primitives that work perfectly with Tailwind
- **Bundle Size** - Tree-shakeable, lightweight components
- **Modern APIs** - Hooks-based, React 19 compatible

### Component Architecture

```tsx
// ✅ CORRECT Pattern - React Aria + Lia Design System
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

export const Select = ({ children, ...props }) => (
  <AriaSelect {...props}>
    {children}
  </AriaSelect>
);

export const SelectTrigger = ({ children, className }) => (
  <Button
    className={cn(
      // Lia Design System styling
      "rounded-lg border border-neutral-200 bg-neutral-50",
      "focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
      className
    )}
  >
    {children}
  </Button>
);
```

### Key React Aria Components

**Form Controls:**
- `Button` - Interactive buttons with press states
- `TextField`, `TextArea` - Text inputs with labels
- `Checkbox`, `CheckboxGroup` - Checkbox controls
- `RadioGroup`, `Radio` - Radio button controls
- `Select`, `ListBox`, `ComboBox` - Dropdown selections
- `Switch` - Toggle switches

**Overlays:**
- `Dialog`, `Modal`, `ModalOverlay` - Modal dialogs
- `Popover` - Floating content panels
- `Tooltip` - Hover/focus tooltips

**Navigation:**
- `Tabs`, `TabList`, `Tab`, `TabPanel` - Tab navigation
- `Menu`, `MenuItem` - Dropdown menus

**Disclosure:**
- `Disclosure`, `DisclosurePanel` - Expandable sections (accordions)

### Component Styling Guidelines

**1. Always use Lia Design System classes:**
```tsx
// Border radius (CRITICAL!)
"rounded-lg"        // Buttons, cards, inputs, containers
"rounded"           // Tab triggers, select items
"rounded-full"      // Badges, pills, avatars

// Focus states (orange-500)
"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"

// Colors
"bg-white"          // Cards, elevated surfaces
"bg-neutral-50"     // Page backgrounds, input backgrounds
"bg-orange-500"     // Primary CTAs
"text-neutral-900"  // Headings
"text-neutral-700"  // Body text
"border-neutral-200" // Borders
```

**2. Use data attributes for state styling:**
```tsx
// React Aria provides data attributes for component states
"data-[selected]:bg-orange-50"           // Selected items
"data-[focused]:ring-2"                   // Focused state
"data-[disabled]:opacity-50"              // Disabled state
"data-[pressed]:scale-[0.98]"            // Active press
"data-[entering]:animate-in"              // Enter animation
"data-[exiting]:animate-out"              // Exit animation
```

**3. Maintain backward compatibility:**
```tsx
// Support both React Aria and legacy Radix prop names
export const Tabs = ({ value, defaultValue, onValueChange, ...props }) => {
  const selectedKey = value ?? props.selectedKey;
  const defaultSelectedKey = defaultValue ?? props.defaultSelectedKey;

  const handleSelectionChange = (key: React.Key) => {
    onValueChange?.(String(key));
    props.onSelectionChange?.(key);
  };

  return (
    <AriaTabs
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={handleSelectionChange}
      {...props}
    />
  );
};
```

### Migration Checklist

When creating or updating UI components:

- [ ] **Import from React Aria** - `react-aria-components`, not Radix UI
- [ ] **Apply Lia styling** - `rounded-lg`, orange-500 focus rings, neutral colors
- [ ] **Use cn() utility** - For className merging from `@/lib/utils/core`
- [ ] **Add data-attribute styles** - For React Aria state management
- [ ] **Maintain exports** - Keep backward compatibility if replacing existing component
- [ ] **Add TypeScript types** - Define proper interfaces extending React Aria types
- [ ] **Test accessibility** - Verify keyboard navigation, ARIA labels, focus management
- [ ] **Run build** - Verify no type errors with `bun run build`

### Common Patterns

**Composition with asChild:**
```tsx
// Custom Slot implementation for composition
const Slot = ({ children, ...props }) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      className: cn(props.className, children.props.className),
    });
  }
  return children;
};

// Usage
<Button asChild>
  <Link href="/about">Go to About</Link>
</Button>
```

**Variant Management with CVA:**
```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-lg font-semibold transition-all focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white hover:bg-orange-600",
        outline: "border-2 border-neutral-200 hover:border-orange-500",
        ghost: "hover:bg-orange-50 hover:text-orange-600",
      },
      size: {
        default: "h-10 px-8",
        sm: "h-9 px-6",
        lg: "h-11 px-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

**Animation States:**
```tsx
<ModalOverlay className={cn(
  "fixed inset-0 z-50 flex items-center justify-center",
  "bg-neutral-900/80",
  // React Aria animation data attributes
  "data-[entering]:animate-in data-[entering]:fade-in-0",
  "data-[exiting]:animate-out data-[exiting]:fade-out-0"
)}>
  <Modal>
    <Dialog>
      {/* Dialog content */}
    </Dialog>
  </Modal>
</ModalOverlay>
```

**See [src/components/ui/](src/components/ui/) for complete component implementations.**

---

## AI Assistant Guidelines

### When Creating Components

1. **Always use Tailwind CSS** - Never suggest CSS-in-JS alternatives
2. **USE ANTHROPIC ROUNDED CORNERS** - `rounded-lg` for buttons/cards/inputs, `rounded-full` for badges (Lia requirement)
3. **Use React Aria Components** - Import from `react-aria-components` for accessible UI primitives
4. **Use Exa MCP before shipping** - Run "frontend-design" skill for latest Lia patterns
5. **Use Context7 MCP for framework APIs** - Get latest Next.js 16+/React 19+ docs
6. **Check compatibility** - Verify packages work with Next.js 16 + Turbopack
7. **Type safety** - Define proper TypeScript interfaces extending React Aria types
8. **Accessibility** - Use React Aria primitives, ARIA labels, keyboard navigation, data attributes
9. **Responsive** - Mobile-first approach
10. **Security** - ALWAYS sanitize user input with `sanitizeHTML()`, `sanitizeURL()`

### Common Mistakes to Avoid

**❌ DO NOT:**
- **Use sharp corners (old Lia)** - Missing `rounded-*` classes violates new Anthropic design (COMMON MISTAKE!)
- **Use glass morphism** - `backdrop-blur-*` effects violate Lia
- Suggest Vanilla Extract, Styled Components, or CSS-in-JS
- Use untyped components
- Skip accessibility requirements
- Hardcode colors or spacing values
- Rely on outdated Next.js/React patterns without checking Context7

**✅ DO:**
- **Use Anthropic rounded corners** - `rounded-lg` for buttons/cards/inputs, `rounded-full` for badges
- **Use solid backgrounds** - Never use backdrop-blur
- **Use Exa MCP before shipping UI** - Get latest Lia patterns
- **Use Context7 MCP for framework APIs** - Stay current with Next.js 16+/React 19+
- Use Tailwind utility classes
- Import from existing UI components
- Define TypeScript types
- Use `orange-600` for links (better WCAG contrast than orange-500)
- Run `bun run check` after changes

---

## Security Essentials (CRITICAL)

### Input Sanitization (ALWAYS REQUIRED)

```typescript
import { sanitizeHTML, sanitizeRichContent, sanitizeURL } from '@/lib/utils/sanitize';

// For user-generated content (reviews, comments)
const safeContent = sanitizeHTML(userInput);
<div dangerouslySetInnerHTML={{ __html: safeContent }} />

// For admin-created rich content (articles, changelog)
const safeRichContent = sanitizeRichContent(adminContent);
<div dangerouslySetInnerHTML={{ __html: safeRichContent }} />

// For URLs from external sources
const safeUrl = sanitizeURL(externalUrl);
<a href={safeUrl}>Link</a>
```

### Security Scanning

```bash
snyk test              # Scan dependencies for vulnerabilities
snyk code test         # Scan code for security issues (SAST)
```

**Security Checklist:**
- [ ] All user input sanitized before rendering
- [ ] URLs validated before navigation/fetch
- [ ] No hardcoded secrets in code
- [ ] Run `snyk test` before deploying

**See [docs/security.md](docs/security.md) for complete security guidelines.**

---

## Engineering Best Practices

### Admin UI Development

When touching admin UI, follow these guardrails to avoid Biome/a11y issues:

1. **Control render complexity** - Extract components/hooks if render body exceeds ~100 LOC
2. **Move async handlers to hooks/utilities** - Keep components declarative
3. **Satisfy a11y rules up front** - Use `<button type="button">`, `label` with `htmlFor`
4. **Run `bun run check` continuously** - Keep Biome happy, fix issues immediately
5. **Prefer reusable patterns** - Share `TableHeader`, `SortIndicator`, `useModalForm`
6. **Organize imports** - Type-only imports (`import type`) grouped above value imports

### Package Installation

Before installing new packages:

```bash
bun info <package-name>    # Check package info
# Verify: Next.js 16 compatibility, Turbopack support, TypeScript types
bun add <package-name>     # Install with caution
bun run build              # Test build
```

---

## Key Features

- **Authentication Flow** - Supabase Auth with email/password + OAuth
- **Booking System** - Real-time availability, Stripe payments
- **Professional Dashboard** - Profile management, service listings, earnings
- **Admin Dashboard** - User management, professional verification, analytics
- **Internationalization** - English & Spanish support (next-intl)

---

## Support & Resources

- **Internal Docs:**
  - [Architecture Guide](docs/architecture.md) - Project structure, lib organization
  - [Development Guide](docs/development.md) - Testing, deployment, releases
  - [Security Guide](docs/security.md) - XSS prevention, SSRF mitigation
  - [Typography Guide](docs/typography.md) - Font system, baseline grid
  - [Lia Design System](docs/lia/) - Complete design system reference
  - [Database Docker Toolkit](docs/database-docker-toolkit.md) - pgAdmin, PgHero, performance monitoring
  - [Quick Start Guide](.github/DB_TOOLKIT_QUICKSTART.md) - Database toolkit quick reference

- **External Docs:**
  - [Next.js 16 Docs](https://nextjs.org/docs) (use Context7 MCP for latest)
  - [React 19 Docs](https://react.dev/blog/2024/12/05/react-19) (use Context7 MCP)
  - [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
  - [React Aria Components Docs](https://react-spectrum.adobe.com/react-aria/components.html) (use Context7 MCP)
  - [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** 2025-11-19
**Version:** 1.5.1 - Database Sync Workflow (Manual Migration Process + Production State Documentation)
