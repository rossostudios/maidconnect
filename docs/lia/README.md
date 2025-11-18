# Lia Design System Handbook

Lia is Casaora's Anthropic-inspired design language. This directory is now the **only canonical reference** for tokens, primitives, and implementation guardrails. All other design notes are managed directly in code or Linear issues so this folder stays lean.

## How to Use This Handbook

1. **Start with Foundations** – color, typography, spacing, and interaction primitives that are defined directly in `src/app/globals.css` and `src/app/fonts.ts`.
2. **Wire UI From Primitives** – every reusable component in `src/components/ui` is cataloged with status, intent, and props inside `primitives.md`.
3. **Check Patterns Per Surface** – `patterns.md` covers admin, dashboard, marketing, and support shells so flows stay consistent.
4. **Ship with Checklists** – `checklists.md` is the single pre-flight tracker replacing the sprawl of `lia-checklist-*.md`.

## Directory Map

| File | Description |
| --- | --- |
| `foundations.md` | Tokens, philosophy, grids, and content rules that apply to every feature. |
| `primitives.md` | Component-level documentation tied to the actual source file and props. |
| `patterns.md` | Application shells and layout recipes (admin, dashboard, marketing, support). |
| `checklists.md` | QA checklists derived from the patterns; use this before merging UI work. |

## Canonical Guardrails

- **Typeface:** Geist Sans for all text, Geist Mono for data (`src/app/fonts.ts`).
- **Palette:** Anthropic warm neutrals + three-accent system (orange, blue, green) defined in `src/app/globals.css`.
- **Geometry:** Anthropic rounded corners (`rounded-lg` for buttons/cards/inputs, `rounded-full` for badges/pills).
- **Spacing:** 4px base grid, 24px baseline, 64px module for vertical rhythm.
- **Interactions:** Orange focus ring (`ring-orange-500`), `hover:bg-neutral-50` for data tables, active scale `0.98` for click feedback.

Questions or proposed changes? Open a short RFC in `docs/lia/` first so we maintain a single source of truth.
