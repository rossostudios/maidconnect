# Primitives

Lia exposes all UI building blocks from `src/components/ui`. This document consolidates the historical design notes and checklists into a single reference. Each primitive references the exact source file and its Lia-specific contract.

## Forms & Inputs

| Component | Path | Notes |
| --- | --- | --- |
| **Button** | `src/components/ui/button.tsx` | Orange-first CTA system. Variants: `default`, `secondary`, `outline`, `ghost`, `link`, `destructive`. Sizes: `sm`, `default`, `lg`, `icon`. Active feedback uses `scale-[0.98]`. Anthropic `rounded-lg` geometry. |
| **Input** | `src/components/ui/input.tsx` | Anthropic `rounded-lg` geometry, `h-10`, orange focus ring. Supports `isInvalid` styling via `aria-invalid`. |
| **Textarea** | `src/components/ui/textarea.tsx` | Same token set as Input with `min-h-[80px]`. |
| **Checkbox** | `src/components/ui/checkbox.tsx` | Radix wrapper with 16px square, orange check, neutral hover. |
| **Radio Group** | `src/components/ui/radio-group.tsx` | Horizontal/vertical layouts with 16px markers. |
| **Select** | `src/components/ui/select.tsx` | Radix Select themed with white surfaces (`bg-white`) and neutral borders. |
| **GridField** | `src/components/ui/grid-field.tsx` | Multi-column form layout snapped to the 8px grid. |

Usage Example:

```tsx
import { Button, Input, Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui";

<form className="space-y-6">
  <Input name="email" type="email" placeholder="concierge@casaora.com" />
  <Select defaultValue="standard">
    <SelectTrigger className="w-full">Plan</SelectTrigger>
    <SelectContent>
      <SelectItem value="standard">Standard</SelectItem>
      <SelectItem value="premium">Premium</SelectItem>
    </SelectContent>
  </Select>
  <Button size="lg">Book Concierge</Button>
</form>
```

## Layout & Containers

| Component | Path | Notes |
| --- | --- | --- |
| **Card** | `src/components/ui/card.tsx` | Handles headers/footers/content with Anthropic `rounded-lg`; `cardVariants` expose density options. |
| **Container** | `src/components/ui/container.tsx` | Responsive shell with Lia gutters (24px). |
| **LiaGrid / LiaGrid10 / LiaGrid12 / LiaGrid13** | `src/components/ui/lia-grid.tsx` | CSS Grid presets for Swiss-style layouts. |
| **SectionHeader / FeatureSection / TwoColumnFeature** | `src/components/ui/*` | Marketing-friendly but still obey Lia tokens; refer to `patterns.md` for when to introduce rounded cards. |

## Navigation & Overlays

| Component | Path | Notes |
| --- | --- | --- |
| **Accordion** | `src/components/ui/accordion.tsx` | Neutral backgrounds, `text-neutral-900`. Use for FAQs and data disclosures. |
| **Dialog** | `src/components/ui/dialog.tsx` | White surfaces, Anthropic `rounded-xl`, `shadow-lg`. Includes `DialogFooter` for CTA stacking. |
| **Tabs** | `src/components/ui/tabs.tsx` | Underline indicator, uppercase labels recommended for admin/dash. |
| **SkipLink** | `src/components/ui/skip-link.tsx` | Accessibility requirement for long forms/dashboards. |

## Data Display

| Component | Path | Notes |
| --- | --- | --- |
| **DataTableEnhanced** | `src/components/ui/data-table-enhanced.tsx` | Uses Geist Mono for metrics, `hover:bg-neutral-50`, zebra stripes optional. |
| **DataCard / PremiumStatCard / StatCard** | `src/components/ui/*` | White surfaces, `border-neutral-200`, `geistMono` metrics. Premium card introduces gradient accent and is only for marketing hero stats. |
| **Chart primitives** | `src/components/ui/chart.tsx` | Wrapper components for Recharts with consistent tooltip + legend styling. |
| **StatusCard** | `src/components/ui/status-card.tsx` | Semantic statuses with the approved utility palette. |

## Feedback & Skeletons

| Component | Path | Notes |
| --- | --- | --- |
| **Badge** | `src/components/ui/badge.tsx` | Anthropic pill-style badges (`rounded-full`) with uppercase `text-xs`. Variants: `default`, `outline`, `secondary`. |
| **Skeleton** | `src/components/ui/skeleton.tsx` | Collection that covers cards, tables, charts, conversation lists, etc. Use to preserve layout stability. |
| **Backdrop** | `src/components/ui/backdrop.tsx` | 80% black overlay for modals/drawers. |
| **AnimatedCounter / AnimatedMarquee / WavyDivider** | Marketing enhancements that still respect Lia spacing/contrast rules. |

## Utilities

| Component | Path | Notes |
| --- | --- | --- |
| **Kbd** | `src/components/ui/kbd.tsx` | Keyboard hint chips for the command palette. |
| **Hero Search**, **TabsV2**, **Enhanced layout blocks** | `src/components/ui/*.tsx` | Use when a marketing hero requires the premium spacing tokens documented in `patterns.md`. |

## Status Legend

- ✅ **Compliant** – Implements Lia tokens with zero drift (most primitives).
- ⚠️ **Legacy** – Exists for backwards compatibility (`MinimalButton`, `MinimalInput`). Avoid using in net-new work.
- 🧪 **Experimental** – Living inside `src/components/dev` or stories; prototype-only, document before adoption.

When creating a new primitive:
1. Build inside `src/components/ui`.
2. Export from `src/components/ui/index.ts`.
3. Add a row here with intent + usage notes.
4. Reference the pattern(s) that rely on it.
