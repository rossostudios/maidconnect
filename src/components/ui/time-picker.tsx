import { ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  name?: string;
  intervalMinutes?: number;
  required?: boolean;
};

function formatDisplay(value: string | null, placeholder?: string) {
  if (!value) {
    return placeholder ?? "Select time";
  }
  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

export function TimePicker({
  value,
  onChange,
  placeholder,
  name,
  intervalMinutes = 30,
  required,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
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

  const times = useMemo(() => {
    const entries: string[] = [];
    const start = 6 * 60; // 6:00 am
    const end = 22 * 60; // 10:00 pm
    for (let minutes = start; minutes <= end; minutes += intervalMinutes) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      entries.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
    return entries;
  }, [intervalMinutes]);

  const hiddenValue = value ?? "";

  return (
    <div className="relative" ref={containerRef}>
      {name ? (
        <input name={name} readOnly required={required} type="hidden" value={hiddenValue} />
      ) : null}
      <button
        className={cn(
          "flex w-full items-center justify-between rounded-full border border-[neutral-200] bg-[neutral-50] px-4 py-2 font-medium text-[neutral-900] text-sm shadow-[neutral-900]/5 shadow-inner transition hover:border-[neutral-500] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[neutral-500] focus-visible:outline-offset-2",
          !value && "text-[neutral-400]"
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <HugeiconsIcon
            aria-hidden="true"
            className="h-4 w-4 text-[neutral-500]"
            icon={Clock01Icon}
          />
          {formatDisplay(value, placeholder)}
        </span>
        <HugeiconsIcon
          className={cn("h-4 w-4 text-[neutral-400] transition-transform", open && "rotate-90")}
          icon={ArrowRight01Icon}
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-3 max-h-64 w-full min-w-[220px] overflow-y-auto rounded-3xl border border-[neutral-200] bg-[neutral-50] p-2 shadow-[0_24px_60px_rgba(22,22,22,0.12)]">
          <div className="grid gap-2">
            {times.map((time) => {
              const isSelected = time === value;
              return (
                <button
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-2 text-sm transition",
                    isSelected
                      ? "bg-[neutral-900] text-[neutral-50] shadow-[0_12px_32px_rgba(22,22,22,0.16)]"
                      : "text-[neutral-900] hover:bg-[neutral-50]"
                  )}
                  key={time}
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  type="button"
                >
                  <span>{formatDisplay(time)}</span>
                  {isSelected ? (
                    <span className="text-[neutral-400] text-xs uppercase tracking-[0.2em]">
                      Selected
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
