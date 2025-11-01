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
            "fixed right-6 bottom-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff5d46] text-white shadow-lg transition-shadow hover:shadow-xl",
            className
          )}
          onClick={() => setIsOpen(true)}
        >
          <EttaIcon className="text-white" size={36} />
        </button>
      )}

      {/* Chat Interface */}
      <EttaChatInterface isOpen={isOpen} locale={locale} onClose={() => setIsOpen(false)} />
    </>
  );
}
