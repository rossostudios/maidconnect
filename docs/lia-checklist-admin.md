# Lia Design System Compliance Checklist - Admin Pages

This checklist ensures admin dashboard pages follow the Lia Design System standards for Bloomberg Terminal-inspired professional interfaces.

## ✅ Typography

- [ ] **Geist Sans ONLY** - All UI text uses `font-[family-name:var(--font-geist-sans)]` or `geistSans.className`
- [ ] **Geist Mono for data** - IDs, timestamps, counts, metrics use `font-[family-name:var(--font-geist-mono)]` or `geistMono.className`
- [ ] **No custom fonts** - Zero references to Satoshi, Manrope, Inter, or other fonts
- [ ] **Uppercase page headers** - Admin page titles use `uppercase tracking-tight`
- [ ] **Tight tracking** - Headings use `tracking-tight`, labels use `tracking-wide`
- [ ] **Small text for metadata** - Use `text-xs` or `text-sm` for secondary info
- [ ] **Typography scale** - 36px (h1), 24px (h2), 16px (body), 14px (labels), 12px (meta)

**Quick Fix:**
```tsx
// ❌ WRONG
<h1 className="text-2xl font-bold">User Management</h1>

// ✅ CORRECT
import { geistSans } from "@/app/fonts";

<h1 className={cn(
  "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
  geistSans.className
)}>
  User Management
</h1>
```

---

## ✅ Color Palette

- [ ] **No custom hex colors** - All colors use Tailwind tokens
- [ ] **White data surfaces** - Tables, cards, modals use `bg-white`
- [ ] **Neutral page background** - `bg-neutral-50`
- [ ] **Text hierarchy** - Headings `neutral-900`, body `neutral-700`, muted `neutral-600`
- [ ] **Orange highlights** - Active states, primary actions use `orange-500`
- [ ] **Semantic status colors** - Success `green-600`, Warning `yellow-600`, Error `red-600`, Info `blue-600`
- [ ] **Neutral borders** - All dividers/borders use `border-neutral-200`
- [ ] **High contrast** - WCAG AAA (7:1+) for all text

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="bg-gray-100 border-gray-300">

// ✅ CORRECT
<div className="bg-white border border-neutral-200">
```

---

## ✅ Geometry & Spacing

- [ ] **Zero rounded corners** - Tables, cards, modals, buttons have sharp edges
- [ ] **8px spacing scale** - All margins/padding are multiples of 8px (never 5px, 7px, etc.)
- [ ] **24px baseline** - Vertical rhythm uses baseline units
- [ ] **Consistent gaps** - Use `gap-4`, `gap-6`, `gap-8` (never `gap-5`, `gap-7`)
- [ ] **Dense layouts** - Admin interfaces favor information density
- [ ] **Minimal shadows** - Use `shadow-sm` or `ring-1 ring-black/5` only

**Quick Fix:**
```tsx
// ❌ WRONG
<div className="rounded-lg p-5 gap-5 shadow-xl">

// ✅ CORRECT
<div className="p-6 gap-6 shadow-sm ring-1 ring-black/5">
```

---

## ✅ Component Patterns

### PrecisionDataTable
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Sharp edges** - No border radius on table or cells
- [ ] **Neutral dividers** - Row borders use `border-neutral-200`
- [ ] **Geist Mono data** - IDs, dates, numbers use monospace font
- [ ] **Hover rows** - `hover:bg-neutral-50` for interactivity
- [ ] **Sortable headers** - Headers have sort indicators
- [ ] **Dense rows** - Compact vertical spacing for data density

```tsx
// ✅ CORRECT Data Table Pattern
<div className="bg-white border border-neutral-200 shadow-sm">
  <table className="w-full">
    <thead className="border-b border-neutral-200 bg-neutral-50">
      <tr>
        <th className="px-4 py-3 text-left">
          <span className="font-[family-name:var(--font-geist-sans)] text-neutral-900 text-xs uppercase tracking-wide">
            User ID
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-neutral-200 hover:bg-neutral-50">
        <td className="px-4 py-3">
          <span className="font-[family-name:var(--font-geist-mono)] text-neutral-700 text-sm">
            USR-2025-001
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Admin Badges/Tags
- [ ] **Sharp rectangular badges** - No rounded corners
- [ ] **Semantic colors** - Use status color palette
- [ ] **Uppercase text** - Badge text uses `uppercase text-xs`
- [ ] **Consistent padding** - `px-3 py-1` standard
- [ ] **High contrast** - White text on colored backgrounds

```tsx
// ✅ CORRECT Badge Patterns
<span className="bg-green-600 px-3 py-1 font-medium text-white text-xs uppercase">
  Active
</span>

<span className="bg-yellow-600 px-3 py-1 font-medium text-white text-xs uppercase">
  Pending
</span>

<span className="bg-red-600 px-3 py-1 font-medium text-white text-xs uppercase">
  Suspended
</span>
```

### Admin Cards/Panels
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Sharp edges** - No border radius
- [ ] **Consistent padding** - `p-6` or `p-8`
- [ ] **Section dividers** - Use `border-b border-neutral-200`
- [ ] **Minimal shadows** - `shadow-sm ring-1 ring-black/5`

### Admin Buttons
- [ ] **Primary action** - `bg-orange-500 text-white hover:bg-orange-600`
- [ ] **Secondary action** - `bg-neutral-100 text-neutral-900 hover:bg-neutral-200`
- [ ] **Destructive action** - `bg-red-600 text-white hover:bg-red-700`
- [ ] **Ghost button** - `bg-transparent hover:bg-neutral-100`
- [ ] **Sharp edges** - No rounded corners
- [ ] **Consistent padding** - `px-4 py-2` or `px-6 py-3`

### Stat Cards
- [ ] **White background** - `bg-white border border-neutral-200`
- [ ] **Geist Mono metrics** - Large numbers use monospace font
- [ ] **Small uppercase labels** - `text-xs uppercase tracking-wide`
- [ ] **Sharp edges** - No border radius
- [ ] **Minimal styling** - Focus on data, not decoration

```tsx
// ✅ CORRECT Stat Card
<div className="bg-white border border-neutral-200 p-6 shadow-sm">
  <p className="font-[family-name:var(--font-geist-sans)] text-neutral-600 text-xs uppercase tracking-wide">
    Total Users
  </p>
  <p className="font-[family-name:var(--font-geist-mono)] mt-2 font-bold text-neutral-900 text-3xl">
    12,847
  </p>
  <p className="font-[family-name:var(--font-geist-sans)] mt-1 text-green-600 text-sm">
    ↑ 12.5% from last month
  </p>
</div>
```

---

## ✅ Accessibility

- [ ] **WCAG AAA contrast** - All text has 7:1+ contrast ratio
- [ ] **Focus states** - All interactive elements have visible focus rings
- [ ] **Focus ring** - `focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500`
- [ ] **Keyboard navigation** - All admin actions accessible via keyboard
- [ ] **Screen reader labels** - All icons and buttons have ARIA labels
- [ ] **Table headers** - Data tables have proper `<thead>` and `<th scope>` elements
- [ ] **Loading states** - Skeletons or spinners for async data
- [ ] **Error states** - Clear error messages with semantic colors

**Quick Fix:**
```tsx
// ❌ WRONG
<button>
  <TrashIcon />
</button>

// ✅ CORRECT
<button
  className="hover:bg-red-50 focus:ring-2 focus:ring-red-500/25"
  aria-label="Delete user"
  type="button"
>
  <TrashIcon aria-hidden="true" className="h-4 w-4 text-red-600" />
</button>
```

---

## ✅ Data Display

### Timestamps
- [ ] **Geist Mono font** - All timestamps use monospace
- [ ] **Consistent format** - Use `Jan 15, 2025 · 10:30 AM` format
- [ ] **Neutral color** - `text-neutral-600` or `text-neutral-700`
- [ ] **Small size** - `text-xs` or `text-sm`

### IDs/References
- [ ] **Geist Mono font** - All IDs use monospace
- [ ] **Uppercase prefix** - Use format like `USR-2025-001`, `BKG-2025-042`
- [ ] **Copy button** - Provide copy-to-clipboard for long IDs
- [ ] **Neutral color** - `text-neutral-700`

### Metrics/Numbers
- [ ] **Geist Mono font** - All numeric data uses monospace
- [ ] **Large display** - Important metrics use `text-2xl` or `text-3xl`
- [ ] **Formatted** - Use thousand separators (12,847 not 12847)
- [ ] **Semantic colors** - Positive numbers green, negative red

### Status Indicators
- [ ] **Sharp badges** - No rounded status badges
- [ ] **Semantic colors** - Use green/yellow/red/blue palette
- [ ] **Uppercase text** - Status text uses `uppercase`
- [ ] **Consistent sizing** - `text-xs px-3 py-1`

---

## 🚫 Common Violations

**DO NOT:**
- ❌ Use `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` on any admin component
- ❌ Use gray-* colors (use neutral-* palette instead)
- ❌ Mix multiple font families (Geist only)
- ❌ Use custom hex colors for status (use semantic tokens)
- ❌ Skip focus states on buttons/inputs
- ❌ Use decorative shadows (minimal shadow-sm only)
- ❌ Use spacing values outside 8px scale
- ❌ Use Inter, Arial, or other fonts (Geist Sans/Mono only)

**DO:**
- ✅ Use sharp rectangular geometry everywhere
- ✅ Use Geist Mono for all IDs, dates, numbers, metrics
- ✅ Use semantic color tokens (green-600, yellow-600, red-600, blue-600)
- ✅ Add visible focus rings to all interactive elements
- ✅ Follow 8px spacing scale strictly
- ✅ Prioritize information density over decoration
- ✅ Use uppercase for labels and metadata

---

## 📋 Page-Specific Checks

### User Management (`src/app/[locale]/admin/users/page.tsx`)
- [ ] User table has sharp edges and neutral borders
- [ ] User IDs use Geist Mono font
- [ ] Status badges use semantic colors (not custom hex)
- [ ] Action buttons follow primary/destructive patterns
- [ ] Search input has proper focus state

### Audit Logs (`src/app/[locale]/admin/audit-logs/page.tsx`)
- [ ] Timestamps use Geist Mono font
- [ ] Log table has hover states on rows
- [ ] Event types use sharp rectangular badges
- [ ] All spacing follows 8px scale
- [ ] Filter controls have focus states

### Analytics Dashboard (`src/app/[locale]/admin/page.tsx`)
- [ ] Stat cards use Geist Mono for numbers
- [ ] Charts have neutral gridlines
- [ ] Chart data uses orange-500 primary color
- [ ] All cards have sharp edges
- [ ] Metrics formatted with thousand separators

### Pricing Controls (`src/app/[locale]/admin/pricing/page.tsx`)
- [ ] Price inputs use Geist Mono font
- [ ] Price table has sharp rectangular cells
- [ ] Currency symbols properly aligned
- [ ] Save button uses orange-500 primary color

### Dispute Resolution (`src/app/[locale]/admin/disputes/page.tsx`)
- [ ] Dispute cards have no border radius
- [ ] Status badges use semantic colors
- [ ] Timestamps use Geist Mono
- [ ] Action buttons follow established patterns

---

## 🔍 Quick Audit Commands

```bash
# Find rounded corners in admin
grep -r "rounded-md\|rounded-lg\|rounded-xl\|rounded-full" src/app/\[locale\]/admin/

# Find gray-* colors (should be neutral-*)
grep -r "bg-gray-\|text-gray-\|border-gray-" src/app/\[locale\]/admin/

# Find metrics not using Geist Mono
grep -r "text-3xl\|text-2xl\|text-xl" src/app/\[locale\]/admin/ | grep -v "geist-mono"

# Find spacing outside 8px scale
grep -r "p-5\|p-7\|gap-5\|gap-7\|m-5\|m-7" src/app/\[locale\]/admin/

# Find custom hex colors
grep -r "#[0-9A-Fa-f]\{6\}" src/app/\[locale\]/admin/
```

---

## ✅ Biome Compliance

All admin components must pass Biome linting:

```bash
# Run Biome check
bun run check

# Auto-fix issues
bun run check:fix
```

**Common Biome issues to avoid:**
- ❌ `noExcessiveCognitiveComplexity` - Keep components under 100 LOC
- ❌ `useSortedAttributes` - Alphabetize JSX props
- ❌ Missing `htmlFor` on labels
- ❌ Missing `type="button"` on non-submit buttons
- ❌ Clickable divs without proper button elements

---

## ✅ Sign-Off

Once all checks pass:

- [ ] Typography uses Geist Sans for UI, Geist Mono for all data
- [ ] Colors use neutral/orange/semantic palette tokens only
- [ ] Geometry has zero rounded corners (sharp edges everywhere)
- [ ] Components follow PrecisionDataTable/badge/card patterns
- [ ] Accessibility meets WCAG AAA standards (7:1+ contrast)
- [ ] Spacing follows 8px/24px scales strictly
- [ ] No custom hex colors, no non-Geist fonts
- [ ] Biome linting passes with zero errors
- [ ] All interactive elements have visible focus states
- [ ] Information density prioritized over decoration

**Reviewer:** _________________
**Date:** _________________
**Page:** _________________
