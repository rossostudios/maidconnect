# CASAORA Design System

**Version:** 2.0 (Staays-Inspired Redesign)
**Last Updated:** November 4, 2025
**Status:** Active

Comprehensive design system documentation for the CASAORA platform. This document defines all design tokens, color palettes, typography scales, spacing systems, and reusable component patterns used throughout the application.

---

## Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Border Radius](#border-radius)
6. [Shadows](#shadows)
7. [Component Patterns](#component-patterns)
8. [Layout & Grid](#layout--grid)
9. [Effects & Animations](#effects--animations)
10. [Accessibility](#accessibility)
11. [Responsive Design](#responsive-design)
12. [Implementation Examples](#implementation-examples)

---

## Overview

### Design Philosophy

CASAORA's design system embodies **quiet luxury** - sophisticated, understated elegance that prioritizes quality over flash. Inspired by premium hospitality brands like Staays, our visual language emphasizes:

- **Breathing room**: Generous white space and uncluttered layouts
- **Typography as art**: Bold, confident headlines that command attention
- **Strategic color use**: Cream and charcoal foundation with red accents
- **Refined details**: Subtle shadows, smooth transitions, thoughtful micro-interactions
- **Accessibility first**: WCAG AAA compliance, keyboard navigation, semantic HTML

### Design Principles

1. **Clarity over complexity**: Every element serves a purpose
2. **Consistency builds trust**: Reusable patterns across the platform
3. **Performance matters**: Optimize for speed without sacrificing aesthetics
4. **Mobile-first**: Responsive design from the ground up
5. **Accessible by default**: Design for all users, all abilities

---

## Color System

### Core Palette

CASAORA uses a refined three-color foundation inspired by luxury interiors:

```css
:root {
  /* Primary Colors */
  --cream: #FFFCF8;        /* Warm white background */
  --charcoal: #1A1A1A;     /* Deep gray-black for text */
  --red: #E63946;          /* Vibrant accent color */

  /* Semantic Mappings */
  --background: #FFFCF8;
  --foreground: #1A1A1A;
  --accent: #E63946;
}
```

#### Color Usage Guide

**Cream (#FFFCF8)**
- **Primary use**: Page backgrounds, card backgrounds, light surfaces
- **Why not pure white**: Cream (#FFFCF8) is warmer and more inviting than stark white (#FFFFFF)
- **Contrast ratio**: 15.8:1 with Charcoal (WCAG AAA ✓)
- **Where to use**: Body backgrounds, card interiors, hero sections

**Charcoal (#1A1A1A)**
- **Primary use**: Body text, headings, icons, dark UI elements
- **Why not black**: Pure black (#000000) can be harsh; Charcoal is softer while maintaining high contrast
- **Contrast ratio**: 15.8:1 on Cream (WCAG AAA ✓)
- **Where to use**: All text content, navigation, icons, form labels

**Red (#E63946)**
- **Primary use**: CTAs, links, hover states, emphasis elements
- **Application**: Used sparingly (1% of visual space) for maximum impact
- **Contrast ratio**: 4.9:1 on Cream (WCAG AA for large text ✓)
- **Where to use**: Primary buttons, link hover states, active states, badges

### Secondary Colors

```css
:root {
  /* Red Variations */
  --red-hover: #D62839;         /* Darker red for hover states */
  --red-light: #FFE8EA;         /* Light red background tint */

  /* Neutral Grays */
  --muted-foreground: #757575;  /* Secondary text, less emphasis */
  --border: #E8E4DC;            /* Borders, dividers, subtle lines */

  /* Surface Colors */
  --surface: #FFFFFF;           /* Pure white for cards on cream */
  --surface-contrast: #1A1A1A;  /* Dark surfaces (footer, etc.) */
}
```

### Semantic Colors

```css
:root {
  /* Feedback Colors */
  --success: #10B981;    /* Green for success states */
  --warning: #F59E0B;    /* Amber for warnings */
  --error: #EF4444;      /* Red for errors (slightly different from accent) */
  --info: #3B82F6;       /* Blue for informational messages */
}
```

### Color Application (90-9-1 Rule)

Visual hierarchy through color distribution:

- **90% Cream**: Backgrounds, white space, breathing room
- **9% Charcoal**: Text, UI elements, structure
- **1% Red**: Accents, CTAs, focal points

This creates visual calm while guiding user attention to key actions.

### Color Contrast Reference

All color combinations meet WCAG 2.1 guidelines:

| Foreground | Background | Ratio | WCAG Level | Use Case |
|------------|-----------|-------|------------|----------|
| Charcoal | Cream | 15.8:1 | AAA | Body text, headings |
| Red | Cream | 4.9:1 | AA (large text) | CTAs, buttons |
| Muted Gray | Cream | 4.6:1 | AA | Secondary text |
| White | Charcoal | 15.8:1 | AAA | Dark surface text |
| Red | White | 4.5:1 | AA | Buttons, badges |

---

## Typography

### Font Stack

CASAORA uses a sophisticated three-font system:

#### Display Font - Cinzel
```css
font-family: var(--font-cinzel), serif;
```

**Use for:**
- Logo and brand name
- Hero headlines (H1)
- Major section headings (H2, H3)
- Professional names
- Emphasized titles

**Weights:**
- Regular (400): Body use (rare)
- Semibold (600): Primary headings
- Bold (700): Extra emphasis

**Character:**
Elegant serif with classical proportions. Conveys sophistication, trust, and timelessness.

#### Accent Font - Spectral
```css
font-family: var(--font-spectral), serif;
```

**Use for:**
- Italic emphasis within paragraphs
- Pull quotes
- Editorial-style callouts
- Captions with personality

**Weights:**
- Regular (400): Body text
- Regular Italic (400): Emphasis
- Semibold (600): Strong emphasis

**Character:**
Editorial serif designed for screen reading. Adds warmth and personality.

#### UI Font - Work Sans
```css
font-family: var(--font-work-sans), sans-serif;
```

**Use for:**
- Body copy
- Navigation links
- Buttons and CTAs
- Form labels and inputs
- UI elements and microcopy

**Weights:**
- Regular (400): Body text
- Medium (500): Labels, captions
- Semibold (600): Buttons, emphasis

**Character:**
Clean, neutral sans-serif. Highly legible, optimized for UI elements.

### Type Scale

CASAORA uses a fluid type scale that adapts to viewport width:

| Style | Font | Size | Weight | Line Height | Spacing |
|-------|------|------|--------|-------------|---------|
| **Display** | Cinzel | clamp(40px, 5vw, 64px) | 600 | 1.18 | 0.005em |
| **H1** | Cinzel | clamp(30px, 3.5vw, 44px) | 600 | 1.2 | 0.005em |
| **H2** | Cinzel | clamp(24px, 2.8vw, 32px) | 600 | 1.25 | 0.005em |
| **H3** | Cinzel | clamp(20px, 2.2vw, 26px) | 600 | 1.3 | 0.005em |
| **UI Heading** | Work Sans | 28px / 22px / 18px | 600 | 1.3–1.4 | 0 |
| **Body Large** | Work Sans | 18px | 400 | 1.65 | 0 |
| **Body** | Work Sans | 16px | 400 | 1.65 | 0 |
| **Body Small** | Work Sans | 13-14px | 400 | 1.55 | 0 |
| **Caption** | Work Sans | 12px | 500 | 1.45 | 0.05em |
| **Label** | Work Sans | 12px | 600 | 1.35 | 0.08em |

### Typography Patterns

#### Utility Classes

To make the scale easy to consume in JSX, we ship Tailwind-style utilities that wrap the CSS variables defined in `globals.css`:

| Class | Use Case | Token Mapping |
|-------|----------|---------------|
| `type-serif-display` | Hero headlines, hero stats | `var(--font-display)` / `var(--leading-display)` |
| `type-serif-lg` | Section headlines, marquee cards | `var(--font-h1)` / `var(--leading-h1)` |
| `type-serif-md` | Card titles, supporting headings | `var(--font-h2)` / `var(--leading-h2)` |
| `type-serif-sm` | Inline callouts, small serif moments | `var(--font-h3)` / `var(--leading-h3)` |
| `type-ui-lg` | Dashboard H1, modal titles | 28px Work Sans |
| `type-ui-md` | Section labels in app surfaces | 22px Work Sans |
| `type-ui-sm` | Card headings, table headers | 18px Work Sans |

All serif utilities default to Cinzel at 600 weight and apply the refined tracking value (0.005em). UI utilities default to Work Sans at 600 weight with neutral tracking.

#### Hero Headline
```tsx
<h1 className="type-serif-display text-[var(--foreground)]">
  Find trusted home professionals
</h1>
```

#### Section Heading
```tsx
<h2 className="type-serif-lg text-[var(--foreground)]">
  How it works
</h2>
```

#### Body Paragraph
```tsx
<p className="font-[family-name:var(--font-work-sans)] text-base text-[var(--muted-foreground)] leading-relaxed">
  Premium cleaning, personal chef services, and more.
</p>
```

#### Editorial Emphasis
```tsx
<p className="type-serif-md leading-[1.45] text-[#E8D896]">
  We care about{" "}
  <span className="font-[family-name:var(--font-spectral)] italic text-[var(--cream)]">
    being better
  </span>
  .
</p>
```

#### Label/Caption
```tsx
<p className="font-medium text-xs text-[var(--muted-foreground)] uppercase tracking-[0.1em]">
  Featured Professional
</p>
```

### Typography Best Practices

**Do:**
- Use Cinzel for major headings and brand elements
- Use Work Sans for all UI elements and body text
- Use Spectral italic for emphasis within text blocks
- Maintain line-height of 1.6 for body text
- Use uppercase sparingly (labels and small caps only)
- Test readability on actual devices

**Don't:**
- Mix more than 2 font families on a single page
- Use font sizes smaller than 14px (except in rare cases)
- Use ALL CAPS for paragraphs or large text blocks
- Use pure black (#000) - always use Charcoal (#1A1A1A)
- Stack multiple italic elements
- Use letter-spacing on body copy

---

## Spacing System

CASAORA uses an 8px base unit for all spacing to create visual rhythm and consistency.

### Spacing Scale

```css
:root {
  --space-1: 8px;     /* 0.5rem */
  --space-2: 16px;    /* 1rem */
  --space-3: 24px;    /* 1.5rem */
  --space-4: 32px;    /* 2rem */
  --space-5: 40px;    /* 2.5rem */
  --space-6: 48px;    /* 3rem */
  --space-7: 64px;    /* 4rem */
  --space-8: 80px;    /* 5rem */
  --space-9: 96px;    /* 6rem */
  --space-10: 128px;  /* 8rem */
}
```

### Spacing Usage Guide

| Spacing | Pixels | Tailwind | Use Case |
|---------|--------|----------|----------|
| xs | 8px | `gap-2`, `p-2` | Icon gaps, tight spacing |
| sm | 16px | `gap-4`, `p-4` | Button padding, form field spacing |
| md | 24px | `gap-6`, `p-6` | Card padding, component spacing |
| lg | 32px | `gap-8`, `p-8` | Section spacing, feature cards |
| xl | 48px | `gap-12`, `p-12` | Large section spacing |
| 2xl | 64px | `gap-16`, `p-16` | Major section spacing |
| 3xl | 96px | `gap-24`, `p-24` | Hero sections, page margins |

### Vertical Rhythm

Maintain consistent vertical spacing using the 8px grid:

```tsx
// Component spacing example
<div className="space-y-8">  {/* 32px between children */}
  <Section />
  <Section />
  <Section />
</div>

// Section padding example (responsive)
<section className="py-16 sm:py-20 lg:py-24">
  {/* 64px/80px/96px vertical padding */}
</section>
```

---

## Border Radius

CASAORA uses rounded corners to create approachable, modern interfaces:

### Border Radius Scale

| Radius | Value | Tailwind | Use Case |
|--------|-------|----------|----------|
| Small | 8px | `rounded-lg` | Form inputs, small elements |
| Medium | 12px | `rounded-xl` | Cards, containers |
| Large | 16px | `rounded-2xl` | Large cards, modals |
| Extra Large | 24px | `rounded-3xl` | Hero cards, feature sections |
| Full | 9999px | `rounded-full` | Buttons, badges, avatars |

### Border Radius Patterns

**Buttons:**
```tsx
// All buttons use full rounding
className="rounded-full"
```

**Cards:**
```tsx
// Standard card
className="rounded-2xl"

// Feature card (larger, more prominent)
className="rounded-3xl"
```

**Form Inputs:**
```tsx
// Text inputs
className="rounded-lg"

// Select dropdowns, pickers
className="rounded-lg"
```

**Images:**
```tsx
// Profile pictures
className="rounded-full"

// Professional photos
className="rounded-t-2xl"  // Top corners only

// Feature images
className="rounded-2xl"
```

---

## Shadows

Shadows create depth and visual hierarchy. CASAORA uses subtle shadows that enhance without overwhelming.

### Shadow Scale

**Subtle Shadow (sm)**
```css
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```
**Use:** List items, subtle card elevation
**Tailwind:** `shadow-sm`

**Card Shadow (default)**
```css
box-shadow: 0 10px 40px rgba(26, 26, 26, 0.04);
```
**Use:** Default cards, content containers
**Tailwind:** `shadow-[0_10px_40px_rgba(26,26,26,0.04)]`

**Card Shadow (hover)**
```css
box-shadow: 0 10px 40px rgba(26, 26, 26, 0.08);
```
**Use:** Card hover state
**Tailwind:** `shadow-[0_10px_40px_rgba(26,26,26,0.08)]`

**Button Shadow**
```css
box-shadow: 0 6px 18px rgba(230, 57, 70, 0.22);
```
**Use:** Primary buttons, CTAs
**Tailwind:** `shadow-[0_6px_18px_rgba(230,57,70,0.22)]`

**Modal Shadow**
```css
box-shadow: 0 20px 60px -15px rgba(26, 26, 26, 0.15);
```
**Use:** Modals, dialogs, overlays
**Tailwind:** `shadow-[0_20px_60px_-15px_rgba(26,26,26,0.15)]`

### Shadow Usage Guidelines

**Do:**
- Use shadows to establish visual hierarchy
- Increase shadow intensity on hover for interactive elements
- Keep shadows subtle (low opacity)
- Use consistent shadow colors (based on foreground color)

**Don't:**
- Use multiple different shadows on the same component
- Use colored shadows (except for accent buttons)
- Overuse shadows (too many creates visual noise)
- Use shadows on flat UI elements (icons, text)

---

## Component Patterns

### Buttons

CASAORA uses three button variants:

#### Primary Button
```tsx
className="inline-flex items-center justify-center rounded-full bg-[var(--red)] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(230,57,70,0.22)] transition-all hover:bg-[var(--red-hover)] active:scale-95"
```
**Use:** Primary actions, main CTAs
**Example:** "Find your professional", "Book now"

#### Secondary Button
```tsx
className="inline-flex items-center justify-center rounded-full border-2 border-[var(--charcoal)] bg-transparent px-8 py-4 font-semibold text-base text-[var(--charcoal)] transition-all hover:bg-[var(--charcoal)] hover:text-white active:scale-95"
```
**Use:** Secondary actions, alternatives
**Example:** "Learn more", "View details"

#### Ghost Button
```tsx
className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-base text-[var(--charcoal)] transition-colors hover:text-[var(--red)]"
```
**Use:** Tertiary actions, navigation
**Example:** "Cancel", "Back"

### Cards

#### Default Card
```tsx
<div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
  {/* Card content */}
</div>
```

#### Feature Card (Prominent)
```tsx
<div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[0_10px_40px_rgba(26,26,26,0.04)] transition-shadow hover:shadow-[0_10px_40px_rgba(26,26,26,0.08)]">
  {/* Card content */}
</div>
```

#### Professional Profile Card
```tsx
<div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
  {/* Image */}
  <div className="relative aspect-[3/4] overflow-hidden">
    <Image src={...} alt={...} fill className="object-cover object-[center_20%]" />
  </div>
  {/* Info */}
  <div className="p-5">
    <h3 className="font-[family-name:var(--font-cinzel)] font-semibold text-base">
      {name}
    </h3>
    {/* Additional info */}
  </div>
</div>
```

### Forms

#### Text Input
```tsx
<input
  type="text"
  className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 font-[family-name:var(--font-work-sans)] text-base text-[var(--charcoal)] transition-colors focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
/>
```

#### Label
```tsx
<label className="block font-medium text-sm text-[var(--charcoal)] mb-2">
  Email address
</label>
```

#### Form Group
```tsx
<div className="space-y-2">
  <label>...</label>
  <input>...</input>
  <p className="text-sm text-[var(--muted-foreground)]">Helper text</p>
</div>
```

### Navigation

#### Header (Desktop)
```tsx
<header className="sticky top-0 z-50 border-[var(--border)] border-b bg-[var(--background)]/80 backdrop-blur-sm">
  <Container>
    <nav className="flex h-16 items-center justify-between">
      {/* Logo */}
      <span className="font-[family-name:var(--font-cinzel)] font-semibold text-2xl">
        CASAORA
      </span>

      {/* Links */}
      <div className="flex items-center gap-8">
        <Link className="font-medium text-sm text-[var(--charcoal)]">Home</Link>
        {/* ... */}
      </div>

      {/* Language Switcher */}
      <div className="flex items-center gap-2">
        <button className="font-bold text-[var(--red)]">EN</button>
        <span className="text-[var(--muted-foreground)]">/</span>
        <button className="hover:text-[var(--red)]">ES</button>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-4">
        <Button variant="ghost">Sign in</Button>
        <Button variant="primary">Sign up</Button>
      </div>
    </nav>
  </Container>
</header>
```

#### Mobile Menu
```tsx
<div className="fixed top-0 right-0 z-70 h-full w-[320px] transform bg-white shadow-2xl transition-transform">
  {/* Menu content */}
</div>
```

### Language Switcher

Current implementation (as of Nov 2025):

```tsx
export function LanguageSwitcher() {
  const locale = useLocale();

  return (
    <div className="flex items-center gap-2 font-medium text-sm">
      <button
        className={`transition-colors hover:text-[var(--red)] ${
          locale === "en" ? "font-bold text-[var(--red)]" : ""
        }`}
      >
        EN
      </button>
      <span className="text-[var(--muted-foreground)]">/</span>
      <button
        className={`transition-colors hover:text-[var(--red)] ${
          locale === "es" ? "font-bold text-[var(--red)]" : ""
        }`}
      >
        ES
      </button>
    </div>
  );
}
```

### Keyboard Shortcuts Button

```tsx
<button
  className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--red)] bg-[#fff5f3] text-[var(--red)] transition-all hover:bg-[var(--red)] hover:text-white active:scale-95"
>
  <span className="font-semibold text-base">?</span>
</button>
```

### Badges

#### Status Badge
```tsx
<span className="inline-flex items-center rounded-full bg-[var(--red-light)] px-3 py-1 font-medium text-xs text-[var(--red)] uppercase">
  Featured
</span>
```

#### Label Badge
```tsx
<span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-3 py-1 font-medium text-xs text-[var(--muted-foreground)] uppercase">
  Most Booked
</span>
```

---

## Layout & Grid

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1320px;   /* Default max-width */
--container-2xl: 1400px;  /* Footer */
--container-3xl: 1680px;  /* Full-width sections */
```

### Container Component

```tsx
// /src/components/ui/container.tsx
export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn(
      "mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 xl:px-16",
      className
    )}>
      {children}
    </div>
  );
}
```

### Grid Patterns

**Two Column Grid:**
```tsx
<div className="grid gap-8 md:grid-cols-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

**Three Column Grid:**
```tsx
<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

**Four Column Grid (Feature Cards):**
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

**Asymmetric Grid:**
```tsx
<div className="grid gap-8 lg:grid-cols-[1fr_auto]">
  <div>Main content</div>
  <aside>Sidebar</aside>
</div>
```

---

## Effects & Animations

### Transitions

All interactive elements should have smooth transitions:

```css
/* Default transition */
transition-colors duration-200 ease-in-out

/* Transform transitions */
transition-transform duration-200 ease-in-out

/* All properties */
transition-all duration-200 ease-in-out
```

### Hover Effects

**Buttons:**
```tsx
// Color change + scale on active
hover:bg-[var(--red-hover)] active:scale-95
```

**Cards:**
```tsx
// Shadow increase
hover:shadow-[0_10px_40px_rgba(26,26,26,0.08)]
```

**Links:**
```tsx
// Color change
hover:text-[var(--red)]
```

**Images:**
```tsx
// Subtle scale (use sparingly)
group-hover:scale-105 transition-transform duration-300
```

### Loading States

**Skeleton Loader:**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 w-3/4 rounded bg-[var(--border)]" />
  <div className="h-4 w-1/2 rounded bg-[var(--border)]" />
</div>
```

**Spinner:**
```tsx
<div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--red)]" />
```

### Animation Guidelines

**Do:**
- Use transitions for state changes (hover, focus, active)
- Keep animations under 300ms for UI feedback
- Use `ease-in-out` or `ease-out` timing functions
- Respect `prefers-reduced-motion`

**Don't:**
- Auto-play animations on page load
- Use animations longer than 500ms
- Animate multiple properties simultaneously (except with `transition-all`)
- Use animations that cause layout shifts

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```tsx
// Button focus
focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red)] focus-visible:outline-offset-2

// Input focus
focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20
```

### Color Contrast

Ensure all text meets WCAG 2.1 standards:

- **Body text**: Minimum 4.5:1 (AAA preferred)
- **Large text (18px+)**: Minimum 3:1 (AA)
- **UI elements**: Minimum 3:1 (AA)

### Semantic HTML

Use appropriate HTML elements:

```tsx
// Navigation
<nav>...</nav>

// Main content
<main>...</main>

// Sections
<section>...</section>

// Articles
<article>...</article>

// Aside content
<aside>...</aside>

// Footer
<footer>...</footer>
```

### ARIA Labels

Provide descriptive labels for interactive elements:

```tsx
<button aria-label="Close menu">
  <XIcon />
</button>

<input aria-label="Search professionals" />
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Tab order follows logical flow
- Enter/Space activates buttons and links
- Escape closes modals and dropdowns
- Arrow keys navigate lists and menus

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Base: 320px - 639px */

sm:   /* 640px+ */
md:   /* 768px+ */
lg:   /* 1024px+ */
xl:   /* 1280px+ */
2xl:  /* 1536px+ */
```

### Responsive Typography

Use clamp() for fluid typography:

```tsx
// Hero headline
text-[clamp(48px,6vw,80px)]

// Section heading
text-[clamp(36px,4.5vw,56px)]

// Subheading
text-[clamp(28px,3.5vw,42px)]
```

### Responsive Spacing

```tsx
// Padding
px-5 sm:px-8 lg:px-12 xl:px-16
py-16 sm:py-20 lg:py-24

// Gap
gap-4 sm:gap-6 lg:gap-8

// Margin
mt-4 sm:mt-6 lg:mt-8
```

### Responsive Layout

```tsx
// Stack on mobile, grid on desktop
<div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-8">
  ...
</div>

// Hide on mobile
<div className="hidden md:block">
  Desktop only content
</div>

// Show only on mobile
<div className="block md:hidden">
  Mobile only content
</div>
```

---

## Implementation Examples

### Complete Page Section

```tsx
export function FeaturesSection() {
  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-medium text-xs text-[var(--muted-foreground)] uppercase tracking-[0.1em]">
            Why Choose CASAORA
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-cinzel)] font-semibold text-[clamp(28px,3.5vw,42px)] text-[var(--charcoal)] leading-tight">
            Premium service, effortlessly delivered
          </h2>
          <p className="mt-6 font-[family-name:var(--font-work-sans)] text-lg text-[var(--muted-foreground)] leading-relaxed">
            We've rethought every detail to bring you a home services experience
            that just works.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[0_10px_40px_rgba(26,26,26,0.04)] transition-shadow hover:shadow-[0_10px_40px_rgba(26,26,26,0.08)]"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--red-light)]">
                <feature.icon className="h-6 w-6 text-[var(--red)]" />
              </div>

              {/* Content */}
              <h3 className="mt-6 font-[family-name:var(--font-cinzel)] font-semibold text-xl text-[var(--charcoal)]">
                {feature.title}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-work-sans)] text-base text-[var(--muted-foreground)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button variant="primary">
            Get started
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

---

## Files Reference

Key files defining the design system:

| File | Purpose |
|------|---------|
| `/src/app/globals.css` | CSS variables, Tailwind config |
| `/src/app/[locale]/layout.tsx` | Font configuration (Cinzel, Spectral, Work Sans) |
| `/src/components/ui/button.tsx` | Button component variants |
| `/src/components/ui/container.tsx` | Layout container |
| `/src/components/navigation/language-switcher.tsx` | Language switcher (EN/ES) |
| `/src/components/keyboard-shortcuts/keyboard-shortcuts-button.tsx` | Keyboard shortcuts button |
| `/src/components/sections/*.tsx` | Section pattern implementations |

---

## Design System Checklist

When building new components, ensure:

**Visual Design:**
- [ ] Uses correct brand colors (Cream, Charcoal, Red)
- [ ] Follows 90-9-1 color distribution
- [ ] Uses correct font families (Cinzel, Spectral, Work Sans)
- [ ] Maintains typography hierarchy
- [ ] Follows 8px spacing system
- [ ] Uses appropriate border radius
- [ ] Applies correct shadows

**Accessibility:**
- [ ] Color contrast meets WCAG AA (minimum) or AAA
- [ ] Focus states visible on all interactive elements
- [ ] Semantic HTML used
- [ ] ARIA labels provided where needed
- [ ] Keyboard navigation works
- [ ] Respects `prefers-reduced-motion`

**Performance:**
- [ ] Images optimized (WebP, lazy loading)
- [ ] Fonts loaded with `display: swap`
- [ ] No unnecessary animations
- [ ] Responsive images with proper sizing

**Consistency:**
- [ ] Uses existing component patterns
- [ ] Matches established UI conventions
- [ ] Follows naming conventions
- [ ] Documented in design system if new pattern

---

## Version History

- **v2.0** (Nov 4, 2025): Staays-inspired redesign
  - New color palette: Cream (#FFFCF8), Red (#E63946), Charcoal (#1A1A1A)
  - New typography: Cinzel, Spectral, Work Sans
  - Removed dark mode
  - Updated language switcher to EN/ES format
  - Redesigned keyboard shortcuts button
  - Updated component patterns for 2025-2026 trends

- **v1.0** (Oct 31, 2025): Initial design system documentation
  - Extracted from codebase
  - Documented original color system
  - Captured typography and spacing
  - Created component reference

---

**End of Document**
