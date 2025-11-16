# Foundations

Version: **2025.02**  
Source of truth: `src/app/globals.css`, `src/app/fonts.ts`

## Design Goals

1. **Data-first clarity** – Feels like a Bloomberg terminal but modernized for Casaora.
2. **Trust through rigor** – Tight typography, zero-radius geometry, and strict spacing.
3. **Accessibility by default** – WCAG AAA contrast targets with predictable focus states.
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

### Neutral Ramp

| Token | Hex | Notes |
| --- | --- | --- |
| `neutral-50` | `#FFFDFC` | Page background |
| `neutral-100` | `#FAF8F6` | Muted surfaces, disabled |
| `neutral-200` | `#E6E5E5` | Borders, table dividers |
| `neutral-300` | `#DCDAD7` | Hover borders |
| `neutral-400` | `#BEBBB7` | Icons, muted lines |
| `neutral-600` | `#8C8985` | Secondary text |
| `neutral-700` | `#64615D` | Body text |
| `neutral-900` | `#181818` | Headings |

### Orange Ramp

| Token | Hex | Usage |
| --- | --- | --- |
| `orange-50` | `#FFF7F0` | Hover background |
| `orange-400` | `#FF8746` | Highlights, progress |
| `orange-500` | `#FF5200` | Primary CTA |
| `orange-600` | `#E64A00` | Links, hover |
| `orange-700` | `#C84000` | Active/destructive |

### Semantic / Utility

- Success `#22C55E`, Warning `#F5A524`, Info `#2E90FA`, Critical `#C84000`.
- Background gradient token: `linear-gradient(180deg,#FFF8F2,#FFF1E6)` for premium heroes.

Rules:
- `orange-600` only for inline links (WCAG AA).
- Never mix additional accent colors for badges—use neutral backgrounds + orange emphasis.
- All borders/dividers default to `neutral-200`.

---

## Geometry & Spacing

- **Border radius:** default `0`. Only apply rounding when `patterns.md` explicitly calls for it (e.g., marketing hero cards).
- **Spacing scale:** 8px base (`gap-1 = 4px`, `gap-2 = 8px`, `gap-3 = 12px`, `gap-4 = 16px`, `gap-6 = 24px`, `gap-8 = 32px`, `gap-12 = 48px`, `gap-16 = 64px`).
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

- **Tone:** Professional, direct, data-backed. Prefer declarative statements (“24/7 concierge”) over fluffy copy.
- **Numerals:** Always render with Geist Mono to maintain alignment in data tables.
- **CTAs:** Primary (orange) + secondary (neutral). Ghost/text links reserved for tertiary actions.
- **Icons:** Hugeicons/Lucide outline style only; keep stroke weight consistent at 1.5px.

---

## Implementation Checklist

- Import `geistSans` / `geistMono` when component-level control is needed (e.g., storybook stories).
- Use the Tailwind tokens defined in `@theme` (no raw hex in JSX).
- If a new token is required, add it to `src/app/globals.css` and document it here first.
