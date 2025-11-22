import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  /**
   * Variant controls the trigger button styling:
   * - "default": bordered input with rounded-lg (for forms)
   * - "inline": borderless, transparent (for search bars)
   */
  variant?: "default" | "inline";
  className?: string;
};

function formatButtonLabel(date: Date | null, placeholder: string, locale: string) {
  if (!date) {
    return placeholder;
  }
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  name,
  required,
  variant = "default",
  className,
}: DatePickerProps) {
  const t = useTranslations("datePicker");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    // Ensure we always have a valid Date object
    if (value instanceof Date) {
      return value;
    }
    if (value && typeof value === "string") {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const weekdays = useMemo(
    () => [
      t("weekdays.sunday").slice(0, 2),
      t("weekdays.monday").slice(0, 2),
      t("weekdays.tuesday").slice(0, 2),
      t("weekdays.wednesday").slice(0, 2),
      t("weekdays.thursday").slice(0, 2),
      t("weekdays.friday").slice(0, 2),
      t("weekdays.saturday").slice(0, 2),
    ],
    [t]
  );

  // Update viewDate when value prop changes
  useEffect(() => {
    if (value instanceof Date) {
      setViewDate(value);
    } else if (value && typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }, [value]);

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
          "flex w-full items-center transition-all focus:outline-none",
          // Default variant: bordered input for forms
          variant === "default" && [
            "justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm",
            "hover:border-neutral-300 hover:bg-neutral-50",
            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
            open && "border-orange-500 ring-2 ring-orange-500/20",
          ],
          // Inline variant: borderless for search bars (Airbnb-style)
          variant === "inline" && ["gap-2 bg-transparent"],
          !value && "text-neutral-500",
          className
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {variant === "default" && (
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 text-neutral-400"
            icon={Calendar03Icon}
          />
        )}
        <span
          className={cn(
            variant === "default" ? "font-medium text-sm" : "text-sm",
            value ? "text-neutral-900" : "text-neutral-500",
            geistSans.className
          )}
        >
          {formatButtonLabel(value, placeholder || t("selectDate"), locale)}
        </span>
      </button>

      {open ? (
        <div className="fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-[320px] animate-in rounded-xl border border-neutral-200 bg-white p-4 shadow-xl ring-1 ring-black/5 duration-200">
          <div className="mb-4 flex items-center justify-between">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowLeft01Icon} />
              <span className="sr-only">{t("previousMonth")}</span>
            </button>
            <div className={cn("font-semibold text-neutral-900 text-sm", geistSans.className)}>
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate)}
            </div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowRight01Icon} />
              <span className="sr-only">{t("nextMonth")}</span>
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day, index) => (
              <span
                className={cn("font-medium text-neutral-400 text-xs", geistSans.className)}
                key={index}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
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
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all",
                    geistSans.className,
                    inCurrentMonth ? "text-neutral-900" : "text-neutral-300",
                    isSelected &&
                      "bg-orange-500 font-medium text-white shadow-sm hover:bg-orange-600",
                    !isSelected &&
                      isToday &&
                      "border border-orange-500 font-medium text-orange-600",
                    !(isSelected || isToday) && inCurrentMonth && "hover:bg-neutral-100",
                    !inCurrentMonth && "cursor-default"
                  )}
                  disabled={!inCurrentMonth}
                  key={date.toISOString()}
                  onClick={() => inCurrentMonth && handleSelect(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-neutral-100 border-t pt-4">
            <button
              className={cn(
                "rounded-md px-2 py-1 font-medium text-neutral-500 text-xs transition hover:bg-neutral-100 hover:text-neutral-900",
                geistSans.className
              )}
              onClick={() => onChange(null)}
              type="button"
            >
              {t("clear")}
            </button>
            <button
              className={cn(
                "rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white text-xs transition hover:bg-neutral-800",
                geistSans.className
              )}
              onClick={handleToday}
              type="button"
            >
              {t("today")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
