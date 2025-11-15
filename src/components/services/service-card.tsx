"use client";

import { Clock01Icon, Delete02Icon, Edit02Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { ProfessionalService } from "@/types";

type ServiceCardProps = {
  service: ProfessionalService;
  onEdit?: (service: ProfessionalService) => void;
  onDelete?: (serviceId: string) => void;
  showActions?: boolean;
};

/**
 * Service Card Component
 *
 * Displays a single service with details, pricing, and actions.
 */
export function ServiceCard({ service, onEdit, onDelete, showActions = true }: ServiceCardProps) {
  const t = useTranslations("components.serviceCard");

  const formatPrice = (price: number) => `$${(price / 1000).toFixed(0)}k`;

  const formatDuration = (minutes: number | null) => {
    if (!minutes) {
      return null;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div
      className={`group border-2 p-6 shadow-sm transition ${
        service.isActive
          ? "border-[neutral-200] bg-[neutral-50]"
          : "border-[bg-[neutral-50]] bg-[neutral-50] opacity-60"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[neutral-900] text-lg">{service.name}</h3>
            {service.isFeatured && (
              <span className="bg-[neutral-500] px-2 py-1 font-medium text-[neutral-50] text-xs">
                {t("featured")}
              </span>
            )}
            {!service.isActive && (
              <span className="bg-[neutral-400] px-2 py-1 font-medium text-[neutral-50] text-xs">
                {t("inactive")}
              </span>
            )}
          </div>
          <p className="mt-1 text-[neutral-400] text-sm">
            {t(`serviceType.${service.serviceType}`)}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                className="border-2 border-[neutral-200] bg-[neutral-50] p-2 transition hover:bg-[neutral-50]"
                onClick={() => onEdit(service)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-[neutral-900]" icon={Edit02Icon} />
              </button>
            )}
            {onDelete && (
              <button
                className="border-2 border-[neutral-500]/30 bg-[neutral-50] p-2 transition hover:bg-[neutral-500]/10"
                onClick={() => onDelete(service.id)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-[neutral-500]" icon={Delete02Icon} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {service.description && (
        <p className="mb-4 line-clamp-2 text-[neutral-400] text-sm">{service.description}</p>
      )}

      {/* Pricing & Duration */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-2xl text-[neutral-500]">
            {formatPrice(service.basePriceCop)}
          </span>
          <span className="text-[neutral-400] text-sm">
            / {t(`pricingUnit.${service.pricingUnit}`)}
          </span>
        </div>

        {service.estimatedDurationMinutes && (
          <div className="flex items-center gap-1 text-[neutral-400] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span>{formatDuration(service.estimatedDurationMinutes)}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 border-[neutral-200] border-t pt-4">
        <div className="flex items-center gap-1">
          <HugeiconsIcon className="h-4 w-4 text-[neutral-500]" icon={StarIcon} />
          <span className="font-medium text-[neutral-900] text-sm">
            {service.averageRating > 0 ? service.averageRating.toFixed(1) : "N/A"}
          </span>
        </div>
        <span className="text-[neutral-400] text-xs">•</span>
        <span className="text-[neutral-400] text-sm">
          {service.bookingCount} {t("bookings")}
        </span>
        {service.requiresApproval && (
          <>
            <span className="text-[neutral-400] text-xs">•</span>
            <span className="text-[neutral-400] text-sm">{t("requiresApproval")}</span>
          </>
        )}
      </div>

      {/* Included Items */}
      {service.includedItems.length > 0 && (
        <div className="mt-4 bg-[neutral-50] p-3">
          <p className="mb-2 font-medium text-[neutral-900] text-xs">{t("included")}:</p>
          <ul className="space-y-1">
            {service.includedItems.slice(0, 3).map((item, index) => (
              <li className="text-[neutral-400] text-xs" key={index}>
                • {item}
              </li>
            ))}
            {service.includedItems.length > 3 && (
              <li className="text-[neutral-400] text-xs">
                + {service.includedItems.length - 3} {t("more")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
