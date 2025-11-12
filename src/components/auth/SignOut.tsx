"use client";

import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { signOutAction } from "@/app/[locale]/auth/actions";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showLabel?: boolean;
  isCollapsed?: boolean;
};

/**
 * Sign Out Button with loading state and visual feedback
 * Provides a smooth logout experience with immediate visual response
 */
export function SignOutButton({ className, showLabel = true, isCollapsed = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    setIsSigningOut(true);
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (_error) {
        // Error is handled by server action
        // Reset state if somehow we're still here
        setIsSigningOut(false);
      }
    });
  };

  const isLoading = isPending || isSigningOut;

  return (
    <button
      aria-label={isLoading ? "Signing out..." : "Sign out"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-[neutral-400] text-sm transition-all hover:bg-[neutral-50] hover:text-[neutral-500]",
        isCollapsed && "justify-center",
        isLoading && "cursor-wait opacity-50",
        className
      )}
      disabled={isLoading}
      onClick={handleSignOut}
      title={isCollapsed ? (isLoading ? "Signing out..." : "Sign out") : undefined}
      type="button"
    >
      {/* Icon with loading animation */}
      <div className={cn("relative", isLoading && "animate-pulse")}>
        <HugeiconsIcon className="h-5 w-5 flex-shrink-0" icon={Logout01Icon} />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[neutral-500] border-t-transparent" />
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && !isCollapsed && (
        <span className={cn(isLoading && "opacity-70")}>
          {isLoading ? "Signing out..." : "Sign out"}
        </span>
      )}
    </button>
  );
}
