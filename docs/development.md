# Casaora - Development Guide

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd casaora

# Install dependencies (using Bun)
bun install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start local Supabase
supabase start

# Apply database migrations
supabase db push

# Run development server
bun dev
```

### Daily Development Commands

```bash
# Start dev server (localhost:3000)
bun dev

# Run linter (Biome)
bun run check

# Auto-fix linting issues
bun run check:fix

# Build for production
bun run build

# Run unit tests
bun test

# Run E2E tests
bun test:e2e

# Type check
bun run type-check
```

---

## Database Management

### Working with Supabase

```bash
# Start local Supabase (Docker required)
supabase start

# Stop local Supabase
supabase stop

# Reset database (WARNING: Destructive!)
supabase db reset

# View database status
supabase status
```

### Creating Migrations

```bash
# Create new migration
supabase migration new <descriptive-name>

# Examples:
supabase migration new add_booking_status_column
supabase migration new create_reviews_table
supabase migration new add_rls_policies

# Apply migrations to local database
supabase db push

# Apply migrations to remote (production)
supabase db push --linked
```

### Migration Best Practices

1. **Descriptive Names:** Use clear, action-oriented names (`add_`, `create_`, `update_`, `drop_`)
2. **Atomic Changes:** One logical change per migration
3. **Reversible:** Include `DOWN` migration when possible
4. **Test Locally:** Always test migrations locally before pushing to production
5. **Backup First:** Create database backup before running migrations on production

**Example Migration:**
```sql
-- Migration: add_booking_status_column
-- Created: 2025-01-17

-- UP Migration
ALTER TABLE bookings
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';

CREATE INDEX idx_bookings_status ON bookings(status);

-- DOWN Migration (if needed)
-- ALTER TABLE bookings DROP COLUMN status;
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Location:** `tests/unit/`

**Run Tests:**
```bash
# Run all unit tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage

# Run specific test file
bun test tests/unit/booking-service.test.ts
```

**Test Structure:**
```typescript
// tests/unit/booking-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createBooking } from '@/lib/services/bookings/booking-creation-service';

describe('Booking Creation Service', () => {
  beforeEach(() => {
    // Setup test data
  });

  it('should create a booking with valid data', async () => {
    const booking = await createBooking({
      professionalId: '123',
      serviceType: 'cleaning',
      date: new Date(),
    });

    expect(booking).toBeDefined();
    expect(booking.status).toBe('pending');
  });

  it('should throw error for invalid professional', async () => {
    await expect(
      createBooking({ professionalId: 'invalid', serviceType: 'cleaning', date: new Date() })
    ).rejects.toThrow('Professional not found');
  });
});
```

**What to Test:**
- Utility functions (`format.ts`, `availability.ts`)
- Business logic in services (`booking-creation-service.ts`)
- API route handlers
- Data transformers and mappers

### E2E Tests (Playwright)

**Location:** `tests/e2e/`

**Run Tests:**
```bash
# Run all E2E tests
bun test:e2e

# Run E2E tests in headed mode (see browser)
bun test:e2e --headed

# Run specific test file
bun test:e2e tests/e2e/booking-flow.spec.ts

# Run with UI mode (interactive debugging)
bun test:e2e --ui
```

**Test Structure:**
```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('user can complete a booking', async ({ page }) => {
    // Navigate to professionals page
    await page.goto('/en/professionals');

    // Search for professional
    await page.fill('[data-testid="search-input"]', 'Cleaning');
    await page.click('[data-testid="search-button"]');

    // Select first professional
    await page.click('[data-testid="professional-card"]:first-child');

    // Fill booking form
    await page.fill('[data-testid="date-input"]', '2025-01-20');
    await page.fill('[data-testid="time-input"]', '10:00');

    // Submit booking
    await page.click('[data-testid="book-now-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

**What to Test:**
- Critical user flows (signup, login, booking)
- Payment integration
- Form submissions
- Navigation flows

### Component Tests (Storybook)

**Location:** `src/components/**/*.stories.tsx`

**Run Storybook:**
```bash
# Start Storybook dev server
bun run storybook

# Build Storybook for production
bun run build-storybook
```

**Story Structure:**
```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Click me',
    variant: 'secondary',
  },
};
```

**What to Test:**
- UI component variations
- Different prop combinations
- Accessibility (aria-labels, keyboard navigation)
- Visual regression

---

## Code Quality Tools

### Biome (Linter & Formatter)

**Configuration:** `biome.json`

**Commands:**
```bash
# Lint all files
bun run check

# Auto-fix linting issues
bun run check:fix

# Lint specific directory
bun run check src/components/

# Format code
bun run format
```

**Key Rules:**
- No `console.log` in production code
- No unused variables
- Consistent import ordering
- Accessibility requirements (a11y)
- Complexity limits (`noExcessiveCognitiveComplexity`)

### TypeScript Type Checking

```bash
# Check types without building
bun run type-check

# Watch mode
bun run type-check --watch
```

---

## Git Workflow

### Branch Naming Conventions

```bash
# Feature branches
git checkout -b feature/booking-calendar
git checkout -b feature/admin-dashboard

# Bug fixes
git checkout -b fix/payment-processing
git checkout -b fix/date-validation

# Hotfixes (critical production fixes)
git checkout -b hotfix/security-patch
git checkout -b hotfix/payment-gateway
```

### Commit Message Format

Follow Conventional Commits:

```bash
# Format: <type>(<scope>): <description>

# Features
git commit -m "feat(booking): add calendar availability view"
git commit -m "feat(admin): add professional verification workflow"

# Bug fixes
git commit -m "fix(payment): handle Stripe webhook timeout"
git commit -m "fix(ui): correct button alignment in mobile view"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Chores (dependencies, config)
git commit -m "chore(deps): update Next.js to 16.0.1"
git commit -m "chore(config): add Biome linting rules"

# Refactoring
git commit -m "refactor(booking): extract availability calculation"

# Tests
git commit -m "test(booking): add unit tests for date validation"

# Performance
git commit -m "perf(api): optimize professional search query"
```

### Pull Request Process

1. **Create Feature Branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Make Changes and Commit:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Push to Remote:**
   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request:**
   - Base: `develop`
   - Title: Same as commit message
   - Description: Explain changes, add screenshots if UI changes

5. **Code Review:**
   - Address reviewer feedback
   - Ensure CI passes (linting, tests, build)

6. **Merge:**
   - Squash and merge to keep history clean
   - Delete feature branch after merge

---

## Release Strategy

### Semantic Versioning

Casaora follows **Semantic Versioning** (SemVer):

- **Patch (v1.0.X):** Bug fixes, security patches → Deploy immediately
- **Minor (v1.X.0):** New features, enhancements → Weekly release (Fridays)
- **Major (vX.0.0):** Breaking changes → Quarterly/planned releases

### Release Schedule

```
Monday-Thursday: Development on 'develop' branch
Friday 4pm: Code freeze and release creation
Friday 5pm: Monitor production deployment
Weekend: Hotfixes only (critical issues)
```

### Creating a Release

**Automated Script:**
```bash
# Weekly release (auto-generates version)
bash scripts/create-release.sh

# Specify version manually
bash scripts/create-release.sh v1.2.0

# Hotfix release (patches current version)
bash scripts/create-release.sh --hotfix
```

**Manual Process:**
```bash
# 1. Update version in package.json
npm version minor  # or patch/major

# 2. Generate changelog
git log --oneline develop...main > CHANGELOG.md

# 3. Merge develop → main
git checkout main
git merge develop

# 4. Create Git tag
git tag -a v1.2.0 -m "Release v1.2.0"

# 5. Push to remote
git push origin main --tags

# 6. Create GitHub Release
gh release create v1.2.0 --generate-notes
```

### Branch Strategy

- **`main`:** Production branch (protected, auto-deploys to Vercel)
- **`develop`:** Integration branch (preview deployments)
- **`feature/*`:** Feature branches (merge to develop)
- **`hotfix/*`:** Emergency fixes (merge to main + develop)

---

## Deployment

### Environment Variables

**Required Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Better Stack (Logging)
LOGTAIL_SOURCE_TOKEN=xxx
```

### Vercel Deployment

**Automatic Deployments:**
- `main` branch → Production (`casaora.com`)
- `develop` branch → Preview (`develop.casaora.com`)
- Pull requests → Ephemeral preview URLs

**Manual Deployment:**
```bash
# Deploy to production (if auto-deploy disabled)
vercel --prod

# Deploy to preview
vercel
```

### Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Type check
bun run type-check

# 2. Lint code
bun run check

# 3. Run tests
bun test

# 4. Build verification
bun run build

# 5. Test production build locally
bun run build && bun start
```

### Skipping Deployments

Use commit prefixes to skip unnecessary deployments:

```bash
# These commits won't trigger deployments
git commit -m "chore: update dependencies [skip deploy]"
git commit -m "docs: update README"
git commit -m "test: add unit tests"
```

Commits prefixed with `chore:`, `docs:`, or `test:` automatically skip deployment.

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
ANALYZE=true bun run build

# Check for duplicate dependencies
bunx npkill

# Update dependencies
bun update
```

### Image Optimization

Always use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Casaora Hero"
  width={1200}
  height={600}
  priority // For above-the-fold images
/>
```

### Code Splitting

Use dynamic imports for heavy components:

```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable server-side rendering if not needed
});
```

---

## Debugging

### Development Tools

**React DevTools:**
- Install browser extension
- Inspect component tree and props
- Profile performance

**Supabase Studio:**
```bash
# Open local Supabase Studio
supabase start
# Visit http://localhost:54323
```

**PostHog:**
- Session recordings for debugging user flows
- Error tracking via Error Boundary integration

### Common Issues

**Issue: "Module not found" after adding new dependency**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
bun install
bun dev
```

**Issue: Database connection errors**
```bash
# Solution: Restart Supabase
supabase stop
supabase start
```

**Issue: TypeScript errors after updating Next.js**
```bash
# Solution: Regenerate types
rm -rf .next
bun run type-check
```

---

## Continuous Integration (CI)

### GitHub Actions

**Workflow:** `.github/workflows/ci.yml`

**CI Pipeline:**
1. Install dependencies
2. Type check (`bun run type-check`)
3. Lint code (`bun run check`)
4. Run unit tests (`bun test`)
5. Build project (`bun run build`)
6. Run E2E tests (`bun test:e2e`)

**Triggered On:**
- Push to `main` or `develop`
- Pull request creation
- Pull request updates

---

## Documentation

### Keeping Documentation Updated

**When to Update Docs:**
- Adding new features or services
- Changing API routes or endpoints
- Modifying database schema
- Updating dependencies
- Changing environment variables

**Documentation Files:**
- `CLAUDE.md` - AI agent guidance (THIS FILE)
- `README.md` - Project overview and quick start
- `docs/architecture.md` - Project structure and architecture
- `docs/development.md` - Development workflow and testing
- `docs/security.md` - Security best practices
- `docs/typography.md` - Lia Design System typography

---

## Support & Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Vitest Docs](https://vitest.dev/guide/)
- [Biome Docs](https://biomejs.dev/)

---

**Last Updated:** 2025-01-17
**Version:** 1.3.0
