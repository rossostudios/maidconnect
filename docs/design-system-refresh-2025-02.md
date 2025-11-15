# Marketing Design Refresh – February 2025

This note captures the latest visual refinements we just shipped to the marketing surface so we can mirror the same system in the dashboard work that follows.

## Snapshot of What Changed

- **Hero (src/components/sections/HeroSection.tsx)**  
  - Larger vertical rhythm (`py-32/40`), single-row CTA stack, and a dedicated concierge text link for quieter intent.  
  - Supporting image now breathes with extra offset, and the trust marquee sits inside a bordered card with soft gradients to echo the Aurius reference.

- **Benefits Surfaces (src/components/sections/benefits-grid.tsx & src/components/ui/benefit-card.tsx)**  
  - The “How it works” grid now lives inside a rounded 40px card with table-style dividers, mirroring the editorial blocks from the inspiration site.  
  - Benefit icons shifted to outline badges (bordered, neutral fill) so they scale into dashboard cards without the old filled tiles.

## Design System Adjustments to Reuse

- **Palette Additions**  
  - Extend the neutral ramp with `neutral-75` and `neutral-125` (creamy tints for chips) plus deep charcoals for dark callouts.  
  - Lock in accent utility colors for app states: success `#34C759`, info `#2E90FA`, warning `#F5A524`, critical `#C84000`.

- **Typography Scale**  
  - Display 64/1.2, H1 48/1.2, H2 40/1.2, H3 32/1.25, Body-L 18/1.5, Body-M 16/1.5, Body-S 14/1.5, Label 12/1.4.  
  - Keep Satoshi for display/H2, Manrope elsewhere; reserve serif for rare editorial pull-quotes.

- **Surface Tokens**  
  - Use `card: border-neutral-200 + shadow-[0_24px_80px_rgba(15,23,42,0.08)] + radius 32-40px` for hero/value blocks.  
  - Lighter sheets: `border-neutral-100`, `shadow-sm`, `radius 16px` for dashboards.  
  - Background gradient token for hero/dark CTA: `linear-gradient(180deg,#FFF8F2 0%,#FFF1E6 100%)`.

- **Component Families**  
  - CTA set: `Primary (orange)`, `Ghost (text link)`, `Text-only (concierge link)`.  
  - Logo marquee, feature cards, and workflow diagrams now share spacing tokens (`gap-16`, `padding 32/40`), so port those to admin/pro/customer shells.

## Next Steps for the Web App

1. **Dashboard Shell:** apply the new card + icon treatments to analytics/profile widgets, keeping the neutral background (#FAF8F6) and orange highlights.  
2. **Workflow Builder:** reuse the refreshed process diagram nodes for automations inside the admin tooling.  
3. **Documentation:** align Figma tokens + storybook stories with these Tailwind updates before branch-off for the dashboard redesign.

Once these patterns are in playlists/Storybook, the dashboard views can inherit the same spacing + surfaces without bespoke CSS.
