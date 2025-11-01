"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface ThemeToggleProps {
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
}

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
      className={`${sizeClasses[size]} ${showLabel ? "w-auto gap-2 px-4" : ""} flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white text-[#211f1a] transition-all hover:scale-105 hover:border-[#211f1a] active:scale-95 dark:border-[#3a3530] dark:bg-[#211f1a] dark:text-[#fbfaf9] dark:hover:border-[#fbfaf9]`}
      onClick={toggleTheme}
      type="button"
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun className={`${iconSizes[size]} rotate-0 transition-transform duration-300`} />
          {showLabel && <span className="font-medium text-sm">Light</span>}
        </>
      ) : (
        <>
          <Moon className={`${iconSizes[size]} rotate-0 transition-transform duration-300`} />
          {showLabel && <span className="font-medium text-sm">Dark</span>}
        </>
      )}
    </button>
  );
}
