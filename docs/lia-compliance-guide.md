# Lia Design System - Compliance Guide

## What is the Lia Design System?

**Lia is an Airbnb-inspired design system** that prioritizes:
- **Clean, modern aesthetics** (thoughtful rounded corners)
- **Approachable, warm design** (cool neutrals with coral-pink and teal accents)
- **Mathematical precision** (4px grid system, 24px baseline grid)
- **Professional sophistication** (no glass morphism, solid backgrounds)

**Philosophy:** Lia creates a **trustworthy, approachable aesthetic** through the Airbnb design language—rounded corners, cool neutrals, and signature coral-pink (Rausch) accents.

---

## Core Design Principles

### 1. Airbnb-Inspired Rounded Corners (MOST IMPORTANT!)

**Rule:** All interactive elements must have **appropriate border-radius** based on their type.

**Border Radius Scale:**
- `rounded-sm` = 4px (small elements, inline badges)
- `rounded-md` = 8px (standard inputs, small cards)
- `rounded-lg` = 12px (default for buttons, cards, inputs)
- `rounded-xl` = 16px (large cards, modals)
- `rounded-full` = 9999px (badges, pills, avatars)

**Usage:**
```tsx
// Buttons, cards, inputs - use rounded-lg (12px)
<button className="bg-rausch-500 text-white px-6 py-3 rounded-lg">...</button>
<div className="border border-neutral-200 rounded-lg p-6">...</div>
<input className="border border-neutral-200 rounded-lg px-4 py-2" />

// Badges, pills, avatars - use rounded-full
<span className="bg-rausch-50 px-3 py-1 border border-rausch-200 rounded-full">Badge</span>
<img className="h-12 w-12 rounded-full border border-neutral-200" />
```

**Why?** Rounded corners create a warm, modern, approachable aesthetic while maintaining professional precision—the Airbnb design philosophy.

---

### 2. No Glass Morphism

**Rule:** Never use blur effects or semi-transparent backgrounds.

**NEVER use:**
```tsx
<div className="backdrop-blur-sm bg-white/70">...</div>
<div className="backdrop-blur-lg bg-neutral-900/50">...</div>
```

**ALWAYS use:**
```tsx
<div className="bg-white border border-neutral-200 rounded-lg">...</div>
<div className="bg-neutral-900 rounded-lg">...</div>
```

**Why?** Glass morphism reduces readability, creates visual noise, and conflicts with the clean Airbnb aesthetic.

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

### 4. Airbnb Color Palette (Rausch + Babu)

**Primary Colors:**
- **Rausch-500** (`#FF385C`) - Primary CTAs, important actions (Airbnb coral-pink)
- **Rausch-600** (`#DA1249`) - Links, hover states (WCAG AA compliant)
- **Babu-500** (`#00A699`) - Info states, secondary accent (Airbnb teal)
- **Neutral-900** (`#222222`) - Headings, primary text (Airbnb dark)
- **Neutral-700** (`#484848`) - Body text (Airbnb Hof)
- **Neutral-500** (`#767676`) - Muted text (Airbnb Foggy)
- **Neutral-200** (`#DDDDDD`) - Borders, dividers (Airbnb dividers)
- **Neutral-50** (`#F7F7F7`) - Page backgrounds (Airbnb light)
- **White** (`#FFFFFF`) - Card backgrounds, surfaces

**Usage:**
```tsx
// Primary CTA
<button className="bg-rausch-500 text-white hover:bg-rausch-600 rounded-lg">
  Book Now
</button>

// Secondary button
<button className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 rounded-lg">
  Learn More
</button>

// Link (always rausch-600 for contrast)
<a href="#" className="text-rausch-600 hover:text-rausch-700">
  View Details
</a>

// Info state (babu)
<div className="bg-babu-50 border border-babu-200 text-babu-700 rounded-lg p-4">
  Information message
</div>
```

---

### 5. 4px Grid System

**Rule:** All spacing must be multiples of 4px.

**Common values:** `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px)

```tsx
// Correct spacing
<div className="p-6 gap-4 mb-8">...</div>

// Also correct (4px base)
<div className="p-4 gap-3 mb-6">...</div>
```

---

### 6. 24px Baseline Grid

**Rule:** All typography line heights should align to multiples of 24px.

```tsx
// Correct - line-height is 24px
<p className="text-base leading-6">Body text</p>

// Correct - line-height is 48px (2 × 24)
<h1 className="text-[48px] leading-[48px]">Heading</h1>
```

---

## Automated Enforcement

### Biome Linter

**Casaora uses Biome for code quality and consistency:**

```bash
# Location: biome.json

# Run checks
bun run check

# Auto-fix issues
bun run check:fix
```

**When you commit:**
```bash
git add .
git commit -m "feat: add new component"

# Pre-commit hook runs:
# Running Biome linter...
# Biome checks passed!
```

---

## Common Patterns & Best Practices

### Pattern 1: Rounded Buttons

```tsx
import { Button } from '@/components/ui/button';

// Primary (rausch coral)
<Button variant="default">Primary Action</Button>

// Secondary
<Button variant="secondary">Secondary Action</Button>

// Outline
<Button variant="outline">Outline Button</Button>

// Ghost
<Button variant="ghost">Ghost Button</Button>
```

---

### Pattern 2: Rounded Cards

```tsx
import { Card } from '@/components/ui/card';

<Card className="p-6">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-neutral-700">Card content here...</p>
</Card>
```

---

### Pattern 3: Rounded Badges

```tsx
import { Badge } from '@/components/ui/badge';

// Default (rausch)
<Badge>Featured</Badge>

// Success (green)
<Badge variant="success">Approved</Badge>

// Info (babu teal)
<Badge variant="info">Draft</Badge>

// Warning
<Badge variant="warning">Pending</Badge>
```

---

### Pattern 4: Rounded Avatars

```tsx
<img
  src={user.avatar}
  alt={user.name}
  className="h-12 w-12 rounded-full border border-neutral-200"
/>
```

---

### Pattern 5: Focus Rings (Rausch)

```tsx
// All interactive elements should have rausch focus rings
<button className="focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2">
  Focusable Button
</button>

<input className="focus:border-rausch-500 focus:ring-2 focus:ring-rausch-500" />
```

---

## Development Workflow

### Before Committing

1. **Run linter:**
   ```bash
   bun run check
   ```

2. **Auto-fix issues:**
   ```bash
   bun run check:fix
   ```

3. **Build to verify types:**
   ```bash
   bun run build
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

---

## Checking Compliance Manually

### Verify Lia Color Usage

```bash
# Search for old orange-* classes (should be rausch-*)
grep -r "orange-500\|orange-600" src/ --include="*.tsx" --include="*.ts"

# Search for old blue-* classes (should be babu-*)
grep -r "blue-500\|blue-600" src/ --include="*.tsx" --include="*.ts"

# Search for old hex values
grep -r "#D97757\|#FAF9F5\|#141413" src/ --include="*.tsx" --include="*.ts"
```

### Find Glass Morphism Violations

```bash
# Search for glass morphism effects
grep -r "backdrop-blur" src/ --include="*.tsx" --include="*.ts"
```

---

## FAQ

### Q: Why Airbnb-inspired design?

**A:** The Airbnb design language is modern, approachable, and trusted worldwide. It combines warm aesthetics with clean functionality—perfect for a home services marketplace like Casaora.

### Q: What's the difference between Rausch and Babu?

**A:**
- **Rausch** (`#FF385C` coral-pink) - Primary accent, CTAs, links, focus states
- **Babu** (`#00A699` teal) - Secondary accent, info states, informational highlights

### Q: Can I use glass morphism for modals?

**A:** **No.** Glass morphism (backdrop-blur) is prohibited. Use solid backgrounds with borders:

```tsx
// Instead of this
<div className="backdrop-blur-sm bg-white/70">...</div>

// Use this
<div className="bg-white border border-neutral-200 rounded-xl shadow-lg">...</div>
```

### Q: How do I check my code for violations?

**A:** Run the Biome linter:

```bash
# Check code
bun run check

# Auto-fix issues
bun run check:fix

# Build to verify types
bun run build
```

---

## Resources

- [Lia Design System Overview (CLAUDE.md)](../CLAUDE.md)
- [Lia Foundations (docs/lia/foundations.md)](lia/foundations.md)
- [Typography Guide (docs/typography.md)](typography.md)
- [Button Component](../src/components/ui/button.tsx)
- [Card Component](../src/components/ui/card.tsx)
- [Badge Component](../src/components/ui/badge.tsx)

---

**Last Updated:** 2025-11-25
**Version:** 2.0.0 (Airbnb-Inspired Refresh)

**Remember:** Lia Design System uses **Airbnb-inspired rounded corners**, **cool neutrals**, and **Rausch coral-pink / Babu teal accents**. No glass morphism, solid backgrounds everywhere.
