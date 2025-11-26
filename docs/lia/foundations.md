# Foundations

Version: **2025.03** (Airbnb-Inspired Refresh)
Source of truth: `src/app/globals.css`, `src/app/fonts.ts`

## Design Goals

1. **Airbnb-inspired clarity** – Clean, modern aesthetic with cool neutrals and signature coral-pink accents.
2. **Trust through precision** – Tight typography, consistent geometry, and strict 4px spacing grid.
3. **Accessibility by default** – WCAG AA contrast targets with predictable focus states.
4. **One system across all surfaces** – Admin, dashboard, marketing, and support use the same tokens.

---

## Typography

| Token | Usage | CSS Utility |
| --- | --- | --- |
| Geist Sans | All narrative/UI text | `font-[family-name:var(--font-geist-sans)]` |
| Geist Mono | Data, IDs, timestamps | `font-[family-name:var(--font-geist-mono)]` |

| Level | Size / Line | Typical Usage |
| --- | --- | --- |
| Display | 64 / 72 | Marketing hero statements |
| H1 | 48 / 48 | Page titles |
| H2 | 36 / 48 | Section titles |
| H3 | 24 / 24 | Card titles, module headings |
| Body | 16 / 24 | Paragraphs |
| Small | 14 / 24 | Metadata, helper text |
| Data | 14 / 24 (Mono) | Metrics, IDs, timestamps |

Rules:
- Uppercase headings (`tracking-tight`) for admin/dash surfaces; marketing can use Title Case.
- Never import Satoshi/Manrope—Geist is the only approved family.
- Align typography to the 24px baseline grid; avoid odd line heights.

---

## Color System

### Neutral Ramp (Airbnb Cool Grays)

| Token | Hex | Notes |
| --- | --- | --- |
| `neutral-50` | `#F7F7F7` | Page background (Airbnb light) |
| `neutral-100` | `#EBEBEB` | Muted surfaces, disabled |
| `neutral-200` | `#DDDDDD` | Borders, table dividers (Airbnb dividers) |
| `neutral-300` | `#C2C2C2` | Hover borders |
| `neutral-400` | `#A8A8A8` | Icons, muted lines |
| `neutral-500` | `#767676` | Mid-gray (Airbnb Foggy) |
| `neutral-600` | `#5E5E5E` | Secondary text |
| `neutral-700` | `#484848` | Body text (Airbnb Hof) |
| `neutral-900` | `#222222` | Headings (Airbnb dark) |

### Rausch Ramp (Primary Accent - Deep Burgundy Wine)

| Token | Hex | Usage |
| --- | --- | --- |
| `rausch-50` | `#F6EDEE` | Hover background, highlights |
| `rausch-100` | `#E4CAD0` | Light highlights |
| `rausch-200` | `#C79BA6` | Soft accents |
| `rausch-300` | `#A87383` | Progress indicators |
| `rausch-400` | `#8F5261` | Highlights |
| `rausch-500` | `#7A3B4A` | Primary CTA (Deep burgundy) |
| `rausch-600` | `#6B3340` | Links, hover state |
| `rausch-700` | `#5D2B35` | Active/destructive |
| `rausch-800` | `#4F242C` | Deep accent |
| `rausch-900` | `#421D24` | Darkest accent |

### Babu Ramp (Airbnb Secondary Accent - Teal)

| Token | Hex | Usage |
| --- | --- | --- |
| `babu-50` | `#E6F7F6` | Info background |
| `babu-100` | `#CCF0EE` | Light info highlights |
| `babu-200` | `#99E1DD` | Soft info accents |
| `babu-300` | `#66D2CC` | Info progress |
| `babu-400` | `#33C3BB` | Info highlights |
| `babu-500` | `#00A699` | Info states (Airbnb teal) |
| `babu-600` | `#008F84` | Info hover |
| `babu-700` | `#007870` | Active info state |

### Green Ramp (Success Accent)

| Token | Hex | Usage |
| --- | --- | --- |
| `green-50` | `#F3F5F0` | Success background |
| `green-400` | `#9CA782` | Success highlights |
| `green-500` | `#788C5D` | Success states |
| `green-600` | `#687C4D` | Success hover |

Rules:
- `rausch-600` for inline links (WCAG AA compliant).
- Use babu for informational accents, green for success states, rausch for primary actions.
- All borders/dividers default to `neutral-200`.

---

## Geometry & Spacing

- **Border radius (Airbnb-inspired):**
  - `rounded-sm` = 4px (small elements, inline badges)
  - `rounded-md` = 8px (standard inputs, small cards)
  - `rounded-lg` = 12px (default for buttons, cards, inputs)
  - `rounded-xl` = 16px (large cards, modals)
  - `rounded-full` = 9999px (badges, pills, avatars)
- **Spacing scale:** 4px base (`gap-1 = 4px`, `gap-2 = 8px`, `gap-3 = 12px`, `gap-4 = 16px`, `gap-5 = 20px`, `gap-6 = 24px`, `gap-8 = 32px`, `gap-10 = 40px`, `gap-12 = 48px`).
- **Baseline grid:** 24px increments for vertical rhythm.
- **Module heights:** multiples of 64px for cards, tables, hero blocks.
- **Gutters:** 24px standard grid gap (`--gutter`).

---

## Interaction Model

- **Hover:** `hover:bg-neutral-50` for data rows, `hover:bg-rausch-50` for CTAs.
- **Active:** `active:scale-[0.98]` for buttons, with darker rausch states.
- **Focus:** `ring-2 ring-rausch-500 ring-offset-2`.
- **Shadows:** `shadow-sm` for data, `shadow-lg` reserved for marketing hero cards.
- **Loading:** Use skeleton components defined in `src/components/ui/skeleton.tsx`.

---

## Content System

- **Tone:** Professional, direct, data-backed. Prefer declarative statements ("24/7 support") over fluffy copy.
- **Numerals:** Always render with Geist Mono to maintain alignment in data tables.
- **CTAs:** Primary (rausch) + secondary (neutral). Ghost/text links reserved for tertiary actions.
- **Icons:** Hugeicons/Lucide outline style only; keep stroke weight consistent at 1.5px.

---

## Implementation Checklist

- Import `geistSans` / `geistMono` when component-level control is needed (e.g., storybook stories).
- Use the Tailwind tokens defined in `@theme` (no raw hex in JSX).
- If a new token is required, add it to `src/app/globals.css` and document it here first.
