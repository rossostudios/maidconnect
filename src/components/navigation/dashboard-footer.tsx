"use client";

import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts/keyboard-shortcuts-button";
import { Link } from "@/i18n/routing";
import { useChangelogUnreadCount } from "@/hooks/use-changelog-unread-count";
import { useTranslations } from "next-intl";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();
  const { unreadCount } = useChangelogUnreadCount();
  const t = useTranslations("changelog");

  return (
    <footer className="border-[#ebe5d8] border-t bg-[#fbfaf9] py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-[#7d7566] text-sm sm:flex-row">
          <p>© {currentYear} MaidConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="transition hover:text-[#ff5d46]" href="/support/account-suspended">
              Support
            </Link>
            <Link className="transition hover:text-[#ff5d46]" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-[#ff5d46]" href="/terms">
              Terms
            </Link>
            <Link className="relative transition hover:text-[#ff5d46]" href="/changelog">
              {t("whatsNew")}
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5d46] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                const feedbackBtn = document.querySelector('[data-feedback-button]') as HTMLButtonElement;
                if (feedbackBtn) feedbackBtn.click();
              }}
              className="transition hover:text-[#ff5d46]"
              type="button"
            >
              Feedback
            </button>
            <KeyboardShortcutsButton variant="light" />
          </div>
        </div>
      </div>
    </footer>
  );
}
