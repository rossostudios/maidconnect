"use client";

import {
  Baby02Icon,
  Bone01Icon,
  Bread01Icon,
  CleanIcon,
  PlantIcon,
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

const SERVICES: ServiceOption[] = [
  { id: "cleaning", label: "Cleaning", icon: CleanIcon },
  { id: "childcare", label: "Childcare", icon: Baby02Icon },
  { id: "eldercare", label: "Elder Care", icon: UserLove02Icon },
  { id: "cooking", label: "Cooking", icon: Bread01Icon },
  { id: "gardening", label: "Gardening", icon: PlantIcon },
  { id: "pet-care", label: "Pet Care", icon: Bone01Icon },
];

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
 * Airbnb-style service selection panel with chip grid.
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
        "w-[380px] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-neutral-200/50",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 px-2">
        <h3 className="font-semibold text-neutral-900">What do you need help with?</h3>
        <p className="mt-1 text-neutral-500 text-sm">Select a service type</p>
      </div>

      {/* Service chips grid */}
      <div className="grid grid-cols-2 gap-2">
        {SERVICES.map((service) => {
          const isSelected = selectedService === service.id;
          const IconComponent = service.icon;

          return (
            <button
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                "hover:border-neutral-300 hover:bg-neutral-50",
                isSelected ? "border-orange-500 bg-orange-50" : "border-neutral-200 bg-white"
              )}
              key={service.id}
              onClick={() => handleServiceClick(service)}
              type="button"
            >
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-orange-100" : "bg-neutral-100"
                )}
              >
                <HugeiconsIcon
                  className={cn("h-5 w-5", isSelected ? "text-orange-600" : "text-neutral-600")}
                  icon={IconComponent}
                />
              </div>
              <span
                className={cn("font-medium", isSelected ? "text-orange-600" : "text-neutral-900")}
              >
                {service.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* All services link */}
      <div className="mt-4 border-neutral-200 border-t pt-4">
        <button
          className="w-full rounded-xl px-4 py-3 text-center font-medium text-orange-600 transition-all hover:bg-orange-50"
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
