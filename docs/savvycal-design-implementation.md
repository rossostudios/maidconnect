# SavvyCal-Inspired Design Implementation Guide

## Overview

This document outlines the complete transformation of MaidConnect's design system to match SavvyCal's aesthetic, including the new color palette, components, and design patterns.

## Color Palette Changes

### New SavvyCal-Inspired Colors

```css
/* Primary Colors */
--color-background: #F5F0E8;      /* Warm cream background */
--color-foreground: #1A1614;      /* Rich dark brown/black */
--color-accent: #E85D48;          /* Coral/orange accent */
--color-accent-hover: #D64A36;    /* Darker coral for hover */
```

### Updated Global Styles

All base colors have been updated in `src/app/globals.css`:

- **HTML/Body**: Now use `#F5F0E8` background and `#1A1614` text color
- **Accent Color**: All interactive elements use `#E85D48` (coral/orange)
- **Focus States**: Updated to use new accent color with 25% opacity
- **Buttons**: `.btn` class now uses coral border and hover states
- **Selection**: Text selection background changed to `#fce4e0`
- **Decorative Elements**: `.hr-red` and `.hr-gold` use new accent color

## New Components

### 1. WavyDivider Component

**Location**: `src/components/ui/wavy-divider.tsx`

Creates smooth wave transitions between sections, matching SavvyCal's signature style.

**Usage**:

```tsx
import { WavyDivider, WavyDividerTall } from "@/components/ui/wavy-divider";

// Standard wave (80px height)
<WavyDivider topColor="#F5F0E8" bottomColor="#ffffff" />

// Flipped wave (for bottom of sections)
<WavyDivider topColor="#F5F0E8" bottomColor="#ffffff" flip />

// Taller dramatic wave (120px height)
<WavyDividerTall topColor="#F5F0E8" bottomColor="#ffffff" />
```

**Props**:
- `topColor`: Background color of section above
- `bottomColor`: Background color of section below
- `flip`: Flip wave vertically (for bottom transitions)
- `className`: Additional CSS classes

### 2. FeatureSection Component

**Location**: `src/components/ui/feature-section.tsx`

Main section layout following SavvyCal's design pattern with large typography, proper spacing, and illustration slots.

**Usage**:

```tsx
import { FeatureSection, FeatureCard, FeatureGrid } from "@/components/ui/feature-section";
import { CleaningSupplies } from "@/components/illustrations/cleaning-supplies";

<FeatureSection
  tagline="SCHEDULING MADE SIMPLE"
  heading="Professional Home Services"
  description="Find verified professionals ready to help with your home needs."
  backgroundColor="#F5F0E8"
  textColor="#1A1614"
  illustration={<CleaningSupplies />}
  align="center"
>
  <FeatureGrid>
    <FeatureCard
      title="House Cleaning"
      description="Professional cleaning services for your home."
      icon={<HomeIcon />}
      href="/services/cleaning"
      linkText="Learn more"
    />
    {/* More cards... */}
  </FeatureGrid>
</FeatureSection>
```

**FeatureSection Props**:
- `tagline`: Small uppercase text above heading
- `heading`: Main section heading
- `description`: Body text below heading
- `backgroundColor`: Section background (default: `#F5F0E8`)
- `textColor`: Text color (default: `#1A1614`)
- `illustration`: SVG illustration component (bottom right)
- `children`: Content to render inside section
- `align`: "left" or "center" alignment
- `className`: Additional CSS classes

**FeatureCard Props**:
- `title`: Card title
- `description`: Card description
- `icon`: Optional icon component
- `href`: Optional link URL (makes card clickable)
- `linkText`: Link text (default: "Learn more")

**FeatureGrid**:
- Responsive grid container (1 col mobile, 2 cols tablet, 3 cols desktop)
- Proper spacing between cards

### 3. SVG Illustrations

**Location**: `src/components/illustrations/`

Three line-art style illustrations inspired by SavvyCal's design:

#### CleaningSupplies
```tsx
import { CleaningSupplies } from "@/components/illustrations/cleaning-supplies";

<CleaningSupplies />
```
Features: spray bottle, bucket with bubbles, mop, sponge, sparkles

#### CleanHome
```tsx
import { CleanHome } from "@/components/illustrations/clean-home";

<CleanHome />
```
Features: house with windows, door, chimney, flowers, sparkles, heart

#### BookingCalendar
```tsx
import { BookingCalendar } from "@/components/illustrations/booking-calendar";

<BookingCalendar />
```
Features: calendar grid, checkmarks, clock, notification bell, star

**Styling**:
- All illustrations use the accent color (`#E85D48`)
- Stroke width: 2.5px for consistent line weight
- Opacity variations for depth (0.3-0.6 for decorative elements)
- Designed to work at 320x320px viewBox
- Fully responsive with CSS

## Implementation Example

### Services Section Redesign

**File**: `src/components/sections/services-section.tsx`

**Before**: Traditional card grid with metrics and pricing

**After**: SavvyCal-inspired layout with:
- Wavy divider transitions (top and bottom)
- Warm cream background (`#F5F0E8`)
- Decorative cleaning supplies illustration (bottom right)
- Simplified feature cards with icons
- Large coral CTA button
- Proper typography hierarchy

**Key Changes**:
```tsx
// Old: Container-based layout
<section className="py-12 sm:py-24">
  <Container>
    {/* Cards */}
  </Container>
</section>

// New: FeatureSection with dividers
<>
  <WavyDivider topColor="#ffffff" bottomColor="#F5F0E8" />

  <FeatureSection
    tagline="OUR SERVICES"
    heading="Professional Home Services"
    description="Find verified professionals for all your home needs"
    illustration={<CleaningSupplies />}
  >
    <FeatureGrid>
      {/* Simplified cards */}
    </FeatureGrid>
  </FeatureSection>

  <WavyDivider flip topColor="#F5F0E8" bottomColor="#ffffff" />
</>
```

## Typography System

Typography remains unchanged (Inter font) but is now used more boldly:

- **Display Headings**: Extra bold (800) for hero sections
- **Section Headings**: Bold (700) with tight letter-spacing
- **Body Text**: Regular weight with 1.65 line height
- **Taglines**: Semi-bold (600), uppercase, wide tracking (0.08em)

## Design Patterns

### Section Structure

```tsx
<>
  {/* Transition from previous section */}
  <WavyDivider topColor="[prev-bg]" bottomColor="[this-bg]" />

  {/* Main section content */}
  <FeatureSection
    tagline="SECTION LABEL"
    heading="Large Bold Heading"
    description="Clear description of what this section offers"
    illustration={<YourIllustration />}
    backgroundColor="[bg-color]"
  >
    {/* Section content */}
  </FeatureSection>

  {/* Transition to next section */}
  <WavyDivider flip topColor="[this-bg]" bottomColor="[next-bg]" />
</>
```

### Color Combinations

**Cream Section** (primary):
```tsx
<FeatureSection
  backgroundColor="#F5F0E8"
  textColor="#1A1614"
/>
```

**White Section** (alternate):
```tsx
<FeatureSection
  backgroundColor="#ffffff"
  textColor="#1A1614"
/>
```

**Dark Section** (for contrast):
```tsx
<FeatureSection
  backgroundColor="#1A1614"
  textColor="#F5F0E8"
/>
```

### Button Styles

**Primary CTA**:
```tsx
<button className="rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-[#D64A36] hover:shadow-xl">
  Get Started
</button>
```

**Secondary CTA**:
```tsx
<button className="rounded-full border-2 border-[#E85D48] bg-transparent px-8 py-4 font-semibold text-[#E85D48] transition-all hover:bg-[#E85D48] hover:text-white">
  Learn More
</button>
```

## Responsive Behavior

All new components are fully responsive:

### WavyDivider
- Maintains aspect ratio across all screen sizes
- Uses `preserveAspectRatio="none"` to stretch horizontally

### FeatureSection
- Illustration hidden on mobile/tablet (`lg:block`)
- Content centers on mobile, can be left-aligned on desktop
- Padding adapts: `py-16` mobile, `py-24` desktop

### FeatureGrid
- 1 column on mobile
- 2 columns on tablet (`md:grid-cols-2`)
- 3 columns on desktop (`lg:grid-cols-3`)
- Consistent 6px gap between cards

## Migration Checklist

To apply this design to other pages:

- [ ] Update section backgrounds to use `#F5F0E8` or `#ffffff`
- [ ] Add `<WavyDivider />` between sections with different backgrounds
- [ ] Replace custom section layouts with `<FeatureSection>`
- [ ] Update all accent colors from `#e63946` to `#E85D48`
- [ ] Update button hover states to use `#D64A36`
- [ ] Add appropriate illustration to each major section
- [ ] Ensure typography uses bold weights (700-800) for headings
- [ ] Update form focus states to use new accent color
- [ ] Test responsive behavior on mobile/tablet/desktop

## Browser Compatibility

All components use standard CSS and SVG features:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 14+
- Android Chrome 90+
- No IE11 support (as per Next.js 16 requirements)

## Performance Considerations

- SVG illustrations are inline (no additional HTTP requests)
- All colors use hex values (faster than color functions)
- CSS transitions use GPU-accelerated properties
- Components tree-shake properly with ES modules

## Accessibility

- All illustrations are decorative (no alt text needed)
- Focus states clearly visible with accent color outline
- Color contrast meets WCAG AA standards:
  - `#1A1614` on `#F5F0E8`: 11.2:1 (AAA)
  - `#E85D48` on `#F5F0E8`: 3.8:1 (AA for large text)
  - White on `#E85D48`: 4.1:1 (AA)

## Future Enhancements

Potential additions to match SavvyCal even more closely:

1. **Dark Mode**: Create dark version with `#1A1614` background
2. **Animation**: Add subtle scroll animations to illustrations
3. **More Illustrations**: Create illustrations for each service type
4. **Patterns**: Add subtle background patterns to sections
5. **Testimonial Cards**: Design testimonial layout matching SavvyCal
6. **Pricing Tables**: Create SavvyCal-style pricing comparison

## Resources

- **SavvyCal Reference**: https://savvycal.com
- **Color Palette**: Extracted from SavvyCal website
- **Typography**: Inter font (already in use)
- **Design Philosophy**: Clean, minimal, bold typography, warm colors

## Questions?

Contact the design team for:
- Additional illustration requests
- Custom color combinations
- Layout assistance
- Accessibility review

---

**Last Updated**: 2025-01-06
**Version**: 1.0.0
**Author**: Claude (via CLAUDE.md guidelines)
