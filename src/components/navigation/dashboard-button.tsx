"use client";

import { useUnreadCount } from "@/hooks/use-unread-count";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

export function DashboardButton({ href, label = "Dashboard", className }: Props) {
  const { unreadCount } = useUnreadCount();

  return (
    <div className="relative inline-block">
      <Link
        className={cn(
          "inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-900 text-sm shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100",
          className
        )}
        href={href}
      >
        {label}
      </Link>
      {unreadCount > 0 && (
        <span className="-right-1 -top-1 absolute flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-900 px-1.5 font-bold text-white text-xs">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
