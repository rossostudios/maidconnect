# UI Best Practices Implementation Guide

This document provides a comprehensive guide to implementing the UX/UI best practices in the Casaora/MaidConnect application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Motion System](#motion-system)
3. [Accessibility Features](#accessibility-features)
4. [Components](#components)
5. [Integration](#integration)
6. [Examples](#examples)

---

## Overview

We've implemented a comprehensive design system that includes:

- **Motion utilities** (`src/lib/motion.ts`) - Consistent animation patterns
- **MotionProvider** - Global motion configuration with reduced-motion support
- **Accessibility enhancements** - Focus-visible, skip links, screen reader support
- **Reusable components** - Card, SkipLink with full a11y compliance

---

## Motion System

### Setup

```tsx
// src/app/[locale]/layout.tsx
import { MotionProvider } from "@/components/providers/motion-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      {children}
    </MotionProvider>
  );
}
```

### Available Animations

```tsx
import {
  fadeInUp,
  fadeInDown,
  scaleIn,
  stagger,
  listAnimation,
  listItem,
  slideInRight,
  viewportOnce,
  hoverLift,
} from "@/lib/motion";
import { motion } from "framer-motion";

// 1. Fade in with upward movement
<motion.div
  initial="hidden"
  animate="show"
  variants={fadeInUp}
>
  Content appears smoothly
</motion.div>

// 2. Stagger children animations
<motion.ul
  initial="hidden"
  animate="show"
  variants={stagger}
>
  <motion.li variants={fadeInUp}>Item 1</motion.li>
  <motion.li variants={fadeInUp}>Item 2</motion.li>
  <motion.li variants={fadeInUp}>Item 3</motion.li>
</motion.ul>

// 3. Viewport reveal (animate when scrolled into view)
<motion.section
  initial="hidden"
  whileInView="show"
  viewport={viewportOnce}
  variants={fadeInUp}
>
  Reveals when 25% visible
</motion.section>

// 4. List animations
<motion.ul variants={listAnimation} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={listItem}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Custom Animations

```tsx
import { createFadeIn, createStagger } from "@/lib/motion";

// Custom fade direction and distance
const customFade = createFadeIn("left", 24);

// Custom stagger timing
const slowStagger = createStagger(0.15, 0.2);

<motion.div variants={customFade}>
  Custom animation
</motion.div>
```

---

## Accessibility Features

### 1. Skip Links

Add to the top of your layout for keyboard navigation:

```tsx
// src/app/[locale]/layout.tsx
import { SkipLink } from "@/components/ui/skip-link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={locale}>
      <body>
        <SkipLink />  {/* Appears on keyboard focus */}
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
```

Multiple skip links:

```tsx
import { SkipLinks, SkipLink } from "@/components/ui/skip-link";

<SkipLinks>
  <SkipLink href="main-content">Skip to main content</SkipLink>
  <SkipLink href="search">Skip to search</SkipLink>
  <SkipLink href="footer">Skip to footer</SkipLink>
</SkipLinks>
```

### 2. Focus Management

All interactive elements automatically get proper focus indicators:

```css
/* Applied globally in globals.css */
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### 3. Screen Reader Support

Use the `.sr-only` utility class:

```tsx
<button>
  <span className="sr-only">Delete item</span>
  <TrashIcon aria-hidden="true" />
</button>
```

---

## Components

### Card Component

Flexible container with motion support:

```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

// Basic card
<Card variant="elevated">
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
</Card>

// Hoverable card with lift effect
<Card variant="default" hoverable>
  Interactive card
</Card>

// Clickable card (renders as link)
<Card href="/details" hoverable variant="elevated">
  Click me
</Card>

// Glass card (translucent background)
<Card variant="glass">
  Glassmorphism effect
</Card>

// Card with image
<Card hoverable>
  <CardImage aspectRatio="16/9">
    <img src="/image.jpg" alt="Description" className="w-full h-full object-cover" />
  </CardImage>
  <CardHeader>
    <h3>Image Card</h3>
  </CardHeader>
  <CardContent>
    Content below image
  </CardContent>
</Card>
```

### Button Component (Existing - Enhanced)

The existing button component already supports variants and accessibility:

```tsx
import { Button } from "@/components/ui/button";

<Button
  href="/booking"
  label="Book Now"
  variant="primary"
  size="lg"
  icon
/>
```

To add motion to existing buttons:

```tsx
import { motion } from "framer-motion";
import { buttonPress } from "@/lib/motion";

<motion.div {...buttonPress}>
  <Button href="/booking" label="Animated Button" />
</motion.div>
```

---

## Integration

### Step 1: Update Root Layout

```tsx
// src/app/[locale]/layout.tsx
import { MotionProvider } from "@/components/providers/motion-provider";
import { SkipLink } from "@/components/ui/skip-link";

export default function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body>
        <SkipLink />
        <MotionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* ...other providers */}
            {children}
          </NextIntlClientProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add Main Content ID

```tsx
// src/app/[locale]/page.tsx
export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      {/* Your content */}
    </main>
  );
}
```

### Step 3: Add Translations

```json
// messages/en.json
{
  "common": {
    "skipToContent": "Skip to main content"
  }
}

// messages/es.json
{
  "common": {
    "skipToContent": "Saltar al contenido principal"
  }
}
```

---

## Examples

### Hero Section with Stagger Animation

```tsx
import { motion } from "framer-motion";
import { staggerSlow, fadeInUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <motion.section
      className="container py-16 md:py-24"
      initial="hidden"
      animate="show"
      variants={staggerSlow}
    >
      <motion.p variants={fadeInUp} className="tagline">
        Para extranjeros en Colombia
      </motion.p>
      <motion.h1 variants={fadeInUp} className="display">
        Encuentra profesionales verificados para tu hogar
      </motion.h1>
      <motion.p variants={fadeInUp} className="lead">
        Perfiles comprobados, precios transparentes y soporte bilingüe.
      </motion.p>
      <motion.div variants={fadeInUp} className="flex gap-3 mt-8">
        <Button href="/search" label="Reservar" variant="primary" size="lg" />
        <Button href="/professionals" label="Ver profesionales" variant="secondary" />
      </motion.div>
    </motion.section>
  );
}
```

### Professional Card Grid

```tsx
import { motion } from "framer-motion";
import { listAnimation, listItem } from "@/lib/motion";
import { Card, CardContent, CardImage } from "@/components/ui/card";

export function ProfessionalGrid({ professionals }: Props) {
  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      variants={listAnimation}
      initial="hidden"
      animate="show"
    >
      {professionals.map(pro => (
        <motion.div key={pro.id} variants={listItem}>
          <Card href={`/professionals/${pro.id}`} hoverable variant="elevated">
            <CardImage aspectRatio="4/3">
              <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover" />
            </CardImage>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg">{pro.name}</h3>
              <p className="text-muted-foreground text-sm">{pro.service}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium">★ {pro.rating}</span>
                <span className="text-sm text-muted-foreground">({pro.reviews} reviews)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Scroll-Reveal Section

```tsx
import { motion } from "framer-motion";
import { fadeInUp, viewportOnce } from "@/lib/motion";

export function Features() {
  return (
    <section className="container py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeInUp}
      >
        <h2 className="text-center">Cómo funciona</h2>
        <div className="grid gap-8 md:grid-cols-3 mt-12">
          {/* Feature items */}
        </div>
      </motion.div>
    </section>
  );
}
```

### Accessible Form with Focus Management

```tsx
export function BookingForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... handle submission

    // Focus first error or success message
    const errorElement = formRef.current?.querySelector('[aria-invalid="true"]');
    if (errorElement) {
      (errorElement as HTMLElement).focus();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <label htmlFor="service">
        Service
        <span className="sr-only">(required)</span>
      </label>
      <select
        id="service"
        aria-required="true"
        aria-invalid={errors.service ? "true" : "false"}
        aria-describedby={errors.service ? "service-error" : undefined}
      >
        {/* options */}
      </select>
      {errors.service && (
        <p id="service-error" className="text-error text-sm" role="alert">
          {errors.service}
        </p>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Performance Tips

1. **Lazy load animations** for below-the-fold content:
   ```tsx
   import { viewportOnce } from "@/lib/motion";
   // Animations only trigger when scrolled into view
   ```

2. **Disable motion** on low-end devices:
   ```tsx
   <Card disableMotion={!window.matchMedia('(min-width: 1024px)').matches}>
   ```

3. **Respect user preferences** - Motion is automatically disabled for users with `prefers-reduced-motion`

---

## Checklist

- [x] Locale mismatch fixed (`defaultLocale: "es"`)
- [x] Motion utilities library created
- [x] MotionProvider implemented
- [x] Accessibility styles added (focus-visible, skip-link)
- [x] SkipLink component created
- [x] Card component with motion support
- [ ] MotionProvider integrated into root layout
- [ ] SkipLink added to layouts
- [ ] Professional cards updated to use new Card component
- [ ] Hero section updated with stagger animations
- [ ] Forms audited for proper ARIA labels

---

## Next Steps

1. **Integrate MotionProvider** into root layout
2. **Add SkipLink** to all main layouts (marketing, dashboard, admin)
3. **Refactor existing components** to use new Card component where appropriate
4. **Add stagger animations** to professional grids and service lists
5. **Audit forms** for accessibility (labels, error messages, focus management)
6. **Test with screen readers** (VoiceOver on macOS, NVDA on Windows)
7. **Performance audit** with Lighthouse

---

## Resources

- [Framer Motion Docs](https://motion.dev/docs/react)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Next.js i18n Routing](https://next-intl.dev/docs/routing)
