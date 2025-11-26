"use client";

import { ComputerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "hugeicons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const themes: { value: ThemeOption; label: string; icon: typeof Sun01Icon }[] = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon01Icon },
  { value: "system", label: "Auto", icon: ComputerIcon },
];

/**
 * ThemeSelector - Airbnb-style Segmented Theme Control
 *
 * A premium segmented control for switching between light, dark, and system themes.
 * Designed to be used inside menus (hamburger menu, settings panels).
 *
 * Features:
 * - Pill-style segmented control
 * - Animated selection indicator
 * - Icons + labels for each option
 * - Brand colors (rausch) for selected state
 */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <span className="font-[family-name:var(--font-geist-sans)] font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Theme
        </span>
        <div className="flex h-10 items-center gap-1 rounded-lg bg-muted p-1">
          {themes.map((t) => (
            <div
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3"
              key={t.value}
            >
              <div className="h-4 w-4 rounded bg-muted-foreground/20" />
              <span className="text-xs">...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="font-[family-name:var(--font-geist-sans)] font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Theme
      </span>
      <div className="flex h-10 items-center gap-1 rounded-lg bg-muted p-1">
        {themes.map((t) => {
          const isSelected = theme === t.value;
          return (
            <button
              className={cn(
                "relative flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3 font-medium text-xs transition-all duration-200",
                isSelected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={t.value}
              onClick={() => setTheme(t.value)}
              type="button"
            >
              {t.value === "system" ? (
                <HugeiconsIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    isSelected ? "text-rausch-500" : ""
                  )}
                  icon={t.icon}
                />
              ) : (
                <t.icon
                  className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    isSelected ? "text-rausch-500" : ""
                  )}
                />
              )}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ThemeToggle - Compact Icon Toggle (for header use)
 *
 * @deprecated Use ThemeSelector inside menus instead
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted"
        disabled
        type="button"
      >
        <div className="h-[1.2rem] w-[1.2rem] rounded-full bg-muted-foreground/20" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <button
      aria-label={`Current theme: ${theme}. Click to change.`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      onClick={cycleTheme}
      type="button"
    >
      {resolvedTheme === "dark" ? (
        <Moon01Icon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun01Icon className="h-[1.2rem] w-[1.2rem]" />
      )}
    </button>
  );
}
