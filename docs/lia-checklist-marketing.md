# Lia Design System Compliance Checklist - Marketing Pages

This checklist ensures marketing pages (homepage, about, services, pricing) follow the Lia Design System standards.

## ✅ Typography

- [ ] **Geist Sans ONLY** - All text uses `font-[family-name:var(--font-geist-sans)]` or Geist Sans className
- [ ] **Geist Mono for data** - Numbers, prices, stats use `font-[family-name:var(--font-geist-mono)]`
- [ ] **No Satoshi/Manrope** - Zero references to old font families
- [ ] **Baseline alignment** - Line heights are multiples of 24px (24px, 48px, 72px)
- [ ] **Typography scale** - Font sizes follow scale: 48px, 36px, 24px, 16px, 14px, 12px
- [ ] **Uppercase headings** - H1 hero titles use `uppercase` class
- [ ] **Tight tracking** - Headings use `tracking-tight` for precision

**Quick Fix:**
```tsx
// ❌ WRONG
<h1 style={{ fontFamily: "var(--font-satoshi)" }}>Title</h1>

// ✅ CORRECT
<h1 className="font-[family-name:var(--font-geist-sans)] font-bold text-4xl uppercase tracking-tight">
  Title
</h1>
```

---

## ✅ Color Palette

- [ ] **No custom hex colors** - All colors use Tailwind tokens
- [ ] **Neutral palette** - Backgrounds use `neutral-50`, cards use `white`
- [ ] **Text colors** - Headings `neutral-900`, body `neutral-700`, muted `neutral-600`
- [ ] **Orange CTAs** - Primary buttons use `bg-orange-500 hover:bg-orange-600`
- [ ] **Orange links** - Links use `text-orange-600` (WCAG AAA compliant)
- [ ] **Borders** - All borders use `border-neutral-200`

**Quick Fix:**
```tsx
// ❌ WRONG
<button className="bg-[#FF5200]">Book Now</button>

// ✅ CORRECT
<button className="bg-orange-500 hover:bg-orange-600 text-white">
  Book Now
</button>
```

---

## ✅ Geometry & Spacing

- [ ] **Zero rounded corners** - No `rounded-md`, `rounded-lg`, `rounded-xl` (use `rounded-sm` ONLY for subtle softness if absolutely needed)
- [ ] **Sharp edges** - Cards and containers have no border radius
- [ ] **8px spacing scale** - All margins/padding are multiples of 8px (0.5, 1, 2, 3, 4, 6, 8, 12, 16...)
- [ ] **24px baseline** - Vertical spacing uses `mb-baseline-1` through `mb-baseline-4`
- [ ] **64px modules** - Section heights use `h-module-1` through `h-module-6`
- [ ] **Consistent gaps** - Grid gaps use `gap-4`, `gap-6`, `gap-8`, `gap-12`

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="rounded-lg p-5 gap-5">

// ✅ CORRECT
<div className="p-6 gap-6">
```

---

## ✅ Component Patterns

### Buttons
- [ ] **Primary CTA** - `bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 font-semibold`
- [ ] **Secondary** - `bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-6 py-3 font-semibold`
- [ ] **Outline** - `border-2 border-neutral-200 bg-white hover:bg-orange-50 hover:border-orange-500 px-6 py-3`
- [ ] **No rounded-full** - Use sharp edges only

### Cards
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Subtle shadow** - `shadow-sm ring-1 ring-black/5`
- [ ] **No border-radius** - Sharp rectangular cards
- [ ] **Consistent padding** - `p-6` or `p-8`

### Hero Sections
- [ ] **Large bold headings** - `text-4xl md:text-5xl lg:text-6xl font-bold`
- [ ] **Neutral background** - `bg-neutral-50` or `bg-white`
- [ ] **Orange accent bar** - `h-1 w-16 bg-orange-500` under headings
- [ ] **Clear CTA hierarchy** - Orange primary, neutral secondary

**Quick Fix:**
```tsx
// ❌ WRONG
<button className="bg-blue-500 rounded-full px-4 py-2">
  Learn More
</button>

// ✅ CORRECT
<button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold">
  Learn More
</button>
```

---

## ✅ Accessibility

- [ ] **WCAG AAA contrast** - All text/background combinations have 7:1+ contrast ratio
- [ ] **Focus states** - All interactive elements have visible focus rings
- [ ] **Focus ring color** - `focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500`
- [ ] **Keyboard navigation** - All CTAs accessible via keyboard
- [ ] **Alt text** - All images have descriptive alt attributes
- [ ] **Semantic HTML** - Proper heading hierarchy (h1 → h2 → h3)
- [ ] **ARIA labels** - Interactive elements have proper labels

**Quick Fix:**
```tsx
// ❌ WRONG
<input className="border border-gray-300" />

// ✅ CORRECT
<input
  className="border border-neutral-200 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
  aria-label="Search services"
/>
```

---

## ✅ Swiss Grid System

- [ ] **12-column grid** - Standard layouts use `grid-cols-1 md:grid-cols-12`
- [ ] **Asymmetric layouts** - Hero sections use 10 or 13-column grids for visual tension
- [ ] **Consistent gaps** - `gap-24` for grid gutters
- [ ] **Baseline alignment** - All content aligns to 24px horizontal lines

---

## 🚫 Common Violations

**DO NOT:**
- ❌ Use `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` (sharp edges only)
- ❌ Use custom hex colors like `#FF5200` (use `orange-500` token)
- ❌ Use Satoshi or Manrope fonts (Geist Sans/Mono only)
- ❌ Use spacing values not in 8px scale (e.g., `p-5`, `gap-7`)
- ❌ Use `bg-gray-*` or `text-gray-*` (use `neutral-*` palette)
- ❌ Skip focus states on buttons/inputs

**DO:**
- ✅ Use sharp rectangular geometry everywhere
- ✅ Use Tailwind color tokens from neutral/orange palettes
- ✅ Use Geist Sans for all text, Geist Mono for data
- ✅ Follow 8px spacing scale strictly
- ✅ Add visible focus states to all interactive elements

---

## 📋 Page-Specific Checks

### Homepage (`src/app/[locale]/page.tsx`)
- [ ] Hero section uses Geist Sans uppercase headings
- [ ] CTA buttons use orange-500 with proper hover states
- [ ] Service cards have sharp edges and neutral borders
- [ ] All spacing follows 8px/24px scales

### Services Page
- [ ] Service tabs have sharp edges
- [ ] Service cards use white backgrounds with neutral-200 borders
- [ ] Feature lists use orange accent bars
- [ ] All images have proper alt text

### Pricing Page
- [ ] Pricing cards have no border radius
- [ ] Price numbers use Geist Mono font
- [ ] CTA buttons follow primary/secondary patterns
- [ ] Feature checkmarks use orange accent color

---

## 🔍 Quick Audit Commands

```bash
# Find rounded corners
grep -r "rounded-md\|rounded-lg\|rounded-xl\|rounded-full" src/components/sections/

# Find custom hex colors
grep -r "#[0-9A-Fa-f]\{6\}" src/components/sections/

# Find old fonts
grep -r "satoshi\|manrope" src/components/sections/

# Find non-8px spacing
grep -r "p-5\|p-7\|gap-5\|gap-7\|m-5\|m-7" src/components/sections/
```

---

## ✅ Sign-Off

Once all checks pass:

- [ ] Typography uses Geist Sans/Mono exclusively
- [ ] Colors use neutral/orange palette tokens only
- [ ] Geometry has zero rounded corners (sharp edges)
- [ ] Components follow button/card/hero patterns
- [ ] Accessibility meets WCAG AAA standards
- [ ] Spacing follows 8px/24px/64px scales
- [ ] No custom hex colors or old fonts

**Reviewer:** _________________
**Date:** _________________
**Page:** _________________
