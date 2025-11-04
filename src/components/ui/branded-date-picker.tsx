"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar01Icon } from "hugeicons-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BrandedDatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
};

export function BrandedDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: BrandedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedDate = value ? new Date(value) : null;

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(selected.toISOString().split("T")[0] as string);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Input Trigger */}
      <button
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span
          className={cn(
            "font-medium text-base",
            value ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
          )}
        >
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar01Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
      </button>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full left-0 z-50 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-elevated)] will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Month Navigation */}
            <div className="mb-6 flex items-center justify-between">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--background-alt)]"
                onClick={handlePrevMonth}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <h3 className="font-[family-name:var(--font-cinzel)] font-semibold text-[var(--foreground)] text-base">
                {monthName}
              </h3>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--background-alt)]"
                onClick={handleNextMonth}
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  className="flex h-8 items-center justify-center font-medium text-[var(--muted-foreground)] text-xs"
                  key={day}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div className="h-10" key={`empty-${index}`} />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected =
                  selectedDate && date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <motion.button
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-full text-sm transition-all will-change-transform motion-reduce:scale-100 motion-reduce:opacity-100",
                      isSelected &&
                        "bg-[var(--red)] font-semibold text-white hover:bg-[var(--red-hover)]",
                      !isSelected &&
                        isToday &&
                        "border-2 border-[var(--red)] font-semibold text-[var(--red)]",
                      !(isSelected || isToday) &&
                        "text-[var(--foreground)] hover:bg-[var(--background-alt)]"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    transition={{
                      duration: 0.15,
                      delay: (index + firstDayOfMonth) * 0.008,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>

            {/* Today Button */}
            <button
              className="mt-4 w-full rounded-full border border-[var(--border)] py-2 font-medium text-[var(--foreground)] text-sm transition-colors hover:bg-[var(--background-alt)]"
              onClick={() => {
                const today = new Date();
                onChange(today.toISOString().split("T")[0] as string);
                setIsOpen(false);
              }}
              type="button"
            >
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
