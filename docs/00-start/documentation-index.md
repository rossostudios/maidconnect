# Casaora Documentation Index

**Single source of truth for all Casaora documentation**

Last Updated: 2025-11-03 | Version: 2.0

---

## Getting Started

### New Developers
1. **[Architecture Overview](/docs/03-technical/architecture.md)** - System design, tech stack, data flow
2. **[Database Schema](/docs/03-technical/database-schema.md)** - All 21 tables, relationships, RLS policies
3. **[Development Guide](/docs/07-guides/development-guide.md)** - How to create components, APIs, modals, calendars
4. **[Quick Reference](/docs/07-guides/quick-reference.md)** - Cheat sheet for common patterns

### Deployment
1. **[Pre-Deploy Checklist](/docs/05-deployment/pre-deploy-checklist.md)** - Must-do items before launch
2. **[Deployment Guide](/docs/05-deployment/deployment-guide.md)** - Step-by-step Vercel deployment
3. **[Supabase Cron Setup](/docs/05-deployment/supabase-cron-setup.md)** - Scheduled jobs configuration

### Operations
1. **[Operations Manual](/docs/01-product/operations-manual.md)** - Day-to-day procedures
2. **[Monitoring](/docs/06-operations/monitoring.md)** - Logs, alerts, Better Stack setup
3. **[Security Best Practices](/docs/06-operations/security-best-practices.md)** - Rate limiting, CSP, security

---

## Essential Documentation

### Product & Design
| Document | Description | Lines |
|----------|-------------|-------|
| [Product Requirements (PRD)](/docs/01-product/prd.md) | Product vision, features, revenue model | ~800 |
| [User Stories](/docs/01-product/user-stories.md) | Detailed stories with acceptance criteria | ~600 |
| [Design System](/docs/02-design/design-system.md) | Complete UI components, colors, typography | ~1,000 |

### Technical
| Document | Description | Lines |
|----------|-------------|-------|
| [Architecture](/docs/03-technical/architecture.md) | System architecture, components, integrations | ~800 |
| [Database Schema](/docs/03-technical/database-schema.md) | 21 tables, relationships, indexes, RLS | ~900 |
| [API Reference](/docs/03-technical/api-reference.md) | All 42 API endpoints documented | ~1,200 |
| [Auth & Tenant Model](/docs/03-technical/auth-tenant-model.md) | Multi-tenant authentication | ~400 |
| [Feature Flags](/docs/03-technical/feature-flags.md) | Feature flag implementation | ~300 |

### Developer Guides
| Document | Description | Lines |
|----------|-------------|-------|
| [Development Guide](/docs/07-guides/development-guide.md) | How-to guide for common tasks | ~400 |
| [Quick Reference](/docs/07-guides/quick-reference.md) | Cheat sheet for patterns & imports | ~150 |
| [API Middleware Guide](/docs/07-guides/api-middleware-guide.md) | API middleware patterns | ~950 |
| [Modal Patterns Guide](/docs/07-guides/modal-patterns-guide.md) | Modal creation patterns | ~500 |

### Compliance & Security
| Document | Description | Lines |
|----------|-------------|-------|
| [Compliance Overview](/docs/07-compliance/compliance-overview.md) | PCI DSS, Law 1581, GDPR, SOC 2 | ~600 |
| [DIY Implementation](/docs/07-compliance/diy-implementation-guide.md) | Bootstrap compliance guide | ~800 |

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
// See: /docs/07-guides/development-guide.md#modals
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

**4. Use Formatting Utilities**
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
│  └─ Middleware (Auth, RBAC)                 │
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
- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase Edge Functions
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (JWT)
- **Payments:** Stripe + Stripe Connect
- **Hosting:** Vercel Edge Network
- **Monitoring:** Better Stack (Logtail)

---

## Key Patterns & Standards

### Shared Components
- **Modals:** BaseModal, FormModal, ConfirmationModal
- **Calendars:** AvailabilityCalendar (unified, configurable)
- **Forms:** useModalForm hook for state management
- **API:** useApiMutation hook for API calls

### Custom Hooks
- `useModalForm` - Form state with auto-reset
- `useApiMutation` - API calls with loading/error states
- `useCalendarMonth` - Month navigation
- `useAvailabilityData` - Calendar data fetching
- `useCalendarGrid` - Calendar grid generation

### API Middleware
- `withAuth` - Require authentication
- `withProfessional` / `withCustomer` / `withAdmin` - Role-based
- `requireProfessionalOwnership` - Verify booking ownership
- `ok()` / `created()` - Response helpers

### Code Standards
- TypeScript strict mode
- Zod for validation
- React Server Components where possible
- Client Components only when needed (interactivity)

---

## Testing & Quality

### Test Suite
- **Location:** `/tests`
- **Documentation:** [Test Suite README](/tests/TEST_SUITE_README.md)
- **Coverage:** Components, hooks, API routes, E2E flows

### Mobile App
- **Location:** `/docs/mobile`
- **Setup:** [Mobile Dev Setup](/docs/mobile/dev-setup.md)
- **Release:** [Release Playbook](/docs/mobile/release-playbook.md)

---

## Recent Major Changes

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
- **Documentation:** See `/docs/08-archives/migration-2025-11/SUMMARY.md`

---

## Archive & History

Historical documentation moved to `/docs/08-archives`:
- Sprint summaries (`/docs/08-archives/sprints/`)
- Planning documents (superseded)
- Session notes (`/docs/08-archives/sessions/`)
- Migration history (`/docs/08-archives/migration-2025-11/`)

**Current versions supersede archived docs.**

---

## Support & Contribution

### Getting Help
- **Technical:** Check [Development Guide](/docs/07-guides/development-guide.md)
- **Patterns:** Check [Quick Reference](/docs/07-guides/quick-reference.md)
- **API:** Check [API Reference](/docs/03-technical/api-reference.md)

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

---

## Documentation Statistics

- **Total Documents:** 35+ organized docs
- **Total Lines:** ~13,500 lines
- **Categories:** 8 main categories
- **API Endpoints:** 42 documented
- **Database Tables:** 21 documented
- **Design Components:** 60+ documented

---

**Maintained by:** Casaora Development Team
**Next Review:** Quarterly (Q1 2025)
