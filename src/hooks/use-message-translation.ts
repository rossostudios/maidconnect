import { useEffect, useState } from "react";
import type { Message } from "@/components/messaging/messaging-interface";
import type { SupportedLanguage } from "@/lib/translation";
import { detectLanguage, translateText } from "@/lib/translation";

export function useMessageTranslation(
  messages: Message[],
  translationEnabled: boolean,
  targetLanguage: SupportedLanguage
) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!translationEnabled) {
      setTranslations({});
      return;
    }

    const translateMessages = async () => {
      for (const msg of messages) {
        // Skip if already translated or currently translating
        if (translations[msg.id] || translatingIds.has(msg.id)) {
          continue;
        }

        // Detect source language
        const sourceLang = detectLanguage(msg.message);

        // Skip if already in target language
        if (sourceLang === targetLanguage) {
          continue;
        }

        // Mark as translating
        setTranslatingIds((prev) => new Set([...prev, msg.id]));

        try {
          const result = await translateText(msg.message, sourceLang, targetLanguage);
          setTranslations((prev) => ({
            ...prev,
            [msg.id]: result.translatedText,
          }));
        } catch {
          // Silently fail - show original message
        } finally {
          setTranslatingIds((prev) => {
            const next = new Set(prev);
            next.delete(msg.id);
            return next;
          });
        }
      }
    };

    translateMessages();
  }, [translationEnabled, messages, targetLanguage, translations, translatingIds]);

  return {
    translations,
    translatingIds,
  };
}
