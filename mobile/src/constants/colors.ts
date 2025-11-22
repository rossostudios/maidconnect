/**
 * Lia Design System Colors - Mobile
 * Anthropic-inspired color palette for Casaora mobile app
 */

export const Colors = {
  // Neutral (Anthropic Warm Grays)
  neutral: {
    50: "#FAF9F5", // Background - Anthropic light
    100: "#F5F4F0",
    200: "#E8E6DC", // Borders - Anthropic light-gray
    300: "#D4D2C8",
    400: "#C0BEB4",
    500: "#B0AEA5", // Mid-gray - Anthropic
    600: "#8B8983",
    700: "#68665F", // Body text
    800: "#3D3C38",
    900: "#141413", // Headings - Anthropic dark
  },

  // Orange (Primary Accent - Anthropic)
  orange: {
    50: "#FAF0ED", // Highlights
    100: "#F5E1DB",
    200: "#EBCABF",
    300: "#E1AEA0",
    400: "#DD9279",
    500: "#D97757", // Primary CTA - Anthropic orange
    600: "#C56847", // Links, hover - Anthropic hover
    700: "#B15937", // Active state
    800: "#8A4529",
    900: "#63321D",
  },

  // Blue (Secondary Accent - Anthropic)
  blue: {
    50: "#EFF4F9",
    100: "#D9E7F2",
    200: "#B8D4E8",
    300: "#93BDDC",
    400: "#7CACD4",
    500: "#6A9BCC", // Info states - Anthropic blue
    600: "#5A8BBC", // Info hover - Anthropic blue hover
    700: "#4A72A0",
    800: "#3A5B85",
    900: "#2A445F",
  },

  // Green (Success Accent - Anthropic)
  green: {
    50: "#F3F5F0",
    100: "#E6EAE0",
    200: "#CED6C4",
    300: "#B0BCA0",
    400: "#9CA782",
    500: "#788C5D", // Success states - Anthropic green
    600: "#687C4D", // Success hover - Anthropic green hover
    700: "#576640",
    800: "#465033",
    900: "#353A26",
  },

  // Semantic Colors
  white: "#FFFFFF",
  black: "#000000",

  error: "#DC2626",
  warning: "#F59E0B",
  info: "#6A9BCC",
  success: "#788C5D",

  // Background Colors
  background: "#FAF9F5",
  card: "#FFFFFF",
  border: "#E8E6DC",

  // Text Colors
  text: {
    primary: "#141413",
    secondary: "#68665F",
    tertiary: "#B0AEA5",
    inverse: "#FFFFFF",
  },
} as const;

export type ColorKey = keyof typeof Colors;
