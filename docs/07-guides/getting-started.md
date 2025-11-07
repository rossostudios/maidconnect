# Getting Started with MaidConnect

**Welcome to the MaidConnect Development Team!**

This guide will help you set up your development environment and get your first contribution merged.

**Estimated Time:** 30-45 minutes

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Understanding the Codebase](#understanding-the-codebase)
- [Your First Task](#your-first-task)
- [Development Workflow](#development-workflow)
- [Common Commands](#common-commands)
- [Getting Help](#getting-help)

---

## Prerequisites

### Required Software

Before you begin, install the following:

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Bun** | 1.1.34+ | Package manager & runtime | [bun.sh](https://bun.sh) |
| **Node.js** | 20+ | JavaScript runtime (fallback) | [nodejs.org](https://nodejs.org) |
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |
| **VS Code** | Latest | Code editor (recommended) | [code.visualstudio.com](https://code.visualstudio.com) |
| **PostgreSQL** | 15+ | Database (local testing) | [postgresql.org](https://postgresql.org) |
| **Supabase CLI** | Latest | Database management | `bun install -g supabase` |
| **Stripe CLI** | Latest | Webhook testing | [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli) |

### Recommended VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "biomejs.biome",              // Linting & formatting
    "bradlc.vscode-tailwindcss",  // Tailwind autocomplete
    "dbaeumer.vscode-eslint",     // TypeScript hints
    "esbenp.prettier-vscode",     // Code formatting
    "supabase.supabase",          // Supabase tools
    "stripe.stripe-vscode"        // Stripe integration
  ]
}
```

### Accounts Needed

You'll need accounts for these services:

- [x] **GitHub** - Source code access
- [x] **Supabase** - Database and auth (free tier)
- [x] **Stripe** - Payments (test mode)
- [x] **Better Stack** - Logging (optional, for production monitoring)
- [x] **Anthropic** - Amara AI (optional, get API key)

---

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-org/maidconnect.git
cd maidconnect

# Create your feature branch
git checkout -b feat/your-feature-name
```

### 2. Install Dependencies

```bash
# Install packages with Bun (recommended)
bun install

# Or use npm if Bun not available
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Open in your editor
code .env.local
```

**Required Environment Variables:**

```bash
# Supabase (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (test mode keys)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App URLs (development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# Cron secret (generate with: openssl rand -base64 32)
CRON_SECRET=your-random-secret
```

**See** [`.env.example`](../../.env.example) **for complete list with descriptions.**

### 4. Start Supabase Locally

```bash
# Start local Supabase instance
supabase start

# This starts:
# - PostgreSQL (localhost:54322)
# - Studio UI (http://localhost:54323)
# - Kong API Gateway (localhost:54321)
# - Realtime server
```

**Important:** Local Supabase runs in Docker. Ensure Docker Desktop is running.

### 5. Run Database Migrations

```bash
# Apply all migrations
supabase db reset

# Verify schema
supabase db diff
```

### 6. Start Development Server

```bash
# Start Next.js dev server
bun run dev

# Or with npm
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

You should see the MaidConnect homepage! 🎉

---

## Understanding the Codebase

### Project Structure

```
maidconnect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes (en, es)
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── dashboard/     # User dashboards
│   │   │   │   ├── customer/  # Customer dashboard
│   │   │   │   └── pro/       # Professional dashboard
│   │   │   └── admin/         # Admin pages
│   │   └── api/               # API routes
│   │       ├── bookings/      # Booking endpoints
│   │       ├── payments/      # Payment endpoints
│   │       ├── messages/      # Messaging endpoints
│   │       └── webhooks/      # Stripe/Checkr webhooks
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── bookings/         # Booking-related components
│   │   ├── professional/     # Professional components
│   │   └── customer/         # Customer components
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase/         # Supabase clients
│   │   ├── stripe/           # Stripe integration
│   │   ├── api/              # API middleware
│   │   └── utils/            # Utility functions
│   ├── types/                 # TypeScript types
│   │   ├── supabase.ts       # Generated DB types
│   │   └── index.ts          # Custom types
│   └── i18n/                  # Internationalization
│       ├── en.json           # English translations
│       └── es.json           # Spanish translations
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── functions/             # Edge functions
├── public/                    # Static assets
├── docs/                      # Documentation
├── tests/                     # Playwright tests
├── proxy.ts                   # Request proxy (auth/routing)
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
├── biome.json                 # Biome (linter) config
└── package.json               # Dependencies
```

### Tech Stack

**Core Technologies:**
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Bun** - Package manager and runtime

**Backend & Database:**
- **Supabase** - PostgreSQL database, auth, storage, realtime
- **Stripe** - Payment processing (destination charges)
- **Resend** - Transactional emails

**State & Validation:**
- **React Query** - Server state management
- **Zod** - Schema validation
- **React Hook Form** - Form handling

**Development Tools:**
- **Biome** - Fast linter and formatter (100x faster than ESLint)
- **Playwright** - End-to-end testing
- **Better Stack (Logtail)** - Logging and monitoring

### Key Concepts

#### 1. Internationalization (i18n)

MaidConnect supports English and Spanish with automatic geolocation detection:

```typescript
// Route structure: /[locale]/page
// Examples:
// - /en/dashboard/customer
// - /es/dashboard/customer

// Use translations in components
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('bookings');

  return <h1>{t('title')}</h1>; // Auto-translates
}
```

**Spanish-first for Colombian market** - Default locale is Spanish (es-CO).

#### 2. Role-Based Access Control (RBAC)

Three user roles with distinct permissions:

| Role | Access | Dashboard |
|------|--------|-----------|
| `customer` | Book services, manage bookings | `/dashboard/customer` |
| `professional` | Accept bookings, manage availability | `/dashboard/pro` |
| `admin` | Full platform access | `/admin` |

**Enforced at multiple levels:**
- Route level ([`proxy.ts`](../../proxy.ts))
- API level (middleware in [`src/lib/api`](../../src/lib/api))
- Database level (Row Level Security policies)

#### 3. Server Components vs Client Components

Next.js 16 defaults to Server Components. Only add `'use client'` when needed:

```typescript
// ✅ Server Component (default) - No directive needed
export default async function BookingsPage() {
  const bookings = await getBookings(); // Direct DB access
  return <BookingList bookings={bookings} />;
}

// ✅ Client Component - Required for interactivity
'use client';

export function BookingCard({ booking }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return <Card onClick={() => setIsExpanded(!isExpanded)}>...</Card>;
}
```

#### 4. Database Access Patterns

Three Supabase clients for different contexts:

```typescript
// Server-side (Server Components, Server Actions)
import { createClient } from '@/lib/supabase/server-client';
const supabase = await createClient();

// Client-side (Client Components)
import { createClient } from '@/lib/supabase/browser-client';
const supabase = createClient();

// Admin operations (bypasses RLS - use with caution)
import { createAdminClient } from '@/lib/supabase/admin-client';
const supabaseAdmin = createAdminClient();
```

**See:** [Authentication Guide](../03-technical/authentication.md)

---

## Your First Task

Let's make a small contribution to get familiar with the workflow!

### Task: Add a New Translation String

**Goal:** Add a welcome message to the customer dashboard

**Steps:**

1. **Find the translation files:**
   ```bash
   code src/i18n/en.json
   code src/i18n/es.json
   ```

2. **Add your translation:**
   ```json
   // en.json
   {
     "dashboard": {
       "customer": {
         "welcome": "Welcome back, {name}!"
       }
     }
   }

   // es.json
   {
     "dashboard": {
       "customer": {
         "welcome": "¡Bienvenido de nuevo, {name}!"
       }
     }
   }
   ```

3. **Use it in a component:**
   ```typescript
   // src/app/[locale]/dashboard/customer/page.tsx
   import { useTranslations } from 'next-intl';

   export default function CustomerDashboard() {
     const t = useTranslations('dashboard.customer');
     const userName = 'John'; // Replace with actual user data

     return <h1>{t('welcome', { name: userName })}</h1>;
   }
   ```

4. **Test it:**
   ```bash
   # Visit http://localhost:3000/en/dashboard/customer
   # Should show: "Welcome back, John!"

   # Visit http://localhost:3000/es/dashboard/customer
   # Should show: "¡Bienvenido de nuevo, John!"
   ```

5. **Run quality checks:**
   ```bash
   # Format and lint
   bun run check:fix

   # Build to check for errors
   bun run build
   ```

6. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat(i18n): add customer dashboard welcome message"
   ```

**Congratulations!** You've made your first contribution. 🎉

---

## Development Workflow

### Standard Git Workflow

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feat/your-feature-name

# 2. Make your changes
code .

# 3. Run quality checks
bun run check:fix  # Format and lint
bun run build      # Check for build errors

# 4. Commit changes (conventional commits)
git add .
git commit -m "feat(scope): description"

# 5. Push to GitHub
git push origin feat/your-feature-name

# 6. Create Pull Request
# Use GitHub UI or: gh pr create --title "..." --body "..."

# 7. Address review feedback
# Make changes, commit, push

# 8. Merge after approval
# Squash merge recommended
```

### Commit Message Format

**Use Conventional Commits:**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Add/update tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(bookings): add cancellation flow
fix(auth): correct session refresh logic
docs(readme): update setup instructions
refactor(api): extract auth middleware
```

### Code Quality Checklist

Before committing, ensure:

- [x] **TypeScript:** No type errors (`bun run build`)
- [x] **Linting:** Passes Biome checks (`bun run check`)
- [x] **Formatting:** Code formatted (`bun run check:fix`)
- [x] **Tests:** All tests passing (`bun test`)
- [x] **i18n:** Translation strings added for both en/es
- [x] **Security:** No hardcoded secrets or API keys
- [x] **RLS:** Database changes include RLS policies

---

## Common Commands

### Development

```bash
# Start dev server
bun run dev

# Start with specific port
bun run dev -- -p 3001

# Build for production
bun run build

# Start production server
bun run start
```

### Code Quality

```bash
# Run linter
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Run both lint and format
bun run check:fix
```

### Testing

```bash
# Run all tests
bun test

# Run tests in UI mode
bun test:ui

# Run tests in headed mode (see browser)
bun test:headed

# Debug tests
bun test:debug
```

### Database

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (re-run all migrations)
supabase db reset

# Create new migration
supabase migration new your_migration_name

# Check for schema drift
supabase db diff

# Generate TypeScript types from database
supabase gen types typescript --local > src/types/supabase.ts
```

### Stripe Webhooks (Local Testing)

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

---

## Getting Help

### Documentation

- **[Quick Reference](./quick-reference.md)** - Cheat sheet for common tasks
- **[Development Guide](./development-guide.md)** - How-to examples
- **[API Reference](../03-technical/api-reference.md)** - API documentation
- **[Database Schema](../03-technical/database-schema.md)** - Database structure
- **[Authentication Guide](../03-technical/authentication.md)** - Auth patterns

### Troubleshooting

**Common Issues:**

**1. "Module not found" errors**
```bash
# Clean install
rm -rf node_modules .next
bun install
bun run dev
```

**2. Database connection errors**
```bash
# Restart Supabase
supabase stop
supabase start

# Check status
supabase status
```

**3. TypeScript errors after DB changes**
```bash
# Regenerate types
supabase gen types typescript --local > src/types/supabase.ts
```

**4. Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
bun run dev -- -p 3001
```

### Getting Support

**Questions? Here's where to ask:**

1. **Check Documentation First** - Most answers are in the docs
2. **GitHub Issues** - Bug reports and feature requests
3. **Team Chat** - Quick questions (Slack/Discord)
4. **Code Review** - Ask in your PR for code-specific questions
5. **Pair Programming** - Schedule with senior dev for complex tasks

### Useful Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Stripe API Reference](https://stripe.com/docs/api)

---

## Next Steps

Now that you're set up, here's what to do next:

### 1. Explore the Codebase

- [ ] Browse the project structure
- [ ] Read the [Architecture Documentation](../01-architecture/system-architecture.md)
- [ ] Review [Coding Standards](../03-technical/coding-standards.md)
- [ ] Understand [Database Schema](../03-technical/database-schema.md)

### 2. Build Something Small

- [ ] Pick a "good first issue" from GitHub
- [ ] Add a new component or feature
- [ ] Write a test for existing functionality
- [ ] Improve documentation

### 3. Learn the Patterns

- [ ] Study [API Middleware Guide](./api-middleware-guide.md)
- [ ] Review [Modal Patterns](./modal-patterns-guide.md)
- [ ] Understand [Form Validation](./development-guide.md#form-validation)
- [ ] Learn [Error Handling](./development-guide.md#error-handling)

### 4. Contribute Regularly

- [ ] Make your first Pull Request
- [ ] Review other developers' PRs
- [ ] Participate in code reviews
- [ ] Share knowledge with the team

---

## Welcome to the Team!

We're excited to have you contributing to MaidConnect. If you have any questions or need help, don't hesitate to ask. Happy coding! 🚀

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
