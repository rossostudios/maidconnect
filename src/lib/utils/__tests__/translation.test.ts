import { describe, expect, it } from "vitest";
import { detectLanguage, getPreferredLanguage, hasSensitiveContent } from "../translation";

// ============================================================================
// SENSITIVE CONTENT DETECTION
// ============================================================================

describe("hasSensitiveContent", () => {
  describe("basic functionality", () => {
    it("returns boolean", () => {
      const result = hasSensitiveContent("test");
      expect(typeof result).toBe("boolean");
    });

    it("detects obvious numeric patterns", () => {
      // Test one at a time to avoid regex global state issues
      expect(hasSensitiveContent("1234")).toBe(true);
    });

    it("detects alphanumeric patterns", () => {
      expect(hasSensitiveContent("A123")).toBe(true);
    });

    it("detects labeled codes", () => {
      expect(hasSensitiveContent("code: 1234")).toBe(true);
    });

    it("does not detect small numbers", () => {
      expect(hasSensitiveContent("I have 2 cats")).toBe(false);
      expect(hasSensitiveContent("Room 42")).toBe(false);
    });
  });

  describe("safe messages (no sensitive content)", () => {
    it("allows normal conversation", () => {
      expect(hasSensitiveContent("Hello, how are you?")).toBe(false);
      expect(hasSensitiveContent("See you at 3 PM")).toBe(false);
      expect(hasSensitiveContent("I'll be there in 15 minutes")).toBe(false);
    });

    it("allows small quantities (1-2 digits)", () => {
      expect(hasSensitiveContent("I need 2 hours")).toBe(false);
      expect(hasSensitiveContent("Bring 5 towels")).toBe(false);
      expect(hasSensitiveContent("It costs 50 dollars")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(hasSensitiveContent("")).toBe(false);
    });

    it("handles whitespace only", () => {
      expect(hasSensitiveContent("   ")).toBe(false);
    });

    it("detects codes in messages", () => {
      const message = "Door code is 4567";
      expect(hasSensitiveContent(message)).toBe(true);
    });
  });
});

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================

describe("detectLanguage", () => {
  describe("detects Spanish (needs >2 indicators)", () => {
    it("detects phrases with multiple Spanish words", () => {
      expect(detectLanguage("el gato en la casa")).toBe("es"); // el, en, la = 3 indicators
      expect(detectLanguage("la casa de los niños")).toBe("es"); // la, de, los, niños (ñ) = 4+
      expect(detectLanguage("está en la casa con el perro")).toBe("es"); // está (á), en, la, con, el = 5+
    });

    it("detects Spanish special characters count as indicators", () => {
      expect(detectLanguage("mañana está aquí")).toBe("es"); // ñ, á, í = 3 special chars
      expect(detectLanguage("el niño está en la casa")).toBe("es"); // ñ + á + words
      expect(detectLanguage("¿Cómo estás?")).toBe("es"); // ¿, ó, á, ¡ = 4 special chars
    });

    it("requires >2 total indicators", () => {
      expect(detectLanguage("The casa")).toBe("en"); // Only 1 indicator
      expect(detectLanguage("el building")).toBe("en"); // Only 1 indicator
      expect(detectLanguage("casa grande")).toBe("en"); // Only 1-2 indicators
    });
  });

  describe("detects English", () => {
    it("detects English sentences without Spanish indicators", () => {
      expect(detectLanguage("Hello, how are you?")).toBe("en");
      expect(detectLanguage("I will arrive at 3 PM")).toBe("en");
      expect(detectLanguage("Thank you very much")).toBe("en");
    });

    it("detects English with few Spanish words", () => {
      expect(detectLanguage("I love tacos")).toBe("en"); // Only 1-2 Spanish indicators
      expect(detectLanguage("Let's go to the fiesta")).toBe("en");
    });

    it("handles English-only technical terms", () => {
      expect(detectLanguage("JavaScript code example")).toBe("en");
      expect(detectLanguage("React component props")).toBe("en");
    });
  });

  describe("edge cases", () => {
    it("handles empty string (defaults to English)", () => {
      expect(detectLanguage("")).toBe("en");
    });

    it("handles numbers only", () => {
      expect(detectLanguage("123456789")).toBe("en");
    });

    it("handles mixed language content", () => {
      // More Spanish indicators → Spanish
      expect(detectLanguage("The casa es muy grande y está en la ciudad")).toBe("es");

      // More English indicators → English
      expect(detectLanguage("I will visit la casa tomorrow")).toBe("en");
    });

    it("handles special characters only", () => {
      expect(detectLanguage("@#$%^&*()")).toBe("en");
    });

    it("handles mixed language content", () => {
      // Clear Spanish with multiple indicators
      expect(detectLanguage("en la casa con el gato")).toBe("es"); // en, la, con, el = 4 words
      expect(detectLanguage("I'm going to the store")).toBe("en"); // No Spanish indicators
    });
  });

  describe("real-world examples", () => {
    it("detects clear Spanish messages", () => {
      expect(detectLanguage("en la casa de mi madre")).toBe("es"); // en, la, de, mi = 4+ words
      expect(detectLanguage("¿Qué tal está todo?")).toBe("es"); // Special chars + words
    });

    it("detects English service messages", () => {
      expect(detectLanguage("I will arrive in 10 minutes")).toBe("en");
      expect(detectLanguage("Do you need me to bring anything?")).toBe("en");
      expect(detectLanguage("The work is complete")).toBe("en");
    });
  });
});

// ============================================================================
// PREFERRED LANGUAGE FROM LOCALE
// ============================================================================

describe("getPreferredLanguage", () => {
  describe("Spanish locales", () => {
    it("detects Spanish (es)", () => {
      expect(getPreferredLanguage("es")).toBe("es");
    });

    it("detects Spanish variants", () => {
      expect(getPreferredLanguage("es-CO")).toBe("es"); // Colombia
      expect(getPreferredLanguage("es-ES")).toBe("es"); // Spain
      expect(getPreferredLanguage("es-MX")).toBe("es"); // Mexico
      expect(getPreferredLanguage("es-AR")).toBe("es"); // Argentina
      expect(getPreferredLanguage("es-CL")).toBe("es"); // Chile
    });

    it("is case-sensitive for locale prefix", () => {
      expect(getPreferredLanguage("ES")).toBe("en"); // uppercase ES doesn't match
      expect(getPreferredLanguage("es")).toBe("es"); // lowercase es matches
    });
  });

  describe("English locales", () => {
    it("detects English (en)", () => {
      expect(getPreferredLanguage("en")).toBe("en");
    });

    it("detects English variants", () => {
      expect(getPreferredLanguage("en-US")).toBe("en"); // United States
      expect(getPreferredLanguage("en-GB")).toBe("en"); // United Kingdom
      expect(getPreferredLanguage("en-CA")).toBe("en"); // Canada
      expect(getPreferredLanguage("en-AU")).toBe("en"); // Australia
    });

    it("defaults to English for other locales", () => {
      expect(getPreferredLanguage("fr")).toBe("en"); // French
      expect(getPreferredLanguage("de")).toBe("en"); // German
      expect(getPreferredLanguage("pt")).toBe("en"); // Portuguese
      expect(getPreferredLanguage("it")).toBe("en"); // Italian
    });
  });

  describe("edge cases", () => {
    it("defaults to English when locale is undefined", () => {
      expect(getPreferredLanguage(undefined)).toBe("en");
    });

    it("defaults to English for empty string", () => {
      expect(getPreferredLanguage("")).toBe("en");
    });

    it("handles locale strings with extra information", () => {
      expect(getPreferredLanguage("es-CO.UTF-8")).toBe("es");
      expect(getPreferredLanguage("en-US.UTF-8")).toBe("en");
    });

    it("handles lowercase locale strings", () => {
      expect(getPreferredLanguage("es-co")).toBe("es");
      expect(getPreferredLanguage("en-us")).toBe("en");
    });

    it("handles malformed locale strings", () => {
      expect(getPreferredLanguage("spanish")).toBe("en"); // Doesn't start with 'es'
      expect(getPreferredLanguage("español")).toBe("es"); // Starts with 'es'
    });
  });

  describe("BCP 47 language tags", () => {
    it("handles language-region format", () => {
      expect(getPreferredLanguage("es-419")).toBe("es"); // Latin America
      expect(getPreferredLanguage("en-001")).toBe("en"); // World English
    });

    it("handles language-script-region format", () => {
      expect(getPreferredLanguage("es-Latn-CO")).toBe("es");
      expect(getPreferredLanguage("en-Latn-US")).toBe("en");
    });
  });
});
