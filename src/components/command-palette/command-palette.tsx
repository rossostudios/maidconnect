"use client";

import { Command } from "cmdk";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import type { AppRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  category: string;
  roles?: AppRole[];
};

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  role?: AppRole;
  dashboardPath?: string;
};

export function CommandPalette({ open, onClose, role, dashboardPath }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Navigate helper
  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      onClose();
    },
    [router, onClose]
  );

  // Define all commands
  const allCommands: CommandItem[] = [
    // Navigation - Dashboard
    {
      id: "goto-dashboard",
      label: "Go to Dashboard",
      description: "View your dashboard home",
      category: "Navigation",
      action: () => {
        if (dashboardPath) {
          navigate(dashboardPath);
        }
      },
    },
    // Navigation - Bookings
    {
      id: "goto-bookings",
      label: "Go to Bookings",
      description: "Manage your bookings",
      category: "Navigation",
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/bookings");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/bookings");
        }
      },
    },
    // Navigation - Messages
    {
      id: "goto-messages",
      label: "Go to Messages",
      description: "View your messages",
      category: "Navigation",
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/messages");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/messages");
        }
      },
    },
    // Navigation - Notifications
    {
      id: "goto-notifications",
      label: "Go to Notifications",
      description: "View your notifications",
      category: "Navigation",
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/notifications");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/notifications");
        }
      },
    },
    // Navigation - Profile (professional only)
    {
      id: "goto-profile",
      label: "Go to Profile",
      description: "Edit your profile",
      category: "Navigation",
      roles: ["professional"],
      action: () => navigate("/dashboard/pro/profile"),
    },
    // Navigation - Favorites (customer only)
    {
      id: "goto-favorites",
      label: "Go to Favorites",
      description: "View your favorite professionals",
      category: "Navigation",
      roles: ["customer"],
      action: () => navigate("/dashboard/customer/favorites"),
    },
    // Navigation - Payments/Finances
    {
      id: "goto-payments",
      label: role === "professional" ? "Go to Finances" : "Go to Payments",
      description:
        role === "professional" ? "View your earnings and payouts" : "View your payment history",
      category: "Navigation",
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/payments");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/finances");
        }
      },
    },
    // Navigation - Availability (professional only)
    {
      id: "goto-availability",
      label: "Go to Availability",
      description: "Manage your availability",
      category: "Navigation",
      roles: ["professional"],
      action: () => navigate("/dashboard/pro/availability"),
    },
    // Navigation - Portfolio (professional only)
    {
      id: "goto-portfolio",
      label: "Go to Portfolio",
      description: "Manage your portfolio",
      category: "Navigation",
      roles: ["professional"],
      action: () => navigate("/dashboard/pro/portfolio"),
    },
    // Navigation - Addresses (customer only)
    {
      id: "goto-addresses",
      label: "Go to Addresses",
      description: "Manage your service addresses",
      category: "Navigation",
      roles: ["customer"],
      action: () => navigate("/dashboard/customer/addresses"),
    },
    // Actions - New Booking (customer only)
    {
      id: "create-booking",
      label: "Find a Professional",
      description: "Search for professionals and create a booking",
      category: "Actions",
      roles: ["customer"],
      action: () => navigate("/professionals"),
    },
    // Actions - New Availability (professional only)
    {
      id: "create-availability",
      label: "Add Availability",
      description: "Add new availability slots",
      category: "Actions",
      roles: ["professional"],
      action: () => navigate("/dashboard/pro/availability"),
    },
    // Settings
    {
      id: "goto-settings",
      label: "Go to Settings",
      description: "Manage your account settings",
      category: "Settings",
      action: () => {
        if (role === "customer") {
          navigate("/dashboard/customer/settings");
        }
        if (role === "professional") {
          navigate("/dashboard/pro/settings");
        }
      },
    },
  ];

  // Filter commands by role
  const commands = allCommands.filter((cmd) => {
    if (!cmd.roles) {
      return true;
    }
    if (!role) {
      return false;
    }
    return cmd.roles.includes(role);
  });

  // Group commands by category
  const categories = Array.from(new Set(commands.map((cmd) => cmd.category)));

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Command Palette */}
      <div className="-translate-x-1/2 fixed top-[20%] left-1/2 z-60 w-full max-w-2xl">
        <Command
          className="rounded-2xl border border-[#dcd6c7] bg-[#fefcf9] shadow-2xl"
          shouldFilter={true}
        >
          {/* Search Input */}
          <div className="flex items-center border-[#dcd6c7] border-b px-4">
            <svg
              className="mr-3 h-5 w-5 text-[#7a6d62]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <Command.Input
              className="h-14 w-full bg-transparent text-[#2e2419] text-base placeholder:text-[#7a6d62] focus:outline-none"
              onValueChange={setSearch}
              placeholder="Search for commands..."
              value={search}
            />
            <button
              aria-label="Close command palette"
              className="ml-2 rounded-lg p-2 text-[#7a6d62] transition-colors hover:bg-[#f5f0e8] hover:text-[#2e2419]"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Command List */}
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-[#7a6d62] text-sm">
              No results found.
            </Command.Empty>

            {categories.map((category) => (
              <Command.Group
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#7a6d62] [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
                heading={category}
                key={category}
              >
                {commands
                  .filter((cmd) => cmd.category === category)
                  .map((cmd) => (
                    <Command.Item
                      className={cn(
                        "group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                        "text-[#2e2419]",
                        "hover:bg-[#f5f0e8]",
                        "aria-selected:bg-[#8B7355] aria-selected:text-white"
                      )}
                      key={cmd.id}
                      onSelect={() => {
                        cmd.action();
                      }}
                      value={`${cmd.label} ${cmd.description || ""}`}
                    >
                      {cmd.icon && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f5f0e8] text-[#5d574b] group-aria-selected:bg-white/20 group-aria-selected:text-white">
                          {cmd.icon}
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="text-[#7a6d62] text-xs group-aria-selected:text-white/80">
                            {cmd.description}
                          </span>
                        )}
                      </div>
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-[#dcd6c7] border-t px-4 py-3 text-[#7a6d62] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="rounded border border-[#dcd6c7] bg-[#f5f0e8] px-1.5 py-1 font-mono text-xs">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded border border-[#dcd6c7] bg-[#f5f0e8] px-1.5 py-1 font-mono text-xs">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded border border-[#dcd6c7] bg-[#f5f0e8] px-1.5 py-1 font-mono text-xs">
                  Esc
                </kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </>
  );
}
