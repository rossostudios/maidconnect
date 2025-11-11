"use client";

import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts/keyboard-shortcuts-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";

/**
 * Client component for footer action buttons
 */
export function SiteFooterActions() {
  return (
    <div className="flex items-center gap-4">
      <KeyboardShortcutsButton />
      <div className="footer-language-switcher">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
