const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const chunk =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = Number.parseInt(chunk, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

export const BRAND_COLORS = {
  orange: "#F44A22",
  midnight: "#161616",
  stone: "#A8AAAC",
  grey: "#E4E2E3",
  silver: "#FEF8E8",
} as const;

export type BrandColorName = keyof typeof BRAND_COLORS;
export type BrandHex = (typeof BRAND_COLORS)[BrandColorName];

export const BRAND_COLOR_VALUES = new Set<BrandHex>(Object.values(BRAND_COLORS));

export const toBrandRgba = (hex: BrandHex, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
