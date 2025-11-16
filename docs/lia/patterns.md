# Patterns

This file consolidates every Lia surface rule that previously lived across `minimal-admin-design-system.md`, `design-system-refresh-2025-02.md`, and the various checklist files. Treat it as the contract for how tokens + primitives assemble into product-ready experiences.

## 1. Admin & Dashboard Shells

**Layout**
- Page background `bg-neutral-50`, content cards `bg-white border border-neutral-200 shadow-sm`.
- 24px gutters, `max-w-[1600px]` center column, sticky resource rails allowed.
- Use `grid grid-cols-12 gap-6` for data heavy screens; cards snap to multiples of 64px height.

**Typography**
- Uppercase page titles + section labels (`tracking-tight`).
- Body text `text-neutral-700`, metadata `text-neutral-600 text-xs`.
- Numbers/IDs always `geistMono`.

**Color**
- Orange is only used for primary CTAs, active table headers, and progress chips.
- Semantic states: success `bg-green-600`, warning `bg-yellow-600`, error `bg-red-600`, info `bg-blue-600`—text always white uppercase `text-xs`.

**Components**
- Data grids -> `DataTableEnhanced` (sortable headers, hover row states).
- Filters -> `Dialog` + `GridField` combos or `Select`/`RadioGroup`.
- Alerts -> `StatusCard` with icon + monospace count.

**Interaction Notes**
- Hover rows use `hover:bg-neutral-50`.
- Buttons use `active:scale-[0.98]` so they feel tactile.
- Focus rings must be visible even inside dense tables (`focus-visible:ring-2 ring-orange-500`).

## 2. Marketing & Landing Surfaces

**Layout**
- Hero blocks use the gradient token `linear-gradient(180deg,#FFF8F2,#FFF1E6)` plus `py-32` or `py-40`.
- Cards can adopt a **premium** hierarchy: `rounded-[32px] border border-neutral-200 shadow-[0_24px_80px_rgba(15,23,42,0.08)]`.
- Use `gap-16` for large sections and `Container` to keep 24px gutters.

**Typography**
- Display/H1 use Geist Sans with tighter letter spacing (no serif backups).
- Hero stats and pricing rows use `geistMono` for credibility.
- Support copy stays under 80 characters per line (set `max-w-3xl`).

**Color**
- Primary CTA remains `orange-500`.
- Secondary actions = ghost text links or `bg-neutral-100`.
- Iconography sticks to neutral outlines; avoid colorful glyphs.

**Components**
- `BenefitCard`, `FeatureSection`, `TwoColumnFeature`, `HeroSearchBar`, logo marquees from `/ui`.
- CTA stack: Primary button + ghost link (“Talk to concierge”).
- When layering imagery, keep frames squared—use masks instead of rounded corners.

**Interaction Notes**
- Scroll-driven animations use Motion but must respect reduced-motion preferences.
- Keep marquee speed constant (duration 25s) to maintain calm energy.

## 3. Support, Error, and Empty States

**Layout**
- Base background `bg-neutral-50`.
- Use `max-w-2xl mx-auto` center alignment with `py-24`.
- Cards remain rectangular with `border-neutral-200`; avoid whimsy.

**Typography**
- Headline = uppercase H2 (36/48).
- Description = `text-neutral-700`.
- Action links = `text-orange-600` with icon leaning right.

**Patterns**
- Help center modules: `Accordion` or `Tabs` with descriptive titles.
- Error states: icon badge + descriptive copy + CTA button.
- Empty states: ghost illustration (monochrome) + primary button + optional secondary link.

**Key Requirements**
- Provide escape routes for every dead end (primary CTA + support link).
- Include inline contact `mailto:support@casaora.com` or concierge CTA for critical errors.
- Use `sonner` toasts sparingly—prefer inline status cards for reliability messaging.

## 4. Cross-Surface Grid Recipes

| Recipe | Description |
| --- | --- |
| **Swiss Grid (13 columns)** | `grid-cols-13` with 24px gutters for hero sections and marketing diagrams. |
| **Dashboard Twin Column** | `grid grid-cols-12 gap-6` with `col-span-8` main + `col-span-4` insights rail. |
| **Admin Table Stack** | Filters `grid grid-cols-4 gap-4` over table, both locked to 64px modules. |
| **Workflow Timeline** | `flex flex-col gap-6 border-l-2 border-neutral-200 pl-8` using `StatusCard` for each step. |

Document any new recipe additions here before sharing in other docs to keep Lia lean.
