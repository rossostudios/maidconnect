# MaidConnect Design System

Comprehensive design system documentation extracted from the MaidConnect codebase. This document defines all design tokens, color palettes, typography scales, spacing systems, and reusable component patterns used throughout the application.

---

## 1. Color System

### Core Color Palette

MaidConnect uses a carefully curated color palette optimized for a professional, expat-focused marketplace. All colors are defined as CSS custom properties in `/src/app/globals.css` and used throughout components via Tailwind and inline styles.

#### Primary Colors

| Color Name | Hex Code | Usage | Components |
|-----------|----------|-------|-----------|
| Background | `#fbfaf9` | Default page background, light surfaces | Site pages, layouts |
| Background Alt | `#fbfafa` | Subtle alternate background | Form inputs, modal overlays |
| Foreground | `#211f1a` | Primary text color, dark surfaces | Typography, primary buttons |
| Surface | `#ffffff` | White surfaces, cards, modals | Cards, containers, dialogs |
| Surface Contrast | `#11100e` | Darkest text, high contrast | Footer background |
| Muted | `#e7e4dd` | Borders, dividers, placeholders | Border colors, disabled states |
| Accent | `#ff5d46` | Primary brand color, CTAs | Buttons, links, hover states |

#### Accent Variations

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Accent Hover | `#eb6c65` | Hover state for accent buttons |
| Accent Light | `#ff5d46/10` | Light background tints for accent elements |
| Accent Light 30% | `#ff5d46/30` | Medium background tints |

#### Neutral Grays

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Dark Gray 1 | `#2b2624` | Secondary button hover states |
| Dark Gray 2 | `#2e2419` | Text on light backgrounds |
| Dark Gray 3 | `#5d574b` | Secondary text, body copy |
| Dark Gray 4 | `#5a5549` | Muted text links |
| Dark Gray 5 | `#7a6d62` | Tertiary text, helper text |
| Dark Gray 6 | `#7d7566` | Disabled states, muted labels |
| Dark Gray 7 | `#8a826d` | Input placeholders |
| Dark Gray 8 | `#a49c90` | Icon fills, subtle accents |
| Dark Gray 9 | `#c9c2b6` | Light borders, subtle dividers |
| Dark Gray 10 | `#d7b59f` | Ghost button hover text |

#### Light Tones (Feature Highlights)

| Color Name | Hex Code | Usage | Section |
|-----------|----------|-------|---------|
| Tone Beige | `#f1e7d4` | Feature card backgrounds | Vetting & verification |
| Tone Green | `#e2ecdf` | Feature card backgrounds | Concierge matching |
| Tone Blue | `#dde6f3` | Feature card backgrounds | Expats-first support |

#### Border Colors

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Border Primary | `#ebe5d8` | Main card borders, dividers |
| Border Light | `#f0ece5` | Light card borders, skeleton states |
| Border Lighter | `#e5dfd4` | Input borders, subtle dividers |
| Border Lightest | `#dcd6c7` | Keyboard shortcut panel borders |
| Border Dashed | `#d8cfbf` | Dashed borders for empty states |

#### Semantic Colors (from email templates and error states)

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Success | `#10b981` | Success messages, confirmations |
| Warning | `#f59e0b` | Warning alerts, attention needed |
| Error | `#ef4444` | Error messages, destructive actions |
| Error Dark | `#dc2626` | Error hover states (derived) |
| Info | `#2563eb` | Informational messages |
| Neutral Gray | `#6b7280` | Email template text |
| Light Gray | `#f9fafb` | Email template backgrounds |
| Very Light Gray | `#e5e7eb` | Email template borders |

#### Dark Theme Colors (Footer & Dark Surfaces)

| Color Name | Hex Code | Usage |
|-----------|----------|-------|
| Dark Surface | `#11100e` | Footer background |
| Dark Hover | `#26231f` | Dark button borders |
| Dark Text | `#f3ece1` | Text on dark backgrounds |
| Dark Text Muted | `#cfc8be` | Muted text on dark backgrounds |
| Dark Text Secondary | `#b1aca5` | Secondary text on dark backgrounds |

---

## 2. Typography System

### Font Families

MaidConnect uses **Geist** font family from Next.js Google Fonts integration:

```typescript
// From /src/app/[locale]/layout.tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

#### Font Stack

**Sans Serif (Primary):**
```css
font-family: var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Monospace (Code/Keyboard Shortcuts):**
```css
font-family: var(--font-geist-mono);
```

### Font Weights Available

- **400** (Regular) - Body text, descriptions
- **500** (Medium) - Secondary text, buttons
- **600** (Semibold) - Headings, labels, emphasis
- **700** (Bold) - Primary headings, strong emphasis

### Type Scale

MaidConnect uses Tailwind's default type scale with custom implementations:

#### Heading Hierarchy

| Size | Class | Usage | Examples |
|------|-------|-------|----------|
| XL | `text-xl` | Section labels, card titles | Section headings |
| 2XL | `text-2xl` | Subheadings | Feature cards, modal titles |
| 3XL | `text-3xl` | Large titles | Dashboard stats values |
| 4XL | `text-4xl` | Major section headings | Product section titles |
| 5XL | `text-5xl` | Hero section titles | Professional profile names |
| 6XL | `text-6xl` | Large hero titles | Product page main heading |
| 7XL | `text-7xl` | Extra large hero titles | Landing page hero |

#### Body Text

| Size | Class | Usage | Examples |
|------|-------|-------|----------|
| XS | `text-xs` | Labels, badges, keyboard shortcuts | `uppercase tracking-[0.2em]` |
| SM | `text-sm` | Secondary text, helper text, captions | Descriptions, timestamps |
| Base | `text-base` | Body text, default | Paragraph text, CTAs |
| LG | `text-lg` | Large body text | Feature descriptions |
| XL | `text-xl` | Large text, subtitles | Professional rates, highlights |
| 2XL | `text-2xl` | Hero subtitle sizes | Hero section text |

### Line Heights

| Value | Class | Usage |
|-------|-------|-------|
| tight | `leading-tight` | Headings (1.1-1.2) |
| relaxed | `leading-relaxed` | Body text, descriptions (1.6-1.75) |
| none | `leading-none` | Buttons, badges |

### Letter Spacing

| Value | Class | Usage | Examples |
|-------|-------|-------|----------|
| Standard | default | Body text | Regular paragraph copy |
| Tight | `tracking-tight` | Logo, headings | MaidConnect header |
| Wide | `tracking-[0.2em]` | Labels, uppercase text | Section labels |
| Extra Wide | `tracking-[0.26em]` | Feature badges | "most booked" badge |
| Extra Wide 2 | `tracking-[0.32em]` | Hero section badges | Hero badge text |

### Text Color Classes

All text colors reference the color palette above:

```css
text-[#211f1a]    /* Primary foreground text */
text-[#5d574b]    /* Body text, secondary */
text-[#7a6d62]    /* Tertiary text, muted */
text-[#7d7566]    /* Navigation inactive state */
text-[#8a826d]    /* Placeholder text */
text-white        /* White text on dark backgrounds */
text-[#f3ece1]    /* Light text on dark footer */
```

### Common Typography Patterns

#### Hero Section Headlines
```
font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-white
```

#### Section Headings
```
font-semibold text-4xl sm:text-5xl lg:text-6xl text-[#211f1a] leading-tight
```

#### Card Titles
```
font-semibold text-[#211f1a] text-lg/xl
```

#### Body Paragraph
```
text-[#5d574b] text-base leading-relaxed
```

#### Labels & Captions
```
font-medium text-[#7a6d62] text-xs uppercase tracking-[0.2em]
```

#### Links (Default)
```
text-[#5a5549] transition hover:text-[#ff5d46]
```

---

## 3. Spacing System

MaidConnect uses Tailwind's spacing scale (4px base unit) with custom container sizing:

### Spacing Scale

| Spacing | Pixels | Usage |
|---------|--------|-------|
| `p-1` / `gap-1` | 4px | Tight spacing in forms |
| `p-2` / `gap-2` | 8px | Icon spacing, small gaps |
| `p-3` / `gap-3` | 12px | Small padding, component gaps |
| `p-4` / `gap-4` | 16px | Default padding, section gaps |
| `p-5` / `gap-5` | 20px | Medium padding |
| `p-6` / `gap-6` | 24px | Card padding, section spacing |
| `p-8` / `gap-8` | 32px | Large padding, major spacing |
| `p-12` / `gap-12` | 48px | Extra large padding |
| `p-16` / `gap-16` | 64px | Hero section spacing |
| `p-20` / `gap-20` | 80px | Large section spacing |
| `p-24` / `gap-24` | 96px | Extra large section spacing |

### Container Sizing

#### Max Width
```typescript
// From /src/components/ui/container.tsx
max-w-[1320px]    // Main container width
max-w-[1400px]    // Footer container width
max-w-[1680px]    // Professional profile container
```

#### Padding (Responsive)

```css
/* Container horizontal padding */
px-5           /* Mobile: 20px */
sm:px-8        /* Tablet: 32px */
lg:px-12       /* Desktop: 48px */
xl:px-16       /* Large: 64px */
```

### Vertical Spacing Patterns

#### Section Spacing (Padding)
```
py-16 sm:py-20 lg:py-24    /* Medium sections */
py-20 sm:py-24 lg:py-32    /* Large sections */
```

#### Item Spacing (Gap)
```
gap-3                       /* Tight component spacing */
gap-4                       /* Default component spacing */
gap-6                       /* Relaxed component spacing */
gap-8                       /* Large component spacing */
```

#### Margin Utilities
```
mt-2, mt-4, mt-6, mt-8     /* Margin-top utilities */
mb-3, mb-6                  /* Margin-bottom utilities */
space-y-2, space-y-3        /* Vertical spacing between children */
space-y-4, space-y-6
```

---

## 4. Border Radius System

MaidConnect uses multiple border radius scales for different component types:

### Border Radius Scale

| Radius | Class | Usage | Examples |
|--------|-------|-------|----------|
| Small | `rounded-lg` | Input fields, small components | Form inputs, badges |
| Medium | `rounded-xl` | Cards, medium components | Skeleton cards |
| Large | `rounded-2xl` | Large cards, modals | Notification cards |
| Extra Large | `rounded-3xl` | Section containers, video | Video backgrounds, large sections |
| Custom 28px | `rounded-[28px]` | Feature cards, prominent cards | Product feature cards, notification prompts |
| Custom 36px | `rounded-[36px]` | Extra large components | Professional profile hero card |
| Full Circle | `rounded-full` | Buttons, avatars, icons | CTA buttons, avatar images, badge icons |

### Common Border Radius Patterns

#### Buttons (All Variants)
```
rounded-full                /* Primary, secondary, card buttons */
rounded-full border font-semibold
```

#### Cards
```
rounded-[28px] border bg-white p-8 shadow-[...]    /* Feature cards */
rounded-[36px] border border-[#ebe5d8] bg-white    /* Profile cards */
rounded-xl border                                   /* Small cards */
```

#### Input Fields
```
rounded-lg border border-[#ebe5d8]                 /* Text inputs */
rounded-full border                                /* Date/time pickers */
```

#### Modals & Overlays
```
rounded-2xl bg-white p-6 shadow-xl                 /* Modal dialogs */
rounded-lg p-3                                      /* Toast messages */
```

---

## 5. Shadow System

MaidConnect uses custom box shadows for depth and emphasis:

### Shadow Scales

#### Subtle Shadow (Default)
```css
shadow-sm
/* Usage: Cards, list items, subtle depth */
```

#### Card Shadow
```css
shadow-[0_10px_40px_rgba(18,17,15,0.04)]
/* Usage: Product feature cards, content containers */
```

#### Enhanced Card Shadow
```css
shadow-[0_10px_40px_rgba(18,17,15,0.08)]
/* Usage: Hover state for cards, elevated elements */
```

#### Button Shadow (Primary)
```css
shadow-[0_6px_18px_rgba(18,17,15,0.22)]
/* Usage: Primary buttons, CTAs */
```

#### Button Shadow (Large)
```css
shadow-[0_12px_36px_rgba(17,16,14,0.22)]
/* Usage: Card buttons, prominent CTAs */
```

#### CTA Button Shadow (Accent)
```css
shadow-[0_6px_18px_rgba(255,93,70,0.22)]
/* Usage: Accent/secondary buttons */
```

#### Large Section Shadow
```css
shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]
/* Usage: Large cards, modal containers, profile cards */
```

#### Calendar/Picker Shadow
```css
shadow-[0_24px_60px_rgba(18,17,15,0.12)]
/* Usage: Date pickers, time pickers, dropdowns */
```

#### Skeleton Shadow
```css
shadow-black/5 shadow-inner
/* Usage: Loading states, muted shadows */
```

#### Profile Card Shadow
```css
shadow-[0_10px_40px_rgba(18,17,15,0.04)]
/* Hover state: shadow-[0_10px_40px_rgba(18,17,15,0.08)] */
```

#### Calendar Selected Date
```css
shadow-[0_10px_20px_rgba(18,17,15,0.16)]
/* Usage: Selected calendar dates */
```

### Shadow Transitions

All shadows support smooth transitions on hover:
```css
shadow-sm transition hover:shadow-md
```

---

## 6. Border System

### Border Widths

| Width | Class | Usage |
|-------|-------|-------|
| 1px | `border` | Default borders on cards, inputs |
| 2px | `border-2` | Button borders, emphasized borders |

### Border Colors (Reference to Color System)

```css
border-[#ebe5d8]      /* Primary border - used on 90% of cards */
border-[#f0ece5]      /* Light border - skeleton, subtle dividers */
border-[#e5dfd4]      /* Input borders, picker borders */
border-[#dcd6c7]      /* Keyboard shortcuts, light dividers */
border-[#d8cfbf]      /* Dashed borders, empty states */
border-[#211f1a]      /* Dark borders, button borders */
border-[#ff5d46]      /* Accent borders, hover states */
border-white/40       /* White borders with opacity - dark backgrounds */
border-white          /* Full white borders */
```

### Border Styles

```css
border              /* Solid 1px border */
border-2            /* Solid 2px border */
border-b            /* Bottom border only */
border-l            /* Left border only */
border-r            /* Right border only */
border-t            /* Top border only */
border-dashed       /* Dashed border style */
border-transparent  /* Invisible border (for spacing) */
```

---

## 7. Component Patterns

### Buttons

MaidConnect defines four button variants with specific styling:

#### Primary Button
**Style:** Dark background with accent hover state
```typescript
border-[#211f1a] bg-[#211f1a] px-6 py-[0.85rem] text-sm text-white 
shadow-[0_6px_18px_rgba(18,17,15,0.22)] 
hover:border-[#ff5d46] hover:bg-[#2b2624] 
focus-visible:outline-[#ff5d46]
```
**Used for:** Primary CTAs, main actions
**Example:** "Find a Professional" button

#### Secondary Button
**Style:** Transparent with accent border and text
```typescript
border-[#ff5d46] bg-transparent px-6 py-[0.85rem] text-sm text-[#ff5d46] 
hover:border-[#211f1a] hover:text-[#211f1a] 
focus-visible:outline-[#ff5d46]
```
**Used for:** Secondary actions, alternatives
**Example:** "Learn More" button

#### Ghost Button
**Style:** No background, text only
```typescript
border-transparent px-4 py-2 text-sm text-[#2b2624] 
hover:text-[#d7b59f] 
focus-visible:outline-[#d7b59f]
```
**Used for:** Tertiary actions, light interactions
**Example:** Back links, navigation

#### Card Button
**Style:** Full-width with dark background
```typescript
w-full justify-between gap-3 border border-transparent bg-[#211f1a] px-6 py-3 
text-sm text-white shadow-[0_12px_36px_rgba(17,16,14,0.22)] 
hover:bg-[#2b2624] 
focus-visible:outline-[#ff5d46]
```
**Used for:** Card action buttons, prominent CTAs
**Example:** Service selection buttons

#### Accent CTA Button
**Style:** Rounded full with accent background
```typescript
rounded-full bg-[#ff5d46] px-8 py-4 font-semibold text-base text-white 
shadow-[0_6px_18px_rgba(255,93,70,0.22)] 
transition hover:bg-[#eb6c65]
```
**Used for:** Primary feature CTAs
**Example:** "Start matching", "Book Now"

### Cards

#### Feature Card (Product/Services)
```typescript
rounded-[28px] border border-[#ebe5d8] bg-white p-8 
shadow-[0_10px_40px_rgba(18,17,15,0.04)] 
transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]
```

#### Profile Card (Professional)
```typescript
mt-8 overflow-hidden rounded-[36px] border border-[#ebe5d8] bg-white 
shadow-[0_10px_40px_rgba(18,17,15,0.04)]
grid gap-8 p-8 md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr]
```

#### Booking Card
```typescript
rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm 
transition hover:shadow-md
```

#### Info/Alert Card
```typescript
rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm
/* Semantic variants: border-red-200 bg-red-50, border-blue-200 bg-blue-50 */
```

#### Empty State Card
```typescript
rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center
```

### Forms & Inputs

#### Text Input
```typescript
w-full rounded-lg border border-[#ebe5d8] px-3 py-2 text-sm 
focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20
```

#### Date/Time Picker
```typescript
flex w-full items-center justify-between rounded-full 
border border-[#e5dfd4] bg-[#fefcf9] px-4 py-2 font-medium text-[#211f1a] text-sm 
shadow-black/5 shadow-inner 
transition hover:border-[#ff5d46] 
focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff5d46] focus-visible:outline-offset-2
```

#### Form Section
```typescript
space-y-2 rounded-lg border border-[#ebe5d8] bg-[#fbfafa] p-4
```

### Badges & Labels

#### Feature Badge (Primary)
```typescript
inline-flex items-center gap-3 rounded-full bg-white/20 px-5 py-2.5 
font-semibold text-white text-xs uppercase tracking-[0.32em] backdrop-blur-sm
```

#### Accent Badge
```typescript
inline-flex items-center rounded-full border-2 border-[#ff5d46] bg-[#ff5d46]/5 
px-4 py-2 font-semibold text-[#ff5d46] text-sm
```

#### Status Badge
```typescript
inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-xs
/* Variations: bg-green-100 text-green-800, bg-red-100 text-red-800 */
```

#### Keyboard Badge
```typescript
inline-flex items-center justify-center rounded-lg border border-[#dcd6c7] 
bg-[#fefcf9] font-medium font-mono text-[#5d574b] shadow-sm
min-w-[28px] px-2.5 py-1.5 text-xs    /* Size: sm */
min-w-[32px] px-3 py-1.5 text-sm      /* Size: md */
```

### Navigation Elements

#### Navigation Link (Active)
```typescript
font-medium text-sm text-[#211f1a]
transition
```

#### Navigation Link (Inactive)
```typescript
font-medium text-sm text-[#7d7566] 
transition hover:text-[#211f1a]
```

#### Language Switcher
```typescript
/* Dark mode */
flex items-center gap-2 rounded-full border-2 border-[#26231f] bg-[#11100e] 
px-4 py-2 text-sm font-medium text-[#f3ece1] 
transition hover:border-[#ff5d46] hover:text-[#ff5d46]

/* Light mode */
flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white 
px-4 py-2 text-sm font-medium text-[#211f1a] 
transition hover:border-[#ff5d46] hover:text-[#ff5d46]
```

### Modals & Overlays

#### Modal Container
```typescript
fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4
max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl
```

#### Side Panel (Notifications)
```typescript
fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl
```

#### Keyboard Shortcuts Panel
```typescript
fixed top-0 right-0 z-60 h-full w-full max-w-md transform 
border-[#dcd6c7] border-l bg-[#fefcf9] shadow-2xl 
transition-transform duration-300 ease-in-out
```

### Skeletons (Loading States)

#### Default Skeleton
```typescript
animate-pulse rounded-md bg-[#ebe5d8]/50
```

#### Section Skeleton
```typescript
rounded-xl border border-[#f0ece5] bg-white/90 p-6 shadow-sm
```

#### Profile Card Skeleton
```typescript
rounded-[28px] bg-white p-8 
shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]
```

#### Table Skeleton
```typescript
rounded-[28px] bg-white p-8 
shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)]
```

---

## 8. Effects & Animations

### Transitions

MaidConnect uses smooth transitions for interactive elements:

```css
transition                          /* Default 150ms */
transition hover:shadow-md          /* Shadow on hover */
transition hover:bg-opacity-80      /* Color opacity change */
transition-colors                   /* Color-specific transitions */
transition-transform                /* Transform animations */
```

### Transform Effects

```css
group-hover:bg-current/30           /* Icon background on parent hover */
group-hover:scale-110               /* Icon scale on rating hover */
-translate-x-1/2 -translate-y-1/2   /* Centering transforms */
rotate-90                           /* Icon rotation on picker open */
```

### Loading Animations

```css
animate-pulse                       /* Skeleton loading effect */
border-[#ff5d46] border-b-2         /* Loading spinner border */
h-8 w-8 animate-spin 
rounded-full border-[#ff5d46] 
border-b-2
```

### Opacity Effects

```css
bg-current/20                       /* 20% opacity of current color */
bg-current/30                       /* 30% opacity - hover state */
bg-black/50                         /* Modal overlay opacity */
text-white/90                       /* Slightly transparent white text */
text-white/80                       /* More transparent white text */
white/20                            /* White with 20% opacity - hero badge */
```

---

## 9. Layout & Grids

### Responsive Grid Systems

#### Two Column Grid
```css
grid gap-8 md:grid-cols-2
grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

#### Three Column Layout (Cards)
```css
mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4
```

#### Flexible Grid
```css
grid gap-4 grid-cols-1 md:grid-cols-3   /* Variable columns */
grid gap-8 lg:grid-cols-[1fr_auto]     /* Custom column sizing */
grid gap-8 sm:grid-cols-2 lg:gap-16    /* Gap increases on larger screens */
```

### Flexbox Layouts

#### Horizontal Stack
```css
flex items-center gap-4           /* Centered horizontally */
flex items-center justify-between /* Space between alignment */
flex flex-col gap-6               /* Vertical stack */
```

#### Navbar Layout
```css
flex items-center justify-between gap-4    /* Navbar with spacing */
```

### Responsive Visibility

```css
hidden md:flex                    /* Hidden on mobile, flex on tablet+ */
hidden md:block                   /* Hidden on mobile, block on tablet+ */
block md:hidden                   /* Visible on mobile, hidden on tablet+ */
```

---

## 10. Accessibility & Focus States

### Focus Visible States

MaidConnect implements accessible focus states for keyboard navigation:

#### Button Focus
```css
focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff5d46] focus-visible:outline-offset-2
```

#### Input Focus
```css
focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20
```

#### Dark Background Focus
```css
focus-visible:outline-white
```

### Disabled States

```css
disabled:cursor-not-allowed disabled:opacity-70
disabled:opacity-50
```

---

## 11. Responsive Design Breakpoints

MaidConnect uses Tailwind's standard breakpoints with mobile-first approach:

| Breakpoint | Width | Class Prefix | Usage |
|-----------|-------|--------------|-------|
| Mobile | < 640px | (none) | Default styles |
| Small | 640px+ | `sm:` | Tablet portrait |
| Medium | 768px+ | `md:` | Tablet landscape |
| Large | 1024px+ | `lg:` | Desktop |
| Extra Large | 1280px+ | `xl:` | Large desktop |

### Common Responsive Patterns

```css
/* Typography */
text-5xl sm:text-6xl lg:text-7xl

/* Padding/Spacing */
px-5 sm:px-8 lg:px-12 xl:px-16
py-16 sm:py-20 lg:py-24

/* Grid Layout */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Display */
block md:hidden                     /* Mobile nav */
hidden md:flex                      /* Desktop nav */

/* Gap */
gap-4 lg:gap-8
```

---

## 12. Dark Mode & Theme Variants

### Footer Dark Theme

MaidConnect implements a dark theme exclusively for the footer:

```css
footer {
  background: #11100e (--surface-contrast)
  color: #f3ece1 (--dark-text)
}
```

**Text Colors:**
- Primary: `#f3ece1`
- Secondary: `#cfc8be`
- Tertiary: `#b1aca5`

**Border Colors:**
- `border-[#26231f]` - Subtle borders on dark background
- `border-[#ff5d46]` - Accent borders on hover

**Interactive Elements:**
```css
hover:border-[#ff5d46] hover:text-[#ff5d46]    /* Dark button hover */
text-[#f3ece1] transition hover:text-[#ff5d46] /* Dark link hover */
```

---

## 13. Design Tokens Summary

### Quick Reference Table

| Token | Value | Category |
|-------|-------|----------|
| Primary Brand | `#ff5d46` | Color |
| Primary Dark | `#211f1a` | Color |
| Primary Light | `#fbfaf9` | Color |
| Primary Border | `#ebe5d8` | Color |
| Font Family | Geist (400-700) | Typography |
| Heading Size Max | `text-7xl` | Typography |
| Body Size Base | `text-base` | Typography |
| Max Container Width | `1320px` | Layout |
| Default Padding | `p-6` / `24px` | Spacing |
| Section Gap | `gap-8` / `32px` | Spacing |
| Card Radius | `rounded-[28px]` | Borders |
| Button Radius | `rounded-full` | Borders |
| Default Shadow | `shadow-sm` | Effects |
| Card Shadow | `shadow-[0_10px_40px_rgba(...)]` | Effects |
| Transition Speed | `150ms` | Animation |

---

## 14. Component Implementation Examples

### Complete Button Component

```typescript
// /src/components/ui/button.tsx
type ButtonVariant = "primary" | "secondary" | "ghost" | "card";

const baseClasses =
  "group inline-flex items-center justify-center rounded-full border font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-[#211f1a] bg-[#211f1a] px-6 py-[0.85rem] text-sm text-white shadow-[0_6px_18px_rgba(18,17,15,0.22)] hover:border-[#ff5d46] hover:bg-[#2b2624] focus-visible:outline-[#ff5d46]",
  secondary:
    "border-[#ff5d46] bg-transparent px-6 py-[0.85rem] text-sm text-[#ff5d46] hover:border-[#211f1a] hover:text-[#211f1a] focus-visible:outline-[#ff5d46]",
  ghost:
    "border-transparent px-4 py-2 text-sm text-[#2b2624] hover:text-[#d7b59f] focus-visible:outline-[#d7b59f]",
  card: "w-full justify-between gap-3 border border-transparent bg-[#211f1a] px-6 py-3 text-sm text-white shadow-[0_12px_36px_rgba(17,16,14,0.22)] hover:bg-[#2b2624] focus-visible:outline-[#ff5d46]",
};
```

### Complete Container Component

```typescript
// /src/components/ui/container.tsx
export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 xl:px-16", className)}>
      {children}
    </div>
  );
}
```

### Card with Icons Pattern

```typescript
// Typical feature card pattern
<div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)] transition hover:shadow-[0_10px_40px_rgba(18,17,15,0.08)]">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff5d46]/10">
    {/* Icon */}
  </div>
  <h3 className="mt-6 font-semibold text-[#211f1a] text-xl">{title}</h3>
  <p className="mt-3 text-[#5d574b] text-base leading-relaxed">{description}</p>
</div>
```

---

## 15. Files Reference

All design tokens are defined in these key files:

| File | Purpose |
|------|---------|
| `/src/app/globals.css` | CSS custom properties, Tailwind theme config |
| `/src/components/ui/button.tsx` | Button component variants |
| `/src/components/ui/container.tsx` | Layout container with max-width |
| `/src/components/ui/skeleton.tsx` | Loading state components |
| `/src/app/[locale]/layout.tsx` | Font configuration (Geist) |
| `/src/lib/content.ts` | Feature highlight color tones |
| `/src/components/sections/*.tsx` | Pattern implementations |

---

## 16. Design Principles

### Color Usage Philosophy

1. **Brand Recognition**: `#ff5d46` accent is used strategically for CTAs and hover states
2. **Professional Feel**: Dark neutrals (`#211f1a`) provide sophistication
3. **Trust & Safety**: Ample white space and clean borders convey reliability
4. **Expat-Friendly**: Warm accent color creates welcoming atmosphere

### Typography Philosophy

1. **Hierarchy**: Clear distinction between headings (semibold), body (regular), and labels (medium)
2. **Readability**: 24px base padding in cards, 16px base text size
3. **Accessibility**: High contrast ratios maintained throughout
4. **International**: Geist font supports multiple languages

### Spacing Philosophy

1. **8px Grid**: All spacing follows 4px-8px base unit multiples
2. **Breathing Room**: Cards and sections have generous padding (p-6 to p-8)
3. **Component Separation**: Gap-6 to gap-8 between major sections
4. **Mobile-First**: Responsive padding scales down gracefully

---

## 17. Implementation Guidelines

### When Adding New Components

1. **Colors**: Always reference CSS custom properties from `globals.css` or use exact hex codes from this document
2. **Spacing**: Use Tailwind spacing scale (p-4, gap-6, etc.) - avoid pixel values
3. **Typography**: Combine size classes (text-lg) with weight classes (font-semibold)
4. **Borders**: Use `rounded-lg`, `rounded-[28px]`, or `rounded-full` - never custom values
5. **Shadows**: Reference the shadow system above - copy-paste shadow classes for consistency

### Color Contrast Checklist

- [ ] Body text on background: min 4.5:1 contrast ratio
- [ ] Headings on background: min 3:1 contrast ratio
- [ ] Interactive elements: Focus visible outline provided
- [ ] Error/Warning: Red color (#ef4444) tested on light backgrounds

### Performance Considerations

- Use `transition` instead of writing custom animations
- Leverage Tailwind's built-in utilities instead of custom CSS
- Skeleton loading states use `animate-pulse` for consistency
- Images optimized via Next.js Image component

---

## Version History

- **v1.0** (Oct 31, 2025): Initial design system extraction from codebase
  - Extracted 60+ colors with usages
  - Documented typography scale with Geist font
  - Captured spacing, borders, shadows, and components
  - Created comprehensive reference for future development

