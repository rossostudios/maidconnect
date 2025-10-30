"use client";

import { Button } from "@/components/ui/button";
import { useUnreadCount } from "@/hooks/use-unread-count";

type Props = {
  href: string;
  label?: string;
};

export function DashboardButton({ href, label = "Dashboard" }: Props) {
  const { unreadCount } = useUnreadCount();

  return (
    <div className="relative">
      <Button
        href={href}
        label={label}
        className="bg-[#211f1a] text-white hover:bg-[#2d2822]"
      />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ff5d46] px-1.5 text-xs font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
