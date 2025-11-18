# Lia Design System - Compliance Guide

## What is the Lia Design System?

**Lia is a mathematical, precision-focused design system** that prioritizes:
- **Sharp, clean edges** (zero rounded corners)
- **Data-focused aesthetics** (inspired by financial dashboards and analytics platforms)
- **Mathematical precision** (8px grid system, 24px baseline grid)
- **Professional sophistication** (no decorative flourishes, no glass morphism)

**Philosophy:** Lia creates a **professional, trustworthy aesthetic** through rigid constraints and mathematical precision, not through decorative elements.

---

## Core Design Principles

### 1. Zero Rounded Corners (MOST IMPORTANT!)

**Rule:** All elements must have **0px border-radius** (sharp, square corners).

**❌ NEVER use:**
```tsx
<div className="rounded-full">...</div>
<button className="rounded-lg">...</button>
<span className="rounded-md">...</span>
<img className="rounded-xl" />
```

**✅ ALWAYS use:**
```tsx
<div className="border border-neutral-200">...</div>
<button className="bg-orange-500 px-6 py-3">...</button>
<span className="border border-orange-200 px-3 py-1">...</span>
<img className="border border-neutral-200" />
```

**Why?** Sharp corners convey **precision, professionalism, and data integrity**. Rounded corners are decorative and reduce visual clarity.

---

### 2. No Glass Morphism

**Rule:** Never use blur effects or semi-transparent backgrounds.

**❌ NEVER use:**
```tsx
<div className="backdrop-blur-sm bg-white/70">...</div>
<div className="backdrop-blur-lg bg-neutral-900/50">...</div>
```

**✅ ALWAYS use:**
```tsx
<div className="bg-white border border-neutral-200">...</div>
<div className="bg-neutral-900">...</div>
```

**Why?** Glass morphism reduces readability, creates visual noise, and conflicts with the data-focused aesthetic.

---

### 3. Geist Fonts Only

**Rule:** Use Geist Sans for all UI, Geist Mono for code/data.

```tsx
// UI and content - Geist Sans (default)
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base">Body text</p>

// Code and technical data - Geist Mono
<code className="font-[family-name:var(--font-geist-mono)]">
  booking_id_12345
</code>
```

---

### 4. Neutral + Orange Color Palette

**Primary Colors:**
- **Orange-500** (`#FF5200`) - Primary CTAs, important actions
- **Orange-600** (`#E64A00`) - Links, hover states (WCAG AA compliant)
- **Neutral-900** (`#181818`) - Headings, primary text
- **Neutral-700** (`#64615D`) - Body text
- **Neutral-200** (`#EBEAE9`) - Borders, dividers
- **White** (`#FFFFFF`) - Card backgrounds, surfaces

**Usage:**
```tsx
// Primary CTA
<button className="bg-orange-500 text-white hover:bg-orange-600">
  Book Now
</button>

// Secondary button
<button className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200">
  Learn More
</button>

// Link (always orange-600 for contrast)
<a href="#" className="text-orange-600 hover:text-orange-700">
  View Details
</a>
```

---

### 5. 8px Grid System

**Rule:** All spacing must be multiples of 8px.

**Common values:** `0.5` (4px), `1` (8px), `2` (16px), `3` (24px), `4` (32px), `6` (48px), `8` (64px)

```tsx
// Correct spacing
<div className="p-6 gap-4 mb-8">...</div>

// Incorrect spacing (not multiples of 8)
<div className="p-5 gap-3 mb-7">...</div>
```

---

### 6. 24px Baseline Grid

**Rule:** All typography line heights must be multiples of 24px.

```tsx
// Correct - line-height is 24px
<p className="text-base leading-[24px]">Body text</p>

// Correct - line-height is 48px (2 × 24)
<h1 className="text-[48px] leading-[48px]">Heading</h1>

// Incorrect - line-height not a multiple of 24
<p className="text-base leading-5">...</p>
```

---

## Automated Enforcement

### Pre-Commit Hook

**Casaora has a pre-commit hook that automatically checks for violations:**

```bash
# Location: .husky/pre-commit

# Checks performed:
1. ✅ No rounded corners (rounded-*, rounded-full, etc.)
2. ✅ No glass morphism (backdrop-blur)
3. ✅ Biome linting passes
4. ✅ TypeScript type checking passes
```

**When you commit:**
```bash
git add .
git commit -m "feat: add new component"

# Hook runs automatically:
🔍 Running Lia Design System checks...
✅ Lia Design System checks passed!
🔍 Running Biome linter...
✅ Biome checks passed!
```

**If violations are found:**
```bash
❌ Lia Design System violation detected:
   Found rounded corner classes (Lia mandates ZERO rounded corners)

src/components/ui/button.tsx:12:    <button className="rounded-full">

💡 Fix: Remove all rounded-* classes
   Lia Design System uses sharp corners only (0px border-radius)
```

---

## Common Violations & Fixes

### Violation 1: Circular Avatars

**❌ Before (Violation):**
```tsx
<img
  src={user.avatar}
  alt={user.name}
  className="h-12 w-12 rounded-full"
/>
```

**✅ After (Lia Compliant):**
```tsx
<img
  src={user.avatar}
  alt={user.name}
  className="h-12 w-12 border border-neutral-200"
/>
```

---

### Violation 2: Rounded Badges

**❌ Before (Violation):**
```tsx
<span className="rounded-full bg-orange-500 px-3 py-1 text-white">
  New
</span>
```

**✅ After (Lia Compliant) - Use AdminBadge:**
```tsx
import { AdminBadge } from '@/components/ui/admin-badge';

<AdminBadge variant="default">New</AdminBadge>
```

---

### Violation 3: Rounded Loading Spinners

**❌ Before (Violation):**
```tsx
<div className="rounded-full border-4 border-orange-500 animate-spin" />
```

**✅ After (Lia Compliant):**
```tsx
<div className="border-4 border-orange-500 animate-spin" />
```

---

### Violation 4: Circular Radio Buttons

**❌ Before (Violation):**
```tsx
<div className="h-4 w-4 rounded-full border border-neutral-900" />
```

**✅ After (Lia Compliant):**
```tsx
<div className="h-4 w-4 border border-neutral-900" />
```

---

### Violation 5: Rounded Toggle Switches

**❌ Before (Violation):**
```tsx
<button
  className="rounded-full bg-orange-500 relative inline-flex h-6 w-11"
  aria-pressed={enabled}
>
  <span className="rounded-full bg-white h-4 w-4" />
</button>
```

**✅ After (Lia Compliant):**
```tsx
<button
  className="bg-orange-500 relative inline-flex h-6 w-11"
  aria-pressed={enabled}
>
  <span className="bg-white h-4 w-4" />
</button>
```

---

## Reusable Components

### AdminBadge Component

**Location:** [`src/components/ui/admin-badge.tsx`](../src/components/ui/admin-badge.tsx)

**Usage:**
```tsx
import { AdminBadge } from '@/components/ui/admin-badge';

// Default (orange)
<AdminBadge>Featured</AdminBadge>

// Success
<AdminBadge variant="success">Approved</AdminBadge>

// Warning
<AdminBadge variant="warning">Pending</AdminBadge>

// Danger
<AdminBadge variant="danger">Rejected</AdminBadge>

// Info
<AdminBadge variant="info">Draft</AdminBadge>

// Sizes
<AdminBadge size="sm">Small</AdminBadge>
<AdminBadge size="md">Medium</AdminBadge>
<AdminBadge size="lg">Large</AdminBadge>
```

**Features:**
- ✅ Zero rounded corners (Lia compliant)
- ✅ Consistent color palette
- ✅ WCAG AA accessible contrast
- ✅ Multiple variants and sizes

---

## Checking Compliance Manually

### Find Rounded Corner Violations

```bash
# Search for rounded corners in source files
grep -r "rounded-full\|rounded-lg\|rounded-md" src/ \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules

# Count violations
grep -r "rounded-" src/ --include="*.tsx" | wc -l
```

### Find Glass Morphism Violations

```bash
# Search for glass morphism effects
grep -r "backdrop-blur" src/ \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules
```

### Validate Typography

```bash
# Find non-baseline line heights (not multiples of 24px)
grep -r "leading-\[(?!24|48|72|96)" src/ \
  --include="*.tsx" --include="*.ts" \
  -P  # Requires grep with PCRE support
```

---

## Development Workflow

### Before Committing

1. **Run linter:**
   ```bash
   bun run check
   ```

2. **Check for Lia violations manually (optional):**
   ```bash
   grep -r "rounded-" src/ --include="*.tsx" --include="*.ts"
   ```

3. **Commit (hook runs automatically):**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### If Hook Fails

1. **Review the violation output:**
   ```bash
   ❌ Lia Design System violation detected:
      Found rounded corner classes

   src/components/ui/card.tsx:15:    className="rounded-lg"
   ```

2. **Fix the violation:**
   ```tsx
   // Remove rounded-lg
   className="border border-neutral-200"
   ```

3. **Re-commit:**
   ```bash
   git add .
   git commit -m "fix: remove rounded corners (Lia compliance)"
   ```

---

## Bypassing the Hook (EMERGENCY ONLY)

**⚠️ WARNING:** Only bypass the hook for critical hotfixes. **Never bypass for design system violations.**

```bash
# Bypass hook (NOT recommended)
git commit --no-verify -m "hotfix: critical security patch"
```

**When to bypass:**
- Critical security vulnerabilities
- Production-breaking bugs
- Emergency database migrations

**When NOT to bypass:**
- Design system violations
- "I'll fix it later"
- Linting errors

---

## FAQ

### Q: Why no rounded corners?

**A:** Lia Design System prioritizes **precision, professionalism, and data clarity**. Rounded corners are decorative and reduce visual precision. Sharp corners create a clean, data-focused aesthetic inspired by financial dashboards and analytics platforms.

### Q: Can I use rounded corners for avatars?

**A:** **No.** Lia Design System has **zero tolerance** for rounded corners. Use square avatars with borders for a professional, consistent aesthetic.

### Q: What if a third-party library uses rounded corners?

**A:** Override the styles with Tailwind utilities:

```tsx
<ThirdPartyComponent className="!rounded-none" />
```

### Q: Can I use glass morphism for modals?

**A:** **No.** Glass morphism (backdrop-blur) is prohibited. Use solid backgrounds with borders:

```tsx
// Instead of this
<div className="backdrop-blur-sm bg-white/70">...</div>

// Use this
<div className="bg-white border border-neutral-200 shadow-lg">...</div>
```

### Q: How do I check my code for violations?

**A:** The pre-commit hook checks automatically. You can also run:

```bash
# Manual check
grep -r "rounded-\|backdrop-blur" src/ --include="*.tsx"

# Check before committing
bun run check
```

---

## Resources

- [Lia Design System Overview (CLAUDE.md)](../CLAUDE.md)
- [Typography Guide (docs/typography.md)](typography.md)
- [AdminBadge Component](../src/components/ui/admin-badge.tsx)
- [Pre-Commit Hook](.husky/pre-commit)

---

**Last Updated:** 2025-01-17
**Version:** 1.3.0

**Remember:** Lia Design System is **non-negotiable**. Zero rounded corners, zero glass morphism, sharp precision everywhere.
