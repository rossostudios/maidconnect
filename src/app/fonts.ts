/**
 * Custom Font Configuration for Casaora
 *
 * Uses next/font/local for optimal font loading with automatic optimization.
 * All fonts are self-hosted for better performance, privacy, and GDPR compliance.
 *
 * Font Usage:
 * - Satoshi: Display text, headings, hero sections (Swiss typography tradition)
 * - Manrope: Body text, UI elements, interface copy
 * - Inter: Fallback for system compatibility
 */

import localFont from "next/font/local";

/**
 * Satoshi Font Family
 *
 * A geometric sans-serif with clean, modern aesthetics.
 * Perfect for headings and display text following Swiss design principles.
 *
 * License: Commercial license required from Indian Type Foundry
 * Variable font for optimal performance and flexibility.
 */
export const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/satoshi/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
  preload: true,
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: "Arial", // Matches x-height for better fallback rendering
});

/**
 * Manrope Font Family
 *
 * Open-source geometric sans-serif designed for readability.
 * Ideal for body text and UI elements with excellent legibility.
 *
 * License: Open Font License (free to use)
 * Using individual weights for maximum browser compatibility.
 */
export const manrope = localFont({
  src: [
    {
      path: "../../public/fonts/manrope/Manrope-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/manrope/Manrope-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  fallback: ["Inter", "system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: "Arial",
});

/**
 * Font Loading Notes:
 *
 * 1. Variable Fonts: Satoshi uses variable font format for optimal performance.
 *    Single file contains all weights, reducing HTTP requests.
 *
 * 2. Font Display: 'swap' ensures text is always visible while fonts load.
 *    Prevents Flash of Invisible Text (FOIT).
 *
 * 3. Preload: Critical fonts are preloaded for faster initial render.
 *
 * 4. Fallback Chain: Inter → system-ui → -apple-system → sans-serif
 *    Ensures consistent rendering while fonts load.
 *
 * 5. Font Size: Total ~200KB (gzipped) for both font families.
 *    Acceptable overhead for custom typography.
 */
