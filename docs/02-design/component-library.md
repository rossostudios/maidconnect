# Component Library Documentation

**Complete reference for all UI components in the MaidConnect design system.**

## Overview

This document provides detailed API documentation for all UI components in the MaidConnect design system. Components are built with React 19, TypeScript 5, and follow accessibility best practices (WCAG 2.1 AA/AAA).

**Key Technologies:**
- **Radix UI** - Accessible, unstyled UI primitives
- **Tailwind CSS 4.1** - Utility-first styling
- **Motion One** - Lightweight animations
- **Hugeicons React** - Icon library
- **Class Variance Authority (CVA)** - Type-safe variants

**Related Documentation:**
- [Design System](./design-system.md) - Design tokens and patterns
- [Motion Guidelines](./motion-guidelines.md) - Animation patterns
- [Brand Guidelines](./branding-guidelines-2025.md) - Visual identity

---

## Table of Contents

### Core Components
- [Button](#button)
- [Card](#card)
- [Badge](#badge)
- [Skeleton](#skeleton)

### Form Components
- [Select](#select)
- [Date Picker](#date-picker)
- [Time Picker](#time-picker)

### Layout Components
- [Container](#container)
- [Accordion](#accordion)
- [Tabs](#tabs)

### Display Components
- [Animated Counter](#animated-counter)
- [Animated Marquee](#animated-marquee)
- [Chart](#chart)

### Specialized Components
- [Hero Search Bar](#hero-search-bar)
- [Checkmark List](#checkmark-list)
- [Comparison Table](#comparison-table)
- [Feature Section](#feature-section)
- [Two Column Feature](#two-column-feature)
- [Wavy Divider](#wavy-divider)

### Utility Components
- [Skip Link](#skip-link)
- [Kbd](#kbd)
- [Theme Toggle](#theme-toggle)

---

## Core Components

### Button

**Location:** [src/components/ui/button.tsx](../../src/components/ui/button.tsx)

Link-based button component with multiple variants and sizes. All buttons are keyboard accessible and include proper focus states.

**Type Definition:**
```typescript
type ButtonVariant = "primary" | "secondary" | "ghost" | "card" | "luxury";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  href: string;                  // Required: Link destination
  label: string;                 // Required: Button text
  variant?: ButtonVariant;       // Default: "primary"
  size?: ButtonSize;             // Default: "md"
  icon?: boolean;                // Show arrow icon (default: false)
  kbd?: string;                  // Keyboard shortcut hint
  className?: string;            // Additional classes
};
```

**Variants:**

| Variant | Use Case | Visual Style |
|---------|----------|--------------|
| `primary` | Primary actions, CTAs | Solid red background (#E85D48), white text |
| `secondary` | Secondary actions | Red border, red text, fills on hover |
| `ghost` | Tertiary actions, navigation | No border, text only, subtle hover |
| `card` | Full-width card buttons | Solid red, full width, justified |
| `luxury` | Premium actions | White background, red border and text |

**Sizes:**

| Size | Padding | Font Size | Use Case |
|------|---------|-----------|----------|
| `sm` | `px-6 py-3` | `text-sm` | Compact spaces, inline actions |
| `md` | `px-8 py-3.5` | `text-sm` | Default size, most use cases |
| `lg` | `px-10 py-4.5` | `text-base` | Hero sections, prominent CTAs |

**Usage Examples:**

```tsx
import { Button } from "@/components/ui/button";

// Primary CTA button
<Button
  href="/professionals"
  label="Find professionals"
  variant="primary"
  size="lg"
  icon
/>

// Secondary action with keyboard shortcut
<Button
  href="/dashboard"
  label="Dashboard"
  variant="secondary"
  kbd="⌘D"
/>

// Ghost button for navigation
<Button
  href="/about"
  label="Learn more"
  variant="ghost"
/>

// Full-width card button
<Button
  href="/booking/123"
  label="View booking details"
  variant="card"
  icon
/>
```

**Accessibility:**
- ✅ Renders as semantic `<a>` tag (proper navigation)
- ✅ Focus indicator with 2px outline (#E85D48)
- ✅ Keyboard navigable (Tab, Enter)
- ✅ Icon marked as `aria-hidden="true"`
- ✅ Active state with scale transform for tactile feedback

**Styling Customization:**
```tsx
<Button
  href="/custom"
  label="Custom"
  className="bg-blue-600 hover:bg-blue-700"
/>
```

---

### Card

**Location:** [src/components/ui/card.tsx](../../src/components/ui/card.tsx)

Flexible container component with optional animations, multiple variants, and composition pattern using sub-components.

**Type Definition:**
```typescript
export type CardVariant = "default" | "elevated" | "outlined" | "glass";

type BaseCardProps = {
  variant?: CardVariant;         // Default: "default"
  hoverable?: boolean;           // Enable hover lift effect (default: false)
  asButton?: boolean;            // Render as button (default: false)
  href?: string;                 // Render as link
  disableMotion?: boolean;       // Disable animations (default: false)
};

interface CardProps extends BaseCardProps, ComponentPropsWithoutRef<"div"> {}
```

**Variants:**

| Variant | Visual Style | Use Case |
|---------|--------------|----------|
| `default` | White background, subtle border, medium shadow | Standard cards, content containers |
| `elevated` | White background, larger shadow | Featured content, important sections |
| `outlined` | Stone background, thick border, no shadow | Alternative card style, outlined containers |
| `glass` | Semi-transparent white, blur effect | Overlays, modern aesthetic |

**Sub-Components:**

```typescript
CardHeader      // Header section (p-6 pb-4)
CardContent     // Main content (p-6 pt-0)
CardFooter      // Footer with top border (p-6 pt-4)
CardImage       // Image section with aspect ratio
```

**Usage Examples:**

```tsx
import { Card, CardHeader, CardContent, CardFooter, CardImage } from "@/components/ui/card";

// Basic card
<Card variant="default">
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>

// Hoverable card with animation
<Card variant="elevated" hoverable>
  <CardHeader>
    <h3>Professional Profile</h3>
  </CardHeader>
  <CardContent>
    Profile details...
  </CardContent>
</Card>

// Clickable card (as link)
<Card href="/booking/123" hoverable>
  <CardImage aspectRatio="16/9">
    <img src="/image.jpg" alt="Service" />
  </CardImage>
  <CardContent>
    <h4>Booking Details</h4>
  </CardContent>
  <CardFooter>
    <p className="text-sm text-gray-600">View full details →</p>
  </CardFooter>
</Card>

// Card as button
<Card asButton hoverable onClick={handleClick}>
  <CardContent>Click me!</CardContent>
</Card>

// Glass variant for overlays
<Card variant="glass">
  <CardContent>
    Overlay content with blur effect
  </CardContent>
</Card>

// Disable motion (accessibility)
<Card hoverable disableMotion>
  <CardContent>No animations</CardContent>
</Card>
```

**Motion Behavior:**
- Hover lift effect when `hoverable={true}`
- Smooth transitions (respects `prefers-reduced-motion`)
- Uses Motion One for performant animations
- Performance optimization with `willChange: "transform"`

**Accessibility:**
- ✅ Semantic HTML (renders as `<a>`, `<button>`, or `<div>`)
- ✅ Focus indicator with 2px outline (#E85D48)
- ✅ Keyboard navigable when clickable
- ✅ Motion respects user preferences
- ✅ Proper heading hierarchy in CardHeader

**Styling Customization:**
```tsx
<Card className="bg-gradient-to-br from-red-50 to-white">
  <CardContent className="space-y-4">
    Custom styling
  </CardContent>
</Card>
```

---

### Badge

**Location:** [src/components/ui/badge.tsx](../../src/components/ui/badge.tsx)

Small label component for statuses, categories, and counts. Built with Class Variance Authority for type-safe variants.

**Type Definition:**
```typescript
export interface BadgeProps extends
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}
```

**Variants:**

| Variant | Visual Style | Use Case |
|---------|--------------|----------|
| `default` | White background, cream border | Neutral badges, default state |
| `primary` | Red background (#E85D48), white text | Important tags, primary status |
| `secondary` | Green background, white text | Success state, verified |
| `success` | Light green background, green text | Success messages, completed |
| `warning` | Light yellow background, yellow text | Warnings, pending states |
| `danger` | Light red background, red text | Errors, critical states |
| `info` | Light blue background, blue text | Information, help text |
| `outline` | Transparent with cream border | Subtle badges, categories |

**Usage Examples:**

```tsx
import { Badge } from "@/components/ui/badge";

// Status badges
<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Suspended</Badge>

// Category tags
<Badge variant="outline">Cleaning</Badge>
<Badge variant="outline">Plumbing</Badge>

// Count badges
<Badge variant="primary">5 new</Badge>

// Custom styling
<Badge variant="default" className="font-bold">
  Custom
</Badge>
```

**Dark Mode Support:**
```tsx
// Badges automatically adapt to dark mode
<Badge variant="success">
  Visible in light and dark modes
</Badge>
```

**Accessibility:**
- ✅ Semantic HTML (`<div>`)
- ✅ Focus ring for interactive badges
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Font semibold for readability

**Composition:**
```tsx
// Badge with icon
<Badge variant="primary">
  <CheckIcon className="mr-1 h-3 w-3" />
  Verified
</Badge>

// Badge with close button
<Badge variant="outline">
  Category
  <button className="ml-2">×</button>
</Badge>
```

---

### Skeleton

**Location:** [src/components/ui/skeleton.tsx](../../src/components/ui/skeleton.tsx)

Loading state components with pre-built patterns for common UI elements. Uses pulse animation for visual feedback.

**Base Component:**

```typescript
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>)
```

**Pre-Built Patterns:**

| Pattern | Use Case | Props |
|---------|----------|-------|
| `DashboardSectionSkeleton` | Dashboard section loading | None |
| `CardSkeleton` | Card loading state | None |
| `ListSkeleton` | List of cards | `count?: number` (default: 3) |
| `ConversationSkeleton` | Chat interface loading | None |
| `TableSkeleton` | Table loading state | `rows?: number`, `columns?: number` |
| `ProfileCardSkeleton` | User profile loading | None |
| `StatCardSkeleton` | Dashboard stat cards | None |
| `FormSkeleton` | Form loading state | `fields?: number` (default: 4) |
| `CalendarSkeleton` | Calendar loading | None |
| `ChartSkeleton` | Analytics charts | None |

**Usage Examples:**

```tsx
import {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  FormSkeleton,
  ProfileCardSkeleton,
  StatCardSkeleton,
  ConversationSkeleton,
  CalendarSkeleton,
  ChartSkeleton,
  DashboardSectionSkeleton,
} from "@/components/ui/skeleton";

// Basic skeleton
<Skeleton className="h-8 w-48" />

// Card loading
<CardSkeleton />

// List of 5 cards
<ListSkeleton count={5} />

// Table with custom dimensions
<TableSkeleton rows={10} columns={6} />

// Form with 6 fields
<FormSkeleton fields={6} />

// Profile card
<ProfileCardSkeleton />

// Dashboard stats (use multiple)
<div className="grid grid-cols-3 gap-4">
  <StatCardSkeleton />
  <StatCardSkeleton />
  <StatCardSkeleton />
</div>

// Chat interface
<ConversationSkeleton />

// Calendar
<CalendarSkeleton />

// Analytics chart
<ChartSkeleton />

// Dashboard section
<DashboardSectionSkeleton />
```

**Custom Skeleton Patterns:**

```tsx
// Professional card skeleton
function ProfessionalCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-6">
      <Skeleton className="mb-4 h-32 w-full rounded-lg" />
      <Skeleton className="mb-2 h-6 w-2/3" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
}
```

**Conditional Loading:**

```tsx
function ProfessionalList({ professionals, isLoading }) {
  if (isLoading) {
    return <ListSkeleton count={6} />;
  }

  return (
    <div className="grid gap-4">
      {professionals.map(pro => (
        <ProfessionalCard key={pro.id} professional={pro} />
      ))}
    </div>
  );
}
```

**Accessibility:**
- ✅ Pulse animation respects `prefers-reduced-motion`
- ✅ Aria labels can be added for screen readers
- ✅ Visual feedback of loading state
- ✅ Maintains layout to prevent content shift

**Styling:**
- Base color: `bg-[#ebe5d8]/50` (cream with opacity)
- Animation: `animate-pulse` (Tailwind CSS)
- Border radius: Matches component being loaded
- Fully customizable with `className` prop

---

## Form Components

### Select

**Location:** [src/components/ui/select.tsx](../../src/components/ui/select.tsx)

Accessible dropdown component built on Radix UI primitives. Supports keyboard navigation, grouped options, and custom styling.

**Components:**

```typescript
Select              // Root container
SelectTrigger       // Trigger button
SelectContent      // Dropdown content portal
SelectValue        // Displays selected value
SelectItem         // Individual option
SelectGroup        // Option group container
SelectLabel        // Group label
SelectSeparator    // Visual separator
SelectScrollUpButton    // Scroll indicator
SelectScrollDownButton  // Scroll indicator
```

**Usage Examples:**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

// Basic select
<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// Grouped options
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select service" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Cleaning Services</SelectLabel>
      <SelectItem value="house">House Cleaning</SelectItem>
      <SelectItem value="deep">Deep Cleaning</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Maintenance</SelectLabel>
      <SelectItem value="plumbing">Plumbing</SelectItem>
      <SelectItem value="electric">Electrical</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// Controlled select
function ServiceFilter() {
  const [service, setService] = useState("");

  return (
    <Select value={service} onValueChange={setService}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by service" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Services</SelectItem>
        <SelectItem value="cleaning">Cleaning</SelectItem>
        <SelectItem value="maintenance">Maintenance</SelectItem>
      </SelectContent>
    </Select>
  );
}

// Disabled option
<SelectContent>
  <SelectItem value="option1">Available</SelectItem>
  <SelectItem value="option2" disabled>
    Coming Soon
  </SelectItem>
</SelectContent>
```

**Keyboard Navigation:**
- `Space` / `Enter` - Open dropdown
- `Arrow Up` / `Arrow Down` - Navigate options
- `Home` / `End` - First/last option
- `Escape` - Close dropdown
- `Type to search` - Filter options

**Accessibility:**
- ✅ Built on Radix UI (WAI-ARIA compliant)
- ✅ Keyboard navigable
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ Disabled state support
- ✅ Grouped options with labels
- ✅ Custom scroll indicators

**Styling:**
- Trigger: Rounded border, red focus ring (#E85D48)
- Content: Portal rendering, smooth animations
- Selected item: Red checkmark indicator
- Hover state: Subtle background change
- Fully customizable with `className`

---

### Date Picker

**Location:** [src/components/ui/date-picker.tsx](../../src/components/ui/date-picker.tsx)

Date selection component for booking and scheduling. (Full API documentation available in component file.)

**Basic Usage:**
```tsx
import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
/>
```

**Features:**
- ✅ Disable past dates
- ✅ Custom date ranges
- ✅ Multiple locales (en, es)
- ✅ Keyboard navigation
- ✅ Mobile-friendly

---

### Time Picker

**Location:** [src/components/ui/time-picker.tsx](../../src/components/ui/time-picker.tsx)

Time selection component for booking appointments. (Full API documentation available in component file.)

**Basic Usage:**
```tsx
import { TimePicker } from "@/components/ui/time-picker";

<TimePicker
  value={time}
  onChange={setTime}
  format="12h"
/>
```

**Features:**
- ✅ 12/24 hour formats
- ✅ Custom time intervals
- ✅ Disable specific times
- ✅ Keyboard input

---

## Layout Components

### Container

**Location:** [src/components/ui/container.tsx](../../src/components/ui/container.tsx)

Max-width container with responsive padding for consistent page layouts.

**Usage:**
```tsx
import { Container } from "@/components/ui/container";

<Container>
  <h1>Page Content</h1>
</Container>

<Container className="py-24">
  <h1>Section with vertical padding</h1>
</Container>
```

**Responsive Behavior:**
- Mobile: Full width with horizontal padding
- Desktop: Max-width constraint (1280px)
- Centered with `mx-auto`

---

### Accordion

**Location:** [src/components/ui/accordion.tsx](../../src/components/ui/accordion.tsx)

Collapsible content sections with multiple variants. Custom implementation with React context for state management.

**Type Definition:**
```typescript
type AccordionProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "minimal";
  allowMultiple?: boolean;       // Allow multiple open items
};

type AccordionItemProps = {
  value: string;                 // Required: Unique identifier
  children: ReactNode;
  className?: string;
};
```

**Components:**
```typescript
Accordion           // Root container with state
AccordionItem      // Individual collapsible item
AccordionTrigger   // Clickable header
AccordionContent   // Collapsible content
```

**Variants:**

| Variant | Visual Style | Use Case |
|---------|--------------|----------|
| `default` | Rounded cards with shadow, generous spacing | FAQ sections, prominent accordions |
| `bordered` | Thick borders, hover effects | Alternative style, outlined sections |
| `minimal` | Bottom borders only, compact | Dense content, simple lists |

**Usage Examples:**

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// Default variant (FAQ style)
<Accordion variant="default">
  <AccordionItem value="item-1">
    <AccordionTrigger>
      How do I book a professional?
    </AccordionTrigger>
    <AccordionContent>
      <p>You can book a professional by browsing our directory...</p>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>
      What payment methods do you accept?
    </AccordionTrigger>
    <AccordionContent>
      <p>We accept credit cards, debit cards, and bank transfers...</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>

// Allow multiple open items
<Accordion variant="bordered" allowMultiple>
  <AccordionItem value="pricing">
    <AccordionTrigger>Pricing</AccordionTrigger>
    <AccordionContent>Pricing details...</AccordionContent>
  </AccordionItem>

  <AccordionItem value="schedule">
    <AccordionTrigger>Schedule</AccordionTrigger>
    <AccordionContent>Schedule information...</AccordionContent>
  </AccordionItem>
</Accordion>

// Minimal variant (compact)
<Accordion variant="minimal">
  <AccordionItem value="terms">
    <AccordionTrigger>Terms of Service</AccordionTrigger>
    <AccordionContent>Terms content...</AccordionContent>
  </AccordionItem>

  <AccordionItem value="privacy">
    <AccordionTrigger>Privacy Policy</AccordionTrigger>
    <AccordionContent>Privacy content...</AccordionContent>
  </AccordionItem>
</Accordion>
```

**Animation Behavior:**
- Smooth expand/collapse (300ms ease-in-out)
- Arrow icon rotation (180° when open)
- Grid-based height animation (prevents content jump)
- Opacity fade (0 to 1)

**Accessibility:**
- ✅ `aria-expanded` attribute on trigger
- ✅ Semantic button for trigger
- ✅ Keyboard navigable (Tab, Enter, Space)
- ✅ Focus visible states
- ✅ Proper heading hierarchy

**State Management:**
- Uses React Context to share state
- Set-based open items tracking
- Single/multiple open modes
- Value-based identification

**Customization:**
```tsx
<Accordion variant="default" className="max-w-3xl mx-auto">
  <AccordionItem value="custom" className="bg-red-50">
    <AccordionTrigger className="text-red-600">
      Custom styled item
    </AccordionTrigger>
    <AccordionContent className="text-gray-700">
      Custom content
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Tabs

**Location:** [src/components/ui/tabs.tsx](../../src/components/ui/tabs.tsx)

Tabbed navigation component built on Radix UI primitives.

**Usage:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
    <TabsTrigger value="availability">Availability</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    Overview content
  </TabsContent>

  <TabsContent value="reviews">
    Reviews content
  </TabsContent>

  <TabsContent value="availability">
    Availability content
  </TabsContent>
</Tabs>
```

**Features:**
- ✅ Keyboard navigation (Arrow keys)
- ✅ Roving tabindex
- ✅ Automatic activation
- ✅ Controlled/uncontrolled modes

---

## Display Components

### Animated Counter

**Location:** [src/components/ui/animated-counter.tsx](../../src/components/ui/animated-counter.tsx)

Number animation component for statistics and metrics.

**Usage:**
```tsx
import { AnimatedCounter } from "@/components/ui/animated-counter";

<AnimatedCounter
  value={1250}
  duration={2000}
  suffix="+"
/>

<AnimatedCounter
  value={98.5}
  decimals={1}
  suffix="%"
/>
```

**Features:**
- ✅ Smooth count-up animation
- ✅ Custom duration
- ✅ Prefix/suffix support
- ✅ Decimal places
- ✅ Respects `prefers-reduced-motion`

---

### Animated Marquee

**Location:** [src/components/ui/animated-marquee.tsx](../../src/components/ui/animated-marquee.tsx)

Infinite scrolling marquee for logos, testimonials, or features.

**Usage:**
```tsx
import { AnimatedMarquee } from "@/components/ui/animated-marquee";

<AnimatedMarquee speed={50}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</AnimatedMarquee>
```

**Features:**
- ✅ Infinite loop
- ✅ Customizable speed
- ✅ Pause on hover
- ✅ Responsive

---

### Chart

**Location:** [src/components/ui/chart.tsx](../../src/components/ui/chart.tsx)

Chart components for analytics dashboards (likely uses Recharts).

**Usage:**
```tsx
import { Chart } from "@/components/ui/chart";

<Chart
  data={analyticsData}
  type="bar"
  height={400}
/>
```

---

## Specialized Components

### Hero Search Bar

**Location:** [src/components/ui/hero-search-bar.tsx](../../src/components/ui/hero-search-bar.tsx)

Large search bar for homepage hero sections.

**Usage:**
```tsx
import { HeroSearchBar } from "@/components/ui/hero-search-bar";

<HeroSearchBar
  placeholder="Search for professionals..."
  onSearch={handleSearch}
/>
```

---

### Checkmark List

**Location:** [src/components/ui/checkmark-list.tsx](../../src/components/ui/checkmark-list.tsx)

List component with checkmark icons for features or benefits.

**Usage:**
```tsx
import { CheckmarkList } from "@/components/ui/checkmark-list";

<CheckmarkList
  items={[
    "Verified professionals",
    "Transparent pricing",
    "24/7 support",
  ]}
/>
```

---

### Comparison Table

**Location:** [src/components/ui/comparison-table.tsx](../../src/components/ui/comparison-table.tsx)

Feature comparison table for pricing or plans.

**Usage:**
```tsx
import { ComparisonTable } from "@/components/ui/comparison-table";

<ComparisonTable
  plans={[
    { name: "Basic", features: [...] },
    { name: "Pro", features: [...] },
  ]}
/>
```

---

### Feature Section

**Location:** [src/components/ui/feature-section.tsx](../../src/components/ui/feature-section.tsx)

Pre-built section component for showcasing features.

**Usage:**
```tsx
import { FeatureSection } from "@/components/ui/feature-section";

<FeatureSection
  title="Why Choose MaidConnect"
  features={[...]}
/>
```

---

### Two Column Feature

**Location:** [src/components/ui/two-column-feature.tsx](../../src/components/ui/two-column-feature.tsx)

Two-column layout for feature descriptions with images.

**Usage:**
```tsx
import { TwoColumnFeature } from "@/components/ui/two-column-feature";

<TwoColumnFeature
  title="Verified Professionals"
  description="All professionals are background-checked..."
  image="/feature-image.jpg"
  imagePosition="right"
/>
```

---

### Wavy Divider

**Location:** [src/components/ui/wavy-divider.tsx](../../src/components/ui/wavy-divider.tsx)

SVG-based decorative wave divider for section transitions.

**Usage:**
```tsx
import { WavyDivider } from "@/components/ui/wavy-divider";

<section className="bg-white">
  {/* Content */}
</section>
<WavyDivider />
<section className="bg-gray-50">
  {/* Content */}
</section>
```

---

## Utility Components

### Skip Link

**Location:** [src/components/ui/skip-link.tsx](../../src/components/ui/skip-link.tsx)

Accessibility component for keyboard navigation to skip to main content.

**Usage:**
```tsx
import { SkipLink } from "@/components/ui/skip-link";

// In layout/header
<SkipLink href="#main-content" />

// In main content
<main id="main-content">
  {/* Page content */}
</main>
```

**Accessibility:**
- ✅ WCAG 2.1 AAA requirement
- ✅ Visible on focus
- ✅ First tab stop on page
- ✅ Keyboard navigable

---

### Kbd

**Location:** [src/components/ui/kbd.tsx](../../src/components/ui/kbd.tsx)

Keyboard shortcut indicator component.

**Usage:**
```tsx
import { Kbd } from "@/components/ui/kbd";

<p>
  Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to search
</p>

<Button kbd="⌘K" label="Search" />
```

**Variants:**
- `solid` - Solid background
- `outline` - Bordered outline

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

---

### Theme Toggle

**Location:** [src/components/ui/theme-toggle.tsx](../../src/components/ui/theme-toggle.tsx)

Dark mode toggle component.

**Usage:**
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

<ThemeToggle />
```

**Features:**
- ✅ Persistent preference (localStorage)
- ✅ System preference detection
- ✅ Smooth transition
- ✅ Accessible button

---

## Component Composition Patterns

### Cards with Actions

```tsx
<Card hoverable>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3>Booking #1234</h3>
      <Badge variant="success">Confirmed</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p>Service: House Cleaning</p>
    <p>Date: January 15, 2025</p>
  </CardContent>
  <CardFooter>
    <div className="flex gap-2">
      <Button href="/bookings/1234" label="View" variant="secondary" size="sm" />
      <Button href="/bookings/1234/cancel" label="Cancel" variant="ghost" size="sm" />
    </div>
  </CardFooter>
</Card>
```

### Form with Select and Date Picker

```tsx
<form>
  <div className="space-y-4">
    <div>
      <label>Service Type</label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cleaning">Cleaning</SelectItem>
          <SelectItem value="plumbing">Plumbing</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <label>Date</label>
      <DatePicker selected={date} onSelect={setDate} />
    </div>

    <Button type="submit" label="Book Now" variant="primary" />
  </div>
</form>
```

### Loading States

```tsx
function ProfessionalList({ professionals, isLoading }) {
  if (isLoading) {
    return <ListSkeleton count={6} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {professionals.map(pro => (
        <Card key={pro.id} hoverable>
          <CardImage aspectRatio="1/1">
            <img src={pro.avatar} alt={pro.name} />
          </CardImage>
          <CardContent>
            <h3>{pro.name}</h3>
            <Badge variant="primary">{pro.service}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Best Practices

### Accessibility

1. **Always use semantic HTML**
   ```tsx
   // ✅ Good
   <Button href="/page" label="Navigate" />

   // ❌ Bad
   <div onClick={() => navigate("/page")}>Navigate</div>
   ```

2. **Provide proper labels**
   ```tsx
   // ✅ Good
   <Select aria-label="Filter by service">
     ...
   </Select>

   // ❌ Bad
   <Select>...</Select>
   ```

3. **Handle focus states**
   ```tsx
   // All components have focus-visible styles built-in
   // Use className to customize if needed
   <Button
     label="Action"
     className="focus-visible:outline-blue-600"
   />
   ```

4. **Support keyboard navigation**
   - All interactive components are keyboard accessible
   - Use `Tab`, `Enter`, `Space`, `Arrow keys`

### Performance

1. **Lazy load heavy components**
   ```tsx
   const Chart = dynamic(() => import("@/components/ui/chart"), {
     loading: () => <ChartSkeleton />,
   });
   ```

2. **Use skeletons for loading states**
   ```tsx
   // Show skeleton immediately, load data async
   {isLoading ? <CardSkeleton /> : <ActualCard data={data} />}
   ```

3. **Disable motion when needed**
   ```tsx
   <Card hoverable disableMotion={prefersReducedMotion} />
   ```

### Consistency

1. **Follow variant naming**
   - `primary`, `secondary`, `ghost` for buttons
   - `default`, `elevated`, `outlined`, `glass` for cards
   - `success`, `warning`, `danger`, `info` for status

2. **Use design tokens**
   ```tsx
   // ✅ Use predefined variants
   <Button variant="primary" size="lg" />

   // ❌ Avoid custom styling
   <button className="bg-red-600 px-10 py-4">...</button>
   ```

3. **Compose with sub-components**
   ```tsx
   // ✅ Use composition pattern
   <Card>
     <CardHeader>...</CardHeader>
     <CardContent>...</CardContent>
   </Card>

   // ❌ Don't create custom card structure
   <div className="card">
     <div className="header">...</div>
     <div className="content">...</div>
   </div>
   ```

---

## Migration Guide

If you're updating old components to use the new design system:

### Button Migration

```tsx
// Before (custom button)
<a
  href="/page"
  className="rounded-full bg-red-600 px-8 py-3 text-white hover:bg-red-700"
>
  Click me
</a>

// After (design system button)
<Button
  href="/page"
  label="Click me"
  variant="primary"
  size="md"
/>
```

### Card Migration

```tsx
// Before (div-based card)
<div className="rounded-lg border bg-white p-6 shadow-md hover:shadow-lg">
  <h3>Title</h3>
  <p>Content</p>
</div>

// After (design system card)
<Card variant="default" hoverable>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

---

## Related Resources

- **[Design System](./design-system.md)** - Color palette, typography, spacing
- **[Motion Guidelines](./motion-guidelines.md)** - Animation patterns
- **[Accessibility Guidelines](./design-system.md#accessibility)** - WCAG compliance
- **[CLAUDE.md](../../CLAUDE.md)** - TypeScript patterns, code style

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintainer:** Design System Team

For questions or contributions, see [Contributing Guide](../07-guides/contributing.md).
