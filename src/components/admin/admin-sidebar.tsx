"use client";

import {
  Alert01Icon,
  Analytics01Icon,
  ClipboardIcon,
  DollarCircleIcon,
  FileIcon,
  Home01Icon,
  MapsLocation01Icon,
  Message01Icon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { HugeIcon } from "@/types/icons";

type NavItem = {
  href: string;
  label: string;
  icon: HugeIcon;
};

const navigation: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home01Icon },
  { href: "/admin/users", label: "Users", icon: UserGroupIcon },
  { href: "/admin/disputes", label: "Disputes", icon: Alert01Icon },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardIcon },
  { href: "/admin/analytics", label: "Analytics", icon: Analytics01Icon },
  { href: "/admin/pricing", label: "Pricing", icon: DollarCircleIcon },
  { href: "/admin/help/articles", label: "Help Center", icon: FileIcon },
  { href: "/admin/changelog", label: "Changelog", icon: StarIcon },
  { href: "/admin/feedback", label: "Feedback", icon: Message01Icon },
  { href: "/admin/roadmap", label: "Roadmap", icon: MapsLocation01Icon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col border-neutral-200 border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-neutral-200 border-b px-6">
        <Link className="flex items-center gap-3" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-sm">
            <Image alt="Casaora" height={18} src="/isologo.svg" width={18} />
          </div>
          <span className="font-bold text-neutral-900 text-xl tracking-tight">Casaora</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all",
                active
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              )}
              href={item.href}
              key={item.href}
            >
              <HugeiconsIcon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-white" : "text-neutral-500 group-hover:text-neutral-900"
                )}
                icon={item.icon}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-neutral-200 border-t p-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <SignOutButton showLabel />
        </div>
      </div>
    </div>
  );
}
