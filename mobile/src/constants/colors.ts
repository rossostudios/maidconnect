/**
 * Lia Design System Colors - Mobile
 * Airbnb-inspired color palette for Casaora mobile app
 * Updated: Deep Burgundy Wine palette
 */

export const Colors = {
  // Neutral (Airbnb Cool Grays)
  neutral: {
    50: "#F7F7F7", // Background - Airbnb page background
    100: "#EBEBEB",
    200: "#DDDDDD", // Borders - Airbnb dividers
    300: "#C2C2C2",
    400: "#A8A8A8",
    500: "#767676", // Mid-gray - Airbnb Foggy
    600: "#5E5E5E",
    700: "#484848", // Body text - Airbnb Hof
    800: "#333333",
    900: "#222222", // Headings - Airbnb
  },

  // Rausch (Primary Accent - Deep Burgundy Wine)
  rausch: {
    50: "#F6EDEE", // Lightest burgundy tint
    100: "#E4CAD0", // Very light burgundy
    200: "#C79BA6", // Light burgundy
    300: "#A87383", // Medium-light burgundy
    400: "#8F5261", // Medium burgundy
    500: "#7A3B4A", // Primary CTA (Burgundy)
    600: "#6B3340", // Links, hover
    700: "#5D2B35", // Active state
    800: "#4F242C", // Pressed state
    900: "#421D24", // Darkest burgundy
  },

  // Babu (Secondary Accent - Airbnb Teal)
  babu: {
    50: "#E6F7F6", // Highlights
    100: "#CCF0EE",
    200: "#99E1DD",
    300: "#66D2CC",
    400: "#33C3BB",
    500: "#00A699", // Info/Secondary - Airbnb teal
    600: "#008F84", // Info hover
    700: "#007870", // Active state
    800: "#00615B",
    900: "#004A47",
  },

  // Green (Success Accent - unchanged)
  green: {
    50: "#F3F5F0",
    100: "#E6EAE0",
    200: "#CED6C4",
    300: "#B0BCA0",
    400: "#9CA782",
    500: "#788C5D", // Success states
    600: "#687C4D", // Success hover
    700: "#576640",
    800: "#465033",
    900: "#353A26",
  },

  // Legacy aliases for backward compatibility
  orange: {
    50: "#F6EDEE",
    100: "#E4CAD0",
    200: "#C79BA6",
    300: "#A87383",
    400: "#8F5261",
    500: "#7A3B4A", // Maps to rausch-500 (Burgundy)
    600: "#6B3340",
    700: "#5D2B35",
    800: "#4F242C",
    900: "#421D24",
  },

  blue: {
    50: "#E6F7F6",
    100: "#CCF0EE",
    200: "#99E1DD",
    300: "#66D2CC",
    400: "#33C3BB",
    500: "#00A699", // Maps to babu-500
    600: "#008F84",
    700: "#007870",
    800: "#00615B",
    900: "#004A47",
  },

  // Semantic Colors
  white: "#FFFFFF",
  black: "#000000",

  error: "#DC2626",
  warning: "#F59E0B",
  info: "#00A699", // babu-500
  success: "#788C5D",

  // Background Colors
  background: "#F7F7F7", // Airbnb
  card: "#FFFFFF",
  border: "#DDDDDD", // Airbnb

  // Text Colors
  text: {
    primary: "#222222", // Airbnb
    secondary: "#484848", // Airbnb Hof
    tertiary: "#767676", // Airbnb Foggy
    inverse: "#FFFFFF",
  },
} as const;

export type ColorKey = keyof typeof Colors;
