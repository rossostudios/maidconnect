"use client";

import {
  Baby02Icon,
  Bread01Icon,
  CleanIcon,
  Home01Icon,
  Restaurant01Icon,
  ShirtIcon,
  UserGroupIcon,
  UserLove02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react";
import type { FC } from "react";
import { cn } from "@/lib/utils";

export type ServiceOption = {
  id: string;
  label: string;
  icon: FC<HugeiconsProps>;
};

/**
 * Service categories following "The Core Four" structure
 * Matches the services page and directory filters
 */
export type ServiceCategory = {
  label: string;
  icon: FC<HugeiconsProps>;
  services: ServiceOption[];
};

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    label: "Home & Cleaning",
    icon: Home01Icon,
    services: [
      { id: "standard-cleaning", label: "Standard Cleaning", icon: CleanIcon },
      { id: "deep-cleaning", label: "Deep Clean / Move-out", icon: CleanIcon },
      { id: "laundry-ironing", label: "Laundry & Ironing", icon: ShirtIcon },
    ],
  },
  {
    label: "Family Care",
    icon: UserGroupIcon,
    services: [
      { id: "nanny-childcare", label: "Nanny & Childcare", icon: Baby02Icon },
      { id: "senior-companionship", label: "Senior Companionship", icon: UserLove02Icon },
    ],
  },
  {
    label: "Kitchen",
    icon: Restaurant01Icon,
    services: [
      { id: "meal-prep", label: "Meal Prep / Private Chef", icon: Bread01Icon },
      { id: "event-cooking", label: "Event Cooking", icon: Bread01Icon },
    ],
  },
];

// Flattened services for backwards compatibility
const SERVICES: ServiceOption[] = SERVICE_CATEGORIES.flatMap((cat) => cat.services);

export type ServicePanelProps = {
  /** Currently selected service ID */
  selectedService: string | null;
  /** Callback when a service is selected */
  onServiceSelect: (serviceId: string, serviceLabel: string) => void;
  /** Callback when panel should close */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
};

/**
 * Airbnb-style service selection panel with grouped categories.
 * Shows "The Core Four" service structure.
 */
export function ServicePanel({
  selectedService,
  onServiceSelect,
  onClose,
  className,
}: ServicePanelProps) {
  const handleServiceClick = (service: ServiceOption) => {
    onServiceSelect(service.id, service.label);
    onClose?.();
  };

  return (
    <div
      className={cn(
        "w-[380px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-neutral-200/50 dark:bg-card dark:shadow-none dark:ring-border",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 px-2">
        <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-50">
          What do you need help with?
        </h3>
        <p className="mt-1 text-neutral-500 text-sm dark:text-neutral-400">Select a service type</p>
      </div>

      {/* Service categories */}
      <div className="space-y-4">
        {SERVICE_CATEGORIES.map((category) => (
          <div key={category.label}>
            {/* Category label */}
            <div className="mb-2 flex items-center gap-2 px-2">
              <HugeiconsIcon
                className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                icon={category.icon}
              />
              <span className="font-medium text-neutral-700 text-xs uppercase tracking-wider dark:text-neutral-400">
                {category.label}
              </span>
            </div>

            {/* Service chips */}
            <div className="grid grid-cols-1 gap-1.5">
              {category.services.map((service) => {
                const isSelected = selectedService === service.id;

                return (
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                      "hover:border-neutral-300 hover:bg-neutral-50 dark:hover:border-rausch-500/50 dark:hover:bg-muted",
                      isSelected
                        ? "border-rausch-500 bg-rausch-50 dark:border-rausch-500/70 dark:bg-rausch-500/20"
                        : "border-neutral-200 bg-white dark:border-border dark:bg-card"
                    )}
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isSelected
                          ? "text-rausch-600 dark:text-rausch-400"
                          : "text-neutral-900 dark:text-neutral-50"
                      )}
                    >
                      {service.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* All services link */}
      <div className="mt-4 border-neutral-200 border-t pt-4 dark:border-border">
        <button
          className="w-full rounded-xl px-4 py-3 text-center font-medium text-rausch-600 transition-all hover:bg-rausch-50 dark:text-rausch-400 dark:hover:bg-rausch-500/20"
          onClick={() => {
            // Clear selection to show all
            onClose?.();
          }}
          type="button"
        >
          Browse all services
        </button>
      </div>
    </div>
  );
}

// Export services for use in parent component
export { SERVICES };
