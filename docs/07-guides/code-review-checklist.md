# Code Review Checklist

**Purpose:** This checklist helps code reviewers ensure consistent, thorough, and constructive code reviews for MaidConnect.

**How to Use:**
1. Not every item applies to every PR - use judgment
2. Focus on items relevant to the changes
3. Leave constructive, actionable feedback
4. Approve when confident changes are safe and maintainable

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [General Review Principles](#general-review-principles)
- [Code Quality](#code-quality)
- [TypeScript & Type Safety](#typescript--type-safety)
- [Security Review](#security-review)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Documentation](#documentation)
- [Database Changes](#database-changes)
- [UI/UX Review](#uiux-review)
- [API Changes](#api-changes)
- [Internationalization](#internationalization)
- [Deployment Readiness](#deployment-readiness)

---

## Quick Reference

**Fastest review flow for common PR types:**

### Feature PR
- [ ] Matches requirements/issue
- [ ] Tests included
- [ ] No `as any` or type bypasses
- [ ] i18n strings added (en + es)
- [ ] No security vulnerabilities
- [ ] Documentation updated

### Bug Fix PR
- [ ] Root cause addressed (not just symptoms)
- [ ] Test added to prevent regression
- [ ] No breaking changes
- [ ] Error handling improved

### Refactor PR
- [ ] Same behavior before/after
- [ ] Tests still pass
- [ ] Improved maintainability
- [ ] No performance regression

### Documentation PR
- [ ] Accurate and up-to-date
- [ ] Clear examples
- [ ] Proper formatting
- [ ] Links work

---

## General Review Principles

### PR Metadata
- [ ] Title follows Conventional Commits format (`feat:`, `fix:`, etc.)
- [ ] Description explains WHAT changed and WHY
- [ ] References issue number (`Closes #123`, `Fixes #456`)
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented

### Code Organization
- [ ] Changes are in appropriate files/directories
- [ ] File names follow kebab-case convention
- [ ] Imports organized properly (React → third-party → internal → styles)
- [ ] No unnecessary files changed
- [ ] No commented-out code (remove it)
- [ ] No debug logs (`console.log`) left in production code

### Scope
- [ ] PR focused on single concern (not doing too much)
- [ ] No unrelated changes mixed in
- [ ] Reasonable size (< 500 lines changed is ideal)
- [ ] Large PRs broken into smaller, reviewable chunks

---

## Code Quality

### Readability
- [ ] Variable names are clear and descriptive
- [ ] Functions have single responsibility
- [ ] Complex logic has explanatory comments
- [ ] Magic numbers replaced with named constants
- [ ] No deeply nested conditionals (max 3 levels)

### Best Practices
- [ ] Follows project coding standards (see [CLAUDE.md](../../CLAUDE.md))
- [ ] No duplicate code (DRY principle)
- [ ] Proper error handling (no silent failures)
- [ ] Uses composition over inheritance
- [ ] Follows Next.js 16 patterns (Server Components by default)

### React/Next.js Specific
- [ ] Server Components used where possible (no unnecessary `'use client'`)
- [ ] Client Components only for interactivity
- [ ] Hooks rules followed (top level, not conditional)
- [ ] No prop drilling (use context/composition)
- [ ] Keys provided for list items (unique, stable)
- [ ] No `useEffect` for data fetching (use Server Components or React Query)

### Functions
- [ ] Functions under 50 lines (ideally under 30)
- [ ] Clear function names describe what they do
- [ ] Parameters validated (Zod schemas)
- [ ] Return types explicit (no implicit any)
- [ ] Side effects documented

---

## TypeScript & Type Safety

**CRITICAL: Zero tolerance for type bypasses**

### Type Safety (Mandatory)
- [ ] ✅ **NO `as any` anywhere** (instant rejection if found)
- [ ] ✅ **NO `any` types** (use `unknown` + validation)
- [ ] ✅ **NO `@ts-ignore` or `@ts-expect-error`** (fix the actual issue)
- [ ] Minimal `!` non-null assertions (justified with comments)
- [ ] All functions have explicit return types
- [ ] All component props use interfaces (not inline types)

### Proper Patterns
- [ ] Type guards used for narrowing (`isBooking`, discriminated unions)
- [ ] Zod schemas for runtime validation + type inference
- [ ] Generics used appropriately (no over-engineering)
- [ ] Error handling properly types caught errors
- [ ] Array/object access handles undefined (noUncheckedIndexedAccess)

### Example of GOOD Type Safety:
```typescript
// ✅ GOOD: Proper type guard + Zod validation
const BookingSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'completed']),
});

type Booking = z.infer<typeof BookingSchema>;

function processBooking(data: unknown): Booking {
  // Runtime validation + type inference
  return BookingSchema.parse(data);
}
```

### Example of BAD Type Safety:
```typescript
// ❌ BAD: Type bypassing
const booking = data as any;
booking.someProperty; // No type safety!

// ❌ BAD: Using any
function processData(data: any) {
  return data.value;
}

// ❌ BAD: Suppressing errors
// @ts-ignore
const result = someFunction(wrongType);
```

---

## Security Review

**CRITICAL: Security vulnerabilities must be caught**

### Authentication & Authorization
- [ ] User authentication verified (no unauthenticated access to protected routes)
- [ ] Authorization checked (users can only access their own data)
- [ ] RLS policies enforced (database-level security)
- [ ] Session validation uses `getUser()` not `getSession()`
- [ ] No role escalation vulnerabilities

### Input Validation
- [ ] All user input validated (Zod schemas)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (sanitized HTML with DOMPurify)
- [ ] CSRF protection enabled (origin/referer validation)
- [ ] File uploads validated (type, size, content)

### Sensitive Data
- [ ] No secrets in code (use environment variables)
- [ ] No passwords/API keys in logs
- [ ] PII properly protected (Law 1581 compliance)
- [ ] Service role key only used server-side
- [ ] Stripe keys never exposed to client

### API Security
- [ ] Rate limiting applied
- [ ] Webhook signatures verified
- [ ] CORS configured correctly
- [ ] Security headers present
- [ ] No sensitive data in URLs

---

## Performance

### General Performance
- [ ] No unnecessary re-renders
- [ ] Expensive operations memoized (`useMemo`, `useCallback`)
- [ ] Large components lazy-loaded (`dynamic()`)
- [ ] Images optimized (Next.js `Image` component)
- [ ] No N+1 queries (use joins or select with relations)

### Database Queries
- [ ] Indexes exist for filtered/joined columns
- [ ] Only selected needed columns (not `SELECT *`)
- [ ] Pagination for large datasets
- [ ] Connection pooling used
- [ ] No queries in loops

### Frontend Performance
- [ ] Code splitting for large features
- [ ] Debounced search inputs
- [ ] Virtualization for long lists
- [ ] Optimistic updates for better UX
- [ ] Loading states prevent multiple submissions

---

## Accessibility

### Semantic HTML
- [ ] Proper heading hierarchy (`h1` → `h2` → `h3`)
- [ ] Buttons for actions, links for navigation
- [ ] Forms have labels
- [ ] Tables use proper markup
- [ ] Landmarks used (`header`, `nav`, `main`, `footer`)

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Focus visible (no `outline: none` without replacement)
- [ ] Tab order logical
- [ ] Escape closes modals/dialogs
- [ ] Enter submits forms

### ARIA
- [ ] ARIA labels for icon-only buttons
- [ ] Live regions for dynamic content
- [ ] ARIA expanded/collapsed states
- [ ] Proper role attributes
- [ ] `aria-describedby` for error messages

### Visual Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Color not sole indicator of state
- [ ] Text resizable to 200%
- [ ] Focus indicators visible
- [ ] Alt text for images

---

## Testing

### Test Coverage
- [ ] Tests included for new features
- [ ] Tests updated for modified features
- [ ] Edge cases tested
- [ ] Error paths tested
- [ ] All tests passing (`bun test`)

### Test Quality
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests use realistic data
- [ ] Tests don't test implementation details
- [ ] Test descriptions clear ("should do X when Y")
- [ ] Proper use of test selectors (`getByRole`, `getByLabel`)

### E2E Tests (Playwright)
- [ ] User flows tested (not just unit tests)
- [ ] Tests in Spanish (primary language)
- [ ] Happy path covered
- [ ] Error states tested
- [ ] Authentication flows work

---

## Documentation

### Code Documentation
- [ ] Complex logic has comments explaining WHY
- [ ] Public APIs documented (JSDoc for utilities)
- [ ] Breaking changes documented
- [ ] Migration guide for breaking changes
- [ ] Examples included for new patterns

### User-Facing Documentation
- [ ] README updated if needed
- [ ] API docs updated for endpoint changes
- [ ] Database schema docs updated for schema changes
- [ ] Feature flags documented
- [ ] Deployment notes included

### Comments Quality
- [ ] Comments explain WHY, not WHAT (code shows what)
- [ ] No outdated comments
- [ ] TODO comments have issue numbers
- [ ] No commented-out code

---

## Database Changes

**CRITICAL: Database changes require extra care**

### Migration Files
- [ ] Migration file naming correct (`YYYYMMDDHHMMSS_description.sql`)
- [ ] Migration tested locally (`supabase db reset`)
- [ ] Migration is idempotent (can run multiple times)
- [ ] Rollback plan documented
- [ ] No data loss risk

### Schema Changes
- [ ] Indexes created for foreign keys
- [ ] Indexes created for filtered columns
- [ ] Enums used instead of strings where appropriate
- [ ] NOT NULL constraints appropriate
- [ ] CHECK constraints for validation
- [ ] Default values set where needed

### Row Level Security (RLS)
- [ ] RLS enabled on all tables with user data
- [ ] Separate policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Policies tested (verify users can't access others' data)
- [ ] Admin bypass policies documented
- [ ] Performance of RLS policies acceptable

### Functions & Triggers
- [ ] Functions use `SECURITY DEFINER` safely
- [ ] `search_path` set explicitly
- [ ] Triggers necessary (not business logic in triggers)
- [ ] Error handling in functions
- [ ] Comments explain purpose

---

## UI/UX Review

### Design System Compliance
- [ ] Uses Tailwind classes exclusively (NO custom CSS variables)
- [ ] Spacing follows 8px scale (`gap-2`, `gap-4`, `gap-6`, etc.)
- [ ] Colors use Tailwind palette (NO `var(--color-name)`)
- [ ] Typography follows design system
- [ ] Components from `@/components/ui` used

### Spacing Guidelines (CRITICAL)
```tsx
// ✅ CORRECT: Tailwind spacing
<section className="py-16 sm:py-20 lg:py-24">
  <div className="flex flex-col gap-6">
    <h1>Title</h1>
    <p>Content</p>
  </div>
</section>

// ❌ WRONG: Custom CSS variables
<section className="py-[var(--spacing-section)]">
  <div className="gap-[--spacing-gap]">
```

### Responsive Design
- [ ] Mobile-first approach
- [ ] Breakpoints used appropriately (`sm:`, `md:`, `lg:`, `xl:`)
- [ ] Touch targets 44x44px minimum
- [ ] No horizontal scroll
- [ ] Text readable on small screens

### User Experience
- [ ] Loading states prevent confusion
- [ ] Error messages helpful (actionable)
- [ ] Success feedback clear
- [ ] Forms have validation feedback
- [ ] Destructive actions require confirmation

---

## API Changes

### Endpoint Design
- [ ] RESTful conventions followed
- [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Status codes appropriate (200, 201, 400, 401, 403, 404, 500)
- [ ] Consistent response format
- [ ] Error responses include helpful messages

### Request/Response
- [ ] Input validated with Zod
- [ ] Pagination for list endpoints
- [ ] Filtering/sorting options where needed
- [ ] Rate limiting applied
- [ ] Response doesn't leak sensitive data

### Breaking Changes
- [ ] Versioned (`/api/v1/`, `/api/v2/`)
- [ ] Documented in migration guide
- [ ] Deprecation notice for old endpoints
- [ ] Backward compatibility where possible

---

## Internationalization

### Translation Strings
- [ ] No hardcoded English strings
- [ ] Translations added to both `en.json` and `es.json`
- [ ] Translation keys descriptive
- [ ] Pluralization handled correctly
- [ ] Variables in translations use proper syntax

### Spanish Quality
- [ ] Spanish translations reviewed (not just Google Translate)
- [ ] Colombian Spanish conventions followed
- [ ] Currency formatted correctly (COP)
- [ ] Date/time formats localized
- [ ] Legal terms properly translated

### i18n Best Practices
- [ ] Uses `useTranslations` hook
- [ ] No string concatenation (use translation variables)
- [ ] Images with text localized
- [ ] Numbers formatted with locale
- [ ] Timezone handling correct

---

## Deployment Readiness

### Build & Quality Checks
- [ ] `bun run build` succeeds
- [ ] `bun run check` passes (Biome linting)
- [ ] `bun test` all tests passing
- [ ] No TypeScript errors
- [ ] No console warnings

### Environment Variables
- [ ] New env vars documented in `.env.example`
- [ ] Env vars added to Vercel dashboard
- [ ] Secrets not committed
- [ ] `NEXT_PUBLIC_*` prefix only for client-exposed vars

### Performance
- [ ] Bundle size acceptable (check `bun run analyze`)
- [ ] No large dependencies added unnecessarily
- [ ] Lighthouse scores maintained (90+)
- [ ] Core Web Vitals acceptable

### Monitoring
- [ ] Error tracking configured (Better Stack)
- [ ] Important events logged
- [ ] No sensitive data in logs
- [ ] Alerts configured for critical errors

---

## Review Comments Best Practices

### Constructive Feedback
- **Be Specific:** ❌ "This is wrong" → ✅ "This could cause XSS. Sanitize with DOMPurify before rendering."
- **Explain Why:** ❌ "Don't use any" → ✅ "Using `any` defeats TypeScript's type safety. Use a proper interface or `unknown` with validation."
- **Suggest Solutions:** ❌ "This won't work" → ✅ "Consider using a Zod schema here to validate the input at runtime."
- **Praise Good Work:** "Great use of React Query for caching here! 👍"

### Priority Levels
Use these labels in comments:

- 🔴 **BLOCKING:** Must be fixed before merge (security, breaking changes)
- 🟡 **IMPORTANT:** Should be addressed (performance, maintainability)
- 🔵 **OPTIONAL:** Nice to have (style preferences, suggestions)
- 💡 **IDEA:** Future improvement (create issue, not required now)

### Example Comments

**Good:**
```markdown
🔴 **BLOCKING:** Using `as any` here bypasses type safety and could lead to runtime errors.

Instead, define a proper type:
\`\`\`typescript
interface BookingData {
  id: string;
  status: 'pending' | 'confirmed';
}
const data: BookingData = response.data;
\`\`\`
```

**Bad:**
```markdown
This is wrong. Fix it.
```

---

## Special Review Cases

### First-Time Contributors
- [ ] Welcome them warmly
- [ ] Point to [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [ ] Explain project conventions patiently
- [ ] Encourage questions
- [ ] Approve when ready (don't be overly strict)

### Urgent Hotfixes
- [ ] Security issue addressed correctly
- [ ] Root cause fixed (not just patched)
- [ ] Tests added to prevent regression
- [ ] Follow-up issue created for proper fix
- [ ] Deployment plan clear

### Large Refactors
- [ ] Behavior unchanged (tests confirm)
- [ ] Incremental changes preferred
- [ ] Migration path documented
- [ ] Team aligned on approach
- [ ] Performance maintained or improved

---

## Final Checklist

Before clicking "Approve":

- [ ] All blocking issues resolved
- [ ] Tests passing in CI
- [ ] No merge conflicts
- [ ] Changes align with project goals
- [ ] Confident changes are safe to deploy
- [ ] Left constructive, helpful feedback
- [ ] Acknowledged good work

**When in Doubt:**
- Request changes if uncertain about security/breaking changes
- Ask questions if approach unclear
- Tag senior developer for second opinion
- Test locally if changes seem risky

---

## Resources

- [CLAUDE.md](../../CLAUDE.md) - Project rules and patterns
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contributing guidelines
- [Getting Started Guide](./getting-started.md) - Development setup
- [Development Guide](./development-guide.md) - How-to examples
- [API Reference](../03-technical/api-reference.md) - API documentation
- [Database Schema](../03-technical/database-schema.md) - Database structure

---

**Remember:** Code review is about:
- ✅ Maintaining code quality
- ✅ Catching bugs early
- ✅ Sharing knowledge
- ✅ Building better software together

**NOT about:**
- ❌ Being a gatekeeper
- ❌ Showing how smart you are
- ❌ Nitpicking style preferences
- ❌ Blocking progress unnecessarily

---

**Version:** 1.0.0
**Last Updated:** 2025-01-06
**Maintained By:** MaidConnect Engineering Team
