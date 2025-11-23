# Foundations

Version: **2025.03**
Source of truth: `src/app/globals.css`, `src/app/fonts.ts`

## Design Goals

1. **Anthropic-inspired clarity** – Clean, modern aesthetic with warm neutrals and thoughtful rounded corners.
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

### Neutral Ramp (Anthropic Warm Grays)

| Token | Hex | Notes |
| --- | --- | --- |
| `neutral-50` | `#FAF9F5` | Page background (Anthropic light) |
| `neutral-100` | `#F5F3EE` | Muted surfaces, disabled |
| `neutral-200` | `#E8E6DC` | Borders, table dividers (Anthropic light-gray) |
| `neutral-300` | `#D4D1C7` | Hover borders |
| `neutral-400` | `#C0BDB3` | Icons, muted lines |
| `neutral-500` | `#B0AEA5` | Mid-gray (Anthropic) |
| `neutral-600` | `#8C8A82` | Secondary text |
| `neutral-700` | `#68665F` | Body text |
| `neutral-900` | `#141413` | Headings (Anthropic dark) |

### Orange Ramp (Anthropic Primary Accent)

| Token | Hex | Usage |
| --- | --- | --- |
| `orange-50` | `#FAF0ED` | Hover background |
| `orange-100` | `#F5E1DB` | Light highlights |
| `orange-400` | `#E88668` | Highlights, progress |
| `orange-500` | `#D97757` | Primary CTA (Anthropic orange) |
| `orange-600` | `#C56847` | Links, hover (Anthropic hover) |
| `orange-700` | `#B15937` | Active/destructive |

### Blue Ramp (Anthropic Secondary Accent)

| Token | Hex | Usage |
| --- | --- | --- |
| `blue-50` | `#EDF4FA` | Info background |
| `blue-400` | `#7FAAD9` | Info highlights |
| `blue-500` | `#6A9BCC` | Info states (Anthropic blue) |
| `blue-600` | `#5A8BBC` | Info hover (Anthropic blue hover) |

### Green Ramp (Anthropic Success Accent)

| Token | Hex | Usage |
| --- | --- | --- |
| `green-50` | `#F0F2ED` | Success background |
| `green-400` | `#8C9F6E` | Success highlights |
| `green-500` | `#788C5D` | Success states (Anthropic green) |
| `green-600` | `#687C4D` | Success hover (Anthropic green hover) |

Rules:
- `orange-600` for inline links (WCAG AA compliant).
- Use blue for informational accents, green for success states, orange for primary actions.
- All borders/dividers default to `neutral-200`.

---

## Geometry & Spacing

- **Border radius (Anthropic):**
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

- **Hover:** `hover:bg-neutral-50` for data rows, `hover:bg-orange-50` for CTAs.
- **Active:** `active:scale-[0.98]` for buttons, with darker orange states.
- **Focus:** `ring-2 ring-orange-500 ring-offset-2`.
- **Shadows:** `shadow-sm` for data, `shadow-lg` reserved for marketing hero cards.
- **Loading:** Use skeleton components defined in `src/components/ui/skeleton.tsx`.

---

## Content System

- **Tone:** Professional, direct, data-backed. Prefer declarative statements ("24/7 support") over fluffy copy.
- **Numerals:** Always render with Geist Mono to maintain alignment in data tables.
- **CTAs:** Primary (orange) + secondary (neutral). Ghost/text links reserved for tertiary actions.
- **Icons:** Hugeicons/Lucide outline style only; keep stroke weight consistent at 1.5px.

---

## Implementation Checklist

- Import `geistSans` / `geistMono` when component-level control is needed (e.g., storybook stories).
- Use the Tailwind tokens defined in `@theme` (no raw hex in JSX).
- If a new token is required, add it to `src/app/globals.css` and document it here first.
