# Casaora Component Library & Design System

**Last Updated:** 2025-01-06
**Version:** 2.0.0

> **IMPORTANT:** This design system uses **Tailwind CSS classes exclusively**. Do NOT create custom CSS variables for spacing. Tailwind's built-in spacing scale provides everything we need.

---

## Table of Contents
- [Design Principles](#design-principles)
- [Spacing System](#spacing-system)
- [Section Templates](#section-templates)
- [Card Patterns](#card-patterns)
- [Button Patterns](#button-patterns)
- [Typography Patterns](#typography-patterns)
- [Color Usage](#color-usage)
- [Responsive Patterns](#responsive-patterns)

---

## Design Principles

### 1. **Consistency First**
- Use the same spacing values for similar elements across all pages
- Follow the spacing hierarchy: Section > Component Group > Element

### 2. **Mobile-First Responsive**
- Start with mobile spacing, progressively enhance for larger screens
- Pattern: `py-12 sm:py-16 lg:py-24` (small → medium → large)

### 3. **Flexbox/Grid with Gap**
- Use `gap-*` classes instead of margin on children
- Example: `flex flex-col gap-6` instead of `<div className="mb-6">` on each child

### 4. **Tailwind Only**
- ✅ Use: `text-gray-600`, `bg-red-50`, `border-gray-200`
- ❌ Avoid: `text-[var(--muted-foreground)]`, custom CSS variables

---

## Spacing System

### Tailwind Spacing Scale (8px base unit)

| Class | Pixels | Rem | Use Case |
|-------|--------|-----|----------|
| `gap-1` | 4px | 0.25rem | Ultra-tight (icon + text) |
| `gap-2` | 8px | 0.5rem | Minimal gaps (badges, inline elements) |
| `gap-3` | 12px | 0.75rem | Tight grouping (form labels, list items) |
| `gap-4` | 16px | 1rem | Default element spacing |
| `gap-6` | 24px | 1.5rem | Card/component internal spacing |
| `gap-8` | 32px | 2rem | Related component groups |
| `gap-12` | 48px | 3rem | Major element separation |
| `gap-16` | 64px | 4rem | Component group spacing |
| `gap-24` | 96px | 6rem | Section spacing |
| `gap-32` | 128px | 8rem | Hero/major sections |

### Vertical Spacing Patterns

#### **Small Sections** (Content-focused, less visual hierarchy)
```tsx
<section className="py-12 sm:py-16 lg:py-20">
  {/* 48px → 64px → 80px */}
</section>
```

#### **Standard Sections** (Most content sections)
```tsx
<section className="py-16 sm:py-20 lg:py-24">
  {/* 64px → 80px → 96px */}
</section>
```

#### **Feature Sections** (High visual impact)
```tsx
<section className="py-20 sm:py-24 lg:py-32">
  {/* 80px → 96px → 128px */}
</section>
```

#### **Hero Sections** (Landing page hero)
```tsx
<section className="py-24 sm:py-32 lg:py-40">
  {/* 96px → 128px → 160px */}
</section>
```

---

## Section Templates

### Template 1: Content Section with Header
Perfect for: Services, Features, Testimonials

```tsx
<section className="py-16 sm:py-20 lg:py-24" id="section-id">
  <Container>
    <div className="mx-auto flex max-w-6xl flex-col gap-16 text-center">
      {/* Header - gap-3 (12px) between tagline and title */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-600">
          Section Label
        </p>
        <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
          Section Title
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Optional subtitle or description
        </p>
      </div>

      {/* Content - gap-6 (24px) for grid items */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Content cards */}
      </div>
    </div>
  </Container>
</section>
```

### Template 2: Two-Column Layout
Perfect for: About, Benefits, Product showcases

```tsx
<section className="py-16 sm:py-20 lg:py-24">
  <Container>
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold sm:text-4xl">Title</h2>
        <p className="text-lg text-gray-600">Description</p>
        <div className="flex flex-col gap-4">
          {/* Feature list */}
        </div>
      </div>

      {/* Right column - visual content */}
      <div className="relative aspect-square overflow-hidden rounded-3xl">
        {/* Image or graphic */}
      </div>
    </div>
  </Container>
</section>
```

### Template 3: CTA Section
Perfect for: Sign-ups, Newsletter, Contact

```tsx
<section className="py-20 sm:py-24 lg:py-32">
  <Container>
    <div className="mx-auto max-w-3xl space-y-8 text-center">
      <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
        Call to Action Title
      </h2>
      <p className="text-lg text-gray-600">
        Supporting text or value proposition
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button className="rounded-full bg-red-600 px-8 py-4 font-semibold text-white hover:bg-red-700">
          Primary CTA
        </button>
        <button className="rounded-full border-2 border-gray-300 px-8 py-4 font-semibold hover:border-gray-400">
          Secondary CTA
        </button>
      </div>
    </div>
  </Container>
</section>
```

---

## Card Patterns

### Standard Card
Feature cards, service cards, product cards

```tsx
<article className="group flex h-full flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
  {/* Icon or visual */}
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
    <Icon className="h-7 w-7 text-red-600" />
  </div>

  {/* Title */}
  <h3 className="text-xl font-semibold">Card Title</h3>

  {/* Description - flex-grow pushes footer to bottom */}
  <p className="flex-grow text-gray-600">
    Card description text that can wrap to multiple lines.
  </p>

  {/* Footer content */}
  <div className="flex flex-col gap-3 border-gray-200 border-t pt-6">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="h-4 w-4" />
      <span>Supporting text</span>
    </div>
  </div>

  {/* CTA */}
  <button className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700">
    Action
  </button>
</article>
```

### Testimonial Card
```tsx
<div className="rounded-2xl bg-white p-8 shadow-sm">
  <div className="flex flex-col gap-6">
    {/* Quote */}
    <blockquote className="text-lg leading-relaxed">
      "Testimonial quote goes here..."
    </blockquote>

    {/* Author */}
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 overflow-hidden rounded-full">
        <Image src={avatar} alt={name} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  </div>
</div>
```

### Stats Card
```tsx
<div className="flex flex-col gap-2 text-center">
  <p className="text-4xl font-bold sm:text-5xl">500+</p>
  <p className="text-gray-600">Verified Professionals</p>
</div>
```

---

## Button Patterns

### Primary Button
```tsx
<button className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700 active:scale-95">
  Primary Action
</button>
```

### Secondary Button
```tsx
<button className="rounded-full border-2 border-gray-300 bg-white px-6 py-3 font-semibold transition-all hover:border-gray-400 hover:bg-gray-50">
  Secondary Action
</button>
```

### Icon Button
```tsx
<button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition-all hover:bg-gray-100">
  <Icon className="h-5 w-5" />
</button>
```

### Text Button / Link
```tsx
<a className="inline-flex items-center gap-2 font-semibold text-red-600 transition-colors hover:text-red-700">
  Learn More
  <ArrowRightIcon className="h-4 w-4" />
</a>
```

---

## Typography Patterns

### Page Header
```tsx
<div className="flex flex-col gap-3 text-center">
  <p className="text-sm font-medium uppercase tracking-wider text-gray-600">
    Overline / Tagline
  </p>
  <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
    Page Title
  </h1>
  <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
    Supporting subtitle or description
  </p>
</div>
```

### Section Header
```tsx
<div className="flex flex-col gap-3">
  <p className="text-sm font-medium uppercase tracking-wider text-gray-600">
    Section Label
  </p>
  <h2 className="text-3xl font-bold sm:text-4xl">
    Section Title
  </h2>
</div>
```

### Content Block
```tsx
<div className="flex flex-col gap-4">
  <h3 className="text-xl font-semibold">Subsection Title</h3>
  <p className="text-gray-600 leading-relaxed">
    Body text with comfortable line height for readability.
  </p>
</div>
```

---

## Color Usage

### Brand Colors
```tsx
// Primary Red
bg-red-600       // #DC2626 - Primary actions
bg-red-700       // #B91C1C - Hover state
bg-red-50        // #FEF2F2 - Light backgrounds
text-red-600     // Red text

// Neutrals (Gray scale)
bg-white         // #FFFFFF - Cards, content
bg-gray-50       // #F9FAFB - Subtle backgrounds
bg-gray-100      // #F3F4F6 - Dividers, borders
text-gray-600    // #4B5563 - Body text
text-gray-900    // #111827 - Headings

// Borders
border-gray-200  // #E5E7EB - Default borders
border-gray-300  // #D1D5DB - Stronger borders
```

### Semantic Colors
```tsx
// Success
bg-green-50 text-green-700   // Success messages
bg-green-600                 // Success buttons

// Warning
bg-yellow-50 text-yellow-700 // Warning messages

// Error
bg-red-50 text-red-700       // Error messages

// Info
bg-blue-50 text-blue-700     // Info messages
```

---

## Responsive Patterns

### Container Widths
```tsx
// Standard container (most sections)
<Container className="max-w-6xl">  {/* 1152px */}

// Wide container (full-width grids)
<Container className="max-w-7xl">  {/* 1280px */}

// Narrow container (text-heavy content)
<Container className="max-w-4xl">  {/* 896px */}

// Extra narrow (forms, CTAs)
<Container className="max-w-3xl">  {/* 768px */}
```

### Responsive Grid Patterns
```tsx
// 1 column → 2 columns → 3 columns
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

// 1 column → 2 columns → 4 columns (steps/features)
<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

// 1 column → 2 columns (equal split)
<div className="grid gap-12 lg:grid-cols-2">

// Asymmetric columns (sidebar layout)
<div className="grid gap-8 lg:grid-cols-[300px_1fr]">
```

### Responsive Text Sizes
```tsx
// Display heading (hero)
className="text-4xl sm:text-5xl lg:text-6xl font-bold"

// Page title
className="text-3xl sm:text-4xl lg:text-5xl font-bold"

// Section heading
className="text-2xl sm:text-3xl lg:text-4xl font-bold"

// Subsection heading
className="text-xl sm:text-2xl font-semibold"

// Body text (large)
className="text-base sm:text-lg"
```

### Responsive Spacing
```tsx
// Section padding
className="py-12 sm:py-16 lg:py-24"

// Component gaps
className="gap-8 sm:gap-12 lg:gap-16"

// Card padding
className="p-6 sm:p-8 lg:p-10"
```

---

## Component Checklist

Before committing a new section/component, verify:

- [ ] Uses Tailwind spacing classes only (no custom CSS variables)
- [ ] Follows mobile-first responsive pattern
- [ ] Uses `gap-*` instead of margin on children
- [ ] Consistent with existing sections (same spacing scale)
- [ ] Proper semantic HTML (`<section>`, `<article>`, `<header>`)
- [ ] Accessible (proper heading hierarchy, ARIA labels where needed)
- [ ] Colors use Tailwind classes (e.g., `text-gray-600`, not `text-[var(--muted-foreground)]`)
- [ ] Responsive text sizes defined
- [ ] Hover states on interactive elements
- [ ] Proper focus states for keyboard navigation

---

## Migration Guide

### Replacing CSS Variables with Tailwind

**Old (CSS Variables):**
```tsx
className="text-[var(--foreground)]"
className="bg-[var(--background-alt)]"
className="border-[var(--border)]"
className="text-[var(--muted-foreground)]"
className="bg-[var(--red)]"
```

**New (Tailwind Classes):**
```tsx
className="text-gray-900"        // Foreground
className="bg-gray-50"           // Background alt
className="border-gray-200"      // Border
className="text-gray-600"        // Muted foreground
className="bg-red-600"           // Red accent
```

### Replacing space-y with gap

**Old:**
```tsx
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**New:**
```tsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Questions?

For questions or suggestions, create a GitHub issue or discussion.
