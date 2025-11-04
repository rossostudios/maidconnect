# CASAORA Branding Guidelines 2025-2026

**Version:** 1.0
**Last Updated:** November 4, 2025
**Status:** Living Document

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Brand Positioning](#brand-positioning)
3. [Visual Identity](#visual-identity)
4. [Design System](#design-system)
5. [2025-2026 Design Trends](#2025-2026-design-trends)
6. [Typography](#typography)
7. [Color Palette](#color-palette)
8. [Spacing & Layout](#spacing--layout)
9. [Component Library](#component-library)
10. [Photography & Imagery](#photography--imagery)
11. [Marketing Screenshot Guidelines](#marketing-screenshot-guidelines)
12. [Platform-Specific Guidelines](#platform-specific-guidelines)
13. [Brand Voice & Messaging](#brand-voice--messaging)
14. [Developer Implementation](#developer-implementation)
15. [Future Enhancements](#future-enhancements)

---

## Executive Summary

CASAORA is a **luxury home services platform** connecting discerning homeowners with vetted professionals for cleaning, personal chef services, and specialized home care. Our brand embodies quiet luxury, trust, and refined simplicity - positioning ourselves as the premium choice in the home services marketplace.

### Brand Personality
- **Refined**: Sophisticated without being pretentious
- **Trustworthy**: Security-first, transparent, reliable
- **Warm**: Approachable luxury, human-centered
- **Modern**: Contemporary design, cutting-edge features
- **Conscious**: Sustainable practices, community-focused

### Design Philosophy
Our visual identity draws inspiration from luxury hospitality brands (Staays, Airbnb Luxe) while maintaining our unique voice. We embrace **quiet luxury** - understated elegance that speaks through quality, not excess.

---

## Brand Positioning

### Target Audience

**Primary:**
- High-income professionals (HHI $150K+)
- Homeowners aged 30-55
- Time-conscious individuals valuing convenience
- Quality-focused consumers willing to pay premium

**Secondary:**
- Property managers of luxury rentals
- Vacation home owners
- Busy families seeking reliable help

### Competitive Differentiation

| CASAORA | Traditional Platforms |
|---------|----------------------|
| Curated, vetted professionals | Open marketplace |
| Luxury-focused experience | Budget-oriented |
| Concierge-style matching | Self-service booking |
| Premium pricing transparency | Hidden fees, bidding |
| White-glove customer support | Automated support |

### Brand Promise

> "Premium home services, effortlessly delivered. We handle the details, so you can focus on what matters."

---

## Visual Identity

### Logo & Brand Mark

**Logo Usage:**
```
CASAORA
```

**Typography:** Cinzel (Semibold, 600 weight)
**Letter Spacing:** 0.04em (tracking tight to medium)
**Treatment:** Always uppercase when used as logo

**Minimum Size:**
- Digital: 120px width minimum
- Print: 0.75 inches minimum

**Clear Space:**
Maintain clear space equal to the height of the letter "A" on all sides.

**Logo Variations:**
1. **Primary**: Charcoal (#1A1A1A) on cream/white backgrounds
2. **Reversed**: Cream (#FFFCF8) on dark backgrounds
3. **Accent**: Red (#E63946) for special applications (use sparingly)

**Don'ts:**
- Never stretch or distort the logo
- Never add drop shadows or effects
- Never use on busy backgrounds without sufficient contrast
- Never use fonts other than Cinzel for the wordmark

---

## Design System

### Core Principles

1. **Quiet Luxury**: Understated elegance, not flashy or overstated
2. **Breathing Room**: Generous white space, uncluttered layouts
3. **Intentional Color**: Strategic use of red accent for emphasis
4. **Typography Hierarchy**: Clear visual hierarchy through font pairing
5. **Consistent Rhythm**: 8px spacing system throughout

### Design Inspiration (2025-2026)

Our design system incorporates current luxury web trends:

- **Quiet Luxury Aesthetic**: Muted colors, subtle gradients, refined typography
- **Bold Typography**: Large, confident headlines in Cinzel
- **Generous White Space**: Breathing room between elements
- **Subtle Motion**: Gentle transitions, no aggressive animations
- **Glassmorphism** (light application): Subtle backdrop blur on overlays
- **Organic Shapes**: Soft rounded corners, natural imagery
- **Editorial Style**: Magazine-quality photography and layouts

---

## 2025-2026 Design Trends

### 1. Quiet Luxury

**What It Is:**
Understated sophistication - less is more. Muted palettes, refined typography, subtle interactions.

**How We Apply It:**
- Cream and charcoal base colors (not stark white/black)
- Minimal use of red accent (strategic, not everywhere)
- Generous padding and white space
- High-quality imagery without filters or effects
- No unnecessary animations or decorations

**Examples in Our App:**
- Hero sections with single-color backgrounds
- Professional profile cards with clean layouts
- Subtle hover states (no dramatic transforms)

### 2. Bold Typography as Art

**What It Is:**
Typography itself becomes a visual element - large, confident, expressive.

**How We Apply It:**
- Large clamp() font sizes for responsive headlines
- Font pairing: Cinzel (display) + Spectral (accent) + Work Sans (UI)
- Generous line height for readability
- Strategic use of uppercase for labels
- Tight tracking on display text

**Examples in Our App:**
- Hero headlines: `clamp(48px, 6vw, 80px)`
- Section titles: `clamp(36px, 4.5vw, 56px)`
- Professional names: Cinzel with tight tracking

### 3. Editorial Layouts

**What It Is:**
Magazine-inspired layouts with asymmetry, strong grids, editorial photography.

**How We Apply It:**
- Grid-based layouts with intentional asymmetry
- High-quality lifestyle photography
- Pull quotes and callouts
- Visual hierarchy through size and placement

**Examples in Our App:**
- Value proposition sections with split layouts
- Feature grids with varied card sizes
- Professional portfolios with editorial photography

### 4. Micro-interactions

**What It Is:**
Subtle, delightful feedback for user actions.

**How We Apply It:**
- Smooth transitions (200-300ms)
- Hover states on all interactive elements
- Scale transforms on button press (active:scale-95)
- Color transitions on focus
- Loading states with subtle animations

**Examples in Our App:**
- Button hover: background and border color change
- Card hover: subtle shadow increase
- Form focus: border color + ring effect

### 5. Sustainable & Conscious Design

**What It Is:**
Design that respects users' attention, reduces cognitive load, performs efficiently.

**How We Apply It:**
- No auto-playing videos or animations
- Reduced motion support
- Efficient image loading
- Clear information hierarchy
- Accessibility-first approach

---

## Typography

### Font Stack

**Display Font (Headings, Logo):**
```css
font-family: var(--font-cinzel), serif;
```
- **Cinzel** - Elegant serif for headlines and brand elements
- Weights: 400 (Regular), 600 (Semibold), 700 (Bold)
- Use: Logo, hero headlines, section titles, professional names

**Accent Font (Editorial Text):**
```css
font-family: var(--font-spectral), serif;
```
- **Spectral** - Editorial serif for emphasis and pull quotes
- Weights: 400 (Regular), 400 Italic, 600 (Semibold)
- Use: Italic emphasis within paragraphs, pull quotes, captions

**UI Font (Body, Interface):**
```css
font-family: var(--font-work-sans), sans-serif;
```
- **Work Sans** - Clean sans-serif for UI and body text
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
- Use: Body copy, buttons, labels, navigation, forms

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| **Display** | Cinzel | clamp(48px, 6vw, 80px) | 600 | 1.1 | -0.02em |
| **H1** | Cinzel | clamp(36px, 4.5vw, 56px) | 600 | 1.15 | -0.01em |
| **H2** | Cinzel | clamp(28px, 3.5vw, 42px) | 600 | 1.2 | 0 |
| **H3** | Cinzel | clamp(24px, 2.5vw, 32px) | 600 | 1.3 | 0 |
| **H4** | Work Sans | 20px | 600 | 1.4 | 0 |
| **Body Large** | Work Sans | 18px | 400 | 1.6 | 0 |
| **Body** | Work Sans | 16px | 400 | 1.6 | 0 |
| **Body Small** | Work Sans | 14px | 400 | 1.5 | 0 |
| **Caption** | Work Sans | 12px | 500 | 1.4 | 0.05em |
| **Label** | Work Sans | 12px | 600 | 1.3 | 0.1em (uppercase) |

### Typography Best Practices

**Headings:**
- Use Cinzel for major headings (H1-H3)
- Use Work Sans for subheadings and UI headings (H4-H6)
- Maintain hierarchy through size, not just weight
- Keep headlines short and impactful (5-8 words max)

**Body Text:**
- Use Work Sans for all body copy
- Minimum 16px font size for readability
- Line height 1.6 for comfortable reading
- Max width 70 characters (approximately 600-700px)

**Emphasis:**
- Use Spectral italic for in-paragraph emphasis
- Avoid using bold within body paragraphs
- Use color (red accent) sparingly for emphasis

**Labels & UI:**
- Uppercase labels at 12px with 0.1em letter spacing
- Use medium weight (500) for labels
- Maintain consistency across all forms and UI elements

---

## Color Palette

### Primary Colors

```css
/* Core Brand Colors */
--cream: #FFFCF8;        /* Background, light surfaces */
--charcoal: #1A1A1A;     /* Text, dark elements */
--red: #E63946;          /* Primary accent, CTAs */
```

**Usage Guidelines:**

**Cream (#FFFCF8)**
- **Use:** Page backgrounds, card backgrounds, light surfaces
- **Don't Use:** Text color (insufficient contrast)
- **Accessibility:** WCAG AAA against charcoal text

**Charcoal (#1A1A1A)**
- **Use:** Body text, headings, icons, dark buttons
- **Don't Use:** Large background areas (too heavy)
- **Accessibility:** WCAG AAA on cream backgrounds

**Red (#E63946)**
- **Use:** Primary buttons, links, hover states, accent elements
- **Don't Use:** Large text blocks, backgrounds
- **Accessibility:** WCAG AA on cream backgrounds

### Secondary Colors

```css
/* Derived Variations */
--red-hover: #D62839;         /* Darker red for hover states */
--red-light: #FFE8EA;         /* Light red background tints */
--muted-foreground: #757575;  /* Secondary text */
--border: #E8E4DC;            /* Borders, dividers */
```

### Semantic Colors

```css
/* Feedback & Status */
--success: #10B981;    /* Success messages */
--warning: #F59E0B;    /* Warnings */
--error: #EF4444;      /* Errors, destructive actions */
--info: #3B82F6;       /* Informational messages */
```

### Color Application

**90-9-1 Rule:**
- **90%** Cream (backgrounds, white space)
- **9%** Charcoal (text, UI elements)
- **1%** Red (accents, CTAs, focal points)

**Contrast Ratios (WCAG 2.1):**
- Body text: Minimum 4.5:1 (Charcoal on Cream = 15.8:1 ✓)
- Large text: Minimum 3:1 (Red on Cream = 4.9:1 ✓)
- UI elements: Minimum 3:1

**Color Psychology:**
- **Cream**: Warmth, approachability, premium quality
- **Charcoal**: Sophistication, trust, reliability
- **Red**: Energy, passion, attention (use strategically)

---

## Spacing & Layout

### Spacing System (8px Base)

```css
/* Spacing Scale */
--space-1: 8px;    /* 0.5rem */
--space-2: 16px;   /* 1rem */
--space-3: 24px;   /* 1.5rem */
--space-4: 32px;   /* 2rem */
--space-5: 40px;   /* 2.5rem */
--space-6: 48px;   /* 3rem */
--space-7: 64px;   /* 4rem */
--space-8: 80px;   /* 5rem */
--space-9: 96px;   /* 6rem */
--space-10: 128px; /* 8rem */
```

**Usage Guidelines:**

| Spacing | Use Case | Example |
|---------|----------|---------|
| 8px | Icon gaps, tight spacing | Icon + text |
| 16px | Component padding, form fields | Button padding |
| 24px | Card padding, form groups | Card interior |
| 32px | Section spacing, stack gaps | Between sections |
| 48px | Large section spacing | Between major sections |
| 64px+ | Hero sections, page margins | Hero vertical padding |

### Layout Grid

**Container Widths:**
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1320px;   /* Main content */
--container-2xl: 1400px;  /* Footer */
--container-3xl: 1680px;  /* Full-width sections */
```

**Responsive Breakpoints:**
```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablet portrait */
--breakpoint-md: 768px;   /* Tablet landscape */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

**Grid System:**
- 12-column grid
- 24px gutter on mobile
- 32px gutter on desktop
- Use CSS Grid for layouts, not float or flexbox grids

---

## Component Library

### Buttons

**Primary Button**
```tsx
className="inline-flex items-center justify-center rounded-full bg-[var(--red)] px-8 py-4 font-semibold text-base text-white transition-all hover:bg-[var(--red-hover)] active:scale-95"
```
**Use:** Main CTAs, primary actions
**Text:** Sentence case, action-oriented

**Secondary Button**
```tsx
className="inline-flex items-center justify-center rounded-full border-2 border-[var(--charcoal)] bg-transparent px-8 py-4 font-semibold text-base text-[var(--charcoal)] transition-all hover:bg-[var(--charcoal)] hover:text-white active:scale-95"
```
**Use:** Secondary actions, alternative paths
**Text:** Sentence case

**Ghost Button**
```tsx
className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-base text-[var(--charcoal)] transition-colors hover:text-[var(--red)]"
```
**Use:** Tertiary actions, navigation
**Text:** Sentence case

### Cards

**Default Card**
```tsx
className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
```

**Feature Card**
```tsx
className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[0_10px_40px_rgba(26,26,26,0.04)] transition-shadow hover:shadow-[0_10px_40px_rgba(26,26,26,0.08)]"
```

### Forms

**Input Field**
```tsx
className="w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--charcoal)] transition-colors focus:border-[var(--red)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/20"
```

**Label**
```tsx
className="block font-medium text-sm text-[var(--charcoal)] mb-2"
```

---

## Photography & Imagery

### Photography Style

**Aesthetic:**
- Natural, unfiltered lifestyle photography
- Bright, airy, well-lit spaces
- Real homes and real people (not overly staged)
- Neutral color grading (no heavy filters)
- Clean, minimal backgrounds

**Subject Matter:**
- Professionals at work (cleaning, cooking, organizing)
- Clean, organized home spaces
- Happy homeowners in their space
- Before/after transformations
- Close-ups of quality details

**Composition:**
- Rule of thirds
- Generous negative space
- Subject in focus, background slightly blurred
- Natural light preferred
- Horizontal orientation for web (16:9 or 3:2)

**Image Specifications:**

| Use Case | Dimensions | Format | Max File Size |
|----------|------------|--------|---------------|
| Hero Section | 1920x1080 | WebP/JPG | 200KB |
| Professional Profile | 800x1066 (3:4) | WebP/JPG | 100KB |
| Feature Card | 600x400 | WebP/JPG | 80KB |
| Thumbnail | 400x300 | WebP/JPG | 50KB |
| App Screenshot | 1242x2688 | PNG | 500KB |

### Image Treatment

**Do:**
- Crop to face-detect when showing people
- Use Next.js Image component for optimization
- Provide alt text for all images
- Use consistent aspect ratios within sections

**Don't:**
- Apply heavy filters or vintage effects
- Use stock photos with watermarks
- Use images with busy backgrounds
- Stretch or distort images

---

## Marketing Screenshot Guidelines

### Purpose of Screenshots

Screenshots serve multiple purposes:
1. **Product Marketing**: Show features on the marketing website
2. **App Store Listings**: Demonstrate value to potential users
3. **Social Media**: Generate interest and engagement
4. **Documentation**: Help users understand features

### 2025-2026 Screenshot Trends

**Modern Screenshot Aesthetic:**
1. **Device Mockups**: Show app in realistic device frames (iPhone, laptop)
2. **Contextual Backgrounds**: Soft gradients or subtle patterns, not solid colors
3. **Annotations**: Minimal text overlays highlighting features
4. **Motion Previews**: Animated GIFs showing interactions (for web)
5. **Dark Mode + Light Mode**: Show both if available (we only have light mode)

### Screenshot Composition (Web)

**Hero Screenshots (Above the Fold)**
- **Size**: 1600x1200px minimum
- **Format**: PNG or WebP with transparency
- **Composition**:
  - Device mockup (browser window or phone frame)
  - Angled perspective (15-25° tilt)
  - Soft shadow beneath device
  - Gradient background or subtle pattern
  - Feature annotation (1-2 callouts max)

**Feature Showcase Screenshots**
- **Size**: 1200x900px
- **Format**: PNG
- **Composition**:
  - Flat perspective (straight-on view)
  - Focus on one feature
  - Clear UI element visibility
  - Optional: Circle or arrow highlighting key elements

**Comparison Screenshots (Before/After)**
- **Size**: 1400x700px (side-by-side)
- **Format**: PNG
- **Composition**:
  - Split screen: Before (left) | After (right)
  - Clear divider line or label
  - Same UI state, different data

### Screenshot Styling

**Color Overlay:**
```css
/* Subtle brand-colored overlay on screenshot backgrounds */
background: linear-gradient(135deg, #FFFCF8 0%, #FFE8EA 100%);
```

**Device Frames:**
- Use [Screely](https://screely.com) or [Shots.so](https://shots.so) for browser mockups
- Use Apple's official marketing assets for iPhone frames
- Maintain realistic shadows and reflections

**Annotations:**
- Font: Work Sans Semibold, 14-16px
- Color: Red (#E63946) for emphasis
- Style: Circular badge or arrow pointer
- Limit to 2-3 annotations per screenshot

**Callout Format:**
```tsx
<div className="absolute top-8 right-8 rounded-full bg-white px-4 py-2 font-semibold text-sm text-[var(--red)] shadow-lg">
  ✓ Feature Name
</div>
```

### Screenshot Checklist

Before using a screenshot for marketing:

- [ ] UI is clean (no test data, lorem ipsum, or errors)
- [ ] Professional photography is used (not placeholder images)
- [ ] Text is readable at all sizes (minimum 14px)
- [ ] Colors match brand guidelines (no off-brand colors)
- [ ] Spacing follows 8px grid system
- [ ] No Lorem Ipsum or dummy text visible
- [ ] No console errors or debug info visible
- [ ] All interactive elements are in default state (not hovered/focused)
- [ ] Real data showcases realistic use cases
- [ ] Screenshot is exported at 2x resolution for retina displays

---

## Platform-Specific Guidelines

### Web (Marketing Site)

**Hero Section Screenshots:**
- **Dimensions**: 1600x1200px minimum
- **Format**: WebP with PNG fallback
- **Treatment**: Device mockup (browser window) at 15° angle
- **Background**: Soft gradient (Cream to Light Red tint)
- **Annotations**: 1-2 feature callouts max

**Feature Section Screenshots:**
- **Dimensions**: 1200x800px
- **Format**: PNG
- **Treatment**: Flat perspective, clean crop
- **Annotations**: Minimal, use arrows or circles

**Comparison Sections:**
- **Dimensions**: 1400x700px (2:1 ratio)
- **Format**: PNG
- **Treatment**: Side-by-side split

### iOS App Store

**Screenshot Requirements (iPhone):**
- **Required Sizes**:
  - 6.9" Display: 1320 x 2868 px
  - 6.7" Display: 1290 x 2796 px
  - 6.5" Display: 1284 x 2778 px
  - 5.5" Display: 1242 x 2208 px
- **Format**: PNG or JPG (no alpha channel)
- **Max File Size**: 500KB each
- **Count**: 3-10 screenshots (recommended: 5)

**Screenshot Content Strategy:**
1. **Screenshot 1 (Value Prop)**: Hero shot showing main benefit
   - Include device frame
   - Add text overlay: "Find Trusted Home Professionals"
   - Background: Soft gradient

2. **Screenshot 2 (Browse)**: Professional browsing experience
   - Show grid of professional profiles
   - Highlight: "Vetted & Verified"

3. **Screenshot 3 (Booking)**: Booking flow
   - Show calendar or booking form
   - Highlight: "Book in Minutes"

4. **Screenshot 4 (Features)**: Unique features
   - Split screen showing multiple features
   - Highlight: "Concierge Matching"

5. **Screenshot 5 (Social Proof)**: Reviews or success state
   - Show positive reviews
   - Highlight: "Trusted by Thousands"

**Text Overlay Guidelines:**
- Font: Work Sans Bold, 48-56px
- Color: Charcoal on light backgrounds, Cream on dark backgrounds
- Alignment: Center top (100-150px from top)
- Max width: 80% of screen width

### Google Play Store

**Screenshot Requirements (Phone):**
- **Minimum Dimensions**: 1080 x 1920 px (16:9 or 9:16)
- **Maximum Dimensions**: 7680 x 4320 px
- **Format**: PNG or JPG
- **Max File Size**: 8MB each
- **Count**: 2-8 screenshots (recommended: 5)

**Screenshot Strategy:** Same as iOS, but ensure text is readable at smaller sizes.

### Social Media

**Instagram (Feed):**
- **Dimensions**: 1080 x 1080 px (1:1) or 1080 x 1350 px (4:5)
- **Format**: JPG
- **Treatment**: Center-crop app screenshot, add branded border or background
- **Text Overlay**: Keep minimal (Instagram adds its own UI)

**Instagram (Stories):**
- **Dimensions**: 1080 x 1920 px (9:16)
- **Format**: JPG or PNG
- **Treatment**: Full-screen phone mockup with subtle background
- **Text Overlay**: Large, bold feature callout

**Twitter/X:**
- **Dimensions**: 1600 x 900 px (16:9)
- **Format**: JPG or PNG
- **Treatment**: Browser mockup or split-screen comparison
- **Text Overlay**: Feature description in top-left or bottom-left

**LinkedIn:**
- **Dimensions**: 1200 x 627 px (1.91:1)
- **Format**: JPG or PNG
- **Treatment**: Professional, clean UI screenshot with text overlay
- **Text Overlay**: Business value proposition

---

## Brand Voice & Messaging

### Tone of Voice

**We are:**
- **Confident, not arrogant**: "We've vetted every professional" (not "We're the best")
- **Warm, not casual**: "Welcome home" (not "Hey there!")
- **Clear, not corporate**: "Book a cleaner" (not "Facilitate service transactions")
- **Premium, not pretentious**: "Quality you can trust" (not "Luxury redefined")

**We are not:**
- Too casual or slangy
- Overly technical or jargon-heavy
- Cold or robotic
- Overly promotional or pushy

### Writing Guidelines

**Headlines:**
- Start with benefit, not feature
- Use active voice
- Keep under 8 words
- Examples:
  - ✓ "Find trusted home professionals, effortlessly"
  - ✗ "Our platform connects you with service providers"

**Body Copy:**
- Write in 2nd person ("you") when addressing users
- Use short sentences (15-20 words max)
- Break up text with subheadings and bullets
- Lead with the benefit, then explain how

**CTAs:**
- Use action verbs
- Create urgency without pressure
- Be specific about what happens next
- Examples:
  - ✓ "Find your professional"
  - ✓ "Book now"
  - ✗ "Click here"
  - ✗ "Learn more" (too vague)

### Terminology

**Preferred Terms:**
| Use | Instead of |
|-----|-----------|
| Professional | Service provider, vendor, contractor |
| Homeowner | Client, customer, user |
| Book | Hire, schedule |
| Vetted | Screened, checked |
| Concierge matching | AI matching, algorithmic matching |

---

## Developer Implementation

### Getting Started

**1. Font Setup**

Add to `/src/app/[locale]/layout.tsx`:
```tsx
import { Cinzel, Spectral, Work_Sans } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const spectral = Spectral({
  subsets: ['latin'],
  variable: '--font-spectral',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
});

// Apply to <html> or <body>
className={`${cinzel.variable} ${spectral.variable} ${workSans.variable}`}
```

**2. Color Variables**

Add to `/src/app/globals.css`:
```css
:root {
  /* Core Colors */
  --cream: #FFFCF8;
  --charcoal: #1A1A1A;
  --red: #E63946;
  --red-hover: #D62839;
  --red-light: #FFE8EA;

  /* Semantic */
  --background: var(--cream);
  --foreground: var(--charcoal);
  --accent: var(--red);
  --muted-foreground: #757575;
  --border: #E8E4DC;

  /* Spacing */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 40px;
  --space-6: 48px;
  --space-7: 64px;
  --space-8: 80px;
  --space-9: 96px;
  --space-10: 128px;

  /* Typography */
  --font-display: clamp(48px, 6vw, 80px);
  --font-h1: clamp(36px, 4.5vw, 56px);
  --font-h2: clamp(28px, 3.5vw, 42px);
  --font-h3: clamp(24px, 2.5vw, 32px);
}
```

**3. Component Examples**

**Button Component:**
```tsx
// /src/components/ui/button.tsx
import { cn } from '@/lib/utils';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-base transition-all active:scale-95',
        variant === 'primary' && 'bg-[var(--red)] px-8 py-4 text-white hover:bg-[var(--red-hover)]',
        variant === 'secondary' && 'border-2 border-[var(--charcoal)] bg-transparent px-8 py-4 text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-white',
        variant === 'ghost' && 'px-4 py-2 text-[var(--charcoal)] hover:text-[var(--red)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

**Hero Section:**
```tsx
export function HeroSection() {
  return (
    <section className="bg-[var(--cream)] py-20 sm:py-28 lg:py-36">
      <Container>
        <div className="max-w-4xl">
          <h1 className="font-[family-name:var(--font-cinzel)] font-semibold text-[var(--font-display)] text-[var(--charcoal)] leading-[1.1] tracking-tight">
            Find trusted home professionals, effortlessly
          </h1>
          <p className="mt-6 font-[family-name:var(--font-work-sans)] text-[var(--muted-foreground)] text-lg leading-relaxed">
            Premium cleaning, personal chef services, and more.
            Vetted professionals, transparent pricing, white-glove service.
          </p>
          <div className="mt-8 flex gap-4">
            <Button variant="primary">Find your professional</Button>
            <Button variant="secondary">How it works</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

### Implementation Checklist

When building new pages or components:

**Design:**
- [ ] Uses correct font families (Cinzel/Spectral/Work Sans)
- [ ] Follows 8px spacing system
- [ ] Uses brand colors (Cream, Charcoal, Red)
- [ ] Maintains 90-9-1 color ratio
- [ ] Has clear typography hierarchy

**Accessibility:**
- [ ] All text meets WCAG AA contrast ratios (4.5:1 minimum)
- [ ] All interactive elements have focus states
- [ ] All images have descriptive alt text
- [ ] Semantic HTML used (nav, section, article, etc.)
- [ ] Keyboard navigation works correctly

**Performance:**
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Fonts loaded with `display: swap`
- [ ] No unnecessary animations
- [ ] Responsive images with `srcset`

**Brand Consistency:**
- [ ] Voice matches brand guidelines
- [ ] Terminology is consistent
- [ ] CTAs are action-oriented
- [ ] No off-brand colors or fonts used

---

## Future Enhancements

### Q1 2026

**Brand Assets:**
- [ ] Create official logo files (SVG, PNG, PDF)
- [ ] Design iconography system (custom icons)
- [ ] Develop illustration style guide
- [ ] Create brand animation guidelines (motion design)

**Photography:**
- [ ] Conduct professional photoshoot with real professionals
- [ ] Build image library (50+ images)
- [ ] Create before/after portfolio examples
- [ ] Develop video content guidelines

**Marketing Materials:**
- [ ] Design app store assets (all required sizes)
- [ ] Create social media templates
- [ ] Develop email template system
- [ ] Design presentation deck template

### Q2 2026

**Design System Expansion:**
- [ ] Build Figma component library
- [ ] Create interactive prototype kit
- [ ] Develop dark mode (if needed)
- [ ] Design mobile app UI kit

**Documentation:**
- [ ] Create developer onboarding guide
- [ ] Build Storybook component library
- [ ] Design accessibility audit checklist
- [ ] Develop localization guidelines (multi-language)

---

## Resources & Tools

### Design Tools
- **Figma**: Design and prototyping
- **Adobe Creative Suite**: Photography editing
- **Shots.so**: Screenshot mockups
- **Screely**: Browser mockups

### Typography
- **Google Fonts**: Font hosting
- **Fontjoy**: Font pairing inspiration
- **Type Scale**: Typography scale calculator

### Color
- **Coolors**: Palette generation
- **Contrast Checker**: WCAG compliance
- **Adobe Color**: Color harmony

### Stock Photography
- **Unsplash**: High-quality free photos
- **Pexels**: Lifestyle photography
- **Burst by Shopify**: E-commerce imagery

### Screenshot Tools
- **Cleanshot X**: macOS screenshot tool
- **Shottr**: Free screenshot annotation
- **Screely**: Browser mockups
- **Shots.so**: Social media mockups

---

## Approval & Sign-off

**Document Owner:** Design Team
**Reviewed By:** Product, Marketing, Engineering
**Last Review Date:** November 4, 2025
**Next Review Date:** February 1, 2026

---

## Questions or Feedback?

For questions about brand guidelines, contact:
- **Design:** design@casaora.com
- **Marketing:** marketing@casaora.com
- **Development:** dev@casaora.com

For updates to this document, submit a pull request to the design team.

---

**End of Document**
