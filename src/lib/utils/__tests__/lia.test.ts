import { describe, expect, it } from "vitest";
import { baseline, colors, grid, module, spacing, typography, validate } from "../lia";

// ============================================================================
// SPACING UTILITIES
// ============================================================================

describe("spacing", () => {
  describe("grid spacing (8px base)", () => {
    it("provides access to grid scale multiples", () => {
      expect(spacing.grid(1)).toBe(4); // Tailwind scale 1 = 4px (0.5 × 8px)
      expect(spacing.grid(2)).toBe(8); // Tailwind scale 2 = 8px (1 × 8px)
      expect(spacing.grid(4)).toBe(16); // Tailwind scale 4 = 16px (2 × 8px)
      expect(spacing.grid(8)).toBe(32); // Tailwind scale 8 = 32px (4 × 8px)
    });

    it("has correct base unit", () => {
      expect(spacing.base).toBe(8);
    });
  });

  describe("baseline spacing (24px multiples)", () => {
    it("provides baseline multiples", () => {
      expect(spacing.baseline(1)).toBe(24); // 1 × 24px
      expect(spacing.baseline(2)).toBe(48); // 2 × 24px
      expect(spacing.baseline(3)).toBe(72); // 3 × 24px
      expect(spacing.baseline(4)).toBe(96); // 4 × 24px
    });

    it("has correct baseline unit", () => {
      expect(spacing.baselineUnit).toBe(24);
    });
  });

  describe("module spacing (64px multiples)", () => {
    it("provides module multiples", () => {
      expect(spacing.module(1)).toBe(64); // 1 × 64px
      expect(spacing.module(2)).toBe(128); // 2 × 64px
      expect(spacing.module(3)).toBe(192); // 3 × 64px
      expect(spacing.module(6)).toBe(384); // 6 × 64px
    });

    it("has correct module unit", () => {
      expect(spacing.moduleUnit).toBe(64);
    });
  });

  describe("design system consistency", () => {
    it("baseline is 3x base unit", () => {
      expect(spacing.baselineUnit).toBe(spacing.base * 3);
    });

    it("module is 8x base unit", () => {
      expect(spacing.moduleUnit).toBe(spacing.base * 8);
    });
  });
});

// ============================================================================
// BASELINE UTILITIES
// ============================================================================

describe("baseline", () => {
  describe("margin bottom utilities", () => {
    it("provides baseline margin bottom classes", () => {
      expect(baseline.mb[1]).toBe("mb-baseline-1"); // 24px
      expect(baseline.mb[2]).toBe("mb-baseline-2"); // 48px
      expect(baseline.mb[3]).toBe("mb-baseline-3"); // 72px
      expect(baseline.mb[4]).toBe("mb-baseline-4"); // 96px
    });
  });

  describe("margin top utilities", () => {
    it("provides baseline margin top classes", () => {
      expect(baseline.mt[1]).toBe("mt-baseline-1");
      expect(baseline.mt[2]).toBe("mt-baseline-2");
      expect(baseline.mt[3]).toBe("mt-baseline-3");
      expect(baseline.mt[4]).toBe("mt-baseline-4");
    });
  });

  describe("vertical padding utilities", () => {
    it("provides baseline padding classes", () => {
      expect(baseline.py[1]).toBe("py-baseline-1");
      expect(baseline.py[2]).toBe("py-baseline-2");
      expect(baseline.py[3]).toBe("py-baseline-3");
      expect(baseline.py[4]).toBe("py-baseline-4");
    });
  });

  describe("all utilities are strings", () => {
    it("returns string class names", () => {
      expect(typeof baseline.mb[1]).toBe("string");
      expect(typeof baseline.mt[1]).toBe("string");
      expect(typeof baseline.py[1]).toBe("string");
    });
  });
});

// ============================================================================
// MODULE UTILITIES
// ============================================================================

describe("module", () => {
  describe("height utilities", () => {
    it("provides module height classes", () => {
      expect(module.h[1]).toBe("h-module-1"); // 64px
      expect(module.h[2]).toBe("h-module-2"); // 128px
      expect(module.h[3]).toBe("h-module-3"); // 192px
      expect(module.h[4]).toBe("h-module-4"); // 256px
      expect(module.h[5]).toBe("h-module-5"); // 320px
      expect(module.h[6]).toBe("h-module-6"); // 384px
    });
  });

  describe("minimum height utilities", () => {
    it("provides module min-height classes", () => {
      expect(module.minH[1]).toBe("min-h-module-1");
      expect(module.minH[2]).toBe("min-h-module-2");
      expect(module.minH[3]).toBe("min-h-module-3");
      expect(module.minH[4]).toBe("min-h-module-4");
    });
  });

  describe("all utilities are strings", () => {
    it("returns string class names", () => {
      expect(typeof module.h[1]).toBe("string");
      expect(typeof module.minH[1]).toBe("string");
    });
  });
});

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

describe("typography", () => {
  describe("display typography", () => {
    it("returns display styles with className", () => {
      const xl = typography.display("xl");
      expect(xl.fontSize).toBe("72px");
      expect(xl.lineHeight).toBe("72px");
      expect(xl.className).toBe("text-[72px] leading-[72px]");
    });

    it("provides all display sizes", () => {
      expect(typography.display("xl").fontSize).toBe("72px");
      expect(typography.display("lg").fontSize).toBe("60px");
      expect(typography.display("md").fontSize).toBe("48px");
      expect(typography.display("sm").fontSize).toBe("40px");
    });
  });

  describe("heading typography", () => {
    it("returns heading styles with className", () => {
      const h1 = typography.heading("h1");
      expect(h1.fontSize).toBe("48px");
      expect(h1.lineHeight).toBe("48px");
      expect(h1.className).toBe("text-[48px] leading-[48px]");
    });

    it("provides all heading sizes", () => {
      expect(typography.heading("h1").fontSize).toBe("48px");
      expect(typography.heading("h2").fontSize).toBe("36px");
      expect(typography.heading("h3").fontSize).toBe("28px");
      expect(typography.heading("h4").fontSize).toBe("24px");
      expect(typography.heading("h5").fontSize).toBe("20px");
      expect(typography.heading("h6").fontSize).toBe("18px");
    });
  });

  describe("body typography", () => {
    it("returns body styles with className", () => {
      const base = typography.body("base");
      expect(base.fontSize).toBe("16px");
      expect(base.lineHeight).toBe("24px");
      expect(base.className).toBe("text-[16px] leading-[24px]");
    });

    it("provides all body sizes", () => {
      expect(typography.body("xl").fontSize).toBe("20px");
      expect(typography.body("lg").fontSize).toBe("18px");
      expect(typography.body("base").fontSize).toBe("16px");
      expect(typography.body("sm").fontSize).toBe("14px");
      expect(typography.body("xs").fontSize).toBe("12px");
    });
  });

  describe("custom typography", () => {
    it("generates custom baseline-aligned typography", () => {
      const custom = typography.custom(32);
      expect(custom.fontSize).toBe("32px");
      expect(custom.lineHeight).toBe("48px"); // Rounds up to nearest baseline
      expect(custom.className).toBe("text-[32px] leading-[48px]");
    });

    it("handles various custom sizes", () => {
      expect(typography.custom(16).lineHeight).toBe("24px");
      expect(typography.custom(24).lineHeight).toBe("24px");
      expect(typography.custom(48).lineHeight).toBe("48px");
    });
  });

  describe("baseline alignment", () => {
    it("all display line heights are baseline-aligned", () => {
      expect(Number.parseInt(typography.display("xl").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.display("lg").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.display("md").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.display("sm").lineHeight, 10) % 24).toBe(0);
    });

    it("all heading line heights are baseline-aligned", () => {
      expect(Number.parseInt(typography.heading("h1").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.heading("h2").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.heading("h3").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.heading("h4").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.heading("h5").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.heading("h6").lineHeight, 10) % 24).toBe(0);
    });

    it("all body line heights are baseline-aligned", () => {
      expect(Number.parseInt(typography.body("xl").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.body("lg").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.body("base").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.body("sm").lineHeight, 10) % 24).toBe(0);
      expect(Number.parseInt(typography.body("xs").lineHeight, 10) % 24).toBe(0);
    });
  });
});

// ============================================================================
// GRID UTILITIES
// ============================================================================

describe("grid", () => {
  it("provides 10-column grid class", () => {
    expect(grid.cols10).toBe("grid-cols-10");
  });

  it("provides 13-column grid class", () => {
    expect(grid.cols13).toBe("grid-cols-13");
  });

  it("all grid classes are strings", () => {
    expect(typeof grid.cols10).toBe("string");
    expect(typeof grid.cols13).toBe("string");
  });
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

describe("validate", () => {
  describe("baseline alignment", () => {
    it("validates baseline-aligned heights", () => {
      expect(validate.isBaseline(24)).toBe(true); // 1 × baseline
      expect(validate.isBaseline(48)).toBe(true); // 2 × baseline
      expect(validate.isBaseline(72)).toBe(true); // 3 × baseline
    });

    it("rejects non-baseline heights", () => {
      expect(validate.isBaseline(25)).toBe(false);
      expect(validate.isBaseline(50)).toBe(false);
    });
  });

  describe("module alignment", () => {
    it("validates module-aligned heights", () => {
      expect(validate.isModule(64)).toBe(true); // 1 × module
      expect(validate.isModule(128)).toBe(true); // 2 × module
      expect(validate.isModule(192)).toBe(true); // 3 × module
    });

    it("rejects non-module heights", () => {
      expect(validate.isModule(65)).toBe(false);
      expect(validate.isModule(100)).toBe(false);
    });
  });

  describe("module calculations", () => {
    it("calculates module count from height", () => {
      expect(validate.getModules(64)).toBe(1);
      expect(validate.getModules(128)).toBe(2);
      expect(validate.getModules(120)).toBe(2); // Rounds up
    });

    it("calculates height from module count", () => {
      expect(validate.getModuleHeight(1)).toBe(64);
      expect(validate.getModuleHeight(3)).toBe(192);
      expect(validate.getModuleHeight(5)).toBe(320);
    });
  });
});

// ============================================================================
// COLOR UTILITIES
// ============================================================================

describe("colors", () => {
  describe("background colors", () => {
    it("provides background color classes", () => {
      expect(colors.bg.default).toBe("bg-neutral-50");
      expect(colors.bg.card).toBe("bg-white");
      expect(colors.bg.muted).toBe("bg-neutral-100");
    });

    it("all background classes are strings", () => {
      expect(typeof colors.bg.default).toBe("string");
      expect(typeof colors.bg.card).toBe("string");
      expect(typeof colors.bg.muted).toBe("string");
    });
  });

  describe("text colors", () => {
    it("provides text color classes", () => {
      expect(colors.text.default).toBe("text-neutral-900");
      expect(colors.text.body).toBe("text-neutral-700");
      expect(colors.text.muted).toBe("text-neutral-600");
    });

    it("all text classes are strings", () => {
      expect(typeof colors.text.default).toBe("string");
      expect(typeof colors.text.body).toBe("string");
      expect(typeof colors.text.muted).toBe("string");
    });
  });

  describe("border colors", () => {
    it("provides border color classes", () => {
      expect(colors.border.default).toBe("border-neutral-200");
      expect(colors.border.muted).toBe("border-neutral-100");
    });

    it("all border classes are strings", () => {
      expect(typeof colors.border.default).toBe("string");
      expect(typeof colors.border.muted).toBe("string");
    });
  });

  describe("interactive colors", () => {
    it("provides interactive color classes", () => {
      expect(colors.interactive.primary).toBe("bg-orange-500 text-white");
      expect(colors.interactive.primaryHover).toBe("hover:bg-orange-600");
      expect(colors.interactive.link).toBe("text-orange-600 hover:text-orange-700");
    });

    it("all interactive classes are strings", () => {
      expect(typeof colors.interactive.primary).toBe("string");
      expect(typeof colors.interactive.primaryHover).toBe("string");
      expect(typeof colors.interactive.link).toBe("string");
    });
  });

  describe("color system consistency", () => {
    it("uses neutral palette for backgrounds and text", () => {
      expect(colors.bg.default).toContain("neutral");
      expect(colors.text.default).toContain("neutral");
      expect(colors.border.default).toContain("neutral");
    });

    it("uses orange palette for interactive elements", () => {
      expect(colors.interactive.primary).toContain("orange");
      expect(colors.interactive.primaryHover).toContain("orange");
      expect(colors.interactive.link).toContain("orange");
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Lia Design System Integration", () => {
  it("provides consistent spacing hierarchy", () => {
    expect(spacing.base).toBe(8);
    expect(spacing.baselineUnit).toBe(24);
    expect(spacing.moduleUnit).toBe(64);

    // Verify mathematical relationships
    expect(spacing.baselineUnit / spacing.base).toBe(3);
    expect(spacing.moduleUnit / spacing.base).toBe(8);
  });

  it("typography aligns to baseline grid", () => {
    const sizes = [
      typography.display("xl"),
      typography.heading("h1"),
      typography.body("base"),
      typography.custom(32),
    ];

    for (const typo of sizes) {
      const lineHeight = Number.parseInt(typo.lineHeight, 10);
      expect(lineHeight % spacing.baselineUnit).toBe(0);
    }
  });

  it("some module heights align to baseline grid", () => {
    // Module (64px) and baseline (24px) don't always align
    // 64px / 24 = 2.666... (not aligned)
    // 192px / 24 = 8 (aligned!)
    // 384px / 24 = 16 (aligned!)
    expect(validate.isBaseline(validate.getModuleHeight(1))).toBe(false); // 64px
    expect(validate.isBaseline(validate.getModuleHeight(2))).toBe(false); // 128px
    expect(validate.isBaseline(validate.getModuleHeight(3))).toBe(true); // 192px (8 × 24)
    expect(validate.isBaseline(validate.getModuleHeight(4))).toBe(false); // 256px
    expect(validate.isBaseline(validate.getModuleHeight(5))).toBe(false); // 320px
    expect(validate.isBaseline(validate.getModuleHeight(6))).toBe(true); // 384px (16 × 24)
  });

  it("all utilities return correct types", () => {
    // Spacing returns numbers
    expect(typeof spacing.grid(1)).toBe("number");
    expect(typeof spacing.baseline(1)).toBe("number");

    // Baseline/module return strings (class names)
    expect(typeof baseline.mb[1]).toBe("string");
    expect(typeof module.h[1]).toBe("string");

    // Typography returns objects with string properties
    const typo = typography.body("base");
    expect(typeof typo.fontSize).toBe("string");
    expect(typeof typo.lineHeight).toBe("string");
    expect(typeof typo.className).toBe("string");

    // Colors return strings (class names)
    expect(typeof colors.bg.default).toBe("string");

    // Validate returns booleans or numbers
    expect(typeof validate.isBaseline(24)).toBe("boolean");
    expect(typeof validate.getModules(64)).toBe("number");
  });
});
