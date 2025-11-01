"use client";

import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts/keyboard-shortcuts-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Client component for footer action buttons
 * Separated to allow theme toggle (client component) in server-rendered footer
 */
export function SiteFooterActions() {
  return (
    <div className="flex items-center gap-4">
      <KeyboardShortcutsButton variant="dark" />
      <ThemeToggle size="sm" />
      <div className="footer-language-switcher">
        <LanguageSwitcher variant="dark" />
      </div>
    </div>
  );
}
