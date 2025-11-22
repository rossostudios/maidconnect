"use client";

/**
 * DirectorySearch - Lia Design System
 *
 * Search input with autocomplete suggestions.
 */

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DirectorySearchProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function DirectorySearch({
  value,
  onChange,
  placeholder = "Search professionals by name or service...",
  className,
}: DirectorySearchProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Debounced update to URL
  const debouncedOnChange = useDebouncedCallback((newValue: string) => {
    onChange(newValue || null);
  }, 300);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange(null);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className={cn("relative", className)}>
      <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3">
        <HugeiconsIcon className="h-5 w-5 text-neutral-400" icon={Search01Icon} />
      </div>

      <Input
        aria-label="Search professionals"
        className="h-11 pr-10 pl-10"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={inputValue}
      />

      {inputValue && (
        <button
          aria-label="Clear search"
          className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          onClick={handleClear}
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
        </button>
      )}
    </div>
  );
}
