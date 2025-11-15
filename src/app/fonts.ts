/**
 * Custom Font Configuration for Casaora Admin
 *
 * Uses Vercel's Geist font family for exceptional readability and precision.
 * Geist is designed specifically for interfaces and data display.
 *
 * Font Usage:
 * - Geist Sans: UI text, labels, headings - clean and readable
 * - Geist Mono: Numbers, data, metrics, code - precise and authoritative
 * - Satoshi/Manrope: Preserved for marketing site
 */

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

/**
 * Geist Sans - Primary Admin UI Font
 *
 * Modern sans-serif designed by Vercel for maximum readability.
 * Perfect for labels, headings, and interface text.
 *
 * Features:
 * - Optimized for screen readability
 * - Excellent spacing and kerning
 * - Wide range of weights
 * - Variable font for performance
 */
export const geistSans = GeistSans;

/**
 * Geist Mono - Data Display Font
 *
 * Monospace font designed for code, data, and numbers.
 * Creates a precise, authoritative feel for metrics and analytics.
 *
 * Features:
 * - Tabular figures (numbers align vertically)
 * - Clear distinction between similar characters (0/O, 1/I/l)
 * - Professional, technical aesthetic
 * - Perfect for dashboards and data tables
 */
export const geistMono = GeistMono;

/**
 * Satoshi Font Family (Marketing Site)
 *
 * Preserved for marketing pages to maintain brand consistency.
 * Use Geist for admin interfaces.
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
  adjustFontFallback: "Arial",
});

/**
 * Manrope Font Family (Marketing Site)
 *
 * Preserved for marketing pages to maintain brand consistency.
 * Use Geist for admin interfaces.
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
 * Font Usage Guidelines:
 *
 * ADMIN DASHBOARD:
 * - Use Geist Sans for all text, labels, headings
 * - Use Geist Mono for numbers, metrics, data values, timestamps
 *
 * MARKETING SITE:
 * - Use Satoshi for headings and display text
 * - Use Manrope for body text and UI elements
 *
 * This separation ensures:
 * - Admin feels professional, precise, data-focused
 * - Marketing feels warm, approachable, brand-focused
 */
