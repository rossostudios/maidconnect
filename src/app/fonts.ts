/**
 * Font Configuration for Casaora - Lia Design System
 *
 * Uses Vercel's Geist font family exclusively across all surfaces for:
 * - Exceptional readability and precision
 * - Consistent brand experience (admin + marketing)
 * - Bloomberg Terminal-inspired professional aesthetic
 *
 * Font Usage:
 * - Geist Sans: All UI text, labels, headings, body copy
 * - Geist Mono: Numbers, data, metrics, code, timestamps
 *
 * Lia Design Philosophy:
 * - One unified typography system
 * - Sharp, clean, professional across all touchpoints
 * - Data-focused aesthetic that builds trust
 */

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/**
 * Geist Sans - Primary Font (All Surfaces)
 *
 * Modern sans-serif designed by Vercel for maximum readability.
 * Used for all text content across marketing, dashboard, and admin.
 *
 * Features:
 * - Optimized for screen readability at all sizes
 * - Excellent spacing and kerning
 * - Wide range of weights (100-900)
 * - Variable font for performance
 * - Professional, trustworthy aesthetic
 *
 * Usage:
 * - Marketing: Headings, body text, CTAs, navigation
 * - Dashboard: All UI text, labels, descriptions
 * - Admin: Headings, form labels, table headers
 */
export const geistSans = GeistSans;

/**
 * Geist Mono - Data Display Font (All Surfaces)
 *
 * Monospace font designed for code, data, and numbers.
 * Creates a precise, authoritative feel for metrics and analytics.
 *
 * Features:
 * - Tabular figures (numbers align vertically)
 * - Clear distinction between similar characters (0/O, 1/I/l)
 * - Professional, technical aesthetic
 * - Perfect for dashboards and data tables
 *
 * Usage:
 * - Marketing: Pricing tables, statistics, metrics
 * - Dashboard: All numbers, timestamps, data values
 * - Admin: Tables, metrics, analytics, IDs
 */
export const geistMono = GeistMono;

/**
 * Font Usage Guidelines - Lia Design System:
 *
 * ALL SURFACES (Marketing, Dashboard, Admin, Error Pages):
 * - Use Geist Sans for all text, labels, headings, body copy
 * - Use Geist Mono for numbers, metrics, data values, timestamps, IDs
 *
 * Typography Scale (Baseline-Aligned):
 * - H1: 48px / 48px line-height (Geist Sans Bold)
 * - H2: 36px / 48px line-height (Geist Sans Semibold)
 * - H3: 24px / 24px line-height (Geist Sans Semibold)
 * - Body: 16px / 24px line-height (Geist Sans Regular)
 * - Small: 14px / 24px line-height (Geist Sans Regular)
 * - Data: 14px / 24px line-height (Geist Mono Regular)
 *
 * This unified approach ensures:
 * - Consistent professional aesthetic across all touchpoints
 * - Trust and credibility through data-focused typography
 * - Superior readability and accessibility
 * - Simplified maintenance and faster development
 */
