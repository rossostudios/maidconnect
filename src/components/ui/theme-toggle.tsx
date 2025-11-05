"use client";

import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "@/components/providers/theme-provider";

type ThemeToggleProps = {
  /**
   * Size variant
   * @default "default"
   */
  size?: "default" | "sm" | "lg";
  /**
   * Show label text
   * @default false
   */
  showLabel?: boolean;
};

/**
 * Theme toggle button for switching between light and dark mode
 * Includes smooth transition animations
 */
export function ThemeToggle({ size = "default", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const sizeClasses = {
    sm: "h-9 w-9",
    default: "h-11 w-11",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      className={`${sizeClasses[size]} ${showLabel ? "w-auto gap-2 px-4" : ""} flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white text-[var(--foreground)] transition-all hover:scale-105 hover:border-[var(--foreground)] active:scale-95 dark:border-[#3a3530] dark:bg-[var(--foreground)] dark:text-[var(--background)] dark:hover:border-[var(--background)]`}
      onClick={toggleTheme}
      type="button"
    >
      {resolvedTheme === "dark" ? (
        <>
          <HugeiconsIcon
            className={`${iconSizes[size]} rotate-0 transition-transform duration-300`}
            icon={Sun01Icon}
          />
          {showLabel && <span className="font-medium text-sm">Light</span>}
        </>
      ) : (
        <>
          <HugeiconsIcon
            className={`${iconSizes[size]} rotate-0 transition-transform duration-300`}
            icon={Moon02Icon}
          />
          {showLabel && <span className="font-medium text-sm">Dark</span>}
        </>
      )}
    </button>
  );
}
