# Lia Implementation Checklists

Use these pre-flight lists before merging UI work. Each section maps back to `foundations.md`, `primitives.md`, and `patterns.md`. Checking every item means the screen is Lia-compliant—no additional documents needed.

## Universal

- [ ] Geist Sans for all text, Geist Mono for data/IDs.
- [ ] No raw hex in JSX; only Tailwind tokens defined in `globals.css`.
- [ ] Spacing sticks to the 8px scale (4, 8, 12, 16, 24, 32, 48, 64).
- [ ] Focus states visible on keyboard navigation (`ring-2 ring-orange-500`).
- [ ] Buttons use one of the exported variants from `@/components/ui`.
- [ ] Cards/tables/modals use `border-neutral-200` and `bg-white`.
- [ ] Primary CTA color is `orange-500`; inline links use `orange-600`.
- [ ] Skeletons or loading states in place for async sections.

## Admin & Dashboard

- [ ] Page background `bg-neutral-50`; cards `bg-white border-neutral-200 shadow-sm`.
- [ ] Page titles uppercase, labels `text-xs uppercase tracking-wide`.
- [ ] IDs/timestamps rendered with Geist Mono.
- [ ] Tables use `DataTableEnhanced` + hover rows `bg-neutral-50`.
- [ ] Filters snap to `grid grid-cols-4 gap-4` or `GridField`.
- [ ] Badges follow semantic palette (success/warning/error/info).
- [ ] Buttons: primary `orange-500`, secondary `neutral-100`, destructive `orange-700`.
- [ ] Layout respects 64px module heights and 24px gutters.

## Marketing & Landing

- [ ] Hero uses gradient background token and `py-32`/`py-40` spacing.
- [ ] Premium cards use `rounded-[32px] border-neutral-200 shadow-[0_24px_80px_rgba(15,23,42,0.08)]`.
- [ ] CTA stack = Primary button + ghost/text link.
- [ ] Iconography stays neutral (outline style); no multi-color badges.
- [ ] Sections capped at `max-w-5xl` copy width.
- [ ] Motion components respect reduced-motion preferences.
- [ ] Logo marquees or trust badges align to the Swiss grid recipes.

## Support, Error, Empty States

- [ ] Layout is centered `max-w-2xl mx-auto py-24`.
- [ ] Include icon badge + heading + supporting paragraph.
- [ ] Provide a minimum of one CTA + one secondary/help link.
- [ ] Error descriptions avoid blame; offer recovery steps.
- [ ] Empty states use monospace numbers for stats, if present.
- [ ] Toasts supplemented with inline feedback for critical actions.

## Release Checklist

- [ ] Storybook stories reference the new docs (`docs/lia/`).
- [ ] Screenshots updated in QA issue to reflect Lia tokens.
- [ ] If a new token/component was added, `foundations.md` or `primitives.md` has been updated in the same PR.
