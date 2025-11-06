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
      <Button className="bg-gray-900 text-white hover:bg-[#2d2822]" href={href} label={label} />
      {unreadCount > 0 && (
        <span className="-right-1 -top-1 absolute flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E85D48] px-1.5 font-bold text-white text-xs">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </div>
  );
}
