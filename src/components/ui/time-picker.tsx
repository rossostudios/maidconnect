import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, ChevronRight } from "lucide-react";
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
  if (!value) return placeholder ?? "Select time";
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
    <div ref={containerRef} className="relative">
      {name ? <input type="hidden" name={name} value={hiddenValue} readOnly required={required} /> : null}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-full border border-[#e5dfd4] bg-[#fefcf9] px-4 py-2 text-sm font-medium text-[#211f1a] shadow-inner shadow-black/5 transition hover:border-[#ff5d46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5d46]",
          !value && "text-[#8a826d]",
        )}
      >
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#ff5d46]" aria-hidden="true" />
          {formatDisplay(value, placeholder)}
        </span>
        <ChevronRight className={cn("h-4 w-4 text-[#a49c90] transition-transform", open && "rotate-90")} />
      </button>

      {open ? (
        <div className="absolute z-50 mt-3 max-h-64 w-full min-w-[220px] overflow-y-auto rounded-3xl border border-[#ebe5d8] bg-white p-2 shadow-[0_24px_60px_rgba(18,17,15,0.12)]">
          <div className="grid gap-2">
            {times.map((time) => {
              const isSelected = time === value;
              return (
                <button
                  type="button"
                  key={time}
                  onClick={() => {
                    onChange(time);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-2 text-sm transition",
                    isSelected
                      ? "bg-[#211f1a] text-white shadow-[0_12px_32px_rgba(18,17,15,0.16)]"
                      : "text-[#211f1a] hover:bg-[#f6f1ea]",
                  )}
                >
                  <span>{formatDisplay(time)}</span>
                  {isSelected ? <span className="text-xs uppercase tracking-[0.2em] text-[#d7b59f]">Selected</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
