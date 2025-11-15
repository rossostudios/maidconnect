# Lia Design System

**Version:** 1.0.0
**Last Updated:** 2025-01-15

## Overview

The **Lia Design System** is Casaora's component library combining Bloomberg Terminal aesthetics with structured design principles. It emphasizes data precision, sharp geometric forms, and ultra-high contrast for professional applications.

## Design Philosophy

### Core Principles

1. **Zero Rounded Corners** - Sharp rectangular geometry across all components
2. **Bloomberg Terminal Aesthetic** - Data-focused, high-contrast, professional
3. **Structured Design** - Mathematical precision, grid-based layouts, minimalism
4. **Orange Accent (#FF5200)** - Vibrant primary color for CTAs and interactive elements
5. **Neutral Palette** - Warm cream/beige tones (neutral-50 to neutral-900)
6. **WCAG AAA Compliance** - Ultra-high contrast for accessibility

### Visual Language

- **Geometry:** Sharp rectangular forms, no curves
- **Shadows:** Minimal elevation, subtle shadows
- **Spacing:** Consistent 8px-based scale
- **Typography:** Satoshi (headings), Manrope (body), Geist Mono (data)
- **Contrast:** High contrast for readability and data clarity

---

## Canonical Primitives

### Typography

**Font Families:**
- **Satoshi** - Display font for headings (`--font-family-satoshi`)
- **Manrope** - Body font for paragraphs and UI (`--font-family-manrope`)
- **Geist Mono** - Monospace for data and code (`--font-mono`)

**Scale (Baseline-Aligned):**
```tsx
h1 { font-size: 48px; line-height: 48px; } // 2× baseline
h2 { font-size: 36px; line-height: 48px; } // 1.5× baseline
h3 { font-size: 24px; line-height: 24px; } // 1× baseline
p  { font-size: 16px; line-height: 24px; } // Body text
```

**Usage:**
```tsx
<h1 className="text-[48px] leading-[48px] font-bold mb-baseline-2">
  Heading
</h1>
```

---

### Color System

**Neutral Palette (Warm Cream/Beige):**
```tsx
neutral-50:  #FFFDFC  // Background
neutral-100: #FAF8F6  // Subtle backgrounds
neutral-200: #EBEAE9  // Borders
neutral-600: #8C8985  // Muted text
neutral-700: #64615D  // Body text
neutral-900: #181818  // Headings
```

**Orange Palette (Energy & Action):**
```tsx
orange-50:  #FFF7F0  // Lightest backgrounds
orange-400: #FF8746  // Lighter accents
orange-500: #FF5200  // Primary CTA
orange-600: #E64A00  // Links (WCAG AA)
orange-700: #C84000  // Pressed state
```

**Usage Guidelines:**
1. **Primary Actions:** `orange-500` for main CTAs
2. **Secondary Actions:** `neutral-100` backgrounds with `neutral-900` text
3. **Links:** Always use `orange-600` for better contrast
4. **Backgrounds:** `neutral-50` for pages, `white` for cards
5. **Text:** `neutral-900` (headings), `neutral-700` (body), `neutral-600` (muted)
6. **Borders:** `neutral-200` for subtle dividers

---

### Spacing Scale

**Base Unit:** 8px

```tsx
0.5 → 4px   // Tight spacing
1   → 8px   // Standard
2   → 16px  // Medium
3   → 24px  // Large
4   → 32px  // XL
6   → 48px  // XXL
8   → 64px  // Module size
```

**Baseline Grid:** 24px (3 × 8px)
**Module Grid:** 64px (8 × 8px)

---

## Component Library

### 1. Button

**Location:** `src/components/ui/button.tsx`

**Status:** ✅ Lia Compliant

**Variants:**
- `default` - Orange primary CTA (`bg-orange-500`, `hover:bg-orange-600`)
- `destructive` - Destructive actions (`bg-orange-700`, `hover:bg-orange-800`)
- `outline` - Outlined with orange accent on hover
- `secondary` - Neutral secondary button (`bg-neutral-200`)
- `ghost` - Transparent with orange hover (`hover:bg-orange-50`)
- `link` - Text link with neutral color

**Sizes:**
- `sm` - `h-9 px-6 text-sm`
- `default` - `h-10 px-8 py-2`
- `lg` - `h-11 px-10 text-base`
- `icon` - `h-10 w-10`

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Orange accent for primary actions
- ✅ Active state with `scale-[0.98]` feedback
- ✅ Focus ring with `ring-2 ring-ring`

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Book Now
</Button>

<Button variant="outline" size="sm">
  Cancel
</Button>
```

---

### 2. Input

**Location:** `src/components/ui/input.tsx`

**Status:** ✅ Lia Compliant

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Height: `h-10`
- ✅ Border: `border border-input`
- ✅ Focus ring: `ring-2 ring-ring`
- ✅ Responsive text: `text-base md:text-sm`

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="Enter your email"
  className="w-full"
/>
```

---

### 3. Textarea

**Location:** `src/components/ui/textarea.tsx`

**Status:** ✅ Lia Compliant

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Min height: `min-h-[80px]`
- ✅ Border: `border border-input`
- ✅ Focus ring: `ring-2 ring-ring`

**Usage:**
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Enter your message"
  rows={5}
/>
```

---

### 4. Card

**Location:** `src/components/ui/card.tsx`

**Status:** ✅ Lia Compliant

**Variants:**
- `default` - White with subtle shadow
- `elevated` - White with medium shadow
- `outlined` - White with ring only
- `glass` - Translucent with backdrop blur

**Subcomponents:**
- `CardHeader` - Header section (`p-6 pb-4`)
- `CardContent` - Main content (`p-6 pt-0`)
- `CardFooter` - Footer section (`p-6 pt-4`)
- `CardImage` - Image section with aspect ratio

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Minimal shadows for subtle elevation
- ✅ Can be `hoverable`, `asButton`, or `href` (link)
- ✅ Focus outline with `outline-neutral-900`

**Usage:**
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card variant="elevated" hoverable>
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### 5. Dialog

**Location:** `src/components/ui/dialog.tsx`

**Status:** ✅ Lia Compliant

**Subcomponents:**
- `Dialog` - Root component (Radix UI)
- `DialogTrigger` - Trigger button
- `DialogContent` - Modal content container
- `DialogHeader` - Header section
- `DialogFooter` - Footer section
- `DialogTitle` - Title text
- `DialogDescription` - Description text

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Overlay: `bg-neutral-900/80` backdrop
- ✅ Content: `border-neutral-200 bg-neutral-50`
- ✅ Close button with orange focus ring (`ring-orange-500/50`)
- ✅ Smooth animations with Radix UI

**Usage:**
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 6. Tabs

**Location:** `src/components/ui/tabs.tsx`

**Status:** ✅ Lia Compliant

**Subcomponents:**
- `Tabs` - Root component (Radix UI)
- `TabsList` - Tab navigation container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Tab panel content

**Lia Features:**
- ✅ Zero rounded corners
- ✅ TabsList: `bg-neutral-50` with `h-12`
- ✅ Active tab: `bg-neutral-50 text-neutral-900 shadow-sm`
- ✅ Inactive tab: `text-neutral-400 hover:text-neutral-900`
- ✅ Focus ring: `ring-2 ring-neutral-500`

**Usage:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <p>Overview content</p>
  </TabsContent>
  <TabsContent value="analytics">
    <p>Analytics content</p>
  </TabsContent>
</Tabs>
```

---

### 7. Accordion

**Location:** `src/components/ui/accordion.tsx`

**Status:** ✅ Lia Compliant

**Variants:**
- `default` - Border with shadow
- `bordered` - Thick border
- `minimal` - Bottom border only

**Subcomponents:**
- `Accordion` - Root container
- `AccordionItem` - Individual accordion item
- `AccordionTrigger` - Clickable header
- `AccordionContent` - Expandable content

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Arrow icon rotates 180° when open
- ✅ Smooth grid animation for expand/collapse
- ✅ Variant-specific padding and borders

**Usage:**
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion variant="default">
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Content for section 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Content for section 2
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### 8. Select

**Location:** `src/components/ui/select.tsx`

**Status:** ✅ Lia Compliant

**Subcomponents:**
- `Select` - Root component (Radix UI)
- `SelectTrigger` - Dropdown trigger button
- `SelectContent` - Dropdown content container
- `SelectItem` - Individual option
- `SelectLabel` - Option group label
- `SelectSeparator` - Visual separator

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Trigger: `border-neutral-200 bg-neutral-50 h-10`
- ✅ Content: `border-neutral-200 bg-neutral-50`
- ✅ Selected item: Orange checkmark icon
- ✅ Hover state: `bg-neutral-50 text-neutral-900`

**Usage:**
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select defaultValue="option1">
  <SelectTrigger className="w-64">
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

### 9. Checkbox

**Location:** `src/components/ui/checkbox.tsx`

**Status:** ✅ Lia Compliant

**Lia Features:**
- ✅ Zero rounded corners (perfectly square)
- ✅ Size: `h-4 w-4`
- ✅ Checked state: `bg-primary text-primary-foreground`
- ✅ Focus ring: `ring-2 ring-ring ring-offset-2`

**Usage:**
```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">
    I accept the terms and conditions
  </Label>
</div>
```

---

### 10. Badge

**Location:** `src/components/ui/badge.tsx`

**Status:** ✅ Lia Compliant

**Variants:**
- `default` - White with neutral border
- `secondary` - Neutral gray
- `success` - Green for positive states
- `warning` - Yellow for cautionary states
- `danger` - Red for errors
- `info` - Blue for informational states
- `outline` - Transparent with border
- Status variants: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`

**Sizes:**
- `sm` - `px-2 py-0.5 text-xs`
- `md` - `px-2.5 py-1 text-xs` (default)
- `lg` - `px-3 py-1.5 text-sm`

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Supports icons and dot indicators
- ✅ Focus ring: `ring-2 ring-neutral-400`

**Usage:**
```tsx
import { Badge } from '@/components/ui/badge';
import { Tick02Icon } from '@hugeicons/core-free-icons';

<Badge variant="success" size="md" icon={Tick02Icon}>
  Active
</Badge>

<Badge variant="warning" dot>
  Pending
</Badge>
```

---

### 11. Avatar

**Location:** `src/components/ui/avatar.tsx`

**Status:** ✅ Lia Compliant

**Subcomponents:**
- `Avatar` - Root container
- `AvatarImage` - Image element
- `AvatarFallback` - Fallback content (initials, icon)

**Lia Features:**
- ✅ Zero rounded corners (square avatars)
- ✅ Size: `h-10 w-10` (default)
- ✅ Aspect ratio: `aspect-square`
- ✅ Fallback: `bg-muted`

**Usage:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar className="h-12 w-12">
  <AvatarImage src="/avatars/user.jpg" alt="User Name" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

---

### 12. Label

**Location:** `src/components/ui/label.tsx`

**Status:** ✅ Lia Compliant

**Lia Features:**
- ✅ Font: `font-medium text-sm`
- ✅ Leading: `leading-none`
- ✅ Disabled state support: `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`

**Usage:**
```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

### 13. Skeleton

**Location:** `src/components/ui/skeleton.tsx`

**Status:** ✅ Lia Compliant

**Variants:**
- `Skeleton` - Base skeleton component
- `DashboardSectionSkeleton` - Dashboard section loader
- `CardSkeleton` - Card loader
- `ListSkeleton` - List loader
- `ConversationSkeleton` - Messaging UI loader
- `TableSkeleton` - Data table loader
- `ProfileCardSkeleton` - Profile card loader
- `StatCardSkeleton` - Stat card loader
- `FormSkeleton` - Form loader
- `CalendarSkeleton` - Calendar loader
- `ChartSkeleton` - Chart/graph loader

**Lia Features:**
- ✅ Zero rounded corners across all variants
- ✅ Square avatars instead of circular
- ✅ Neutral colors: `bg-neutral-200/50`, `bg-neutral-50`
- ✅ Pulse animation: `animate-pulse`

**Usage:**
```tsx
import { Skeleton, TableSkeleton, CardSkeleton } from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton className="h-8 w-64" />

// Table skeleton
<TableSkeleton rows={5} columns={4} />

// Card skeleton
<CardSkeleton />
```

---

### 14. Container

**Location:** `src/components/ui/container.tsx`

**Status:** ✅ Lia Compliant

**Lia Features:**
- ✅ Max width: `max-w-[1320px]`
- ✅ Responsive padding:
  - Mobile: `px-5`
  - Small: `sm:px-8`
  - Large: `lg:px-12`
  - XL: `xl:px-16`
- ✅ Centered: `mx-auto`

**Usage:**
```tsx
import { Container } from '@/components/ui/container';

<Container>
  <h1>Page Content</h1>
  <p>Constrained to max width with responsive padding</p>
</Container>
```

---

### 15. LiaDataTable

**Location:** `src/components/admin/data-table/lia-data-table.tsx`

**Status:** ✅ Lia Compliant (Flagship Component)

**Features:**
- Built on TanStack Table v8
- URL state persistence (filters, sorting, pagination)
- Column visibility toggles
- Bulk row selection
- Export to CSV/JSON
- Keyboard navigation
- Loading skeletons
- Empty states
- Responsive design

**Design:**
- Bloomberg Terminal aesthetic
- Ultra-high contrast (WCAG AAA)
- Geist Sans + Geist Mono typography
- Sharp geometric shapes
- Orange (#FF5200) accents

**Lia Features:**
- ✅ Zero rounded corners
- ✅ Orange selection highlight (`bg-orange-50`)
- ✅ Hover state: `hover:bg-orange-50/30`
- ✅ Striped rows: `bg-white` / `bg-neutral-50/50`
- ✅ Toolbar with filters and export
- ✅ Pagination controls

**Usage:**
```tsx
import { LiaDataTable } from '@/components/admin/data-table/lia-data-table';
import { type ColumnDef } from '@tanstack/react-table';

type User = {
  id: string;
  name: string;
  email: string;
};

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

<LiaDataTable
  columns={columns}
  data={users}
  pageSize={10}
  enableUrlSync
  enableExport
  enableRowSelection
  exportFilename="users"
/>
```

---

### 16. SkipLink

**Location:** `src/components/ui/skip-link.tsx`

**Status:** ✅ Lia Compliant

**Purpose:** WCAG 2.2 AA compliance for keyboard navigation

**Subcomponents:**
- `SkipLink` - Individual skip link
- `SkipLinks` - Container for multiple skip links

**Lia Features:**
- ✅ Accessible keyboard navigation
- ✅ Smooth scrolling
- ✅ Focus outline with `outline: 2px solid neutral-500`
- ✅ Screen reader support
- ✅ Internationalized text

**Usage:**
```tsx
import { SkipLink, SkipLinks } from '@/components/ui/skip-link';

// Single skip link
<SkipLink />

// Multiple skip links
<SkipLinks>
  <SkipLink href="main-content">Skip to main content</SkipLink>
  <SkipLink href="footer">Skip to footer</SkipLink>
</SkipLinks>
```

---

## Component Composition Patterns

### Form Pattern

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <h2 className="text-xl font-semibold">Contact Form</h2>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Your message here..." />
      </div>
    </form>
  </CardContent>
  <CardFooter>
    <Button variant="default">Send Message</Button>
    <Button variant="outline">Cancel</Button>
  </CardFooter>
</Card>
```

### Data Display Pattern

```tsx
import { LiaDataTable } from '@/components/admin/data-table/lia-data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const columns = [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback>{row.original.initials}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status}>
        {row.original.statusLabel}
      </Badge>
    ),
  },
];

<LiaDataTable
  columns={columns}
  data={users}
  enableExport
  enableRowSelection
/>
```

### Navigation Pattern

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';

<Container>
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="overview">
      <Card>
        <CardContent>Overview content</CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="analytics">
      <Card>
        <CardContent>Analytics content</CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</Container>
```

---

## Design Tokens Reference

### Colors

```css
/* Neutral Palette */
--neutral-50: #FFFDFC;
--neutral-100: #FAF8F6;
--neutral-200: #EBEAE9;
--neutral-600: #8C8985;
--neutral-700: #64615D;
--neutral-900: #181818;

/* Orange Palette */
--orange-50: #FFF7F0;
--orange-400: #FF8746;
--orange-500: #FF5200;
--orange-600: #E64A00;
--orange-700: #C84000;
```

### Typography

```css
/* Font Families */
--font-family-satoshi: var(--font-satoshi), Inter, system-ui, sans-serif;
--font-family-manrope: var(--font-manrope), Inter, system-ui, sans-serif;
--font-mono: Geist Mono, monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing

```css
/* Baseline Grid */
--baseline: 24px;
--module: 64px;

/* Spacing Scale */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-6: 48px;
--space-8: 64px;
```

### Shadows

```css
/* Elevation */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 20px 60px -15px rgba(22, 22, 22, 0.15);
```

---

## Accessibility

All Lia components follow **WCAG 2.2 AA** (aiming for AAA) standards:

1. **Keyboard Navigation** - All interactive elements are keyboard accessible
2. **Focus Indicators** - Visible focus rings on all focusable elements
3. **Color Contrast** - Minimum 4.5:1 for text, 7:1+ for critical UI
4. **Screen Reader Support** - ARIA labels and semantic HTML
5. **Skip Links** - Bypass repetitive content (SkipLink component)

---

## Migration Guide

### From Rounded to Lia

**Before (Rounded Corners):**
```tsx
<button className="rounded-full bg-orange-500 px-8 py-3">
  Button
</button>
```

**After (Lia):**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="default">
  Button
</Button>
```

### From Generic to Lia Components

**Before (Generic Card):**
```tsx
<div className="rounded-lg border p-6 shadow-md">
  <h3 className="font-bold">Title</h3>
  <p>Content</p>
</div>
```

**After (Lia Card):**
```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';

<Card variant="elevated">
  <CardHeader>
    <h3 className="font-bold">Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

---

## Contributing

When creating new components for the Lia Design System:

1. **No Rounded Corners** - Remove all `rounded-*` classes
2. **Use Design Tokens** - Reference colors from the palette
3. **Follow Spacing Scale** - Use 8px-based spacing
4. **Ensure Accessibility** - Add ARIA labels, keyboard support
5. **Document Variants** - Use CVA for variant management
6. **Export Types** - Export TypeScript types and props

---

## Resources

- [Bloomberg Terminal Design](https://www.bloomberg.com/professional/)
- [Structured Grid Systems](https://www.grid-systems.com/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [TanStack Table](https://tanstack.com/table/latest)

---

**Maintained by:** Casaora Design Team
**Contact:** design@casaora.com
**License:** Internal Use Only
