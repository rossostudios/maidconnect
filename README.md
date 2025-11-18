# Casaora

> The hybrid household staffing platform for expats in Colombia

**Casaora** is the hybrid household staffing platform for expats in Colombia. We combine **Amara AI** for instant bookings with a **White-Glove Concierge** for permanent placements.

Whether you need a cleaner for tomorrow or a full-time nanny with a legal contract, Casaora provides the vetting, payments, and legal framework to hire with confidence.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-latest-f9f1e1)](https://bun.sh/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Features

### For Customers

- 🤖 **Amara Instant Book** - Chat with our AI to book vetted help in under 2 minutes
- 💼 **Direct Hire Program** - Permanently hire staff with legal contracts & a 30-day replacement guarantee
- 🛡️ **Verified Trust Badges** - See exactly who is ID-checked, background-checked, and interviewed
- 💰 **Transparent Fees** - Clear distinction between hourly booking fees and one-time hiring fees ($299 placement)
- 💬 **English-First Support** - Bilingual contracts and coordinators for seamless communication
- 💳 **Secure Payments** - Integrated Stripe processing for both hourly gigs and placement fees
- ⭐ **Quality Guarantee** - Satisfaction guaranteed with responsive support and 30-day replacement for direct hires
- 🌐 **Bilingual Platform** - Full English and Spanish support throughout

### For Professionals

- 🚀 **Career Ladder** - Start with hourly gigs and graduate to full-time direct employment
- 💯 **Zero Commission** - You keep 100% of your hourly rate; we charge the client
- 🏅 **Profile Badges** - Earn visual distinctions for skills, reliability, and vetting status
- 🔒 **Client Vetting** - We verify families to ensure your safety and respect
- 🗓️ **Smart Calendar** - Manage availability for both instant bookings and long-term interviews
- 💬 **Secure Messaging** - Direct communication with customers and coordinators
- 📊 **Professional Dashboard** - Track earnings, bookings, and career progression

### For Admins

- 👥 **User Management** - Comprehensive admin dashboard for oversight
- 🔒 **Professional Vetting** - Queue system for reviewing and approving professionals
- 📊 **Platform Analytics** - Real-time statistics and performance metrics with PostHog
- 🎫 **Dispute Resolution** - Built-in system for handling customer issues
- 📝 **Content Management** - Integrated CMS for help center and announcements
- 🚨 **Audit Logging** - Complete activity tracking and compliance
- 🧪 **A/B Testing** - Feature flags for gradual rollouts and experiments

---

## 🚀 Quick Start

### Prerequisites

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager (required)
- **PostgreSQL** - Via [Supabase](https://supabase.com/)
- **Stripe Account** - For payment processing

### Installation

```bash
# Clone the repository
git clone https://github.com/rossostudios/casaora.git
cd casaora

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Set up Supabase
supabase start

# Run development server
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
casaora/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes (en/es)
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── dashboard/     # Customer & Pro dashboards
│   │   │   └── api/           # API routes
│   │   └── globals.css        # Global Tailwind styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── admin/             # Admin-specific components
│   │   ├── bookings/          # Booking system components
│   │   └── professionals/     # Professional profiles
│   ├── lib/
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   ├── integrations/      # External services (Stripe, Supabase)
│   │   ├── utils/             # Helper functions
│   │   └── shared/            # Cross-cutting concerns
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── i18n/                  # Internationalization config
├── supabase/
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge functions
├── scripts/                   # Automation scripts
├── docs/
│   └── lia/                   # Lia design system handbook
└── tests/                     # E2E tests (Playwright)
```

---

## 🛠️ Tech Stack

### Core

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router & Turbopack
- **[React 19](https://react.dev/)** - UI library with React Server Components
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Type safety
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

### Styling & UI

- **[Tailwind CSS 4.1](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Aria](https://react-spectrum.adobe.com/react-aria/)** - Accessible UI primitives (migrating from Radix UI)
- **[Radix UI](https://www.radix-ui.com/)** - Component primitives (being phased out)
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[HugeIcons](https://hugeicons.com/)** - Icon library

### Database & Backend

- **[Supabase](https://supabase.com/)** - PostgreSQL database, authentication, storage, realtime
- **[Stripe](https://stripe.com/)** - Payment processing

### State Management & Forms

- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching

### Security

- **[DOMPurify](https://github.com/cure53/DOMPurify)** - HTML sanitization for XSS prevention
- **[Snyk](https://snyk.io/)** - Continuous security scanning and vulnerability detection

### Analytics & Monitoring

- **[PostHog](https://posthog.com/)** - Product analytics, feature flags, and session recording
- **[Better Stack](https://betterstack.com/)** - Application logging and error tracking

### Internationalization

- **[next-intl](https://next-intl-docs.vercel.app/)** - i18n with English & Spanish support

### AI & Content

- **[Anthropic Claude](https://www.anthropic.com/)** - AI assistant (Amara)
- **[Sanity CMS](https://www.sanity.io/)** - Headless CMS for help center

### Developer Tools

- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Playwright](https://playwright.dev/)** - E2E testing
- **[Storybook](https://storybook.js.org/)** - Component development

---

## 🎨 Lia Design System

Casaora's visual language is powered by **Lia**, an Anthropic-inspired design system that balances warmth with precision.

### Design Philosophy

- **Anthropic-Inspired:** Clean, modern aesthetic with thoughtful rounded corners
- **Warm Neutrals:** Cool gray palette (#FAF9F5 to #141413) with excellent contrast
- **Three-Accent System:** Orange (primary), blue (secondary), green (success)
- **Geist Fonts:** Geist Sans for UI, Geist Mono for data/code
- **4px Grid:** Precise spacing system (4, 8, 12, 16, 20, 24, 32, 40, 48px)
- **24px Baseline:** Typography locked to 24px vertical rhythm

### Key Visual Elements

**Border Radius (Anthropic Rounded):**
- `rounded-sm` (4px) - Small elements
- `rounded-md` (8px) - Standard inputs
- `rounded-lg` (12px) - Buttons, cards, inputs (default)
- `rounded-xl` (16px) - Large cards, modals
- `rounded-full` (9999px) - Badges, pills, avatars

**Color Palette:**
- **Orange:** `#D97757` (primary CTA), `#C56847` (hover)
- **Blue:** `#6A9BCC` (info states), `#5A8BBC` (hover)
- **Green:** `#788C5D` (success), `#687C4D` (hover)
- **Neutrals:** `#FAF9F5` (background) to `#141413` (text)

**Accessibility:**
- WCAG AA compliant contrast ratios
- Orange-600 (`#C56847`) for links
- Focus rings with 2px offset
- Keyboard navigation support

### Documentation

Complete design system reference: [docs/lia/](docs/lia/)

---

## 🔧 Development

### Available Scripts

```bash
# Development
bun dev                 # Start dev server with Turbopack
bun build              # Build for production
bun start              # Start production server

# Code Quality
bun run check          # Run Biome linter
bun run check:fix      # Auto-fix linting issues
bun run format         # Format code

# Security
bun run security:scan  # Scan dependencies (Snyk SCA)
bun run security:code  # Scan code (Snyk SAST)

# Testing
bun test               # Run Playwright E2E tests
bun test:ui            # Run tests with UI
bun test:debug         # Debug tests

# Database
supabase start         # Start local Supabase
supabase db push       # Push migrations
supabase db reset      # Reset database

# Deployment
bash scripts/create-release.sh    # Create weekly release
```

### Environment Variables

Create `.env.local` with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Optional: AI Assistant
ANTHROPIC_API_KEY=

# Optional: CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Optional: Monitoring
LOGTAIL_SOURCE_TOKEN=
NEXT_PUBLIC_LOGTAIL_TOKEN=

# Optional: Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Business Logic
NEXT_PUBLIC_DIRECT_HIRE_FEE_AMOUNT=29900  # Cent value (e.g., $299.00 USD)
NEXT_PUBLIC_ENABLE_DIRECT_HIRE=true       # Feature flag for Direct Hire system
```

See [`.env.example`](.env.example) for complete list.

---

## 📦 Release Strategy

Casaora follows a **weekly release schedule**:

### Schedule

- **Monday-Thursday:** Development on `develop` branch
- **Friday 4pm:** Code freeze and release creation
- **Friday 5pm:** Monitor production deployment
- **Weekend:** Hotfixes only (critical issues)

### Creating a Release

```bash
# Automated release (recommended)
git checkout develop
bash scripts/create-release.sh

# Or specify version manually
bash scripts/create-release.sh v1.2.0
```

The script automatically:
1. ✅ Generates changelog from commits
2. ✅ Merges `develop` → `main`
3. ✅ Creates Git tag
4. ✅ Creates GitHub release
5. ✅ Triggers production deployment

### Semantic Versioning

- **Patch (v1.0.X):** Bug fixes, security patches
- **Minor (v1.X.0):** New features, enhancements
- **Major (vX.0.0):** Breaking changes

Release notes are tracked inline in pull requests; the `scripts/create-release.sh` helper keeps this process consistent without an external runbook.

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Next.js App Router + React)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│       (Services in src/lib/)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Data Access Layer           │
│    (Repositories in src/lib/)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       External Services Layer       │
│  (Supabase, Stripe, Sanity, etc.)   │
└─────────────────────────────────────┘
```

### Key Principles

- **Hybrid Booking Engine:** Distinct logic flows for Hourly (Transactional) vs Direct Hire (Escrow/Fee-based) bookings
- **Separation of Concerns:** Clear boundaries between layers
- **Type Safety:** End-to-end TypeScript with strict mode
- **Server Components:** Leverage React Server Components for performance
- **Progressive Enhancement:** Works without JavaScript when possible
- **Accessibility First:** WCAG 2.1 AA compliance with React Aria

---

## 🧪 Testing

### E2E Tests (Playwright)

```bash
bun test                 # Run all tests
bun test:ui             # Interactive mode
bun test:headed         # Headed browser mode
bun test:debug          # Debug mode
```

### Test Coverage Goals

- **Critical paths:** 80%+ coverage
- **Business logic:** 90%+ coverage
- **Utilities:** 95%+ coverage

---

## 🚢 Deployment

### Platforms

- **Production:** [Vercel](https://vercel.com/)
- **Database:** [Supabase Cloud](https://supabase.com/)
- **CMS:** [Sanity Cloud](https://www.sanity.io/)

### CI/CD Pipeline

1. **Pull Request:** Automated checks (lint, type-check, tests)
2. **Merge to `develop`:** Preview deployment
3. **Merge to `main`:** Production deployment
4. **GitHub Release:** Automatic changelog generation

### Deployment Optimization

We've optimized deployment frequency:
- **Before:** ~77 deployments/week (excessive)
- **After:** ~7-10 deployments/week (controlled)
- **Reduction:** 85%+ fewer deployments

**See:** [scripts/README.md](scripts/README.md) for deployment automation.

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI development guide
- **[docs/lia/README.md](docs/lia/README.md)** - Lia design system handbook (tokens, primitives, patterns)
- **[scripts/README.md](scripts/README.md)** - Automation scripts
- **[src/lib/integrations/posthog/IMPLEMENTATION_GUIDE.md](src/lib/integrations/posthog/IMPLEMENTATION_GUIDE.md)** - PostHog analytics guide

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork and clone** the repository
2. **Create a branch** from `develop`: `git checkout -b feature/your-feature`
3. **Make your changes** following our code style
4. **Write tests** for new functionality
5. **Run checks:** `bun run check && bun test`
6. **Create a PR** to `develop` branch

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add booking calendar view
fix: resolve payment processing bug
chore: update dependencies [skip deploy]
docs: improve README
```

### Code Style

- **Linting:** Biome (run `bun run check:fix`)
- **Formatting:** Automatic with Biome
- **TypeScript:** Strict mode enabled
- **Components:** Tailwind CSS only (no CSS-in-JS)

---

## 🔒 Security

### Reporting Vulnerabilities

Please report security vulnerabilities to: **security@casaora.com**

Do not create public GitHub issues for security vulnerabilities.

### Security Measures

- ✅ **XSS Prevention:** HTML sanitization with DOMPurify on all user input
- ✅ **SSRF Prevention:** Server-side URL validation using trusted environment variables
- ✅ **Open Redirect Protection:** URL allowlist validation for external redirects
- ✅ **SQL Injection Prevention:** Parameterized queries and Row Level Security (RLS)
- ✅ **Row Level Security (RLS):** Enabled on all Supabase tables
- ✅ **Rate Limiting:** API endpoint protection with Upstash Redis
- ✅ **Input Validation:** Zod schemas for all API/form inputs
- ✅ **CSRF Protection:** Built-in Next.js CSRF protection
- ✅ **Secure Payments:** PCI compliant via Stripe
- ✅ **Background Checks:** Professional verification system
- ✅ **Continuous Scanning:** Snyk for dependency & code security
- ✅ **Error Monitoring:** Automatic error tracking with PostHog and Better Stack
- ✅ **Privacy-First Analytics:** GDPR-compliant analytics with masked sensitive data

### Security Scanning

We use **Snyk** for automated security monitoring:

```bash
# Scan dependencies for vulnerabilities (SCA)
bun run security:scan

# Scan code for security issues (SAST)
bun run security:code

# View security dashboard
snyk monitor
```

### Secure Development Practices

**Input Sanitization:**
```typescript
import { sanitizeHTML, sanitizeURL } from '@/lib/utils/sanitize';

// Sanitize HTML before rendering
const safeContent = sanitizeHTML(userInput);
<div dangerouslySetInnerHTML={{ __html: safeContent }} />

// Validate URLs before navigation
const safeUrl = sanitizeURL(externalUrl);
<a href={safeUrl}>Safe Link</a>
```

**SSRF Prevention:**
```typescript
// ✅ Use trusted environment variables
const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';
const response = await fetch(`${baseUrl}/api/endpoint`);
```

**Open Redirect Prevention:**
```typescript
// Validate redirect URLs against allowlist
const allowedHosts = ['connect.stripe.com', 'dashboard.stripe.com'];
const url = new URL(redirectUrl);
if (!allowedHosts.includes(url.hostname)) {
  throw new Error('Invalid redirect URL');
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs
- [React Aria](https://react-spectrum.adobe.com/react-aria/) by Adobe
- [PostHog](https://posthog.com/) - Open source product analytics
- [Anthropic Claude](https://www.anthropic.com/) for AI capabilities
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime

---

## 📞 Contact & Support

- **Website:** [casaora.com](https://casaora.com)
- **Email:** support@casaora.com
- **Documentation:** [Lia design system](docs/lia/README.md)
- **Issues:** [GitHub Issues](https://github.com/rossostudios/casaora/issues)

---

## 🗺️ Roadmap

See our [public roadmap](https://github.com/rossostudios/casaora/roadmap) for upcoming features and improvements.

**Current Focus (Q1 2025):**
- ✅ **Product Analytics** - PostHog integration complete (feature flags, session recording, funnels)
- 💎 **Direct Hire System** - Implementation of $299 placement fee, contract generation, and 30-day guarantees
- 🛡️ **Trust & Safety V2** - Visual verification badges and enhanced background check integration
- 🤖 **Amara AI Evolution** - Transitioning from simple chat to full "Instant Booking" intent handling
- 🏗️ **Professional Network** - Scaling the "Top 5%" supply in Medellín
- 📱 **Mobile App** - React Native for iOS and Android (In Progress)
- 🔄 **React Aria Migration** - Better accessibility with React Aria Components (In Progress)

---

<div align="center">

**Built with ❤️ by [Rosso Studios](https://github.com/rossostudios)**

[⬆ Back to Top](#casaora)

</div>
