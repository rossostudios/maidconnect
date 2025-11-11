"use client";

import { useTranslations } from "next-intl";
import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts/keyboard-shortcuts-button";
import { useFeedback } from "@/components/providers/feedback-provider";
import { useChangelogUnreadCount } from "@/hooks/use-changelog-unread-count";
import { Link } from "@/i18n/routing";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();
  const { unreadCount } = useChangelogUnreadCount();
  const { openFeedback } = useFeedback();
  const t = useTranslations("changelog");

  return (
    <footer className="border-slate-200 border-t bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-slate-600 text-sm sm:flex-row">
          <p>© {currentYear} Casaora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="transition hover:text-slate-900" href="/support/account-suspended">
              Support
            </Link>
            <Link className="transition hover:text-slate-900" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-slate-900" href="/terms">
              Terms
            </Link>
            <Link className="relative transition hover:text-slate-900" href="/changelog">
              {t("whatsNew")}
              {unreadCount > 0 && (
                <span className="-right-2 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 font-bold text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              className="transition hover:text-slate-900"
              onClick={openFeedback}
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
