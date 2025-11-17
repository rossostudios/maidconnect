import { describe, expect, it } from "vitest";
import {
  BASELINE,
  calculateModules,
  formatTypographyClass,
  getBaselineTypography,
  getModuleHeight,
  isBaselineAligned,
  isModuleAligned,
  MODULE,
  TYPOGRAPHY_SCALE,
} from "../typography";

// ============================================================================
// CONSTANTS
// ============================================================================

describe("BASELINE constant", () => {
  it("equals 24 pixels (3 × 8px)", () => {
    expect(BASELINE).toBe(24);
  });
});

describe("MODULE constant", () => {
  it("equals 64 pixels (8 × 8px)", () => {
    expect(MODULE).toBe(64);
  });
});

// ============================================================================
// BASELINE TYPOGRAPHY
// ============================================================================

describe("getBaselineTypography", () => {
  it("rounds up font size to nearest baseline multiple", () => {
    const result = getBaselineTypography(32);

    expect(result.fontSize).toBe("32px");
    expect(result.lineHeight).toBe("48px"); // 32 rounds up to 48 (2 × 24)
  });

  it("handles exact baseline multiples (no rounding needed)", () => {
    const result = getBaselineTypography(24);

    expect(result.fontSize).toBe("24px");
    expect(result.lineHeight).toBe("24px"); // 24 is exactly 1 × baseline
  });

  it("handles font size exactly at 48px", () => {
    const result = getBaselineTypography(48);

    expect(result.fontSize).toBe("48px");
    expect(result.lineHeight).toBe("48px"); // 48 is exactly 2 × baseline
  });

  it("rounds up small font sizes", () => {
    const result = getBaselineTypography(16);

    expect(result.fontSize).toBe("16px");
    expect(result.lineHeight).toBe("24px"); // 16 rounds up to 24 (1 × baseline)
  });

  it("rounds up slightly over baseline multiple", () => {
    const result = getBaselineTypography(25);

    expect(result.fontSize).toBe("25px");
    expect(result.lineHeight).toBe("48px"); // 25 rounds up to 48 (2 × baseline)
  });

  it("handles large display sizes", () => {
    const result = getBaselineTypography(72);

    expect(result.fontSize).toBe("72px");
    expect(result.lineHeight).toBe("72px"); // 72 is exactly 3 × baseline
  });

  it("accepts custom baseline", () => {
    const result = getBaselineTypography(20, 16);

    expect(result.fontSize).toBe("20px");
    expect(result.lineHeight).toBe("32px"); // 20 rounds up to 32 (2 × 16)
  });

  it("handles edge case of 1px font size", () => {
    const result = getBaselineTypography(1);

    expect(result.fontSize).toBe("1px");
    expect(result.lineHeight).toBe("24px"); // 1 rounds up to 24 (1 × baseline)
  });

  it("handles decimal font sizes (rounds up)", () => {
    const result = getBaselineTypography(18.5);

    expect(result.fontSize).toBe("18.5px");
    expect(result.lineHeight).toBe("24px"); // 18.5 rounds up to 24
  });
});

// ============================================================================
// MODULE CALCULATIONS
// ============================================================================

describe("calculateModules", () => {
  it("calculates modules for exact multiples", () => {
    expect(calculateModules(64)).toBe(1); // 1 × 64
    expect(calculateModules(128)).toBe(2); // 2 × 64
    expect(calculateModules(192)).toBe(3); // 3 × 64
  });

  it("rounds up for non-exact values", () => {
    expect(calculateModules(120)).toBe(2); // 120 → 2 modules (128px)
    expect(calculateModules(200)).toBe(4); // 200 → 4 modules (256px)
  });

  it("rounds up even for 1px over threshold", () => {
    expect(calculateModules(65)).toBe(2); // 65 → 2 modules
    expect(calculateModules(129)).toBe(3); // 129 → 3 modules
  });

  it("handles zero height", () => {
    expect(calculateModules(0)).toBe(0);
  });

  it("handles very small values (< 1 module)", () => {
    expect(calculateModules(1)).toBe(1); // Even 1px requires 1 module
    expect(calculateModules(32)).toBe(1); // Half module rounds up to 1
  });

  it("handles large values", () => {
    expect(calculateModules(1000)).toBe(16); // 1000 → 16 modules (1024px)
  });

  it("accepts custom module size", () => {
    expect(calculateModules(100, 50)).toBe(2); // 100 → 2 × 50 = 100
    expect(calculateModules(120, 50)).toBe(3); // 120 → 3 × 50 = 150
  });
});

describe("getModuleHeight", () => {
  it("calculates height for module count", () => {
    expect(getModuleHeight(1)).toBe(64);
    expect(getModuleHeight(2)).toBe(128);
    expect(getModuleHeight(3)).toBe(192);
    expect(getModuleHeight(5)).toBe(320);
  });

  it("handles zero modules", () => {
    expect(getModuleHeight(0)).toBe(0);
  });

  it("handles decimal modules (maintains precision)", () => {
    expect(getModuleHeight(2.5)).toBe(160); // 2.5 × 64
    expect(getModuleHeight(1.5)).toBe(96); // 1.5 × 64
  });

  it("accepts custom module size", () => {
    expect(getModuleHeight(3, 50)).toBe(150); // 3 × 50
    expect(getModuleHeight(4, 32)).toBe(128); // 4 × 32
  });

  it("handles large module counts", () => {
    expect(getModuleHeight(100)).toBe(6400); // 100 × 64
  });
});

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

describe("TYPOGRAPHY_SCALE", () => {
  describe("display sizes", () => {
    it("has correct xl display size", () => {
      expect(TYPOGRAPHY_SCALE.display.xl).toEqual({
        fontSize: "72px",
        lineHeight: "72px",
      });
    });

    it("has correct lg display size", () => {
      expect(TYPOGRAPHY_SCALE.display.lg).toEqual({
        fontSize: "60px",
        lineHeight: "72px", // Rounds up to 72 (3 × 24)
      });
    });

    it("has correct md display size", () => {
      expect(TYPOGRAPHY_SCALE.display.md).toEqual({
        fontSize: "48px",
        lineHeight: "48px",
      });
    });

    it("has correct sm display size", () => {
      expect(TYPOGRAPHY_SCALE.display.sm).toEqual({
        fontSize: "40px",
        lineHeight: "48px", // Rounds up to 48 (2 × 24)
      });
    });
  });

  describe("heading sizes", () => {
    it("has correct h1 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h1).toEqual({
        fontSize: "48px",
        lineHeight: "48px",
      });
    });

    it("has correct h2 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h2).toEqual({
        fontSize: "36px",
        lineHeight: "48px", // Rounds up to 48
      });
    });

    it("has correct h3 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h3).toEqual({
        fontSize: "28px",
        lineHeight: "48px", // Rounds up to 48
      });
    });

    it("has correct h4 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h4).toEqual({
        fontSize: "24px",
        lineHeight: "24px",
      });
    });

    it("has correct h5 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h5).toEqual({
        fontSize: "20px",
        lineHeight: "24px", // Rounds up to 24
      });
    });

    it("has correct h6 size", () => {
      expect(TYPOGRAPHY_SCALE.heading.h6).toEqual({
        fontSize: "18px",
        lineHeight: "24px", // Rounds up to 24
      });
    });
  });

  describe("body text sizes", () => {
    it("has correct xl body size", () => {
      expect(TYPOGRAPHY_SCALE.body.xl).toEqual({
        fontSize: "20px",
        lineHeight: "24px",
      });
    });

    it("has correct lg body size", () => {
      expect(TYPOGRAPHY_SCALE.body.lg).toEqual({
        fontSize: "18px",
        lineHeight: "24px",
      });
    });

    it("has correct base body size", () => {
      expect(TYPOGRAPHY_SCALE.body.base).toEqual({
        fontSize: "16px",
        lineHeight: "24px",
      });
    });

    it("has correct sm body size", () => {
      expect(TYPOGRAPHY_SCALE.body.sm).toEqual({
        fontSize: "14px",
        lineHeight: "24px",
      });
    });

    it("has correct xs body size", () => {
      expect(TYPOGRAPHY_SCALE.body.xs).toEqual({
        fontSize: "12px",
        lineHeight: "24px",
      });
    });
  });

  describe("baseline alignment", () => {
    it("all display sizes have baseline-aligned line heights", () => {
      expect(Number.parseInt(TYPOGRAPHY_SCALE.display.xl.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.display.lg.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.display.md.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.display.sm.lineHeight) % 24).toBe(0);
    });

    it("all heading sizes have baseline-aligned line heights", () => {
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h1.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h2.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h3.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h4.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h5.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.heading.h6.lineHeight) % 24).toBe(0);
    });

    it("all body sizes have baseline-aligned line heights", () => {
      expect(Number.parseInt(TYPOGRAPHY_SCALE.body.xl.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.body.lg.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.body.base.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.body.sm.lineHeight) % 24).toBe(0);
      expect(Number.parseInt(TYPOGRAPHY_SCALE.body.xs.lineHeight) % 24).toBe(0);
    });
  });
});

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

describe("formatTypographyClass", () => {
  it("formats typography object as Tailwind classes", () => {
    const typo = getBaselineTypography(32);
    const result = formatTypographyClass(typo);

    expect(result).toBe("text-[32px] leading-[48px]");
  });

  it("handles exact baseline multiples", () => {
    const typo = getBaselineTypography(24);
    const result = formatTypographyClass(typo);

    expect(result).toBe("text-[24px] leading-[24px]");
  });

  it("handles large display sizes", () => {
    const typo = getBaselineTypography(72);
    const result = formatTypographyClass(typo);

    expect(result).toBe("text-[72px] leading-[72px]");
  });

  it("handles small text sizes", () => {
    const typo = getBaselineTypography(12);
    const result = formatTypographyClass(typo);

    expect(result).toBe("text-[12px] leading-[24px]");
  });

  it("handles decimal font sizes", () => {
    const typo = getBaselineTypography(18.5);
    const result = formatTypographyClass(typo);

    expect(result).toBe("text-[18.5px] leading-[24px]");
  });
});

// ============================================================================
// ALIGNMENT CHECKS
// ============================================================================

describe("isBaselineAligned", () => {
  it("returns true for exact baseline multiples", () => {
    expect(isBaselineAligned(24)).toBe(true); // 1 × 24
    expect(isBaselineAligned(48)).toBe(true); // 2 × 24
    expect(isBaselineAligned(72)).toBe(true); // 3 × 24
    expect(isBaselineAligned(96)).toBe(true); // 4 × 24
  });

  it("returns false for non-baseline values", () => {
    expect(isBaselineAligned(25)).toBe(false);
    expect(isBaselineAligned(50)).toBe(false);
    expect(isBaselineAligned(32)).toBe(false);
  });

  it("handles zero", () => {
    expect(isBaselineAligned(0)).toBe(true); // 0 is divisible by 24
  });

  it("handles negative values", () => {
    expect(isBaselineAligned(-24)).toBe(true); // -24 is a multiple
    expect(isBaselineAligned(-25)).toBe(false);
  });

  it("accepts custom baseline", () => {
    expect(isBaselineAligned(32, 16)).toBe(true); // 32 is 2 × 16
    expect(isBaselineAligned(30, 16)).toBe(false);
  });

  it("handles decimal values (always false unless exactly divisible)", () => {
    expect(isBaselineAligned(24.5)).toBe(false);
    expect(isBaselineAligned(48.0)).toBe(true);
  });
});

describe("isModuleAligned", () => {
  it("returns true for exact module multiples", () => {
    expect(isModuleAligned(64)).toBe(true); // 1 × 64
    expect(isModuleAligned(128)).toBe(true); // 2 × 64
    expect(isModuleAligned(192)).toBe(true); // 3 × 64
    expect(isModuleAligned(256)).toBe(true); // 4 × 64
  });

  it("returns false for non-module values", () => {
    expect(isModuleAligned(65)).toBe(false);
    expect(isModuleAligned(100)).toBe(false);
    expect(isModuleAligned(120)).toBe(false);
  });

  it("handles zero", () => {
    expect(isModuleAligned(0)).toBe(true); // 0 is divisible by 64
  });

  it("handles negative values", () => {
    expect(isModuleAligned(-64)).toBe(true); // -64 is a multiple
    expect(isModuleAligned(-65)).toBe(false);
  });

  it("accepts custom module size", () => {
    expect(isModuleAligned(100, 50)).toBe(true); // 100 is 2 × 50
    expect(isModuleAligned(100, 64)).toBe(false); // 100 is not a multiple of 64
  });

  it("handles decimal values", () => {
    expect(isModuleAligned(64.5)).toBe(false);
    expect(isModuleAligned(128.0)).toBe(true);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Swiss Grid System integration", () => {
  it("baseline is exactly 3 times the base 8px unit", () => {
    expect(BASELINE).toBe(3 * 8);
  });

  it("module is exactly 8 times the base 8px unit", () => {
    expect(MODULE).toBe(8 * 8);
  });

  it("module is 8/3 times the baseline unit", () => {
    expect(MODULE / BASELINE).toBeCloseTo(8 / 3, 2);
  });

  it("all predefined typography scales align to baseline", () => {
    const allScales = [
      ...Object.values(TYPOGRAPHY_SCALE.display),
      ...Object.values(TYPOGRAPHY_SCALE.heading),
      ...Object.values(TYPOGRAPHY_SCALE.body),
    ];

    for (const scale of allScales) {
      const lineHeight = Number.parseInt(scale.lineHeight);
      expect(isBaselineAligned(lineHeight)).toBe(true);
    }
  });

  it("module (64px) and baseline (24px) share common factor (8px)", () => {
    expect(MODULE % 8).toBe(0); // 64 = 8 × 8
    expect(BASELINE % 8).toBe(0); // 24 = 3 × 8
  });
});
