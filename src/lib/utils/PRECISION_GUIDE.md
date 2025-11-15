# Precision Design System Utilities Guide

Quick reference for using Casaora's Precision design system utilities.

## Import

```typescript
import { spacing, baseline, typography, colors, grid, cn } from '@/lib/utils/precision';
```

## Spacing

### Grid Spacing (8px multiples)

```tsx
// Use constants in inline styles
<div style={{ marginBottom: spacing.grid(4) }}>  // 16px
<div style={{ padding: spacing.grid(6) }}>       // 24px

// Available values: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px),
//                   6 (24px), 8 (32px), 10 (40px), 12 (48px), etc.
```

### Baseline Spacing (24px multiples)

```tsx
// Use Tailwind utility classes
<div className="mb-baseline-1">  // margin-bottom: 24px
<div className="mb-baseline-2">  // margin-bottom: 48px
<div className="mt-baseline-3">  // margin-top: 72px
<div className="py-baseline-1">  // padding-y: 24px

// Or use constants
<div style={{ marginBottom: spacing.baseline(2) }}>  // 48px
```

### Module Heights (64px multiples)

```tsx
// Use Tailwind utility classes
<div className="h-module-1">      // height: 64px
<div className="h-module-3">      // height: 192px
<div className="min-h-module-2">  // min-height: 128px

// Or use constants
<div style={{ height: spacing.module(3) }}>  // 192px
```

## Typography

### Pre-defined Scales

```tsx
// Display typography (hero sections)
const hero = typography.display('xl');
<h1 className={hero.className}>  // text-[72px] leading-[72px]

// Heading typography
const h1 = typography.heading('h1');
<h1 className={h1.className}>  // text-[48px] leading-[48px]

// Body typography
const body = typography.body('base');
<p className={body.className}>  // text-[16px] leading-[24px]
```

### Custom Typography

```tsx
// Generate baseline-aligned typography for any font size
const custom = typography.custom(32);
<div className={custom.className}>  // text-[32px] leading-[48px]

// Line height is automatically rounded up to nearest 24px multiple
typography.custom(18)  // → { fontSize: '18px', lineHeight: '24px' }
typography.custom(32)  // → { fontSize: '32px', lineHeight: '48px' }
typography.custom(56)  // → { fontSize: '56px', lineHeight: '72px' }
```

## Colors

### Backgrounds

```tsx
<div className={colors.bg.default}>  // bg-neutral-50 (main page)
<div className={colors.bg.card}>     // bg-white (cards)
<div className={colors.bg.muted}>    // bg-neutral-100 (muted areas)
```

### Text

```tsx
<h1 className={colors.text.default}>  // text-neutral-900 (headings)
<p className={colors.text.body}>      // text-neutral-700 (body text)
<span className={colors.text.muted}>  // text-neutral-600 (secondary)
```

### Borders

```tsx
<div className={colors.border.default}>  // border-neutral-200
<div className={colors.border.muted}>    // border-neutral-100
```

### Interactive Elements

```tsx
// Primary CTA button
<button className={cn(
  colors.interactive.primary,       // bg-orange-500 text-white
  colors.interactive.primaryHover   // hover:bg-orange-600
)}>
  Click me
</button>

// Link
<a className={colors.interactive.link}>  // text-orange-600 hover:text-orange-700
  Learn more
</a>
```

## Grid System

### Swiss Grid Columns

```tsx
// 10-column asymmetric grid
<div className={grid.cols10}>
  {/* 10 equal columns */}
</div>

// 13-column dynamic grid
<div className={grid.cols13}>
  {/* 13 equal columns */}
</div>

// Standard 12-column (built into Tailwind)
<div className="grid-cols-12">
  {/* 12 equal columns */}
</div>
```

## Validation

### Check Baseline/Module Alignment

```tsx
import { validate } from '@/lib/utils/precision';

// Check if value aligns to baseline (24px)
validate.isBaseline(48);  // true (2 × 24px)
validate.isBaseline(50);  // false

// Check if value aligns to module (64px)
validate.isModule(128);   // true (2 × 64px)
validate.isModule(100);   // false

// Calculate module count for height
validate.getModules(200);  // 4 (rounds up to 4 × 64px = 256px)

// Get module height in pixels
validate.getModuleHeight(3);  // 192px (3 × 64px)
```

## Complete Examples

### Hero Section

```tsx
import { typography, baseline, colors, cn } from '@/lib/utils/precision';

export function HeroSection() {
  const heading = typography.display('xl');
  const subheading = typography.body('xl');

  return (
    <section className={cn(
      colors.bg.default,
      baseline.py[4],  // padding-y: 96px
      "text-center"
    )}>
      <h1 className={cn(
        heading.className,     // text-[72px] leading-[72px]
        colors.text.default,   // text-neutral-900
        baseline.mb[2]         // margin-bottom: 48px
      )}>
        Welcome to Casaora
      </h1>

      <p className={cn(
        subheading.className,  // text-[20px] leading-[24px]
        colors.text.body,      // text-neutral-700
        baseline.mb[3]         // margin-bottom: 72px
      )}>
        Premium household professionals
      </p>

      <button className={cn(
        colors.interactive.primary,      // bg-orange-500 text-white
        colors.interactive.primaryHover, // hover:bg-orange-600
        "px-8 py-4 rounded-full font-semibold"
      )}>
        Get Started
      </button>
    </section>
  );
}
```

### Card Component

```tsx
import { spacing, baseline, colors, module, cn } from '@/lib/utils/precision';

export function Card({ title, children }: CardProps) {
  const cardTitle = typography.heading('h3');

  return (
    <div className={cn(
      colors.bg.card,           // bg-white
      colors.border.default,    // border-neutral-200
      module.minH[2],           // min-height: 128px (2 modules)
      "border rounded-lg p-6"
    )}>
      <h3 className={cn(
        cardTitle.className,    // text-[28px] leading-[48px]
        colors.text.default,    // text-neutral-900
        baseline.mb[1]          // margin-bottom: 24px
      )}>
        {title}
      </h3>

      <div className={colors.text.body}>
        {children}
      </div>
    </div>
  );
}
```

### Data Dashboard

```tsx
import { spacing, baseline, typography, colors, grid, cn } from '@/lib/utils/precision';

export function Dashboard() {
  const sectionTitle = typography.heading('h2');
  const statValue = typography.display('md');

  return (
    <div className={cn(
      colors.bg.default,        // bg-neutral-50
      baseline.py[3]            // padding-y: 72px
    )}>
      <h2 className={cn(
        sectionTitle.className, // text-[36px] leading-[48px]
        baseline.mb[2]          // margin-bottom: 48px
      )}>
        Analytics Overview
      </h2>

      <div className={cn(
        grid.cols10,            // 10-column Swiss grid
        "gap-6"
      )}>
        {stats.map(stat => (
          <div key={stat.id} className={cn(
            colors.bg.card,
            colors.border.default,
            module.h[2],        // height: 128px (2 modules)
            "col-span-2 border rounded-lg p-6"
          )}>
            <div className={cn(
              statValue.className,   // text-[48px] leading-[48px]
              colors.text.default
            )}>
              {stat.value}
            </div>
            <div className={colors.text.muted}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Design Principles

1. **Always use baseline multiples (24px)** for vertical spacing
2. **Always use grid multiples (8px)** for horizontal spacing
3. **Always use module heights (64px)** for component heights
4. **Always use Precision colors** (neutral + orange palette)
5. **Always maintain baseline-aligned typography** for vertical rhythm

## Resources

- **Constants**: `src/lib/shared/config/design-system.ts`
- **Typography helpers**: `src/lib/utils/typography.ts`
- **CSS utilities**: `src/app/globals.css` (lines 227-271)
- **Consolidated utilities**: `src/lib/utils/precision.ts` (this module)
