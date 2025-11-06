"use client";

import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
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
        <span className={cn("font-medium text-base", value ? "text-stone-900" : "text-stone-600")}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <HugeiconsIcon className="h-5 w-5 text-stone-600" icon={Calendar01Icon} />
      </button>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute top-full left-0 z-50 mt-3 w-80 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5 will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            {/* Month Navigation */}
            <div className="mb-6 flex items-center justify-between">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
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

              <h3 className="font-[family-name:var(--font-cinzel)] font-semibold text-base text-gray-900">
                {monthName}
              </h3>

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
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
                  className="flex h-8 items-center justify-center font-medium text-gray-600 text-xs"
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
                      isSelected && "bg-orange-500 font-semibold text-white hover:bg-orange-600",
                      !isSelected &&
                        isToday &&
                        "border-2 border-orange-500 font-semibold text-orange-500",
                      !(isSelected || isToday) && "text-gray-900 hover:bg-gray-50"
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                      delay: (index + firstDayOfMonth) * 0.008,
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
              className="mt-4 w-full rounded-full border border-stone-200 py-2 font-medium text-gray-900 text-sm transition-colors hover:bg-gray-50"
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
