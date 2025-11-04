# Casaora Documentation

Welcome to Casaora documentation. This guide provides comprehensive information about the platform's features, architecture, development, and operations.

## Quick Navigation

### For Developers
1. [Architecture Overview](./03-technical/architecture.md)
2. [Database Schema](./03-technical/database-schema.md)
3. [API Middleware](./03-technical/api-middleware.md)
4. [Modal Patterns](./03-technical/modal-patterns.md)
5. [Deployment Guide](./05-deployment/deployment-guide.md)

### For Designers
1. [Design System](./02-design/design-system.md)
2. [Product Requirements](./01-product/prd.md)
3. [User Stories](./01-product/user-stories.md)

### For Product/Operations
1. [PRD](./01-product/prd.md)
2. [Operations Manual](./01-product/operations-manual.md)
3. [Monitoring](./06-operations/monitoring.md)

---

## Documentation Structure

### [01 - Product](./01-product/)
Product vision, operations, and user stories.

- **[Product Requirements Document](./01-product/prd.md)** - Product vision, features, target users, revenue model
- **[Operations Manual](./01-product/operations-manual.md)** - Operational procedures, onboarding, dispute resolution
- **[User Stories](./01-product/user-stories.md)** - User stories with acceptance criteria

### [02 - Design](./02-design/)
Design system and UI components.

- **[Design System](./02-design/design-system.md)** - Colors, typography, spacing, components (1,002 lines)

### [03 - Technical](./03-technical/)
Architecture, implementation guides, and utilities.

**Core Documentation:**
- **[Architecture Overview](./03-technical/architecture.md)** - System architecture, components, data flow
- **[Database Schema](./03-technical/database-schema.md)** - 21 tables, RLS policies, functions
- **[API Reference](./03-technical/api-reference.md)** - 42 API endpoints documented
- **[API Middleware](./03-technical/api-middleware.md)** - Authentication, authorization, error handling (NEW)
- **[Modal Patterns](./03-technical/modal-patterns.md)** - Reusable modal components and hooks (NEW)

**Specialized Guides:**
- **[Auth & Tenant Model](./03-technical/auth-tenant-model.md)** - Multi-tenant authentication
- **[Feature Flags](./03-technical/feature-flags.md)** - Feature flag implementation
- **[Next.js 16 Features](./03-technical/nextjs-16-features.md)** - Next.js 16 migration guide
- **[React 19 Implementation](./03-technical/react-19-implementation.md)** - React 19 hooks implementation
- **[React 19 Memoization](./03-technical/react-19-memoization-guide.md)** - Performance optimization

**Utilities:**
- **[Utilities Overview](./03-technical/utilities/README.md)** - Centralized utility functions (NEW)
- **[Formatting Utilities](./03-technical/utilities/formatting-utilities.md)** - Currency, date, time formatting

### [04 - Features](./04-features/)
Feature-specific implementations.

- **[Dashboard Integration](./04-features/dashboard-integration.md)** - Dashboard features
- **[Professional Onboarding](./04-features/professional-onboarding.md)** - Onboarding flow
- **[Changelog & Feedback](./04-features/changelog-feedback-system.md)** - User feedback system

### [05 - Deployment](./05-deployment/)
Deployment guides and checklists.

- **[Deployment Guide](./05-deployment/deployment-guide.md)** - Vercel deployment
- **[Pre-Deploy Checklist](./05-deployment/pre-deploy-checklist.md)** - Pre-launch checklist
- **[Supabase Cron Setup](./05-deployment/supabase-cron-setup.md)** - Scheduled jobs

### [06 - Operations](./06-operations/)
Monitoring, security, and operations.

- **[Monitoring & Logging](./06-operations/monitoring.md)** - Better Stack & Supabase logging
- **[Security Best Practices](./06-operations/security-best-practices.md)** - Rate limiting, CSP, auth security
- **[Performance Monitoring](./06-operations/performance-monitoring.md)** - Web Vitals optimization

### [07 - Compliance](./07-compliance/)
Legal compliance and security.

- **[Compliance Overview](./07-compliance/compliance-overview.md)** - PCI DSS, Law 1581, GDPR, OWASP
- **[DIY Implementation](./07-compliance/diy-implementation-guide.md)** - Bootstrap compliance guide

### [08 - Archives](./08-archives/)
Historical documentation and migration guides.

**Sessions & Sprints:**
- Week 0 Day 2 session summary
- Weeks 1-2 session summary
- Sprint 4 Phase 1 & 2 summaries

**Planning (Historical):**
- Game plan 2025-01 (60-90 day roadmap)
- High-priority UX plan
- Product pages plan
- Various React 19 and optimization plans

**Migration Guides (November 2025):**
- Modal refactor documentation (MODAL_*)
- API middleware migration (API_*)
- Calendar API reference
- Before/after comparisons

### [Mobile](./mobile/)
Mobile app documentation.

- **[Setup](./mobile/dev-setup.md)** - Development environment
- **[Notifications](./mobile/notifications.md)** - Push notifications
- **[Release Playbook](./mobile/release-playbook.md)** - Release process

---

## Key Highlights

### Recent Improvements (November 2025)

**API Middleware System:**
- 48% average code reduction across 68+ routes
- Eliminated ~3,600 lines of duplicate code
- Centralized authentication, authorization, and error handling
- See [API Middleware Guide](./03-technical/api-middleware.md)

**Modal Component Patterns:**
- Consolidated 9 modal implementations
- 35% average code reduction per modal
- Reusable hooks for state management
- Built-in accessibility features
- See [Modal Patterns Guide](./03-technical/modal-patterns.md)

**Formatting Utilities:**
- Replaced duplicated formatting in 47+ files
- Centralized currency, date, time formatting
- Null-safe with TypeScript support
- See [Utilities Overview](./03-technical/utilities/README.md)

### Core Documentation

**Design System (29KB, 1,002 lines):**
- 60+ colors with usage guidelines
- Complete component library
- Accessibility patterns

**API Reference (42 endpoints):**
- Authentication & account management
- Bookings lifecycle
- Payments & payouts
- Admin operations

**Database Schema (21 tables):**
- 300+ columns documented
- 70+ performance indexes
- RLS policies for security
- JSONB field structures

---

## Documentation Statistics

- **Total Documents**: 38 organized docs + 20+ archived
- **Core Categories**: 8 main categories
- **API Endpoints**: 42 documented
- **Database Tables**: 21 documented
- **Design Components**: 60+ documented

---

## External Resources

### Platform Services
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Better Stack Logs](https://logs.betterstack.com/)
- [Upstash Console](https://console.upstash.com/)

### Official Documentation
- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Compliance
- [Colombian Law 1581](https://www.sic.gov.co/tema/proteccion-de-datos-personales)
- [PCI DSS](https://www.pcisecuritystandards.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## Support

### Documentation Issues
1. Check if document is archived (may be outdated)
2. Search for updated version in main categories
3. Create GitHub issue with `documentation` label

### Questions
- **Technical**: #dev channel
- **Product**: #product channel
- **Operations**: #ops channel
- **Compliance**: Legal team

---

## Changelog

### November 2025 - Refactoring & Consolidation
- Created API middleware system documentation
- Created modal patterns guide
- Created utilities documentation
- Consolidated duplicate modal docs
- Moved migration guides to archives
- Reduced documentation verbosity by ~50%

### January 2025 - Major Reorganization
- Created organized folder structure
- Created design system documentation
- Created API reference
- Created database schema documentation
- Consolidated duplicate documents
- Archived historical documents

---

**Documentation Version**: 2.0.0
**Last Updated**: November 2025
**Maintained by**: Casaora Development Team
