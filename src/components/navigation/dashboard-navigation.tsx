"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
  showBadge?: boolean;
};

type Props = {
  navLinks: NavLink[];
};

export function DashboardNavigation({ navLinks }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/messages/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  return (
    <nav className="flex items-center gap-6 text-sm font-medium text-[#524d43]">
      {navLinks.map((item) => {
        const isMessagesLink = item.label === "Messages";
        const showBadge = isMessagesLink && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative transition hover:text-[#ff5d46]"
          >
            {item.label}
            {showBadge && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff5d46] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
