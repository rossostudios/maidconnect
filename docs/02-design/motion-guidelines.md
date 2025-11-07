# Motion & Animation Guidelines

**Comprehensive guide to implementing motion and animations in Casaora using Motion One.**

## Overview

Our motion system uses **[Motion One](https://motion.dev/)** - a lightweight, performant animation library built on the Web Animations API. All animations automatically respect user preferences for reduced motion (WCAG 2.2 compliant).

**Key Benefits:**
- **Performance**: Uses native Web Animations API (hardware-accelerated)
- **Lightweight**: Only ~5KB (vs Framer Motion's 25KB+)
- **Accessibility**: Automatic reduced-motion support
- **Developer Experience**: Simple, declarative API
- **React Integration**: Works seamlessly with React 19

**Library:** [https://motion.dev/](https://motion.dev/)

---

## Installation

Motion One is already installed in the project:

```bash
# Already in package.json
"motion": "^12.23.24"
```

---

## Basic Animation API

### animate()

The core function for creating animations:

```typescript
import { animate } from "motion";

// Animate an element
animate("#my-element", { opacity: 1, y: 0 }, { duration: 0.3 });
```

**Syntax:**
```typescript
animate(
  element,           // Selector, element, or ref
  keyframes,         // Properties to animate
  options?           // Duration, easing, delay, etc.
)
```

---

## Common Animations

### Fade In

```typescript
import { animate } from "motion";
import { useEffect, useRef } from "react";

export function FadeInComponent() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(
        ref.current,
        { opacity: [0, 1] },
        { duration: 0.3, easing: "ease-out" }
      );
    }
  }, []);

  return <div ref={ref}>Content fades in</div>;
}
```

### Fade In Up

```typescript
import { animate } from "motion";

export function FadeInUp() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(
        ref.current,
        {
          opacity: [0, 1],
          y: [20, 0]  // Move up 20px
        },
        { duration: 0.3, easing: [0.4, 0, 0.2, 1] }
      );
    }
  }, []);

  return <div ref={ref}>Content appears from below</div>;
}
```

### Scale In

```typescript
animate(
  element,
  {
    opacity: [0, 1],
    scale: [0.9, 1]
  },
  { duration: 0.2, easing: "ease-out" }
);
```

---

## Scroll-Based Animations

Motion One has excellent scroll animation support:

### scroll()

Animate on scroll:

```typescript
import { scroll } from "motion";

scroll(
  animate("#my-element", {
    opacity: [0, 1],
    y: [50, 0]
  }),
  {
    target: document.querySelector("#my-element"),
    offset: ["start end", "end end"]  // When to trigger
  }
);
```

### Scroll-Triggered Reveal

```typescript
import { inView } from "motion";
import { useEffect, useRef } from "react";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Trigger when element enters viewport
      inView(
        ref.current,
        () => {
          animate(
            ref.current!,
            { opacity: [0, 1], y: [30, 0] },
            { duration: 0.5, easing: [0.4, 0, 0.2, 1] }
          );
        },
        { amount: 0.25 }  // Trigger when 25% visible
      );
    }
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

---

## Stagger Animations

Animate multiple elements with delay:

```typescript
import { stagger, animate } from "motion";

// Stagger children
animate(
  ".list-item",
  { opacity: [0, 1], y: [20, 0] },
  { delay: stagger(0.1), duration: 0.3 }
);
```

### Stagger Example Component

```typescript
import { animate, stagger } from "motion";
import { useEffect, useRef } from "react";

export function StaggerList({ items }: { items: string[] }) {
  const listRef = useRef<HTMLULElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll("li");

      animate(
        items,
        { opacity: [0, 1], y: [20, 0] },
        {
          delay: stagger(0.1),  // 0.1s delay between each
          duration: 0.3,
          easing: "ease-out"
        }
      );
    }
  }, [items]);

  return (
    <ul ref={listRef}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
```

---

## Interactive Animations

### Hover Effects

```typescript
import { animate } from "motion";

export function HoverCard() {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      animate(
        ref.current,
        { scale: 1.05, y: -4 },
        { duration: 0.2, easing: "ease-out" }
      );
    }
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      animate(
        ref.current,
        { scale: 1, y: 0 },
        { duration: 0.2, easing: "ease-out" }
      );
    }
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="card"
    >
      Hover me!
    </div>
  );
}
```

### Click/Tap Effects

```typescript
export function PressButton() {
  const ref = useRef<HTMLButtonElement>(null);

  const handlePress = () => {
    if (ref.current) {
      animate(
        ref.current,
        { scale: [1, 0.95, 1] },
        { duration: 0.2 }
      );
    }
  };

  return (
    <button ref={ref} onClick={handlePress}>
      Click me!
    </button>
  );
}
```

---

## Real-World Examples

### Hero Section

```typescript
import { animate, stagger } from "motion";
import { useEffect, useRef } from "react";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll(".animate");

      animate(
        elements,
        { opacity: [0, 1], y: [30, 0] },
        {
          delay: stagger(0.15),  // Stagger each element
          duration: 0.5,
          easing: [0.4, 0, 0.2, 1]
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-24">
      <p className="animate text-sm text-gray-600">
        Para extranjeros en Colombia
      </p>
      <h1 className="animate text-5xl font-bold mt-4">
        Encuentra profesionales verificados para tu hogar
      </h1>
      <p className="animate text-xl text-gray-600 mt-6">
        Perfiles comprobados, precios transparentes y soporte bilingüe.
      </p>
      <div className="animate flex gap-3 mt-8">
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg">
          Buscar profesionales
        </button>
        <button className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg">
          Cómo funciona
        </button>
      </div>
    </section>
  );
}
```

### Professional Card Grid

```typescript
import { animate, inView, stagger } from "motion";
import { useEffect, useRef } from "react";

export function ProfessionalGrid({ professionals }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      // Animate when grid enters viewport
      inView(
        gridRef.current,
        () => {
          const cards = gridRef.current!.querySelectorAll(".pro-card");

          animate(
            cards,
            { opacity: [0, 1], y: [30, 0] },
            {
              delay: stagger(0.1),
              duration: 0.4,
              easing: [0.4, 0, 0.2, 1]
            }
          );
        },
        { amount: 0.2 }  // Trigger when 20% visible
      );
    }
  }, [professionals]);

  return (
    <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {professionals.map((pro) => (
        <div key={pro.id} className="pro-card">
          <img
            src={pro.avatar}
            alt={pro.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-6">
            <h3 className="font-semibold text-lg">{pro.name}</h3>
            <p className="text-gray-600 text-sm">{pro.service}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium">★ {pro.rating}</span>
              <span className="text-sm text-gray-600">
                ({pro.reviews} reseñas)
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Modal Animation

```typescript
import { animate } from "motion";
import { useEffect, useRef } from "react";

export function Modal({ isOpen, onClose, children }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      if (backdropRef.current) {
        animate(
          backdropRef.current,
          { opacity: [0, 1] },
          { duration: 0.2 }
        );
      }

      if (modalRef.current) {
        animate(
          modalRef.current,
          {
            opacity: [0, 1],
            scale: [0.95, 1]
          },
          { duration: 0.2, easing: "ease-out" }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-xl p-6 max-w-md w-full"
        >
          {children}
        </div>
      </div>
    </>
  );
}
```

---

## Accessibility

### Reduced Motion Support

Motion One automatically respects `prefers-reduced-motion`:

```typescript
import { animate } from "motion";

// This animation will be skipped if user prefers reduced motion
animate(
  element,
  { opacity: [0, 1], y: [20, 0] },
  {
    duration: 0.3,
    // Motion One handles prefers-reduced-motion automatically!
  }
);
```

### Manual Reduced Motion Check

```typescript
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  animate(element, { y: [20, 0] }, { duration: 0.3 });
} else {
  // Just set final state without animation
  element.style.opacity = "1";
  element.style.transform = "translateY(0)";
}
```

---

## Performance Best Practices

### 1. Use Hardware-Accelerated Properties

Prefer these properties for smooth 60fps animations:
- ✅ `opacity`
- ✅ `transform` (translateX, translateY, scale, rotate)
- ❌ `width`, `height` (causes layout recalculation)
- ❌ `top`, `left` (causes layout recalculation)

```typescript
// ✅ GOOD: Uses transform
animate(element, { x: [0, 100] }, { duration: 0.3 });

// ❌ BAD: Uses left
animate(element, { left: ["0px", "100px"] }, { duration: 0.3 });
```

### 2. Animate on Scroll Efficiently

Use `inView()` for scroll-based animations:

```typescript
import { inView, animate } from "motion";

// Only animates when element enters viewport
inView(
  element,
  () => animate(element, { opacity: [0, 1] }, { duration: 0.3 }),
  { amount: 0.25 }
);
```

### 3. Clean Up Animations

Motion One handles cleanup automatically, but you can cancel manually if needed:

```typescript
const animation = animate(element, { x: 100 }, { duration: 1 });

// Cancel if component unmounts
useEffect(() => {
  return () => animation.cancel();
}, []);
```

---

## Animation Timing Guidelines

### Duration Standards

- **Micro-interactions:** 0.15s (buttons, toggles)
- **Standard UI:** 0.2-0.3s (modals, dropdowns, cards)
- **Page transitions:** 0.4-0.5s (route changes, major state changes)
- **Emphasis:** 0.6-0.8s (special effects, celebrations)

### Easing Curves

```typescript
// Standard easing (default)
{ easing: "ease" }

// Custom cubic bezier (Material Design style)
{ easing: [0.4, 0, 0.2, 1] }

// Spring physics (bouncy, natural)
{ easing: "spring" }

// Linear (constant speed)
{ easing: "linear" }
```

---

## Common Patterns

### Loading States

```typescript
animate(
  ".loader",
  { opacity: [1, 0.5, 1] },
  {
    duration: 1.5,
    repeat: Infinity,
    easing: "ease-in-out"
  }
);
```

### Success Animation

```typescript
animate(
  ".success-icon",
  { scale: [0, 1.2, 1] },
  {
    duration: 0.5,
    easing: "spring"
  }
);
```

### Error Shake

```typescript
animate(
  ".error-message",
  { x: [0, -10, 10, -10, 10, 0] },
  { duration: 0.5 }
);
```

---

## Utility Hooks

### useAnimation Hook

Create a reusable animation hook:

```typescript
import { animate } from "motion";
import { useEffect, useRef } from "react";

export function useAnimation(
  animationConfig: any,
  deps: any[] = []
) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, ...animationConfig);
    }
  }, deps);

  return ref;
}

// Usage
export function Component() {
  const ref = useAnimation([
    { opacity: [0, 1], y: [20, 0] },
    { duration: 0.3 }
  ]);

  return <div ref={ref}>Animated content</div>;
}
```

---

## Troubleshooting

### Animation Not Working

1. **Check element ref is assigned**
```typescript
const ref = useRef<HTMLDivElement>(null);

// ✅ Correct
<div ref={ref}>...</div>

// ❌ Wrong
<div>...</div>
```

2. **Ensure element exists before animating**
```typescript
useEffect(() => {
  if (ref.current) {  // ✅ Check exists
    animate(ref.current, ...);
  }
}, []);
```

3. **Verify property names**
```typescript
// ✅ Correct
{ x: 100, y: 50, opacity: 1, scale: 1.5 }

// ❌ Wrong
{ translateX: 100, left: 50 }  // Use x, y instead
```

---

## Resources

- **Motion One Docs**: [https://motion.dev/](https://motion.dev/)
- **Motion One GitHub**: [https://github.com/motiondivision/motionone](https://github.com/motiondivision/motionone)
- **Motion for React**: [https://motion.dev/docs/react-quick-start](https://motion.dev/docs/react-quick-start)
- **Scroll Animations**: [https://motion.dev/docs/scroll](https://motion.dev/docs/scroll)
- **Accessibility**: [WCAG 2.2 - Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

---

## Related Documentation

- [Design System](./design-system.md) - Complete design system documentation
- [Branding Guidelines](./branding-guidelines-2025.md) - Brand colors, typography, voice
- [CLAUDE.md](../../CLAUDE.md) - Project coding standards

---

**Last Updated:** January 2025
**Version:** 2.0.0 (Motion One)
**Status:** Active
