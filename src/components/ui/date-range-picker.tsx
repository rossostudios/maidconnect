import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
};

function formatButtonLabel(range: DateRange, placeholder: string, locale: string) {
  if (!range.from) {
    return placeholder;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!range.to) {
    return formatter.format(range.from);
  }

  return `${formatter.format(range.from)} - ${formatter.format(range.to)}`;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder,
  name,
  required,
}: DateRangePickerProps) {
  const t = useTranslations("datePicker");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => value.from || new Date());
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
    if (value.from) {
      setViewDate(value.from);
    }
  }, [value.from]);

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
    if (!value.from || (value.from && value.to)) {
      // Start new range
      onChange({ from: date, to: undefined });
    } else {
      // Complete range
      if (date < value.from) {
        onChange({ from: date, to: value.from });
      } else {
        onChange({ from: value.from, to: date });
      }
      setOpen(false);
    }
  };

  const handleToday = () => {
    const today = new Date();
    onChange({ from: today, to: today });
    setViewDate(today);
    setOpen(false);
  };

  const isSelected = (date: Date) => {
    if (!value.from) {
      return false;
    }
    if (value.to) {
      return date >= value.from && date <= value.to;
    }
    return date.getTime() === value.from.getTime();
  };

  const isRangeStart = (date: Date) => value.from && date.getTime() === value.from.getTime();

  const isRangeEnd = (date: Date) => value.to && date.getTime() === value.to.getTime();

  const isInRange = (date: Date) => value.from && value.to && date > value.from && date < value.to;

  const hiddenValue = value.from
    ? `${value.from.toISOString()}${value.to ? `,${value.to.toISOString()}` : ""}`
    : "";

  return (
    <div className="relative" ref={containerRef}>
      {name ? (
        <input name={name} readOnly required={required} type="hidden" value={hiddenValue} />
      ) : null}
      <button
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20",
          !value.from && "text-neutral-500",
          open && "border-orange-500 ring-2 ring-orange-500/20"
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2.5">
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 text-neutral-500"
            icon={Calendar03Icon}
          />
          <span className={cn("font-medium text-neutral-900 text-sm", geistSans.className)}>
            {formatButtonLabel(value, placeholder || t("selectDate"), locale)}
          </span>
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
              const selected = isSelected(date);
              const start = isRangeStart(date);
              const end = isRangeEnd(date);
              const inRange = isInRange(date);
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
                    "relative flex h-9 w-9 items-center justify-center text-sm transition-all",
                    geistSans.className,
                    inCurrentMonth ? "text-neutral-900" : "text-neutral-300",
                    !inCurrentMonth && "cursor-default",
                    // Range styling
                    (start || end) &&
                      "z-10 rounded-lg bg-orange-500 text-white shadow-sm hover:bg-orange-600",
                    inRange && "rounded-none bg-orange-50 text-orange-900",
                    start && value.to && "rounded-r-none",
                    end && "rounded-l-none",
                    !selected &&
                      isToday &&
                      "rounded-lg border border-orange-500 font-medium text-orange-600",
                    !(selected || isToday) && inCurrentMonth && "rounded-lg hover:bg-neutral-100"
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
              onClick={() => onChange({ from: undefined, to: undefined })}
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
