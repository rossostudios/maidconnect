/**
 * Auto-translation utilities for in-app chat
 * Week 5-6: Communications & Retention feature
 *
 * Uses LibreTranslate for free, privacy-respecting translation
 * https://github.com/LibreTranslate/LibreTranslate
 */

export type SupportedLanguage = "en" | "es";

/**
 * Sensitive field patterns that should NOT be auto-translated
 * These include door codes, addresses, phone numbers, etc.
 */
const SENSITIVE_PATTERNS = [
  /\b\d{3,}\b/g, // Numbers with 3+ digits (door codes, phone numbers)
  /\b[A-Z]\d+[A-Z]?\b/gi, // Alphanumeric codes (A123, B45C)
  /\b(?:code|código|clave|contraseña):\s*\S+/gi, // Labeled codes
];

/**
 * Check if message contains sensitive information
 */
export function hasSensitiveContent(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Translate text using LibreTranslate API
 * Falls back to showing original if translation fails
 */
export async function translateText(
  text: string,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage
): Promise<{ translatedText: string; error?: string }> {
  // Don't translate if same language
  if (sourceLang === targetLang) {
    return { translatedText: text };
  }

  // Don't translate sensitive content
  if (hasSensitiveContent(text)) {
    return {
      translatedText: text,
      error: "Contains sensitive information (not translated for safety)",
    };
  }

  try {
    // Use LibreTranslate public API (consider self-hosting for production)
    const response = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Translation API error");
    }

    const data = await response.json();
    return { translatedText: data.translatedText };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translatedText: text,
      error: "Translation unavailable",
    };
  }
}

/**
 * Detect language of text (simple heuristic)
 * For production, use a proper language detection library
 */
export function detectLanguage(text: string): SupportedLanguage {
  // Common Spanish words/patterns
  const spanishIndicators = [
    /\b(el|la|los|las|un|una|de|del|en|por|para|con|que|no|sí|está|son)\b/gi,
    /[áéíóúñ¿¡]/g,
  ];

  const spanishScore = spanishIndicators.reduce((score, pattern) => {
    const matches = text.match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);

  // If we find Spanish indicators, assume Spanish
  return spanishScore > 2 ? "es" : "en";
}

/**
 * Get user's preferred language from locale
 */
export function getPreferredLanguage(locale?: string): SupportedLanguage {
  if (!locale) return "en";
  return locale.startsWith("es") ? "es" : "en";
}
