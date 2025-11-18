# Casaora - Typography & Design System

## Lia Design System Overview

**Casaora uses the Lia Design System for mathematical precision, data-focused aesthetics, and professional sophistication.**

### Core Design Principles

1. **Zero Rounded Corners** - Sharp, precise edges for professional, data-focused aesthetic
2. **Geist Fonts Exclusively** - Geist Sans for UI, Geist Mono for numbers/data/code
3. **8px Grid System** - All spacing in multiples of 8px
4. **24px Baseline Grid** - Typography locked to 24px vertical rhythm
5. **Neutral + Orange Palette** - Warm, sophisticated color system

---

## Typography System

### Fonts

**Casaora uses Geist and Geist Mono for a clean, modern aesthetic.**

**Font Configuration:** [`src/app/fonts.ts`](../src/app/fonts.ts)

```typescript
import { Geist, Geist_Mono } from 'next/font/google';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
```

### Font Usage Guidelines

| Font | Use Cases | Examples |
|------|-----------|----------|
| **Geist Sans** | All UI, headings, body text, buttons, forms, navigation | Everything in the app |
| **Geist Mono** | Code blocks, technical data, timestamps, IDs, numbers | Admin panels, developer tools, logs, analytics |

### Typography Examples

```tsx
// Headings - Geist Sans (default)
<h1 className="text-[48px] leading-[48px] font-bold mb-baseline-2">
  Premium Household Staff
</h1>

<h2 className="text-[36px] leading-[48px] font-semibold mb-baseline-1">
  Our Services
</h2>

// Body text - Geist Sans (default)
<p className="text-base leading-[24px] mb-baseline-1">
  Casaora connects discerning households with Colombia's top 5% of domestic professionals.
</p>

// Explicit mono font for code/data
<code className="font-[family-name:var(--font-geist-mono)]">
  booking_id_12345
</code>

// Technical data with mono font
<span className="font-[family-name:var(--font-geist-mono)] text-sm">
  2025-01-17 14:30:00 UTC
</span>
```

### Font Loading (Root Layout)

```typescript
// src/app/[locale]/layout.tsx
import { geistSans, geistMono } from '../fonts';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### CSS Variables

```css
/* globals.css */

/* Typography - Geist Fonts */
--font-geist-sans: var(--font-geist-sans);
--font-geist-mono: var(--font-geist-mono);
```

---

## Baseline Grid System

**The 24px baseline grid ensures perfect vertical rhythm across all typography.**

### Baseline Grid Fundamentals

- **Baseline:** 24px (3 × 8px base unit)
- **All line heights** must be multiples of 24px
- **All vertical spacing** (margin, padding) must be multiples of 24px
- **Typography alignment** locked to horizontal grid lines

### Typography Scale (Baseline-Aligned)

```css
/* globals.css */

h1 {
  font-family: var(--font-geist-sans);
  font-size: 48px;             /* 2 × baseline */
  line-height: 48px;           /* 2 × baseline */
  margin-bottom: var(--baseline); /* 24px */
  font-weight: 700;
  letter-spacing: -0.02em;
}

h2 {
  font-family: var(--font-geist-sans);
  font-size: 36px;             /* 1.5 × baseline */
  line-height: 48px;           /* 2 × baseline (round up) */
  margin-bottom: var(--baseline); /* 24px */
  font-weight: 600;
  letter-spacing: -0.015em;
}

h3 {
  font-family: var(--font-geist-sans);
  font-size: 28px;             /* ~1.17 × baseline */
  line-height: 48px;           /* 2 × baseline (round up) */
  margin-bottom: var(--baseline); /* 24px */
  font-weight: 600;
  letter-spacing: -0.01em;
}

h4 {
  font-family: var(--font-geist-sans);
  font-size: 20px;             /* ~0.83 × baseline */
  line-height: 24px;           /* 1 × baseline */
  margin-bottom: var(--baseline); /* 24px */
  font-weight: 600;
}

/* Body text */
p, ul, ol, li {
  font-family: var(--font-geist-sans);
  font-size: 16px;
  line-height: var(--baseline); /* 24px */
  margin-bottom: var(--baseline); /* 24px */
}

/* Small text */
.text-sm {
  font-size: 14px;
  line-height: var(--baseline); /* 24px */
}

/* Code/data */
code, pre {
  font-family: var(--font-geist-mono);
  line-height: var(--baseline); /* 24px */
}
```

### Baseline-Aligned Typography Utility

```typescript
// src/lib/utils/typography.ts

/**
 * Calculates baseline-aligned line height for any font size
 * @param fontSize - Font size in pixels
 * @param baseline - Baseline grid size (default: 24px)
 * @returns Line height rounded to nearest baseline multiple
 */
export function getBaselineTypography(fontSize: number, baseline: number = 24) {
  const lineHeight = Math.ceil(fontSize / baseline) * baseline;

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}

// Usage
const h1Style = getBaselineTypography(48);
// Returns: { fontSize: '48px', lineHeight: '48px' }

const h2Style = getBaselineTypography(36);
// Returns: { fontSize: '36px', lineHeight: '48px' } (rounded up)
```

### Baseline Spacing Utilities

```css
/* tailwind.config.ts */

/* Baseline spacing utilities (multiples of 24px) */
.mb-baseline-1 { margin-bottom: 24px; }
.mb-baseline-2 { margin-bottom: 48px; }
.mb-baseline-3 { margin-bottom: 72px; }
.mb-baseline-4 { margin-bottom: 96px; }

.mt-baseline-1 { margin-top: 24px; }
.mt-baseline-2 { margin-top: 48px; }
.mt-baseline-3 { margin-top: 72px; }
.mt-baseline-4 { margin-top: 96px; }

.py-baseline-1 { padding-top: 24px; padding-bottom: 24px; }
.py-baseline-2 { padding-top: 48px; padding-bottom: 48px; }
.py-baseline-3 { padding-top: 72px; padding-bottom: 72px; }
.py-baseline-4 { padding-top: 96px; padding-bottom: 96px; }
```

**Usage:**
```tsx
<h1 className="text-[48px] leading-[48px] mb-baseline-2">
  Heading (48px font, 48px line-height, 48px bottom margin)
</h1>

<p className="text-[16px] leading-[24px] mb-baseline-1">
  Body text (16px font, 24px line-height, 24px bottom margin)
</p>
```

---

## Lia Grid System

**The Lia Grid System provides mathematical precision and visual harmony through modular layouts.**

### Grid System Fundamentals

- **Baseline Grid:** 24px (vertical rhythm for typography)
- **Module System:** 64px (8 × 8px) - Layout units for both columns AND rows
- **Mathematical Precision:** All spacing in multiples of 8px, typography aligned to 24px
- **Asymmetric Balance:** Dynamic layouts within rigid structure

### Grid Configurations

**Lia supports three grid configurations:**

| Grid | Columns | Gap | Margin | Use Case |
|------|---------|-----|--------|----------|
| **12-column** | 12 | 24px | 24px | Standard layouts, versatile |
| **10-column** | 10 | 24px | 42px | Asymmetric balance, editorial |
| **13-column** | 13 | 16px | 32px | Dynamic tension, modern |

### Using LiaGrid Component

```tsx
import { LiaGrid, GridField } from '@/components/ui/lia-grid';

// 1. 12-column grid (most common)
<LiaGrid columns={12} gap={24} margin={24}>
  <GridField colSpan={8} rowSpan={4}>Main content</GridField>
  <GridField colSpan={4} rowSpan={4}>Sidebar</GridField>
</LiaGrid>

// 2. 10-column grid (asymmetric)
<LiaGrid columns={10} gap={24} margin={42}>
  <GridField colSpan={6} rowSpan={3}>Content</GridField>
  <GridField colSpan={4} rowSpan={3}>Sidebar</GridField>
</LiaGrid>

// 3. 13-column grid (dynamic)
<LiaGrid columns={13} gap={16} margin={32}>
  <GridField colSpan={8} rowSpan={2}>Content</GridField>
  <GridField colSpan={5} rowSpan={2}>Sidebar</GridField>
</LiaGrid>

// Or use presets
<LiaGrid12>...</LiaGrid12>  // 12-column preset
<LiaGrid10>...</LiaGrid10>  // 10-column preset
<LiaGrid13>...</LiaGrid13>  // 13-column preset
```

### GridField Component

```tsx
interface GridFieldProps {
  colSpan: number;      // Column span (1-12/10/13)
  rowSpan: number;      // Row span in modules (64px units)
  children: ReactNode;
}

// Example: 8 columns wide, 3 modules tall
<GridField colSpan={8} rowSpan={3}>
  <h2>Section Title</h2>
  <p>Content here...</p>
</GridField>
```

### Module Heights

**Modules are 64px units for vertical rhythm:**

```css
/* Module height utilities */
.h-module-1 { height: 64px; }   /* 1 × 64px */
.h-module-2 { height: 128px; }  /* 2 × 64px */
.h-module-3 { height: 192px; }  /* 3 × 64px */
.h-module-4 { height: 256px; }  /* 4 × 64px */
.h-module-5 { height: 320px; }  /* 5 × 64px */
.h-module-6 { height: 384px; }  /* 6 × 64px */
```

**Usage:**
```tsx
<div className="h-module-3">
  Content spans exactly 3 modules (192px)
</div>
```

---

## Design System Constants

**Configuration:** [`src/lib/shared/config/design-system.ts`](../src/lib/shared/config/design-system.ts)

```typescript
// Lia Grid System Constants
export const LIA_GRID = {
  baseline: 24,      // 24px baseline grid
  module: 64,        // 64px module units
  baseUnit: 8,       // 8px base spacing unit
} as const;

// Pre-defined grid configurations
export const GRID_COLUMNS = {
  standard: { columns: 12, gap: 24, margin: 24 },
  asymmetric: { columns: 10, gap: 24, margin: 42 },
  dynamic: { columns: 13, gap: 16, margin: 32 },
} as const;

// Typography Scale (baseline-aligned)
export const TYPOGRAPHY_SCALE = {
  heading: {
    h1: { fontSize: '48px', lineHeight: '48px', fontWeight: 700 },
    h2: { fontSize: '36px', lineHeight: '48px', fontWeight: 600 },
    h3: { fontSize: '28px', lineHeight: '48px', fontWeight: 600 },
    h4: { fontSize: '20px', lineHeight: '24px', fontWeight: 600 },
  },
  body: {
    large: { fontSize: '18px', lineHeight: '24px', fontWeight: 400 },
    base: { fontSize: '16px', lineHeight: '24px', fontWeight: 400 },
    small: { fontSize: '14px', lineHeight: '24px', fontWeight: 400 },
  },
} as const;
```

**Usage:**
```typescript
import { LIA_GRID, TYPOGRAPHY_SCALE } from '@/lib/shared/config/design-system';

// Use constants for consistency
const spacing = LIA_GRID.baseline;  // 24px
const moduleHeight = LIA_GRID.module;  // 64px

// Apply typography styles
const headingStyle = TYPOGRAPHY_SCALE.heading.h1;
// { fontSize: '48px', lineHeight: '48px', fontWeight: 700 }
```

---

## Debug Mode

**Visualize the 24px baseline grid during development.**

### BaselineGridDebug Component

```tsx
// src/components/dev/baseline-grid-debug.tsx
export function BaselineGridDebug() {
  // Only renders in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Horizontal lines every 24px */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-px bg-orange-500/20"
          style={{ top: `${i * 24}px` }}
        />
      ))}
    </div>
  );
}
```

**Add to Root Layout (development only):**
```tsx
// src/app/[locale]/layout.tsx
import { BaselineGridDebug } from '@/components/dev/baseline-grid-debug';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BaselineGridDebug />
      </body>
    </html>
  );
}
```

**Toggle Grid:**
Press `Cmd/Ctrl + Shift + G` to toggle the baseline grid overlay.

---

## Responsive Typography

**Typography scales responsively while maintaining baseline alignment.**

```tsx
// Responsive headings
<h1 className="text-[32px] leading-[48px] md:text-[48px] md:leading-[48px] mb-baseline-2">
  Responsive Heading
</h1>

// Responsive body text
<p className="text-sm leading-[24px] md:text-base md:leading-[24px] mb-baseline-1">
  Responsive paragraph text
</p>

// Responsive spacing
<section className="py-baseline-2 md:py-baseline-3 lg:py-baseline-4">
  Content with responsive vertical spacing
</section>
```

---

## Performance Optimization

### Font Loading Strategy

1. **Google Fonts CDN:** Geist fonts served from Google's optimized CDN
2. **Preloading:** Both fonts preloaded for critical rendering path
3. **Font Display Swap:** Uses `display: swap` to show fallback immediately
4. **Variable Font:** Geist supports all weights dynamically for smaller file sizes

```typescript
// src/app/fonts.ts
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',      // Show fallback immediately
  preload: true,        // Preload for faster rendering
});
```

### Font Fallback Stack

```css
/* globals.css */

body {
  font-family: var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

code {
  font-family: var(--font-geist-mono), 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

---

## Accessibility

### Typography Accessibility

- **Minimum font size:** 14px (WCAG AAA compliant)
- **Line height:** 1.5× font size minimum (24px for 16px text)
- **Contrast ratios:** All text meets WCAG AA standards
  - `neutral-900` on `white` - 16.7:1 (AAA)
  - `neutral-700` on `white` - 11.6:1 (AAA)
  - `orange-600` on `white` - 4.6:1 (AA for large text)

### Semantic HTML

```tsx
// Use semantic headings
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// NOT this
<div className="text-4xl font-bold">Page Title</div>
```

---

## Typography Best Practices

### DO:
- ✅ Use Geist Sans for all UI and content
- ✅ Use Geist Mono for code, data, timestamps, IDs
- ✅ Align all typography to 24px baseline grid
- ✅ Use baseline spacing utilities (`mb-baseline-1`, etc.)
- ✅ Maintain consistent line heights (multiples of 24px)
- ✅ Use semantic HTML headings (`<h1>`, `<h2>`, etc.)
- ✅ Test responsive typography at all breakpoints

### DON'T:
- ❌ Use custom fonts (stick to Geist family)
- ❌ Use arbitrary line heights (must be multiples of 24px)
- ❌ Use arbitrary vertical spacing (use baseline multiples)
- ❌ Mix font families within the same design
- ❌ Use non-semantic headings (`<div>` styled as heading)
- ❌ Use font sizes below 14px
- ❌ Ignore baseline grid alignment

---

## Resources

- [Geist Font Documentation](https://vercel.com/font)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [WCAG Typography Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Baseline Grid Theory](https://alistapart.com/article/settingtypeontheweb/)

---

**Last Updated:** 2025-01-17
**Version:** 1.3.0
