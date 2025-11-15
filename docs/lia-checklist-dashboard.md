# Lia Design System Compliance Checklist - Dashboard Pages

This checklist ensures dashboard pages (customer/professional dashboards) follow the Lia Design System standards.

## ✅ Typography

- [ ] **Geist Sans ONLY** - All UI text uses Geist Sans className or CSS variable
- [ ] **Geist Mono for metrics** - Booking counts, revenue, dates use Geist Mono
- [ ] **No custom fonts** - Zero references to Satoshi, Manrope, or other fonts
- [ ] **Uppercase page titles** - Dashboard headings use `uppercase` class
- [ ] **Tight tracking** - Headers use `tracking-tight`, labels use `tracking-wide`
- [ ] **Baseline alignment** - Line heights are 24px or 48px
- [ ] **Typography scale** - Font sizes: 36px (h1), 24px (h2), 16px (body), 14px (labels), 12px (meta)

**Quick Fix:**
```tsx
// ❌ WRONG
<h1 className="text-2xl font-bold">Dashboard</h1>

// ✅ CORRECT
<h1 className="font-[family-name:var(--font-geist-sans)] font-semibold text-3xl text-neutral-900 uppercase tracking-tight">
  Dashboard
</h1>
```

---

## ✅ Color Palette

- [ ] **No custom hex colors** - All colors use Tailwind tokens
- [ ] **White containers** - Main content areas use `bg-white`
- [ ] **Neutral backgrounds** - Page background uses `bg-neutral-50`
- [ ] **Text hierarchy** - Headings `neutral-900`, body `neutral-700`, muted `neutral-600`
- [ ] **Orange highlights** - Active states, badges, CTAs use orange-500/600
- [ ] **Neutral borders** - All dividers use `border-neutral-200`
- [ ] **Status colors** - Use semantic palette (green-600, yellow-600, red-600 for success/warning/error)

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="bg-gray-50 border-gray-200">

// ✅ CORRECT
<div className="bg-white border border-neutral-200">
```

---

## ✅ Geometry & Spacing

- [ ] **Zero rounded corners** - Cards, containers, modals have sharp edges
- [ ] **8px spacing scale** - All margins/padding are multiples of 8px
- [ ] **24px baseline** - Vertical rhythm uses baseline units
- [ ] **Consistent gaps** - Use `gap-4`, `gap-6`, `gap-8` (never `gap-5`, `gap-7`)
- [ ] **Module heights** - Stats cards use `h-module-2` (128px) or similar
- [ ] **Grid gutters** - Dashboard grids use `gap-6` or `gap-8`

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="rounded-lg p-5 gap-5">

// ✅ CORRECT
<div className="p-6 gap-6">
```

---

## ✅ Component Patterns

### Stats Cards
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Sharp edges** - No border radius
- [ ] **Geist Mono metrics** - Numbers use `font-[family-name:var(--font-geist-mono)]`
- [ ] **Consistent padding** - `p-6` standard
- [ ] **Subtle shadow** - `shadow-sm ring-1 ring-black/5`

```tsx
// ✅ CORRECT Stats Card
<div className="bg-white border border-neutral-200 p-6 shadow-sm ring-1 ring-black/5">
  <p className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-sm uppercase tracking-wide">
    Total Bookings
  </p>
  <p className="font-[family-name:var(--font-geist-mono)] mt-2 font-bold text-neutral-900 text-3xl">
    127
  </p>
</div>
```

### Booking Cards
- [ ] **Sharp rectangular cards** - No rounded corners
- [ ] **White backgrounds** - `bg-white border border-neutral-200`
- [ ] **Status badges** - Sharp rectangular badges with semantic colors
- [ ] **Geist Mono dates** - Use monospace font for timestamps
- [ ] **Orange CTA buttons** - Action buttons use `bg-orange-500`

```tsx
// ✅ CORRECT Booking Card
<div className="bg-white border border-neutral-200 p-6">
  <div className="flex items-center justify-between">
    <h3 className="font-[family-name:var(--font-geist-sans)] font-semibold text-lg text-neutral-900">
      House Cleaning
    </h3>
    <span className="bg-green-500 px-3 py-1 font-medium text-white text-xs uppercase">
      Confirmed
    </span>
  </div>
  <p className="font-[family-name:var(--font-geist-mono)] mt-2 text-neutral-600 text-sm">
    Jan 15, 2025 · 10:00 AM
  </p>
</div>
```

### Navigation Sidebar
- [ ] **Active state** - `bg-orange-500 text-white` for current page
- [ ] **Hover state** - `hover:bg-neutral-100` for inactive items
- [ ] **Sharp edges** - No rounded navigation items
- [ ] **Uppercase labels** - Navigation items use `uppercase tracking-wide`

### Data Tables
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Neutral dividers** - Row borders use `border-neutral-200`
- [ ] **Geist Mono data** - Numbers, dates, IDs use monospace font
- [ ] **Hover rows** - `hover:bg-neutral-50` for interactivity
- [ ] **No rounded table** - Table has sharp rectangular edges

---

## ✅ Accessibility

- [ ] **WCAG AAA contrast** - All text meets 7:1+ contrast ratio
- [ ] **Focus states** - All buttons, inputs, links have visible focus rings
- [ ] **Focus ring** - `focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500`
- [ ] **Keyboard navigation** - All dashboard actions accessible via keyboard
- [ ] **Screen reader labels** - All icons and interactive elements have ARIA labels
- [ ] **Semantic HTML** - Proper heading hierarchy (h1 → h2 → h3)
- [ ] **Loading states** - Skeletons or spinners for async content

**Quick Fix:**
```tsx
// ❌ WRONG
<button className="bg-orange-500">
  <TrashIcon />
</button>

// ✅ CORRECT
<button
  className="bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/25"
  aria-label="Delete booking"
>
  <TrashIcon aria-hidden="true" />
</button>
```

---

## ✅ Dashboard-Specific Components

### Booking Timeline
- [ ] **Sharp edge containers** - Timeline cards have no border radius
- [ ] **Orange accent line** - Timeline line uses `border-l-2 border-orange-500`
- [ ] **Geist Mono timestamps** - All dates/times use monospace font
- [ ] **Status dots** - Use semantic colors (green, yellow, red)

### Revenue Chart
- [ ] **White background** - Chart container uses `bg-white`
- [ ] **Neutral gridlines** - Chart grid uses `stroke-neutral-200`
- [ ] **Orange data line** - Primary chart line uses `stroke-orange-500`
- [ ] **Geist Mono axes** - Axis labels use monospace font

### Quick Actions Panel
- [ ] **Sharp action buttons** - No rounded corners on quick action cards
- [ ] **Orange hover states** - Buttons use `hover:bg-orange-50 hover:text-orange-600`
- [ ] **Consistent spacing** - Actions use `gap-4` or `gap-6`

---

## 🚫 Common Violations

**DO NOT:**
- ❌ Use `rounded-md`, `rounded-lg`, `rounded-xl` on cards or containers
- ❌ Use gray-* colors (use neutral-* palette instead)
- ❌ Mix Geist Sans and non-Geist fonts
- ❌ Use custom hex colors for status badges
- ❌ Skip focus states on interactive elements
- ❌ Use spacing values outside 8px scale

**DO:**
- ✅ Use sharp rectangular geometry everywhere
- ✅ Use Geist Mono for all metrics, dates, numbers
- ✅ Use semantic color tokens (green-600, yellow-600, red-600)
- ✅ Add visible focus rings to all buttons and inputs
- ✅ Follow 8px spacing scale strictly

---

## 📋 Page-Specific Checks

### Customer Dashboard (`src/app/[locale]/dashboard/customer/page.tsx`)
- [ ] Stats cards use Geist Mono for booking counts
- [ ] Upcoming bookings table has sharp edges
- [ ] CTA buttons use orange-500 primary color
- [ ] All spacing follows 8px scale

### Professional Dashboard (`src/app/[locale]/dashboard/pro/page.tsx`)
- [ ] Revenue chart uses Geist Mono for dollar amounts
- [ ] Booking pipeline cards have no border radius
- [ ] Earnings stats use monospace font
- [ ] Status badges use semantic colors (not custom hex)

### Booking Details (`src/app/[locale]/dashboard/bookings/[id]/page.tsx`)
- [ ] Booking metadata uses Geist Mono for dates/times
- [ ] Action buttons follow primary/secondary patterns
- [ ] Timeline has orange accent line
- [ ] All cards have sharp edges

---

## 🔍 Quick Audit Commands

```bash
# Find rounded corners in dashboard
grep -r "rounded-md\|rounded-lg\|rounded-xl" src/app/\[locale\]/dashboard/

# Find gray-* colors (should be neutral-*)
grep -r "bg-gray-\|text-gray-\|border-gray-" src/app/\[locale\]/dashboard/

# Find stats/metrics not using Geist Mono
grep -r "text-3xl\|text-2xl" src/app/\[locale\]/dashboard/ | grep -v "geist-mono"

# Find spacing outside 8px scale
grep -r "p-5\|p-7\|gap-5\|m-5" src/app/\[locale\]/dashboard/
```

---

## ✅ Sign-Off

Once all checks pass:

- [ ] Typography uses Geist Sans for UI, Geist Mono for data
- [ ] Colors use neutral/orange/semantic palette tokens only
- [ ] Geometry has zero rounded corners (sharp edges)
- [ ] Components follow stats card/booking card/table patterns
- [ ] Accessibility meets WCAG AAA standards
- [ ] Spacing follows 8px/24px scales
- [ ] No custom hex colors or non-Geist fonts

**Reviewer:** _________________
**Date:** _________________
**Page:** _________________
