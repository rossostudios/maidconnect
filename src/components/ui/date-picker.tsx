import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CalendarSetting01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
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

export function DatePicker({ value, onChange, placeholder, name, required }: DatePickerProps) {
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
      t("weekdays.sunday"),
      t("weekdays.monday"),
      t("weekdays.tuesday"),
      t("weekdays.wednesday"),
      t("weekdays.thursday"),
      t("weekdays.friday"),
      t("weekdays.saturday"),
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
          "flex w-full items-center justify-between rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 font-medium text-[#0f172a] text-sm shadow-[#0f172a]/5 shadow-inner transition hover:border-[#64748b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#64748b] focus-visible:outline-offset-2",
          !value && "text-[#94a3b8]"
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 text-[#64748b]"
            icon={CalendarSetting01Icon}
          />
          {formatButtonLabel(value, placeholder || t("selectDate"), locale)}
        </span>
        <HugeiconsIcon
          className={cn("h-4 w-4 text-[#94a3b8] transition-transform", open && "rotate-90")}
          icon={ArrowRight01Icon}
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-3 w-full min-w-[280px] rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-[0_24px_60px_rgba(22,22,22,0.12)]">
          <div className="flex items-center justify-between">
            <button
              className="rounded-full border border-[#e2e8f0] p-1 text-[#94a3b8] transition hover:border-[#64748b] hover:text-[#64748b]"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowLeft01Icon} />
              <span className="sr-only">{t("previousMonth")}</span>
            </button>
            <div className="font-semibold text-[#0f172a] text-sm">
              {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate)}
            </div>
            <button
              className="rounded-full border border-[#e2e8f0] p-1 text-[#94a3b8] transition hover:border-[#64748b] hover:text-[#64748b]"
              onClick={() =>
                setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              type="button"
            >
              <HugeiconsIcon aria-hidden="true" className="h-4 w-4" icon={ArrowRight01Icon} />
              <span className="sr-only">{t("nextMonth")}</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center font-semibold text-[#94a3b8] text-xs uppercase tracking-[0.18em]">
            {weekdays.map((day) => (
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
                    inCurrentMonth ? "text-[#0f172a]" : "text-[#e2e8f0]",
                    isSelected &&
                      "bg-[#0f172a] text-[#f8fafc] shadow-[0_10px_20px_rgba(22,22,22,0.16)]",
                    !isSelected && isToday && "border border-[#64748b] text-[#64748b]",
                    !(isSelected || isToday) && "hover:bg-[#f8fafc]"
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

          <div className="mt-4 flex items-center justify-between text-[#94a3b8] text-xs">
            <button
              className="rounded-full border border-transparent px-3 py-1 font-semibold text-[#64748b] transition hover:border-[#64748b]/40"
              onClick={() => onChange(null)}
              type="button"
            >
              {t("clear")}
            </button>
            <button
              className="rounded-full border border-[#0f172a] px-3 py-1 font-semibold text-[#0f172a] transition hover:border-[#64748b] hover:text-[#64748b]"
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
