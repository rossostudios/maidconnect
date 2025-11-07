# Casaora Documentation Index

**Single source of truth for all Casaora documentation**

Last Updated: 2025-11-06 | Version: 3.0

---

## Quick Start Guides

### New Developers
1. **[Getting Started](/docs/07-guides/getting-started.md)** - First steps for new developers
2. **[Local Development Setup](/docs/07-guides/local-development-setup.md)** - Complete local environment setup
3. **[Architecture Overview](/docs/03-technical/architecture.md)** - System design, tech stack, data flow
4. **[Database Schema](/docs/03-technical/database-schema.md)** - All 21 tables, relationships, RLS policies
5. **[Development Guide](/docs/07-guides/development-guide.md)** - How to create components, APIs, modals, calendars
6. **[Quick Reference](/docs/07-guides/quick-reference.md)** - Cheat sheet for common patterns
7. **[Contributing Guide](/docs/07-guides/contributing.md)** - How to contribute to the project

### Product & Business
1. **[Product Requirements (PRD)](/docs/01-product/prd.md)** - Product vision, features, revenue model
2. **[User Stories](/docs/01-product/user-stories.md)** - Detailed stories with acceptance criteria
3. **[Operations Manual](/docs/01-product/operations-manual.md)** - Day-to-day procedures
4. **[Changelog](/docs/00-start/changelog.md)** - Version history and major changes

### Designers
1. **[Design System](/docs/02-design/design-system.md)** - Complete design tokens, colors, typography
2. **[Component Library](/docs/02-design/component-library.md)** - All UI components API reference
3. **[Motion Guidelines](/docs/02-design/motion-guidelines.md)** - Animation patterns and best practices
4. **[Branding Guidelines](/docs/02-design/branding-guidelines-2025.md)** - Visual identity, logo usage

### DevOps & Operations
1. **[Deployment Guide](/docs/05-deployment/deployment-guide.md)** - Step-by-step Vercel deployment
2. **[Environments](/docs/05-deployment/environments.md)** - Local/preview/prod configuration
3. **[CI/CD Pipeline](/docs/05-deployment/ci-cd.md)** - Automated delivery pipeline
4. **[Monitoring](/docs/06-operations/monitoring.md)** - Logs, alerts, Better Stack setup
5. **[Incident Response](/docs/06-operations/incident-response.md)** - SEV classification, triage, communication
6. **[On-Call Runbook](/docs/06-operations/on-call-runbook.md)** - First response procedures

---

## Complete Documentation Catalog

### 🎯 Product Documentation (`/docs/01-product`)

| Document | Description | Size |
|----------|-------------|------|
| [Product Requirements (PRD)](/docs/01-product/prd.md) | Product vision, features, revenue model | ~800 lines |
| [User Stories](/docs/01-product/user-stories.md) | Detailed user stories with acceptance criteria | ~600 lines |
| [Operations Manual](/docs/01-product/operations-manual.md) | Day-to-day operational procedures | ~400 lines |

### 🎨 Design Documentation (`/docs/02-design`)

| Document | Description | Size |
|----------|-------------|------|
| [Design System](/docs/02-design/design-system.md) | Complete design tokens, colors, typography, spacing, components | ~1,045 lines |
| [Component Library](/docs/02-design/component-library.md) | Comprehensive API reference for all 23+ UI components | ~800 lines |
| [Motion Guidelines](/docs/02-design/motion-guidelines.md) | Animation patterns using Motion One, accessibility | ~711 lines |
| [Branding Guidelines 2025](/docs/02-design/branding-guidelines-2025.md) | Visual identity, logo usage, brand voice | ~630 lines |

### 🔧 Technical Documentation (`/docs/03-technical`)

| Document | Description | Size |
|----------|-------------|------|
| [Architecture](/docs/03-technical/architecture.md) | System architecture, components, data flow, integrations | ~800 lines |
| [Database Schema](/docs/03-technical/database-schema.md) | 21 tables, relationships, indexes, RLS policies | ~900 lines |
| [API Reference](/docs/03-technical/api-reference.md) | All 42 API endpoints with request/response examples | ~1,200 lines |
| [Authentication](/docs/03-technical/authentication.md) | Supabase auth, session management, RLS, security | ~600 lines |
| [Webhooks](/docs/03-technical/webhooks.md) | Stripe webhooks, event handling, security | ~500 lines |
| [API Middleware](/docs/03-technical/api-middleware.md) | Middleware patterns, auth helpers, validation | ~400 lines |
| [API Guidelines](/docs/03-technical/api-guidelines.md) | API route patterns, error handling, security | ~200 lines |
| [Auth & Tenant Model](/docs/03-technical/auth-tenant-model.md) | Multi-tenant authentication architecture | ~400 lines |
| [Feature Flags](/docs/03-technical/feature-flags.md) | Feature flag implementation and usage | ~300 lines |
| [Coding Standards](/docs/03-technical/coding-standards.md) | TypeScript/React/Tailwind conventions | ~200 lines |
| [Next.js 16 Features](/docs/03-technical/nextjs-16-features.md) | Next.js 16 migration and features | ~300 lines |
| [React 19 Implementation](/docs/03-technical/react-19-implementation.md) | React 19 patterns and best practices | ~400 lines |
| [React 19 Memoization Guide](/docs/03-technical/react-19-memoization-guide.md) | Performance optimization patterns | ~300 lines |
| [Modal Patterns](/docs/03-technical/modal-patterns.md) | Modal architecture and patterns | ~400 lines |

### ✨ Feature Documentation (`/docs/04-features`)

| Document | Description | Size |
|----------|-------------|------|
| [Amara AI Assistant](/docs/04-features/amara-ai-assistant.md) | AI chatbot implementation, Claude integration | ~400 lines |
| [Availability Management](/docs/04-features/availability-management.md) | Professional scheduling and calendar system | ~500 lines |
| [Booking Lifecycle](/docs/04-features/booking-lifecycle.md) | Complete booking flow and state management | ~600 lines |
| [Changelog & Feedback System](/docs/04-features/changelog-feedback-system.md) | User feedback and changelog features | ~350 lines |
| [Dashboard Integration](/docs/04-features/dashboard-integration.md) | Multi-role dashboard architecture | ~450 lines |
| [Help Center](/docs/04-features/help-center.md) | Bilingual knowledge base with search & feedback | ~300 lines |
| [Messaging & Translation](/docs/04-features/messaging-translation.md) | Real-time chat with auto-translation EN↔ES | ~550 lines |
| [Payment System](/docs/04-features/payment-system.md) | Stripe integration, payments, refunds, payouts | ~700 lines |
| [Professional Onboarding](/docs/04-features/professional-onboarding.md) | Multi-step verification and approval flow | ~500 lines |
| [Reviews & Ratings](/docs/04-features/reviews-ratings.md) | Review system, rating calculations, moderation | ~450 lines |
| [Trust & Safety](/docs/04-features/trust-safety.md) | Background checks, verification, safety features | ~550 lines |

### 🚀 Deployment Documentation (`/docs/05-deployment`)

| Document | Description | Size |
|----------|-------------|------|
| [Deployment Guide](/docs/05-deployment/deployment-guide.md) | Step-by-step Vercel deployment | ~500 lines |
| [Pre-Deploy Checklist](/docs/05-deployment/pre-deploy-checklist.md) | Must-do items before production launch | ~300 lines |
| [Environments](/docs/05-deployment/environments.md) | Local, preview, production configuration | ~400 lines |
| [Release Playbook](/docs/05-deployment/release-playbook.md) | Safe release process and rollback procedures | ~883 lines |
| [CI/CD Pipeline](/docs/05-deployment/ci-cd.md) | Automated testing, building, deployment | ~860 lines |
| [Supabase Cron Setup](/docs/05-deployment/supabase-cron-setup.md) | Scheduled jobs and background tasks | ~200 lines |

### 🔄 Operations Documentation (`/docs/06-operations`)

| Document | Description | Size |
|----------|-------------|------|
| [Monitoring](/docs/06-operations/monitoring.md) | Better Stack logs, alerts, dashboards | ~600 lines |
| [Performance Monitoring](/docs/06-operations/performance-monitoring.md) | Web Vitals, performance tracking, optimization | ~500 lines |
| [Security Best Practices](/docs/06-operations/security-best-practices.md) | Rate limiting, CSP, CSRF, security hardening | ~700 lines |
| [Incident Response](/docs/06-operations/incident-response.md) | SEV classification, triage, communication templates | ~995 lines |
| [On-Call Runbook](/docs/06-operations/on-call-runbook.md) | First response procedures, escalation paths | ~879 lines |

### 📚 Developer Guides (`/docs/07-guides`)

| Document | Description | Size |
|----------|-------------|------|
| [Getting Started](/docs/07-guides/getting-started.md) | First steps for new developers | ~400 lines |
| [Local Development Setup](/docs/07-guides/local-development-setup.md) | Complete environment setup guide | ~500 lines |
| [Development Guide](/docs/07-guides/development-guide.md) | How-to guide for common development tasks | ~400 lines |
| [Contributing](/docs/07-guides/contributing.md) | Contribution guidelines and workflow | ~350 lines |
| [Code Review Checklist](/docs/07-guides/code-review-checklist.md) | PR review guidelines and best practices | ~300 lines |
| [Quick Reference](/docs/07-guides/quick-reference.md) | Cheat sheet for patterns, imports, utilities | ~150 lines |
| [API Middleware Guide](/docs/07-guides/api-middleware-guide.md) | Comprehensive middleware usage patterns | ~950 lines |
| [Modal Patterns Guide](/docs/07-guides/modal-patterns-guide.md) | Modal creation and management patterns | ~500 lines |

### ⚖️ Compliance & Legal (`/docs/07-compliance`)

| Document | Description | Size |
|----------|-------------|------|
| [Compliance Overview](/docs/07-compliance/compliance-overview.md) | PCI DSS, Law 1581, GDPR, SOC 2 overview | ~600 lines |
| [DIY Implementation Guide](/docs/07-compliance/diy-implementation-guide.md) | Bootstrap compliance implementation | ~800 lines |
| [Privacy Policy](/docs/07-compliance/privacy-policy.md) | GDPR + Colombian Law 1581 compliant policy | ~850 lines |
| [Terms of Service](/docs/07-compliance/terms-of-service.md) | Legal terms for platform usage | ~900 lines |
| [Cookie Policy](/docs/07-compliance/cookie-policy.md) | Cookie usage and consent documentation | ~440 lines |
| [Data Processing Agreement](/docs/07-compliance/data-processing-agreement.md) | GDPR DPA for business customers | ~650 lines |
| [GDPR Compliance Guide](/docs/07-compliance/gdpr-compliance-guide.md) | Detailed GDPR implementation guide | ~1,200 lines |
| [Colombian Law 1581 Guide](/docs/07-compliance/colombian-law-1581-compliance-guide.md) | Colombian data protection compliance | ~1,100 lines |

### 📐 Architecture Decision Records (`/docs/01-decisions`)

| Document | Description |
|----------|-------------|
| [ADR-001: Why Next.js 16](/docs/01-decisions/adr-001-why-nextjs-16.md) | Next.js 16 framework selection |
| [ADR-002: Why proxy.ts Pattern](/docs/01-decisions/adr-002-why-proxy-ts-pattern.md) | Proxy.ts middleware approach |
| [ADR-003: Why Supabase](/docs/01-decisions/adr-003-why-supabase.md) | Supabase as backend platform |
| [ADR-004: Why Stripe Connect](/docs/01-decisions/adr-004-why-stripe-connect.md) | Stripe Connect for marketplace payments |
| [ADR-005: Why Tailwind CSS 4.1](/docs/01-decisions/adr-005-why-tailwind-css-4-1.md) | Tailwind CSS styling choice |
| [ADR-006: Why Bun](/docs/01-decisions/adr-006-why-bun.md) | Bun as package manager and runtime |
| [ADR-007: Why Biome](/docs/01-decisions/adr-007-why-biome.md) | Biome for linting and formatting |
| [ADR-008: Why Better Stack](/docs/01-decisions/adr-008-why-better-stack.md) | Better Stack for monitoring |
| [ADR-009: Why English-First i18n](/docs/01-decisions/adr-009-why-english-first-i18n.md) | i18n strategy decision |
| [ADR-010: Why Motion One](/docs/01-decisions/adr-010-why-motion-one.md) | Motion One for animations |

### 📱 Mobile Documentation (`/docs/mobile`)

| Document | Description |
|----------|-------------|
| [Mobile App Overview](/docs/mobile/MOBILE_APP_COMPLETE_OVERVIEW.md) | Complete mobile app documentation |
| [Mobile Dev Setup](/docs/mobile/dev-setup.md) | React Native development setup |
| [Mobile Release Playbook](/docs/mobile/release-playbook.md) | App Store and Play Store release process |
| [Notifications](/docs/mobile/notifications.md) | Push notifications implementation |
| [User Flow](/docs/mobile/USER_FLOW.md) | Mobile app user journeys |

### 📝 Meta Documentation (`/docs/00-start`)

| Document | Description |
|----------|-------------|
| [Documentation Index](/docs/00-start/documentation-index.md) | This file - complete docs navigation |
| [README](/docs/00-start/readme.md) | Introduction to documentation |
| [Docs Style Guide](/docs/00-start/docs-style-guide.md) | Documentation writing standards |
| [ADR Template](/docs/00-start/adr-template.md) | Template for architecture decisions |
| [Glossary](/docs/00-start/glossary.md) | Common terms and definitions |
| [Changelog](/docs/00-start/changelog.md) | Project version history |

---

## Development Workflows

### Creating New Features

**1. Create an API Endpoint**
```typescript
// See: /docs/07-guides/development-guide.md#api-routes
import { withProfessional, ok } from "@/lib/api";

export const POST = withProfessional(async ({ user, supabase }) => {
  // Your logic here
  return ok({ success: true });
});
```

**2. Create a Modal**
```typescript
// See: /docs/07-guides/modal-patterns-guide.md
import { FormModal } from "@/components/shared/form-modal";
import { useModalForm } from "@/hooks/use-modal-form";

// Use FormModal for forms, BaseModal for custom layouts
```

**3. Create a Calendar**
```typescript
// See: /docs/07-guides/development-guide.md#calendars
import { AvailabilityCalendar } from "@/components/shared/availability-calendar";

// Highly configurable with size/theme variants
```

**4. Use UI Components**
```typescript
// See: /docs/02-design/component-library.md
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**5. Use Formatting Utilities**
```typescript
// See: /docs/07-guides/quick-reference.md#utilities
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils/formatting";
```

---

## Architecture Quick View

```
┌─────────────────────────────────────────────┐
│  Next.js 16 (App Router) + React 19        │
│  ├─ Pages (RSC)                             │
│  ├─ API Routes (42 endpoints)               │
│  └─ proxy.ts (Auth, RBAC, i18n)             │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌──────────┐
│Supabase │ │Stripe  │ │ Better   │
│(DB+Auth)│ │Payments│ │  Stack   │
└─────────┘ └────────┘ └──────────┘
```

**Tech Stack:**
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4.1
- **Backend:** Next.js API Routes, Supabase Edge Functions
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (JWT + RLS)
- **Payments:** Stripe + Stripe Connect
- **Animations:** Motion One (lightweight, performant)
- **Hosting:** Vercel Edge Network
- **Monitoring:** Better Stack (Logtail)
- **Package Manager:** Bun
- **Linting:** Biome

---

## Key Patterns & Standards

### Shared Components
- **Modals:** BaseModal, FormModal, ConfirmationModal
- **Calendars:** AvailabilityCalendar (unified, configurable)
- **Forms:** useModalForm hook for state management
- **API:** useApiMutation hook for API calls
- **UI Components:** 23+ components in design system

### Custom Hooks
- `useModalForm` - Form state with auto-reset
- `useApiMutation` - API calls with loading/error states
- `useCalendarMonth` - Month navigation
- `useAvailabilityData` - Calendar data fetching
- `useCalendarGrid` - Calendar grid generation

### API Middleware
- `withAuth` - Require authentication
- `withProfessional` / `withCustomer` / `withAdmin` - Role-based access
- `requireProfessionalOwnership` - Verify booking ownership
- `ok()` / `created()` / `noContent()` - Response helpers

### Code Standards
- TypeScript strict mode (NO `any`, use proper types)
- Zod for validation
- React Server Components by default
- Client Components only when needed (interactivity)
- Tailwind CSS utility classes (no custom CSS variables for spacing/colors)
- Accessibility-first (WCAG 2.1 AA/AAA)

---

## Testing & Quality

### Test Suite
- **Location:** `/tests`
- **Documentation:** [Test Suite README](/tests/TEST_SUITE_README.md)
- **Coverage:** Components, hooks, API routes, E2E flows
- **Framework:** Playwright for E2E testing

### Code Quality
- **TypeScript:** Strict mode, no implicit any
- **Linting:** Biome (fast, comprehensive)
- **Type Safety:** Zod schemas for runtime validation
- **Accessibility:** WCAG 2.1 compliance

---

## Recent Major Changes

### Documentation Sprint (Nov 2025)
- **Phase 3:** Complete feature documentation (11 feature docs)
- **Phase 4:** Technical reference updates (API, DB, Auth, Webhooks)
- **Phase 5:** Developer onboarding guides (Getting Started, Setup, Contributing)
- **Phase 6:** Operations runbooks (Incident Response, On-Call, Monitoring)
- **Phase 7:** Compliance & Legal (Privacy, Terms, Cookie, GDPR, Law 1581)
- **Phase 8:** Design system (Component Library, Motion Guidelines)
- **Result:** 114 markdown files, comprehensive coverage

### Phase 2 Performance (Nov 2025)
- Image optimization with Next.js Image
- React 19 memoization patterns
- Bundle size reduction
- Core Web Vitals improvements

### Test Suite (Nov 2025)
- Comprehensive test coverage added
- Unit, integration, E2E tests
- CI/CD integration

### Auto-Translate Chat (Nov 2025)
- Real-time message translation
- Spanish ↔ English support
- Seamless UX integration

### Shared Components (Nov 2025)
- **Calendars:** 6 duplicate components → 1 unified component (56% code reduction)
- **Modals:** 9 modals refactored with shared patterns (84% fewer hooks)
- **API Middleware:** 68 routes standardized (47% code reduction projected)

---

## Archive & History

Historical documentation moved to `/docs/08-archives`:
- Sprint summaries (`/docs/08-archives/sprints/`)
- Planning documents (superseded)
- Session notes (`/docs/08-archives/sessions/`)
- Migration history (`/docs/08-archives/migration-2025-11/`)
- Implementation histories

**Current versions supersede archived docs.**

---

## Support & Contribution

### Getting Help
- **New Developer?** Start with [Getting Started](/docs/07-guides/getting-started.md)
- **Technical Question?** Check [Development Guide](/docs/07-guides/development-guide.md)
- **Quick Pattern?** See [Quick Reference](/docs/07-guides/quick-reference.md)
- **API Question?** Check [API Reference](/docs/03-technical/api-reference.md)
- **Database Question?** See [Database Schema](/docs/03-technical/database-schema.md)
- **Design Question?** Check [Component Library](/docs/02-design/component-library.md)

### Contributing
1. Read [Contributing Guide](/docs/07-guides/contributing.md)
2. Review [Code Review Checklist](/docs/07-guides/code-review-checklist.md)
3. Follow [Coding Standards](/docs/03-technical/coding-standards.md)
4. Use [Docs Style Guide](/docs/00-start/docs-style-guide.md) for documentation

### External Services
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Better Stack Logs](https://logs.betterstack.com/)

### Documentation Updates
- Keep documentation in sync with code
- Update this index when adding new docs
- Archive outdated documentation
- Use clear, scannable formatting
- Follow the [Docs Style Guide](/docs/00-start/docs-style-guide.md)

---

## Documentation Statistics

- **Total Documents:** 114 markdown files
- **Total Lines:** ~35,000+ lines
- **Main Categories:** 9 directories
- **API Endpoints:** 42 documented
- **Database Tables:** 21 documented
- **Design Components:** 23+ fully documented
- **Feature Docs:** 11 comprehensive guides
- **Compliance Docs:** 8 legal documents
- **Operations Runbooks:** 5 playbooks
- **Architecture Decisions:** 10 ADRs

---

**Maintained by:** Casaora Development Team
**Version:** 3.0
**Last Updated:** November 6, 2025
**Next Review:** Q1 2026
