"use client";

/**
 * ServiceFilter - Lia Design System
 *
 * Grouped multi-select service filter with "The Core Four" categories.
 * Organized by service domain for better UX and reduced decision fatigue.
 */

import { Checkbox } from "@/components/ui/checkbox";
import { SERVICE_CATEGORIES, SERVICE_OPTIONS } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

type ServiceFilterProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  compact?: boolean;
};

export function ServiceFilter({ value, onChange, className, compact = false }: ServiceFilterProps) {
  // Parse comma-separated values into array
  const selectedServices = value ? value.split(",") : [];

  const handleToggle = (serviceValue: string, checked: boolean) => {
    let newServices: string[];
    if (checked) {
      newServices = [...selectedServices, serviceValue];
    } else {
      newServices = selectedServices.filter((s) => s !== serviceValue);
    }
    onChange(newServices.length > 0 ? newServices.join(",") : null);
  };

  if (compact) {
    const count = selectedServices.length;
    const getLabel = () => {
      if (count === 0) {
        return "All Services";
      }
      if (count === 1) {
        return SERVICE_OPTIONS.find((opt) => opt.value === selectedServices[0])?.label;
      }
      return `${count} services`;
    };
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-neutral-600 text-sm dark:text-rausch-200">{getLabel()}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section label */}
      <p className="font-medium text-neutral-700 text-sm dark:text-rausch-100">Service Type</p>

      {/* Grouped categories */}
      {SERVICE_CATEGORIES.map((category) => (
        <div className="space-y-2" key={category.label}>
          {/* Category header */}
          <p className="font-medium text-neutral-500 text-xs uppercase tracking-wide dark:text-rausch-300">
            {category.label}
          </p>

          {/* Options within category */}
          <div aria-label={category.label} className="space-y-2 pl-2" role="group">
            {category.options.map((opt) => (
              <div className="group flex cursor-pointer items-center gap-2.5" key={opt.value}>
                <Checkbox
                  checked={selectedServices.includes(opt.value)}
                  className="h-4 w-4"
                  id={`service-${opt.value}`}
                  onCheckedChange={(checked) => handleToggle(opt.value, !!checked)}
                />
                <label
                  className="cursor-pointer text-neutral-700 text-sm group-hover:text-neutral-900 dark:text-rausch-200 dark:group-hover:text-rausch-50"
                  htmlFor={`service-${opt.value}`}
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
