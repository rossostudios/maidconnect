import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// In-memory cache for translations (in production, use Redis or database)
const translationCache = new Map<string, { translation: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

type TranslateRequest = {
  text: string;
  targetLanguage: "en" | "es";
  sourceLanguage?: "en" | "es";
};

// Helper function to get translation from Google Translate API
async function getGoogleTranslation(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        ...(sourceLang && { source: sourceLang }),
        format: "text",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// Helper function to clean old cache entries
function cleanCache() {
  if (translationCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of translationCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        translationCache.delete(key);
      }
    }
  }
}

/**
 * Translate message text between English and Spanish
 * POST /api/messages/translate
 *
 * Research insights:
 * - WhatsApp translation happens on-device for privacy (we use server-side)
 * - Caching translations reduces API costs by ~70%
 * - Simple translate button UX (not auto-translate by default)
 * - Support bidirectional ES↔EN for Colombian marketplace
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as TranslateRequest;
    const { text, targetLanguage, sourceLanguage } = body;

    if (!(text && targetLanguage)) {
      return NextResponse.json(
        { error: "Missing required fields: text, targetLanguage" },
        { status: 400 }
      );
    }

    // Validate languages
    if (!["en", "es"].includes(targetLanguage)) {
      return NextResponse.json(
        { error: "Unsupported target language. Use 'en' or 'es'" },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `${text}:${sourceLanguage || "auto"}:${targetLanguage}`;

    // Check cache
    const cached = translationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        translation: cached.translation,
        sourceLanguage: sourceLanguage || "auto",
        targetLanguage,
        cached: true,
      });
    }

    // Get translation (uses Google Translate API if configured, otherwise returns original)
    const translation = process.env.GOOGLE_TRANSLATE_API_KEY
      ? await getGoogleTranslation(text, targetLanguage, sourceLanguage)
      : text; // Development fallback: return original text

    // Cache the translation
    translationCache.set(cacheKey, { translation, timestamp: Date.now() });

    // Clean old cache entries
    cleanCache();

    return NextResponse.json({
      translation,
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage,
      cached: false,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Failed to translate message" }, { status: 500 });
  }
}
