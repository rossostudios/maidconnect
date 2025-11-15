# Lia Design System Compliance Checklist - Error Pages

This checklist ensures error pages (404, 500, global-error) follow the Lia Design System standards while maintaining clarity and usability during error states.

## ✅ Typography

- [ ] **Geist Sans ONLY** - All text uses `font-[family-name:var(--font-geist-sans)]` or `geistSans.className`
- [ ] **Geist Mono for error codes** - Error codes (404, 500) use `font-[family-name:var(--font-geist-mono)]`
- [ ] **No custom fonts** - Zero references to Satoshi, Manrope, or other fonts
- [ ] **Large error codes** - Use `text-6xl` or `text-7xl` for error codes
- [ ] **Clear messaging** - Error descriptions use `text-lg` or `text-xl`
- [ ] **Tight tracking** - Headings use `tracking-tight`
- [ ] **Typography scale** - 72px (error code), 48px (heading), 18px (description)

**Quick Fix:**
```tsx
// ❌ WRONG
<h1 className="text-4xl font-bold">404</h1>

// ✅ CORRECT
import { geistMono, geistSans } from "@/app/fonts";

<div className="text-center">
  <p className={cn(
    "font-bold text-7xl text-neutral-900",
    geistMono.className
  )}>
    404
  </p>
  <h1 className={cn(
    "mt-4 font-bold text-4xl text-neutral-900 tracking-tight",
    geistSans.className
  )}>
    Page Not Found
  </h1>
</div>
```

---

## ✅ Color Palette

- [ ] **No custom hex colors** - All colors use Tailwind tokens
- [ ] **Neutral backgrounds** - Use `bg-neutral-50` or `bg-white`
- [ ] **Text hierarchy** - Error code `neutral-900`, heading `neutral-900`, description `neutral-700`
- [ ] **Orange CTAs** - "Go Home" button uses `bg-orange-500 hover:bg-orange-600`
- [ ] **Semantic error colors** - Error icons/indicators can use `red-600` sparingly
- [ ] **High contrast** - WCAG AAA (7:1+) for all text

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="bg-gray-100">
  <button className="bg-blue-500">Go Back</button>
</div>

// ✅ CORRECT
<div className="bg-neutral-50">
  <button className="bg-orange-500 hover:bg-orange-600 text-white">
    Go Home
  </button>
</div>
```

---

## ✅ Geometry & Spacing

- [ ] **Zero rounded corners** - Error containers, buttons have sharp edges
- [ ] **8px spacing scale** - All margins/padding are multiples of 8px
- [ ] **24px baseline** - Vertical spacing uses baseline units
- [ ] **Centered layout** - Error content centered both horizontally and vertically
- [ ] **Consistent gaps** - Use `gap-4`, `gap-6`, `gap-8`
- [ ] **Breathing room** - Error pages have generous spacing for readability

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="rounded-lg p-5">

// ✅ CORRECT
<div className="p-8 gap-6">
```

---

## ✅ Component Patterns

### Error Code Display
- [ ] **Geist Mono font** - Error codes use monospace font
- [ ] **Large size** - `text-6xl` or `text-7xl` for visibility
- [ ] **Bold weight** - `font-bold` for emphasis
- [ ] **Neutral color** - `text-neutral-900` for clarity

```tsx
// ✅ CORRECT Error Code Pattern
<p className={cn(
  "font-bold text-7xl text-neutral-900 tracking-tight",
  geistMono.className
)}>
  404
</p>
```

### Error Message
- [ ] **Geist Sans font** - Error messages use sans font
- [ ] **Clear hierarchy** - Main heading `text-4xl`, description `text-lg`
- [ ] **Centered alignment** - `text-center` for error messages
- [ ] **Concise copy** - Clear, actionable error descriptions

```tsx
// ✅ CORRECT Error Message Pattern
<div className="text-center">
  <h1 className={cn(
    "font-bold text-4xl text-neutral-900 tracking-tight",
    geistSans.className
  )}>
    Page Not Found
  </h1>
  <p className={cn(
    "mt-4 text-lg text-neutral-700",
    geistSans.className
  )}>
    The page you're looking for doesn't exist or has been moved.
  </p>
</div>
```

### Error Action Buttons
- [ ] **Primary CTA** - "Go Home" button uses `bg-orange-500`
- [ ] **Secondary CTA** - "Try Again" uses `bg-neutral-100`
- [ ] **Sharp edges** - No rounded corners
- [ ] **Consistent padding** - `px-6 py-3` or `px-8 py-4`
- [ ] **Clear labels** - Action-oriented button text

```tsx
// ✅ CORRECT Error Button Pattern
<div className="flex justify-center gap-4">
  <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 font-semibold text-white">
    Go Home
  </button>
  <button className="bg-neutral-100 hover:bg-neutral-200 px-8 py-3 font-semibold text-neutral-900">
    Try Again
  </button>
</div>
```

### Error Icon (Optional)
- [ ] **Minimal decoration** - Use sparingly, only if needed
- [ ] **Semantic color** - Error icons can use `text-red-600`
- [ ] **Sharp edges** - No rounded icon containers
- [ ] **Consistent size** - `h-12 w-12` or `h-16 w-16`

---

## ✅ Accessibility

- [ ] **WCAG AAA contrast** - All text has 7:1+ contrast ratio
- [ ] **Focus states** - All buttons have visible focus rings
- [ ] **Focus ring** - `focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500`
- [ ] **Keyboard navigation** - All actions accessible via keyboard
- [ ] **Screen reader labels** - Page title describes error state
- [ ] **Semantic HTML** - Use `<main>`, `<h1>`, proper heading hierarchy
- [ ] **Clear error messages** - Avoid technical jargon
- [ ] **Actionable guidance** - Tell users what to do next

**Quick Fix:**
```tsx
// ❌ WRONG
<div onClick={() => router.push('/')}>
  Go Home
</div>

// ✅ CORRECT
<button
  className="bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/25 px-8 py-3 text-white"
  onClick={() => router.push('/')}
  type="button"
>
  Go Home
</button>
```

---

## ✅ Error Page Patterns

### 404 Not Found
- [ ] **Clear error code** - Large "404" in Geist Mono
- [ ] **Helpful message** - "Page Not Found" heading
- [ ] **Actionable description** - Explain what happened
- [ ] **Navigation options** - "Go Home" and "Browse Services" buttons
- [ ] **Minimal design** - Focus on message, not decoration

```tsx
// ✅ CORRECT 404 Pattern
<main className="flex min-h-screen items-center justify-center bg-neutral-50">
  <div className="text-center">
    <p className={cn("font-bold text-7xl text-neutral-900", geistMono.className)}>
      404
    </p>
    <h1 className={cn("mt-6 font-bold text-4xl text-neutral-900 tracking-tight", geistSans.className)}>
      Page Not Found
    </h1>
    <p className={cn("mx-auto mt-4 max-w-md text-lg text-neutral-700", geistSans.className)}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 font-semibold text-white">
        Go Home
      </button>
    </div>
  </div>
</main>
```

### 500 Server Error
- [ ] **Clear error code** - Large "500" in Geist Mono
- [ ] **Reassuring message** - "Something Went Wrong" heading
- [ ] **Non-technical description** - Avoid stack traces
- [ ] **Action buttons** - "Try Again" and "Go Home"
- [ ] **Error reporting** - Optional "Report Issue" button

```tsx
// ✅ CORRECT 500 Pattern
<main className="flex min-h-screen items-center justify-center bg-neutral-50">
  <div className="text-center">
    <p className={cn("font-bold text-7xl text-neutral-900", geistMono.className)}>
      500
    </p>
    <h1 className={cn("mt-6 font-bold text-4xl text-neutral-900 tracking-tight", geistSans.className)}>
      Something Went Wrong
    </h1>
    <p className={cn("mx-auto mt-4 max-w-md text-lg text-neutral-700", geistSans.className)}>
      We're working to fix this issue. Please try again in a moment.
    </p>
    <div className="mt-8 flex justify-center gap-4">
      <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 font-semibold text-white">
        Try Again
      </button>
      <button className="bg-neutral-100 hover:bg-neutral-200 px-8 py-3 font-semibold text-neutral-900">
        Go Home
      </button>
    </div>
  </div>
</main>
```

### Global Error
- [ ] **Error boundary** - React Error Boundary for client-side errors
- [ ] **Clear messaging** - "Unexpected Error" heading
- [ ] **Reset option** - "Try Again" button to reset error boundary
- [ ] **Navigation fallback** - "Go Home" button always works
- [ ] **No stack traces** - Hide technical details from users

---

## 🚫 Common Violations

**DO NOT:**
- ❌ Use `rounded-md`, `rounded-lg`, `rounded-xl` on error containers or buttons
- ❌ Use custom hex colors for error states
- ❌ Display raw stack traces or technical errors
- ❌ Use decorative illustrations (keep minimal)
- ❌ Skip focus states on action buttons
- ❌ Use vague error messages like "Error occurred"
- ❌ Mix multiple font families

**DO:**
- ✅ Use sharp rectangular geometry everywhere
- ✅ Use Geist Mono for error codes, Geist Sans for messages
- ✅ Provide clear, actionable error messages
- ✅ Offer navigation options (Home, Try Again)
- ✅ Add visible focus rings to all buttons
- ✅ Center error content for visual clarity
- ✅ Follow 8px spacing scale strictly

---

## 📋 Page-Specific Checks

### 404 Page (`src/app/[locale]/not-found.tsx`)
- [ ] Error code uses Geist Mono font
- [ ] Message uses Geist Sans font
- [ ] "Go Home" button uses orange-500
- [ ] All spacing follows 8px scale
- [ ] No rounded corners on buttons or containers

### Global Error (`src/app/global-error.tsx`)
- [ ] Error boundary properly configured
- [ ] Reset button uses orange-500
- [ ] Error message is user-friendly (no stack traces)
- [ ] Fonts use Geist Sans/Mono
- [ ] All buttons have focus states

### Locale Error (`src/app/[locale]/error.tsx`)
- [ ] Error message localized if applicable
- [ ] Typography uses Geist fonts
- [ ] Action buttons follow Lia patterns
- [ ] Layout is centered and accessible
- [ ] No custom hex colors

---

## 🔍 Quick Audit Commands

```bash
# Find rounded corners in error pages
grep -r "rounded-md\|rounded-lg\|rounded-xl\|rounded-full" src/app/**/error.tsx src/app/**/not-found.tsx src/app/global-error.tsx

# Find custom hex colors
grep -r "#[0-9A-Fa-f]\{6\}" src/app/**/error.tsx src/app/**/not-found.tsx

# Find non-Geist fonts
grep -r "font-satoshi\|font-manrope\|font-inter" src/app/**/error.tsx

# Find spacing outside 8px scale
grep -r "p-5\|p-7\|gap-5\|m-5" src/app/**/error.tsx
```

---

## ✅ Sign-Off

Once all checks pass:

- [ ] Typography uses Geist Sans for messages, Geist Mono for error codes
- [ ] Colors use neutral/orange palette tokens only
- [ ] Geometry has zero rounded corners (sharp edges)
- [ ] Components follow error message/button patterns
- [ ] Accessibility meets WCAG AAA standards (7:1+ contrast)
- [ ] Spacing follows 8px/24px scales
- [ ] No custom hex colors, no non-Geist fonts
- [ ] All interactive elements have visible focus states
- [ ] Error messages are clear, actionable, and user-friendly
- [ ] Navigation options provided (Go Home, Try Again)

**Reviewer:** _________________
**Date:** _________________
**Page:** _________________
