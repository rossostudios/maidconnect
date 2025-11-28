/**
 * Marketing Components
 * Interactive visual components for the Casaora homepage
 */

// =============================================================================
// Zero-Bloat Components (CSS-first, no Framer Motion)
// =============================================================================

export type { InstantMatchCalendarProps } from "./calendar/InstantMatchCalendar";
// InstantMatchCalendar - Static calendar grid with CSS animations (~0KB vs ~45KB)
export { InstantMatchCalendar } from "./calendar/InstantMatchCalendar";

// VettingCard - CSS-first vetting flow visualization
export { VettingCard } from "./vetting-flow/VettingCard";

// =============================================================================
// Legacy Components (Framer Motion - to be deprecated)
// =============================================================================

// Interactive Calendar (Framer Motion) - Use InstantMatchCalendar instead
export { InteractiveCalendar } from "./calendar/InteractiveCalendar";

// Escrow Vault Card
export { EscrowVaultCard } from "./escrow-vault/EscrowVaultCard";

// Instant Match Card (Framer Motion) - Use InstantMatchCalendar instead
export { InstantMatchCard } from "./instant-match/InstantMatchCard";
// =============================================================================
// Types
// =============================================================================
export type {
  EscrowVaultCardProps,
  InstantMatchCardProps,
  InteractiveCalendarProps,
  SupportedCurrency,
  VettingFlowCardProps,
  VettingStep,
} from "./types";
// Vetting Flow Card (Framer Motion) - Use VettingCard instead
export { VettingFlowCard } from "./vetting-flow/VettingFlowCard";
