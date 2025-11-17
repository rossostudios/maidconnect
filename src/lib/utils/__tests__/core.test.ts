import { describe, expect, it } from "vitest";
import { cn } from "../core";

describe("cn (className utility)", () => {
  it("joins multiple class names with spaces", () => {
    const result = cn("class1", "class2", "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("filters out falsy values", () => {
    const result = cn("class1", false, "class2", null, "class3", undefined);
    expect(result).toBe("class1 class2 class3");
  });

  it("handles empty string (keeps it)", () => {
    // Empty strings are falsy but might be intentional
    const result = cn("class1", "", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles single class name", () => {
    const result = cn("solo-class");
    expect(result).toBe("solo-class");
  });

  it("handles no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles all falsy values", () => {
    const result = cn(false, null, undefined);
    expect(result).toBe("");
  });

  it("handles conditional classes (common pattern)", () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn("base-class", isActive && "active", isDisabled && "disabled");

    expect(result).toBe("base-class active");
  });

  it("handles Tailwind CSS classes", () => {
    const result = cn(
      "flex",
      "items-center",
      "justify-between",
      "px-4",
      "py-2",
      "bg-neutral-900",
      "text-white"
    );

    expect(result).toBe("flex items-center justify-between px-4 py-2 bg-neutral-900 text-white");
  });

  it("handles complex conditional patterns", () => {
    const variant = "primary";
    const size = "lg";
    const disabled = false;

    const result = cn(
      "button",
      variant === "primary" && "bg-orange-500",
      variant === "secondary" && "bg-neutral-100",
      size === "sm" && "px-4 py-2",
      size === "lg" && "px-8 py-4",
      disabled && "opacity-50 cursor-not-allowed"
    );

    expect(result).toBe("button bg-orange-500 px-8 py-4");
  });

  it("handles mixed valid and invalid classes", () => {
    const result = cn("valid1", null, "valid2", false, undefined, "valid3");
    expect(result).toBe("valid1 valid2 valid3");
  });

  it("preserves class order", () => {
    const result = cn("first", "second", "third", "fourth");
    expect(result).toBe("first second third fourth");
  });

  it("handles responsive classes", () => {
    const result = cn("text-sm", "md:text-base", "lg:text-lg");
    expect(result).toBe("text-sm md:text-base lg:text-lg");
  });

  it("handles dark mode variants", () => {
    const result = cn("bg-white", "dark:bg-neutral-900", "text-neutral-900", "dark:text-white");
    expect(result).toBe("bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white");
  });

  it("handles hover and focus states", () => {
    const result = cn("bg-orange-500", "hover:bg-orange-600", "focus:ring-2", "focus:ring-orange-500/25");
    expect(result).toBe("bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/25");
  });
});
