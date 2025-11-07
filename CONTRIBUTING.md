# Contributing to MaidConnect

**Thank you for your interest in contributing to MaidConnect!**

This guide will help you understand how to contribute effectively to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Contributing Code](#contributing-code)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Documentation](#documentation)
- [Testing Requirements](#testing-requirements)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting comments, or personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of unacceptable behavior may be reported to the project team at [conduct@casaora.co](mailto:conduct@casaora.co). All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Completed Setup:**
   - [x] Read [Getting Started Guide](docs/07-guides/getting-started.md)
   - [x] Followed [Local Development Setup](docs/07-guides/local-development-setup.md)
   - [x] Have a working local environment

2. **Reviewed Documentation:**
   - [x] [Development Guide](docs/07-guides/development-guide.md) - Common patterns
   - [x] [API Reference](docs/03-technical/api-reference.md) - API documentation
   - [x] [Database Schema](docs/03-technical/database-schema.md) - Database structure
   - [x] [CLAUDE.md](CLAUDE.md) - Project rules and best practices

3. **Signed CLA (if applicable):**
   - [x] Contributor License Agreement (for external contributors)

---

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**

1. **Check existing issues** - Search [GitHub Issues](https://github.com/your-org/maidconnect/issues) to see if it's already reported
2. **Verify it's a bug** - Ensure it's not a feature request or usage question
3. **Test on latest version** - Pull latest `main` branch and verify bug still exists

**How to submit a good bug report:**

Use the bug report template and include:

```markdown
## Description
Clear description of what the bug is

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g., macOS 14.1]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.10.0]
- Bun version: [e.g., 1.1.34]

## Additional Context
Any other context about the problem
```

**Labels to use:**
- `bug` - Something isn't working
- `high priority` - Critical issue affecting users
- `good first issue` - Good for newcomers

---

### Suggesting Features

**Before suggesting a feature:**

1. **Check roadmap** - Review [Product Roadmap](docs/02-product/product-roadmap.md)
2. **Search existing requests** - Check if similar feature is already requested
3. **Consider alternatives** - Think about different approaches

**How to submit a good feature request:**

Use the feature request template and include:

```markdown
## Problem Statement
Describe the problem this feature would solve

## Proposed Solution
Detailed description of the proposed feature

## Alternatives Considered
Other solutions you've considered

## User Stories
- As a [user type], I want [goal] so that [benefit]
- As a [user type], I want [goal] so that [benefit]

## Design Mockups (if applicable)
Screenshots, wireframes, or sketches

## Technical Considerations
Any technical implications you're aware of

## Success Metrics
How would we measure success of this feature?
```

**Labels to use:**
- `enhancement` - New feature or request
- `needs discussion` - Requires team discussion
- `Colombian law compliance` - Related to Ley 1581 compliance

---

### Contributing Code

#### Types of Contributions

We welcome:

- **Bug fixes** - Fix reported issues
- **Feature implementation** - Implement approved features
- **Performance improvements** - Optimize existing code
- **Documentation** - Improve docs, add examples
- **Tests** - Add missing tests, improve coverage
- **Refactoring** - Improve code quality without changing behavior

#### Finding Work

**For newcomers:**
1. Look for issues labeled `good first issue`
2. Check `help wanted` label
3. Ask in team chat if unsure where to start

**For experienced contributors:**
1. Review [Product Roadmap](docs/02-product/product-roadmap.md)
2. Check `high priority` issues
3. Propose architectural improvements

---

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

```
<type>/<short-description>

Examples:
feat/add-recurring-bookings
fix/auth-session-refresh
docs/update-api-reference
refactor/extract-auth-middleware
perf/optimize-db-queries
test/add-booking-tests
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style/formatting (no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Add/update tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Git Workflow

```bash
# 1. Sync with main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feat/your-feature

# 3. Make changes
code .

# 4. Commit frequently with clear messages
git add .
git commit -m "feat(bookings): add cancellation flow"

# 5. Keep branch updated
git fetch origin
git rebase origin/main

# 6. Push to GitHub
git push origin feat/your-feature

# 7. Create Pull Request
# Use GitHub UI or: gh pr create
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Examples:**

```bash
feat(bookings): add cancellation with refund logic

- Implement 24-hour cancellation window
- Calculate refund amount based on policy
- Send cancellation email to both parties

Closes #123

---

fix(auth): correct session refresh on expired tokens

The session was not properly refreshing when tokens expired,
causing users to be logged out unexpectedly.

Fixes #456

---

docs(api): update booking endpoints documentation

Added missing parameters and response examples for
booking creation and cancellation endpoints.
```

**Commit Message Rules:**
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Capitalize subject line
- No period at end of subject line
- Reference issue numbers in footer

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Add/update tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance
- `revert` - Revert previous commit

**Scopes** (examples):
- `bookings` - Booking system
- `payments` - Payment processing
- `auth` - Authentication/authorization
- `messaging` - In-app messaging
- `api` - API routes
- `db` - Database/migrations
- `ui` - UI components
- `i18n` - Internationalization

---

## Coding Standards

### TypeScript Guidelines

**DO:**
```typescript
// ✅ Explicit return types
export async function getBooking(id: string): Promise<Booking | null> {
  // ...
}

// ✅ Proper error handling
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  if (error instanceof ValidationError) {
    return { success: false, error: error.message };
  }
  throw error;
}

// ✅ Use Zod for validation
const BookingSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive()
});
```

**DON'T:**
```typescript
// ❌ No implicit any
function process(data) {
  return data.value;
}

// ❌ No unsafe type assertions
const user = response.data as any;

// ❌ No ignoring errors
try {
  await operation();
} catch (error) {
  // Silent failure
}
```

**See:** [CLAUDE.md - TypeScript Best Practices](CLAUDE.md#typescript-best-practices--anti-patterns) for complete guidelines.

### React Guidelines

**DO:**
```typescript
// ✅ Server Component by default (no 'use client')
export default async function BookingsPage() {
  const bookings = await getBookings();
  return <BookingList bookings={bookings} />;
}

// ✅ Client Component only when needed
'use client';

export function InteractiveCard({ booking }: Props) {
  const [expanded, setExpanded] = useState(false);
  return <Card onClick={() => setExpanded(!expanded)}>...</Card>;
}

// ✅ Proper prop types
interface BookingCardProps {
  booking: Database['public']['Tables']['bookings']['Row'];
  onCancel?: (id: string) => Promise<void>;
  className?: string;
}
```

**DON'T:**
```typescript
// ❌ Don't use 'use client' unnecessarily
'use client';  // Not needed if no interactivity

export default function StaticPage() {
  return <div>Static content</div>;
}

// ❌ Don't use inline prop types
export function Card({ booking }: { booking: any }) {
  // ...
}
```

### CSS Guidelines (Tailwind)

**DO:**
```tsx
// ✅ Use Tailwind classes
<div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8">

// ✅ Use cn() for conditional classes
<button className={cn(
  "rounded-lg px-4 py-2",
  isActive ? "bg-red-600 text-white" : "bg-gray-100 text-gray-900"
)}>

// ✅ Use Tailwind's spacing scale
<section className="py-16 sm:py-20 lg:py-24">
```

**DON'T:**
```tsx
// ❌ Don't use custom CSS variables
<div className="py-[var(--spacing-section)]">

// ❌ Don't use inline styles
<div style={{ padding: '64px' }}>

// ❌ Don't create custom CSS files (except for global styles)
```

**See:** [CLAUDE.md - Tailwind CSS Design System](CLAUDE.md#tailwind-css-design-system)

---

## Pull Request Process

### Before Creating PR

**Checklist:**
- [ ] Code follows project conventions
- [ ] TypeScript compiles without errors (`bun run build`)
- [ ] Linting passes (`bun run check`)
- [ ] Code is formatted (`bun run check:fix`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] i18n strings added for both en/es
- [ ] Database migrations include RLS policies
- [ ] No hardcoded secrets or API keys
- [ ] Commit messages follow convention

### Creating the PR

**Use the PR template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Closes #123

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing tests pass locally
- [ ] i18n strings added for both languages
```

### PR Size Guidelines

**Ideal PR size:**
- **Lines changed:** 100-400 lines (sweet spot: 200)
- **Files changed:** 1-10 files
- **Commits:** 1-5 commits (squash if more)

**If PR is too large:**
- Break into smaller PRs
- Create feature branch and merge sub-PRs into it
- Explain why large PR is necessary

---

## Code Review Guidelines

### For Authors

**Before requesting review:**
1. Self-review your code
2. Run all quality checks
3. Write clear PR description
4. Add screenshots for UI changes
5. Link related issues

**During review:**
- Respond promptly to feedback
- Ask questions if feedback is unclear
- Mark conversations as resolved after addressing
- Thank reviewers for their time

**After approval:**
- Squash commits if requested
- Ensure CI/CD passes
- Merge when ready (or request maintainer to merge)

### For Reviewers

**What to review:**

**1. Functionality:**
- Does the code work as intended?
- Are edge cases handled?
- Is error handling appropriate?

**2. Code Quality:**
- Is the code readable and maintainable?
- Are there any code smells?
- Could this be simpler?

**3. Security:**
- Are inputs validated?
- Are there any security vulnerabilities?
- Is sensitive data handled correctly?

**4. Performance:**
- Are there any obvious performance issues?
- Could database queries be optimized?
- Are there unnecessary re-renders?

**5. Testing:**
- Are there appropriate tests?
- Do tests cover edge cases?
- Are tests maintainable?

**6. Documentation:**
- Is the code self-documenting?
- Are comments appropriate and helpful?
- Is documentation updated?

**How to provide feedback:**

**DO:**
```markdown
✅ "Consider extracting this into a separate function for better readability:
```typescript
function validateBooking(booking: Booking) {
  // validation logic
}
```
This would make the code easier to test and maintain."

✅ "Great approach! One small suggestion: we could use `useMemo` here to prevent unnecessary re-calculations."

✅ "I'm not sure I understand this logic. Could you add a comment explaining the business rule?"
```

**DON'T:**
```markdown
❌ "This is wrong."
❌ "Why didn't you just use X?"
❌ "I would never write it this way."
```

**Review Response Time:**
- **Urgent/hotfix:** Within 2 hours
- **Normal:** Within 24 hours
- **Large PR:** Within 48 hours

---

## Documentation

### What Needs Documentation

**Always document:**
- New features or significant changes
- Breaking changes
- Database migrations
- API changes
- Configuration changes
- New environment variables

**Types of documentation:**

1. **Code Comments** - Explain "why", not "what"
   ```typescript
   // ✅ Good: Explains business logic
   // We use 18% commission to cover payment processing (3%) and platform costs (15%)
   const PLATFORM_FEE_PERCENT = 18;

   // ❌ Bad: States the obvious
   // Set platform fee to 18
   const PLATFORM_FEE_PERCENT = 18;
   ```

2. **JSDoc** - For complex functions
   ```typescript
   /**
    * Creates a booking with payment authorization
    *
    * @param bookingData - Booking details
    * @param customerId - Customer's user ID
    * @returns Booking ID and Stripe client secret
    * @throws {ValidationError} If booking data is invalid
    * @throws {PaymentError} If payment intent creation fails
    */
   export async function createBooking(
     bookingData: BookingData,
     customerId: string
   ): Promise<BookingResult> {
     // ...
   }
   ```

3. **README** - For new directories
   ```markdown
   # Messaging System

   Real-time messaging between customers and professionals.

   ## Components
   - `ConversationList` - List of conversations
   - `MessageThread` - Message display and input

   ## API Routes
   - `POST /api/messages` - Send message
   - `GET /api/messages/:conversationId` - Get messages
   ```

4. **Migration Comments** - For database changes
   ```sql
   -- Migration: Add booking cancellation policy
   -- Description: Implement 24-hour cancellation window with refund logic
   -- Author: Your Name
   -- Date: 2025-01-06

   ALTER TABLE bookings ADD COLUMN cancellation_policy TEXT;
   ```

### i18n Documentation

**Always add translations for both languages:**

```json
// en.json
{
  "bookings": {
    "cancel": {
      "title": "Cancel Booking",
      "confirmMessage": "Are you sure you want to cancel this booking?",
      "refundInfo": "You will receive a {percentage}% refund"
    }
  }
}

// es.json
{
  "bookings": {
    "cancel": {
      "title": "Cancelar Reserva",
      "confirmMessage": "¿Estás seguro de que quieres cancelar esta reserva?",
      "refundInfo": "Recibirás un reembolso del {percentage}%"
    }
  }
}
```

---

## Testing Requirements

### What to Test

**Priority 1: Critical Paths**
- User authentication
- Booking creation and payment
- Payment capture and refunds
- Cancellation flow
- Professional onboarding

**Priority 2: Business Logic**
- Availability checking
- Price calculations
- Refund calculations
- RLS policies

**Priority 3: UI Components**
- Forms and validation
- Navigation flows
- Error states
- Loading states

### Testing Strategies

**1. End-to-End Tests (Playwright)**

```typescript
// tests/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('customer can create booking', async ({ page }) => {
  await page.goto('/professionals');
  await page.click('[data-testid="professional-card"]:first-child');
  await page.click('text=Book Service');

  await page.fill('[name="date"]', '2025-12-15');
  await page.fill('[name="time"]', '10:00');
  await page.click('text=Continue to Payment');

  await expect(page).toHaveURL(/\/checkout/);
});
```

**2. Component Tests (if needed)**

```typescript
// __tests__/BookingCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookingCard } from '@/components/bookings/BookingCard';

test('displays booking details', () => {
  const booking = createMockBooking();
  render(<BookingCard booking={booking} />);

  expect(screen.getByText(booking.service_name)).toBeInTheDocument();
  expect(screen.getByText(/\$50,000/)).toBeInTheDocument();
});
```

**3. API Tests (via E2E)**

```typescript
test('API returns bookings for authenticated user', async ({ request }) => {
  const response = await request.get('/api/bookings', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.bookings).toBeInstanceOf(Array);
});
```

**Running Tests:**

```bash
# Run all tests
bun test

# Run specific test file
bun test booking-flow

# Run in UI mode (interactive)
bun test:ui

# Run in headed mode (see browser)
bun test:headed

# Debug tests
bun test:debug
```

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Team Chat (Slack/Discord)** - Real-time communication
- **Email** - [dev@casaora.co](mailto:dev@casaora.co)

### Getting Recognition

We value all contributions! Ways to get recognized:

- **Contributor Wall** - Featured on our website
- **Release Notes** - Mentioned in version releases
- **Team Shout-outs** - Recognized in team meetings
- **Swag** - Contributor t-shirts and stickers (for significant contributions)

### Regular Events

- **Weekly Standups** - Every Monday @ 10:00 AM COT
- **Code Review Sessions** - Every Wednesday @ 2:00 PM COT
- **Monthly Retrospectives** - First Friday of month @ 3:00 PM COT
- **Quarterly Hackathons** - Build innovative features

---

## Questions?

If you have questions about contributing:

1. **Check Documentation** - Most answers are in the docs
2. **Search Issues** - Someone may have asked before
3. **Ask in Discussions** - Community can help
4. **Contact Team** - [dev@casaora.co](mailto:dev@casaora.co)

---

## Thank You!

Thank you for contributing to MaidConnect! Every contribution, no matter how small, makes a difference.

**Together, we're building a platform that empowers cleaning professionals and provides exceptional service to customers across Colombia.** 🇨🇴

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
