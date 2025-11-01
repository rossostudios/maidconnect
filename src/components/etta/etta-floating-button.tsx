"use client";

/**
 * Etta Floating Button
 *
 * A floating action button that opens the Etta chat interface.
 * Positioned in the bottom-right corner.
 */

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { EttaChatInterface } from "./etta-chat-interface";
import { EttaIcon } from "./etta-icon";

interface EttaFloatingButtonProps {
  className?: string;
  locale?: string;
}

export function EttaFloatingButton({ className, locale }: EttaFloatingButtonProps) {
  const t = useTranslations("etta");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          aria-label={t("openChat")}
          className={cn(
            "fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5d46] text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:right-6 sm:bottom-6 sm:h-16 sm:w-16",
            className
          )}
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <EttaIcon className="text-white" size={32} />
        </button>
      )}

      {/* Chat Interface */}
      <EttaChatInterface isOpen={isOpen} locale={locale} onClose={() => setIsOpen(false)} />
    </>
  );
}
