"use client";

/**
 * ServiceFilter - Minimal Lia Design System
 *
 * Multi-select service filter with checkboxes for boutique marketplace.
 */

import { Checkbox } from "@/components/ui/checkbox";
import { SERVICE_CATEGORIES } from "@/hooks/use-directory-filters";
import { cn } from "@/lib/utils";

interface ServiceFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  compact?: boolean;
}

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
      if (count === 0) return "All Services";
      if (count === 1) {
        return SERVICE_CATEGORIES.find((c) => c.value === selectedServices[0])?.label;
      }
      return `${count} services`;
    };
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-neutral-600 text-sm">{getLabel()}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section label */}
      <p className="font-medium text-neutral-700 text-sm">Service Type</p>

      {/* Checkbox list */}
      <div aria-label="Service Type" className="space-y-2" role="group">
        {SERVICE_CATEGORIES.map((cat) => (
          <div className="group flex cursor-pointer items-center gap-2.5" key={cat.value}>
            <Checkbox
              checked={selectedServices.includes(cat.value)}
              className="h-4 w-4"
              id={`service-${cat.value}`}
              onCheckedChange={(checked) => handleToggle(cat.value, !!checked)}
            />
            <label
              className="cursor-pointer text-neutral-700 text-sm group-hover:text-neutral-900"
              htmlFor={`service-${cat.value}`}
            >
              {cat.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
