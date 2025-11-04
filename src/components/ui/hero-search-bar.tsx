"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandedDatePicker } from "@/components/ui/branded-date-picker";
import { cn } from "@/lib/utils";

type HeroSearchBarProps = {
  className?: string;
};

export function HeroSearchBar({ className }: HeroSearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [serviceType, setServiceType] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Build search params
    const params = new URLSearchParams();
    if (location) {
      params.set("city", location);
    }
    if (date) {
      params.set("date", date);
    }
    if (serviceType) {
      params.set("service", serviceType);
    }

    // Navigate to professionals page with search params
    router.push(`/professionals?${params.toString()}`);
  };

  return (
    <form
      className={cn(
        "relative mx-auto max-w-6xl rounded-2xl bg-white shadow-[var(--shadow-elevated)]",
        className
      )}
      onSubmit={handleSearch}
    >
      <div className="grid overflow-visible md:grid-cols-[1fr_1fr_1fr_auto]">
        {/* Location Input */}
        <div className="group relative flex items-center gap-3 overflow-hidden rounded-l-2xl border-[var(--border)] border-r px-6 py-5 transition-colors hover:bg-[var(--background-alt)]">
          <div className="flex-1">
            <label
              className="block font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wide"
              htmlFor="location"
            >
              Where
            </label>
            <input
              className="mt-1 w-full border-none bg-transparent font-medium text-[var(--foreground)] text-base outline-none placeholder:text-[var(--muted-foreground)]"
              id="location"
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or neighborhood"
              type="text"
              value={location}
            />
          </div>
        </div>

        {/* Date Input - Custom Branded Date Picker */}
        <div className="group relative flex items-center gap-3 overflow-visible border-[var(--border)] border-r px-6 py-5 transition-colors hover:bg-[var(--background-alt)]">
          <div className="flex-1">
            <label className="block font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wide">
              When
            </label>
            <div className="mt-1">
              <BrandedDatePicker onChange={setDate} placeholder="Select date" value={date} />
            </div>
          </div>
        </div>

        {/* Service Type */}
        <div className="group relative flex items-center gap-3 overflow-hidden border-[var(--border)] border-r px-6 py-5 transition-colors hover:bg-[var(--background-alt)]">
          <div className="flex-1">
            <label
              className="block font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wide"
              htmlFor="service"
            >
              Service
            </label>
            <select
              className="mt-1 w-full border-none bg-transparent font-medium text-[var(--foreground)] text-base outline-none"
              id="service"
              onChange={(e) => setServiceType(e.target.value)}
              value={serviceType}
            >
              <option value="">Any service</option>
              <option value="cleaning">House Cleaning</option>
              <option value="cooking">Personal Chef</option>
              <option value="childcare">Childcare</option>
              <option value="elderly">Elderly Care</option>
              <option value="gardening">Gardening</option>
              <option value="pet">Pet Care</option>
            </select>
          </div>
        </div>

        {/* Search Button - Staays Style */}
        <button
          className="flex items-center justify-center rounded-r-2xl bg-[var(--red)] px-12 py-5 font-semibold text-sm text-white uppercase tracking-[0.1em] transition-all hover:bg-[var(--red-hover)] active:scale-95 md:min-w-[160px]"
          type="submit"
        >
          SEARCH
        </button>
      </div>
    </form>
  );
}
