import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CalendarSetting01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatButtonLabel(date: Date | null, placeholder?: string) {
  if (!date) {
    return placeholder ?? "Select date";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function DatePicker({ value, onChange, placeholder, name, required }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("mousedown", handler);
    }
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: Date; inCurrentMonth: boolean }> = [];

    // previous month
    for (let i = startWeekDay - 1; i >= 0; i -= 1) {
      days.push({
        date: new Date(year, month, -i),
        inCurrentMonth: false,
      });
    }

    // current month
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({
        date: new Date(year, month, day),
        inCurrentMonth: true,
      });
    }

    // next month fill to 6 rows
    while (days.length < 42) {
      const last = days.at(-1);
      if (!last) {
        break;
      }
      days.push({
        date: new Date(last.date.getFullYear(), last.date.getMonth(), last.date.getDate() + 1),
        inCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  const handleSelect = (date: Date) => {
    setViewDate(date);
    onChange(date);
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setViewDate(today);
    setOpen(false);
  };

  const hiddenValue = value
    ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    : "";

  return (
    <div className="relative" ref={containerRef}>
      {name ? (
        <input name={name} readOnly required={required} type="hidden" value={hiddenValue} />
      ) : null}
      <button
        className={cn(
          "flex w-full items-center justify-between rounded-full border border-[#e5dfd4] bg-[#fefcf9] px-4 py-2 font-medium text-[var(--foreground)] text-sm shadow-black/5 shadow-inner transition hover:border-[var(--red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red)] focus-visible:outline-offset-2",
          !value && "text-[#8a826d]"
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 text-[var(--red)]"
            icon={CalendarSetting01Icon}
          />
          {formatButtonLabel(value, placeholder)}
        </span>
        <HugeiconsIcon
          className={cn(
            "h-4 w-4 text-[var(--muted-foreground)] transition-transform",
            open && "rotate-90"
          )}
          icon={ArrowRight01Icon}
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-3 w-full min-w-[280px] rounded-3xl border border-[#ebe5d8] bg-white p-4 shadow-[0_24px_60px_rgba(18,17,15,0.12)]">
          <div className="flex items-center justify-between">
            <button
              className="rounded-full border border-[#ebe5d8] p-1 text-[var(--muted-foreground)] transition hover:border-[var(--red)] hover:text-[var(--red)]"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowLeft01Icon} />
              <span className="sr-only">Previous month</span>
            </button>
            <div className="font-semibold text-[var(--foreground)] text-sm">
              {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                viewDate
              )}
            </div>
            <button
              className="rounded-full border border-[#ebe5d8] p-1 text-[var(--muted-foreground)] transition hover:border-[var(--red)] hover:text-[var(--red)]"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowRight01Icon} />
              <span className="sr-only">Next month</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center font-semibold text-[var(--muted-foreground)] text-xs uppercase tracking-[0.18em]">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const isSelected =
                value &&
                date.getFullYear() === value.getFullYear() &&
                date.getMonth() === value.getMonth() &&
                date.getDate() === value.getDate();
              const isToday = (() => {
                const today = new Date();
                return (
                  date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate()
                );
              })();

              return (
                <button
                  className={cn(
                    "rounded-full py-2 text-sm transition",
                    inCurrentMonth ? "text-[var(--foreground)]" : "text-[#c9c2b6]",
                    isSelected &&
                      "bg-[var(--foreground)] text-white shadow-[0_10px_20px_rgba(18,17,15,0.16)]",
                    !isSelected && isToday && "border border-[var(--red)] text-[var(--red)]",
                    !(isSelected || isToday) && "hover:bg-[#f6f1ea]"
                  )}
                  key={date.toISOString()}
                  onClick={() => handleSelect(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-[#8a826d] text-xs">
            <button
              className="rounded-full border border-transparent px-3 py-1 font-semibold text-[var(--red)] transition hover:border-[var(--red)]/40"
              onClick={() => onChange(null)}
              type="button"
            >
              Clear
            </button>
            <button
              className="rounded-full border border-[var(--foreground)] px-3 py-1 font-semibold text-[var(--foreground)] transition hover:border-[var(--red)] hover:text-[var(--red)]"
              onClick={handleToday}
              type="button"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
