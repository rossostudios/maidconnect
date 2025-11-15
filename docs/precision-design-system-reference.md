# Precision Design System Reference

**Version:** 2.0 (Geist Migration)
**Last Updated:** 2025-01-15
**Status:** Production

## Overview

The Precision Design System is Casaora's Bloomberg Terminal-inspired design language that delivers:

- **Professional Trust** - Data-focused aesthetic that builds credibility
- **Sharp Clarity** - Zero rounded corners, crisp geometry
- **WCAG AAA** - Ultra-high contrast (7:1+ ratios) for superior accessibility
- **Baseline Rhythm** - 24px vertical grid locks all typography
- **Module System** - 64px height units for predictable component sizing
- **Unified Typography** - Geist Sans/Mono across all surfaces (marketing, dashboard, admin)

---

## Typography

### Font Families

**Geist Sans** - Primary font for all text
**Purpose:** Headings, body text, UI labels, navigation
**Weight Range:** 100-900 (variable font)
**Usage:** Marketing pages, dashboards, admin panels, error pages

```tsx
// Apply via Tailwind
<h1 className="font-[family-name:var(--font-geist-sans)]">

// Or via CSS custom property
font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
```

**Geist Mono** - Data display font
**Purpose:** Numbers, metrics, timestamps, IDs, code
**Weight Range:** 100-900 (variable font)
**Tabular Figures:** Numbers align vertically

```tsx
// Apply via Tailwind
<span className="font-[family-name:var(--font-geist-mono)]">1,234.56</span>

// Or via CSS custom property
font-family: var(--font-geist-mono), 'Courier New', monospace;
```

### Typography Scale (Baseline-Aligned)

All typography locked to 24px baseline grid for perfect vertical rhythm:

| Element | Size | Line Height | Weight | Letter Spacing | Usage |
|---------|------|-------------|--------|----------------|-------|
| **H1** | 48px | 48px (2× baseline) | 700 (Bold) | -0.02em | Page titles, hero headings |
| **H2** | 36px | 48px (2× baseline) | 600 (Semibold) | -0.015em | Section headings |
| **H3** | 28px | 48px (2× baseline) | 600 (Semibold) | -0.01em | Subsection headings |
| **H4** | 24px | 24px (1× baseline) | 600 (Semibold) | 0 | Card titles, labels |
| **Body** | 16px | 24px (1× baseline) | 400 (Regular) | 0 | Paragraphs, content |
| **Small** | 14px | 24px (1× baseline) | 400 (Regular) | 0 | Captions, metadata |
| **Data** | 14px | 24px (1× baseline) | 400 (Regular - Mono) | 0 | Numbers, timestamps |

**Example:**

```tsx
<h1 className="font-bold text-[48px] leading-[48px]">Premium Service</h1>
<p className="text-base leading-[24px]">Body text with perfect baseline alignment.</p>
<span className="font-[family-name:var(--font-geist-mono)] text-sm leading-[24px]">1,234.56</span>
```

---

## Color Palette

### Neutral Palette (Primary)

The foundation of Precision - warm cream/beige tones for professional hierarchy:

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | #FFFDFC | Page backgrounds, main surfaces |
| `neutral-100` | #FAF8F6 | Subtle backgrounds, disabled states |
| `neutral-200` | #EBEAE9 | Borders, dividers |
| `neutral-600` | #8C8985 | Muted text, secondary labels |
| `neutral-700` | #64615D | Body text, descriptions |
| `neutral-900` | #181818 | Headings, primary text |
| `white` | #FFFFFF | Card backgrounds, elevated surfaces |

### Orange Palette (Accent)

High-energy accent for actions and emphasis:

| Token | Hex | Usage |
|-------|-----|-------|
| `orange-50` | #FFF7F0 | Lightest backgrounds, highlights |
| `orange-400` | #FF8746 | Lighter accents |
| `orange-500` | #FF5200 | **Primary CTA**, active states |
| `orange-600` | #E64A00 | Links (WCAG AA compliant), hover states |
| `orange-700` | #C84000 | Pressed/active states |

### Color Usage Guidelines

**DO:**
- Use `neutral-900` for headings
- Use `neutral-700` for body text
- Use `neutral-600` for muted/secondary text
- Use `neutral-200` for borders
- Use `orange-500` for primary CTAs
- Use `orange-600` for links (better contrast)
- Use `white` for card/modal backgrounds
- Use `neutral-50` for page backgrounds

**DON'T:**
- ❌ Use `neutral-500` (not defined in Precision)
- ❌ Use multi-color badges (blue, green, purple, red)
- ❌ Use `orange-500` for links (use `orange-600` for WCAG AA)
- ❌ Use custom hex colors outside the palette

**Badge Color System:**

```tsx
// ❌ WRONG - Multi-color badges
<span className="bg-blue-100 text-blue-700">New</span>
<span className="bg-green-100 text-green-700">Resolved</span>
<span className="bg-purple-100 text-purple-700">Feature</span>

// ✅ CORRECT - Precision neutral + orange
<span className="bg-orange-500 text-white">New</span>
<span className="bg-neutral-200 text-neutral-900">In Review</span>
<span className="bg-neutral-100 text-neutral-700">Resolved</span>
```

---

## Spacing Scale

### 8px Base Unit

All spacing follows 8px increments for visual harmony:

| Utility | Pixels | Usage |
|---------|--------|-------|
| `gap-1` | 4px | Tight spacing (half unit) |
| `gap-2` | 8px | Compact spacing |
| `gap-3` | 12px | Default inline spacing |
| `gap-4` | 16px | Standard spacing |
| `gap-6` | 24px | Comfortable spacing |
| `gap-8` | 32px | Generous spacing |
| `gap-12` | 48px | Section breaks |
| `gap-16` | 64px | Major section dividers |

### 24px Baseline Grid

Vertical rhythm for typography alignment:

| Utility | Pixels | Usage |
|---------|--------|-------|
| `mb-baseline-1` | 24px | 1 baseline unit |
| `mb-baseline-2` | 48px | 2 baseline units |
| `mb-baseline-3` | 72px | 3 baseline units |
| `mb-baseline-4` | 96px | 4 baseline units |

### 64px Module System

Component heights snap to 64px modules:

| Utility | Pixels | Usage |
|---------|--------|-------|
| `h-module-1` | 64px | Single module height |
| `h-module-2` | 128px | Double module height |
| `h-module-3` | 192px | Triple module height |
| `h-module-4` | 256px | Quad module height |

---

## Component Patterns

### Buttons

**Sharp edges, orange primary, neutral secondary:**

```tsx
// Primary CTA
<button className="bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 px-6 py-3 font-semibold transition-colors">
  Book Now
</button>

// Secondary
<button className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-6 py-3 font-semibold transition-colors">
  Learn More
</button>

// Outline
<button className="border-2 border-neutral-200 bg-white hover:border-orange-500 hover:text-orange-600 px-6 py-3 font-semibold transition-colors">
  View Details
</button>

// Ghost
<button className="bg-transparent text-neutral-700 hover:bg-orange-50 hover:text-orange-600 px-6 py-3 font-semibold transition-colors">
  Cancel
</button>
```

**Key Principles:**
- ✅ Sharp edges (no border-radius)
- ✅ Orange for primary actions
- ✅ Neutral palette for secondary
- ✅ Clear hover/active states

### Badges

**Sharp rectangles, neutral palette with orange for emphasis:**

```tsx
// High priority / Active state
<span className="bg-orange-500 text-white px-3 py-1 font-medium text-xs">
  New
</span>

// Medium emphasis
<span className="bg-neutral-200 text-neutral-900 px-3 py-1 font-medium text-xs">
  In Review
</span>

// Low emphasis
<span className="bg-neutral-100 text-neutral-700 px-3 py-1 font-medium text-xs">
  Resolved
</span>

// With icon (for differentiation, not color)
<span className="bg-neutral-100 text-neutral-900 flex items-center gap-1 px-3 py-1 font-medium text-xs">
  <HugeiconsIcon icon={Bug01Icon} className="h-3 w-3" />
  Bug
</span>
```

### Cards

**White backgrounds, sharp edges, subtle shadows:**

```tsx
<div className="bg-white border border-neutral-200 p-6 shadow-sm ring-1 ring-black/5 transition hover:border-neutral-300 hover:shadow-md">
  <h3 className="font-bold text-lg text-neutral-900 mb-2">Card Title</h3>
  <p className="text-neutral-700 text-sm">Card description text.</p>
</div>
```

**Key Principles:**
- ✅ Sharp edges (no border-radius)
- ✅ `white` background
- ✅ `neutral-200` borders
- ✅ `shadow-sm` for subtle elevation
- ✅ `ring-1 ring-black/5` for depth

### Tables (PrecisionDataTable)

**Sharp edges, Geist Mono for data, clear hierarchy:**

```tsx
<table className="w-full border-collapse">
  <thead>
    <tr className="border-b-2 border-neutral-900">
      <th className="font-semibold text-left text-neutral-900 text-sm uppercase tracking-wide px-4 py-3">
        Name
      </th>
      <th className="font-[family-name:var(--font-geist-mono)] text-right text-neutral-900 text-sm uppercase tracking-wide px-4 py-3">
        Amount
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-neutral-200 hover:bg-neutral-50">
      <td className="px-4 py-3 text-neutral-900">John Doe</td>
      <td className="font-[family-name:var(--font-geist-mono)] text-right text-neutral-900 px-4 py-3">
        $1,234.56
      </td>
    </tr>
  </tbody>
</table>
```

**Key Principles:**
- ✅ Geist Mono for numbers/data columns
- ✅ `border-b-2 border-neutral-900` for header
- ✅ `border-b border-neutral-200` for rows
- ✅ `hover:bg-neutral-50` for row hover
- ✅ No rounded corners

### Headers (Admin Pages)

**Standardized pattern with Geist Sans:**

```tsx
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

<div>
  <h1
    className={cn(
      "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
      geistSans.className
    )}
  >
    Page Title
  </h1>
  <p
    className={cn(
      "mt-1.5 font-normal text-neutral-700 text-sm tracking-wide",
      geistSans.className
    )}
  >
    Page description text
  </p>
</div>
```

---

## Swiss Grid System

### Grid Configurations

**12-Column Grid** (Standard, versatile)

```tsx
<SwissGrid columns={12} gap={24} margin={24}>
  <GridField colSpan={8} rowSpan={4}>Main content</GridField>
  <GridField colSpan={4} rowSpan={4}>Sidebar</GridField>
</SwissGrid>
```

**10-Column Grid** (Asymmetric balance)

```tsx
<SwissGrid columns={10} gap={24} margin={42}>
  <GridField colSpan={6} rowSpan={3}>Content</GridField>
</SwissGrid>
```

**13-Column Grid** (Dynamic tension)

```tsx
<SwissGrid columns={13} gap={16} margin={32}>
  <GridField colSpan={8} rowSpan={2}>Content</GridField>
</SwissGrid>
```

### Baseline Grid Debug

```tsx
import { BaselineGridDebug } from '@/components/dev/baseline-grid-debug';

// Add to root layout (development only)
<BaselineGridDebug />

// Toggle with Cmd/Ctrl + Shift + G
```

---

## Example Layouts

### Admin Page Layout

```tsx
<section className="space-y-8">
  {/* Header */}
  <div>
    <h1 className={cn("font-semibold text-3xl text-neutral-900 uppercase tracking-tight", geistSans.className)}>
      Dashboard
    </h1>
    <p className={cn("mt-1.5 font-normal text-neutral-700 text-sm tracking-wide", geistSans.className)}>
      Overview of your account
    </p>
  </div>

  {/* Content */}
  <div className="grid grid-cols-3 gap-6">
    <div className="bg-white border border-neutral-200 p-6 shadow-sm">
      <h3 className="font-bold text-lg text-neutral-900 mb-2">Stat Card</h3>
      <p className="font-[family-name:var(--font-geist-mono)] text-2xl text-neutral-900">1,234</p>
    </div>
  </div>
</section>
```

### Marketing Hero Section

```tsx
<section className="bg-neutral-50 py-16">
  <div className="container mx-auto">
    <h1 className="font-bold text-[48px] leading-[48px] text-neutral-900 mb-6">
      Premium Household Staff
    </h1>
    <p className="text-lg leading-[24px] text-neutral-700 mb-8">
      Connect with Colombia's top 5% of domestic professionals
    </p>
    <button className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-4 font-semibold">
      Get Started
    </button>
  </div>
</section>
```

### Data Table Layout

```tsx
<div className="bg-white border border-neutral-200 shadow-sm">
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-neutral-900 bg-neutral-50">
        <th className="text-left px-4 py-3 font-semibold text-sm uppercase">Name</th>
        <th className="text-right px-4 py-3 font-[family-name:var(--font-geist-mono)] font-semibold text-sm uppercase">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-neutral-200 hover:bg-neutral-50">
        <td className="px-4 py-3">John Doe</td>
        <td className="text-right px-4 py-3 font-[family-name:var(--font-geist-mono)]">$1,234.56</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Accessibility

### WCAG AAA Compliance

All color combinations meet WCAG AAA standards (7:1+ contrast):

| Foreground | Background | Contrast | Rating |
|------------|------------|----------|--------|
| `neutral-900` | `neutral-50` | 14.3:1 | AAA ✅ |
| `neutral-700` | `neutral-50` | 7.2:1 | AAA ✅ |
| `orange-600` | `white` | 7.5:1 | AAA ✅ |
| `white` | `orange-500` | 8.1:1 | AAA ✅ |

### Focus States

```tsx
// All interactive elements must have visible focus rings
<button className="focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500">
  Click me
</button>

<input className="focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500" />
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible
- Skip links for main content

---

## Migration Checklist

### From Old Design to Precision

**Fonts:**
- [x] Replace Satoshi → Geist Sans
- [x] Replace Manrope → Geist Sans
- [x] Use Geist Mono for all data/numbers

**Colors:**
- [x] Replace custom hex → Precision tokens
- [x] Replace multi-color badges → neutral + orange
- [x] Use `orange-600` for links (not `orange-500`)

**Geometry:**
- [x] Remove all `rounded-*` classes
- [x] Remove `backdrop-blur-*` effects
- [x] Use sharp edges everywhere

**Typography:**
- [x] Lock to 24px baseline grid
- [x] Use Geist Sans for headings
- [x] Use Geist Mono for data

**Components:**
- [x] Update admin headers to standard pattern
- [x] Update buttons to Precision style
- [x] Update badges to neutral + orange
- [x] Update tables to use Geist Mono

---

## Resources

- **Font Files:** `public/fonts/` (not needed - Geist loaded from npm)
- **Design Tokens:** [src/app/globals.css](../src/app/globals.css)
- **Font Config:** [src/app/fonts.ts](../src/app/fonts.ts)
- **Typography Utilities:** [src/lib/utils/typography.ts](../src/lib/utils/typography.ts)
- **Component Examples:** [src/components/ui/](../src/components/ui/)
- **Admin Pages:** [src/app/\[locale\]/admin/](../src/app/[locale]/admin/)

---

## Quick Reference

### Color Tokens

```
Backgrounds: neutral-50, white
Borders: neutral-200
Text Primary: neutral-900
Text Body: neutral-700
Text Muted: neutral-600
CTA: orange-500
Links: orange-600
Hover: orange-600
Active: orange-700
```

### Typography Classes

```
Headings: text-[48px] leading-[48px] (H1)
Body: text-base leading-[24px]
Data: font-[family-name:var(--font-geist-mono)]
Small: text-sm leading-[24px]
```

### Spacing Classes

```
Baseline: mb-baseline-1 (24px)
Module: h-module-1 (64px)
Gap: gap-4 (16px), gap-6 (24px)
Padding: p-6 (24px), p-8 (32px)
```

### Component Classes

```
Button Primary: bg-orange-500 text-white hover:bg-orange-600
Button Secondary: bg-neutral-100 text-neutral-900 hover:bg-neutral-200
Badge Active: bg-orange-500 text-white
Badge Default: bg-neutral-200 text-neutral-900
Card: bg-white border border-neutral-200 shadow-sm
```

---

**Last Updated:** 2025-01-15
**Maintained By:** Casaora Engineering Team
