# Casaora Documentation

Welcome to Casaora documentation. This guide provides comprehensive information about the platform's features, architecture, development, operations, and compliance.

**📖 Start Here:** [Documentation Index](./00-start/documentation-index.md) - Complete navigation and single source of truth

---

## Quick Start

### New Developers
1. **[Getting Started](./07-guides/getting-started.md)** - First steps for new developers
2. **[Local Development Setup](./07-guides/local-development-setup.md)** - Complete environment setup
3. **[Architecture Overview](./03-technical/architecture.md)** - System design and tech stack
4. **[Database Schema](./03-technical/database-schema.md)** - All 21 tables and RLS policies
5. **[Development Guide](./07-guides/development-guide.md)** - Common development tasks
6. **[Quick Reference](./07-guides/quick-reference.md)** - Cheat sheet for patterns

### Designers
1. **[Design System](./02-design/design-system.md)** - Complete design tokens and patterns
2. **[Component Library](./02-design/component-library.md)** - All 23+ UI components API reference
3. **[Motion Guidelines](./02-design/motion-guidelines.md)** - Animation best practices
4. **[Branding Guidelines](./02-design/branding-guidelines-2025.md)** - Visual identity and logo usage

### Product/Business
1. **[Product Requirements](./01-product/prd.md)** - Product vision and features
2. **[User Stories](./01-product/user-stories.md)** - Detailed user stories
3. **[Operations Manual](./01-product/operations-manual.md)** - Day-to-day procedures
4. **[Changelog](./00-start/changelog.md)** - Version history

### DevOps & Operations
1. **[Deployment Guide](./05-deployment/deployment-guide.md)** - Vercel deployment process
2. **[CI/CD Pipeline](./05-deployment/ci-cd.md)** - Automated testing and deployment
3. **[Monitoring](./06-operations/monitoring.md)** - Better Stack logs and alerts
4. **[Incident Response](./06-operations/incident-response.md)** - SEV classification and procedures
5. **[On-Call Runbook](./06-operations/on-call-runbook.md)** - First response procedures

### Compliance & Legal
1. **[Compliance Overview](./07-compliance/compliance-overview.md)** - PCI DSS, GDPR, Law 1581
2. **[Privacy Policy](./07-compliance/privacy-policy.md)** - GDPR + Colombian Law 1581 compliant
3. **[Terms of Service](./07-compliance/terms-of-service.md)** - Legal terms
4. **[Cookie Policy](./07-compliance/cookie-policy.md)** - Cookie usage and consent

---

## Documentation Structure

### [📝 00 - Start](./00-start/)
Meta documentation and getting started guides.

- **[Documentation Index](./00-start/documentation-index.md)** - Complete navigation (v3.0)
- **[README](./00-start/readme.md)** - Introduction to documentation
- **[Changelog](./00-start/changelog.md)** - Project version history
- **[Glossary](./00-start/glossary.md)** - Common terms and definitions
- **[Docs Style Guide](./00-start/docs-style-guide.md)** - Documentation writing standards
- **[ADR Template](./00-start/adr-template.md)** - Architecture decision template

### [🎯 01 - Product](./01-product/)
Product vision, operations, and user stories.

- **[Product Requirements Document](./01-product/prd.md)** - Product vision, features, revenue model (~800 lines)
- **[Operations Manual](./01-product/operations-manual.md)** - Operational procedures (~400 lines)
- **[User Stories](./01-product/user-stories.md)** - User stories with acceptance criteria (~600 lines)

### [📐 01 - Decisions](./01-decisions/)
Architecture Decision Records (ADRs) - 10 documented decisions.

- Why Next.js 16, Supabase, Stripe Connect, Tailwind CSS 4.1, Bun, Biome, Better Stack, Motion One, etc.
- See: [Documentation Index](./00-start/documentation-index.md#architecture-decision-records)

### [🎨 02 - Design](./02-design/)
Complete design system and brand guidelines.

- **[Design System](./02-design/design-system.md)** - Colors, typography, spacing, components (~1,045 lines)
- **[Component Library](./02-design/component-library.md)** - API reference for all 23+ UI components (~800 lines)
- **[Motion Guidelines](./02-design/motion-guidelines.md)** - Animation patterns using Motion One (~711 lines)
- **[Branding Guidelines 2025](./02-design/branding-guidelines-2025.md)** - Visual identity, logo usage (~630 lines)

### [🔧 03 - Technical](./03-technical/)
Architecture, API, database, and implementation guides.

**Core Documentation:**
- **[Architecture Overview](./03-technical/architecture.md)** - System architecture and data flow (~800 lines)
- **[Database Schema](./03-technical/database-schema.md)** - 21 tables, RLS policies, indexes (~900 lines)
- **[API Reference](./03-technical/api-reference.md)** - All 42 API endpoints documented (~1,200 lines)
- **[Authentication](./03-technical/authentication.md)** - Supabase auth, sessions, RLS (~600 lines)
- **[Webhooks](./03-technical/webhooks.md)** - Stripe webhooks and event handling (~500 lines)
- **[API Middleware](./03-technical/api-middleware.md)** - Auth helpers and validation (~400 lines)
- **[Coding Standards](./03-technical/coding-standards.md)** - TypeScript/React/Tailwind conventions (~200 lines)
- **[API Guidelines](./03-technical/api-guidelines.md)** - API route patterns and security (~200 lines)

**Specialized Guides:**
- **[Modal Patterns](./03-technical/modal-patterns.md)** - Reusable modal components (~400 lines)
- **[Auth & Tenant Model](./03-technical/auth-tenant-model.md)** - Multi-tenant authentication (~400 lines)
- **[Feature Flags](./03-technical/feature-flags.md)** - Feature flag implementation (~300 lines)
- **[Next.js 16 Features](./03-technical/nextjs-16-features.md)** - Migration guide (~300 lines)
- **[React 19 Implementation](./03-technical/react-19-implementation.md)** - React 19 patterns (~400 lines)
- **[React 19 Memoization](./03-technical/react-19-memoization-guide.md)** - Performance optimization (~300 lines)

### [✨ 04 - Features](./04-features/)
Comprehensive feature-specific implementations (11 feature docs).

- **[Amara AI Assistant](./04-features/amara-ai-assistant.md)** - AI chatbot with Claude (~400 lines)
- **[Availability Management](./04-features/availability-management.md)** - Professional scheduling (~500 lines)
- **[Booking Lifecycle](./04-features/booking-lifecycle.md)** - Complete booking flow (~600 lines)
- **[Changelog & Feedback System](./04-features/changelog-feedback-system.md)** - User feedback (~350 lines)
- **[Dashboard Integration](./04-features/dashboard-integration.md)** - Multi-role dashboards (~450 lines)
- **[Help Center](./04-features/help-center.md)** - Bilingual knowledge base (~300 lines)
- **[Messaging & Translation](./04-features/messaging-translation.md)** - Chat with EN↔ES translation (~550 lines)
- **[Payment System](./04-features/payment-system.md)** - Stripe integration, payouts (~700 lines)
- **[Professional Onboarding](./04-features/professional-onboarding.md)** - Verification flow (~500 lines)
- **[Reviews & Ratings](./04-features/reviews-ratings.md)** - Review system and moderation (~450 lines)
- **[Trust & Safety](./04-features/trust-safety.md)** - Background checks, verification (~550 lines)

### [🚀 05 - Deployment](./05-deployment/)
Production deployment guides and checklists.

- **[Deployment Guide](./05-deployment/deployment-guide.md)** - Step-by-step Vercel deployment (~500 lines)
- **[Pre-Deploy Checklist](./05-deployment/pre-deploy-checklist.md)** - Must-do items before launch (~300 lines)
- **[Environments](./05-deployment/environments.md)** - Local/preview/prod configuration (~400 lines)
- **[Release Playbook](./05-deployment/release-playbook.md)** - Safe release procedures (~883 lines)
- **[CI/CD Pipeline](./05-deployment/ci-cd.md)** - Automated testing and deployment (~860 lines)
- **[Supabase Cron Setup](./05-deployment/supabase-cron-setup.md)** - Scheduled jobs (~200 lines)

### [🔄 06 - Operations](./06-operations/)
Production-ready operations and monitoring.

- **[Monitoring](./06-operations/monitoring.md)** - Better Stack logs, alerts, dashboards (~600 lines)
- **[Performance Monitoring](./06-operations/performance-monitoring.md)** - Web Vitals tracking (~500 lines)
- **[Security Best Practices](./06-operations/security-best-practices.md)** - Rate limiting, CSP, CSRF (~700 lines)
- **[Incident Response](./06-operations/incident-response.md)** - SEV classification, triage (~995 lines)
- **[On-Call Runbook](./06-operations/on-call-runbook.md)** - First response procedures (~879 lines)

### [⚖️ 07 - Compliance](./07-compliance/)
Complete legal and compliance documentation (8 docs).

- **[Compliance Overview](./07-compliance/compliance-overview.md)** - PCI DSS, GDPR, Law 1581 overview (~600 lines)
- **[DIY Implementation Guide](./07-compliance/diy-implementation-guide.md)** - Bootstrap compliance (~800 lines)
- **[Privacy Policy](./07-compliance/privacy-policy.md)** - GDPR + Colombian Law 1581 (~850 lines)
- **[Terms of Service](./07-compliance/terms-of-service.md)** - Legal terms for platform (~900 lines)
- **[Cookie Policy](./07-compliance/cookie-policy.md)** - Cookie usage and consent (~440 lines)
- **[Data Processing Agreement](./07-compliance/data-processing-agreement.md)** - GDPR DPA (~650 lines)
- **[GDPR Compliance Guide](./07-compliance/gdpr-compliance-guide.md)** - Detailed GDPR guide (~1,200 lines)
- **[Colombian Law 1581 Guide](./07-compliance/colombian-law-1581-compliance-guide.md)** - Colombian compliance (~1,100 lines)

### [📚 07 - Guides](./07-guides/)
Developer onboarding and how-to guides.

- **[Getting Started](./07-guides/getting-started.md)** - First steps for new developers (~400 lines)
- **[Local Development Setup](./07-guides/local-development-setup.md)** - Complete environment setup (~500 lines)
- **[Development Guide](./07-guides/development-guide.md)** - Common development tasks (~400 lines)
- **[Contributing](./07-guides/contributing.md)** - Contribution guidelines (~350 lines)
- **[Code Review Checklist](./07-guides/code-review-checklist.md)** - PR review guidelines (~300 lines)
- **[Quick Reference](./07-guides/quick-reference.md)** - Cheat sheet for patterns (~150 lines)
- **[API Middleware Guide](./07-guides/api-middleware-guide.md)** - Middleware usage patterns (~950 lines)
- **[Modal Patterns Guide](./07-guides/modal-patterns-guide.md)** - Modal creation patterns (~500 lines)

### [📦 08 - Archives](./08-archives/)
Historical documentation and migration guides.

**Sessions & Sprints:**
- Sprint summaries and planning documents
- Session notes from major development phases

**Implementation History:**
- Modal refactor documentation
- API middleware migration
- Calendar consolidation details

### [📱 Mobile](./mobile/)
Mobile app documentation (React Native).

- **[Mobile App Overview](./mobile/MOBILE_APP_COMPLETE_OVERVIEW.md)** - Complete mobile documentation
- **[Mobile Dev Setup](./mobile/dev-setup.md)** - React Native development environment
- **[Mobile Release Playbook](./mobile/release-playbook.md)** - App Store and Play Store releases
- **[Notifications](./mobile/notifications.md)** - Push notifications implementation
- **[User Flow](./mobile/USER_FLOW.md)** - Mobile app user journeys

---

## Key Highlights

### Documentation Sprint (November 2025)

**Comprehensive Documentation Coverage:**
- **114 markdown files** documenting all platform areas
- **35,000+ lines** of comprehensive documentation
- **9 main categories** organized for easy navigation
- **Phases 3-8 completed:** Features, Technical, Guides, Operations, Compliance, Design

**What Was Created:**
- 11 comprehensive feature documentation files
- Complete compliance & legal documentation (8 docs)
- Production-ready operations runbooks (5 docs)
- Enhanced design system documentation (4 docs)
- Developer onboarding guides (8 guides)
- Updated API and technical references

### Shared Component Architecture (November 2025)

**API Middleware System:**
- 48% average code reduction across 68+ routes
- Eliminated ~3,600 lines of duplicate code
- Centralized authentication, authorization, and error handling
- See [API Middleware Guide](./03-technical/api-middleware.md)

**Modal Component Patterns:**
- Consolidated 9 modal implementations
- 84% fewer hooks (45 → 7)
- Reusable hooks for state management
- Built-in accessibility features
- See [Modal Patterns Guide](./03-technical/modal-patterns.md)

**Calendar Consolidation:**
- 6 duplicate calendars → 1 unified component
- 33% code reduction (1,469 → 981 lines)
- Highly configurable with size/theme variants

### Core Documentation

**Design System:**
- 1,045 lines documenting colors, typography, spacing, components
- 23+ fully documented UI components with API reference
- Complete motion guidelines using Motion One
- Tailwind CSS 4.1 utility-first approach

**API Reference:**
- 42 endpoints fully documented
- Request/response examples
- Authentication and authorization patterns
- Error handling guidelines

**Database Schema:**
- 21 tables documented with relationships
- 300+ columns with detailed descriptions
- 70+ performance indexes
- Complete RLS policies for security
- JSONB field structures

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

## Tech Stack Reference

### Frontend
- **Framework:** Next.js 16 with App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1
- **Animations:** Motion One
- **Icons:** Hugeicons React
- **Components:** Radix UI primitives
- **Type Safety:** TypeScript 5 (strict mode)

### Backend
- **API:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (JWT + RLS)
- **Payments:** Stripe + Stripe Connect
- **Storage:** Supabase Storage
- **Edge Functions:** Supabase Edge Functions

### Infrastructure
- **Hosting:** Vercel Edge Network
- **Package Manager:** Bun
- **Linting:** Biome
- **Monitoring:** Better Stack (Logtail)
- **Rate Limiting:** Upstash Redis
- **CI/CD:** GitHub Actions + Vercel

---

## External Resources

### Platform Services
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Better Stack Logs](https://logs.betterstack.com/)
- [Upstash Console](https://console.upstash.com/)

### Official Documentation
- [Next.js 16](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Tailwind CSS 4.1](https://tailwindcss.com/docs)
- [Motion One](https://motion.dev/)

### Compliance Resources
- [Colombian Law 1581](https://www.sic.gov.co/tema/proteccion-de-datos-personales)
- [GDPR Official Site](https://gdpr.eu/)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## Support & Contributing

### Getting Help
- **New Developer?** Start with [Getting Started](./07-guides/getting-started.md)
- **Technical Question?** Check [Development Guide](./07-guides/development-guide.md)
- **Quick Pattern?** See [Quick Reference](./07-guides/quick-reference.md)
- **API Question?** Check [API Reference](./03-technical/api-reference.md)
- **Design Question?** Check [Component Library](./02-design/component-library.md)

### Contributing
1. Read [Contributing Guide](./07-guides/contributing.md)
2. Review [Code Review Checklist](./07-guides/code-review-checklist.md)
3. Follow [Coding Standards](./03-technical/coding-standards.md)
4. Use [Docs Style Guide](./00-start/docs-style-guide.md) for documentation

### Documentation Issues
1. Check if document is archived (may be outdated)
2. Search for updated version in [Documentation Index](./00-start/documentation-index.md)
3. Create GitHub issue with `documentation` label

---

## Changelog

### November 2025 - Documentation Sprint & Refactoring
- **Documentation Phases 3-8:** Complete platform documentation (114 files)
- Feature documentation (11 comprehensive guides)
- Compliance & legal documentation (8 documents)
- Operations runbooks (5 playbooks)
- Design system enhancements (Component Library, Motion Guidelines)
- Developer onboarding guides (Getting Started, Setup, Contributing)
- Updated Documentation Index to v3.0

### November 2025 - Component Architecture
- Created API middleware system documentation
- Created modal patterns guide
- Consolidated duplicate modal docs
- Created utilities documentation
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

**Documentation Version:** 3.0
**Last Updated:** November 6, 2025
**Maintained by:** Casaora Development Team
**Next Review:** Q1 2026
