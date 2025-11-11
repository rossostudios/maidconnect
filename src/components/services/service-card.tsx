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
      className={`group rounded-[24px] border-2 p-6 shadow-sm transition ${
        service.isActive
          ? "border-[#e2e8f0] bg-[#f8fafc]"
          : "border-[bg-[#f8fafc]] bg-[#f8fafc] opacity-60"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#0f172a] text-lg">{service.name}</h3>
            {service.isFeatured && (
              <span className="rounded-full bg-[#64748b] px-2 py-1 font-medium text-[#f8fafc] text-xs">
                {t("featured")}
              </span>
            )}
            {!service.isActive && (
              <span className="rounded-full bg-[#94a3b8] px-2 py-1 font-medium text-[#f8fafc] text-xs">
                {t("inactive")}
              </span>
            )}
          </div>
          <p className="mt-1 text-[#94a3b8] text-sm">{t(`serviceType.${service.serviceType}`)}</p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                className="rounded-lg border-2 border-[#e2e8f0] bg-[#f8fafc] p-2 transition hover:bg-[#f8fafc]"
                onClick={() => onEdit(service)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-[#0f172a]" icon={Edit02Icon} />
              </button>
            )}
            {onDelete && (
              <button
                className="rounded-lg border-2 border-[#64748b]/30 bg-[#f8fafc] p-2 transition hover:bg-[#64748b]/10"
                onClick={() => onDelete(service.id)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-[#64748b]" icon={Delete02Icon} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {service.description && (
        <p className="mb-4 line-clamp-2 text-[#94a3b8] text-sm">{service.description}</p>
      )}

      {/* Pricing & Duration */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-2xl text-[#64748b]">
            {formatPrice(service.basePriceCop)}
          </span>
          <span className="text-[#94a3b8] text-sm">
            / {t(`pricingUnit.${service.pricingUnit}`)}
          </span>
        </div>

        {service.estimatedDurationMinutes && (
          <div className="flex items-center gap-1 text-[#94a3b8] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span>{formatDuration(service.estimatedDurationMinutes)}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 border-[#e2e8f0] border-t pt-4">
        <div className="flex items-center gap-1">
          <HugeiconsIcon className="h-4 w-4 text-[#64748b]" icon={StarIcon} />
          <span className="font-medium text-[#0f172a] text-sm">
            {service.averageRating > 0 ? service.averageRating.toFixed(1) : "N/A"}
          </span>
        </div>
        <span className="text-[#94a3b8] text-xs">•</span>
        <span className="text-[#94a3b8] text-sm">
          {service.bookingCount} {t("bookings")}
        </span>
        {service.requiresApproval && (
          <>
            <span className="text-[#94a3b8] text-xs">•</span>
            <span className="text-[#94a3b8] text-sm">{t("requiresApproval")}</span>
          </>
        )}
      </div>

      {/* Included Items */}
      {service.includedItems.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#f8fafc] p-3">
          <p className="mb-2 font-medium text-[#0f172a] text-xs">{t("included")}:</p>
          <ul className="space-y-1">
            {service.includedItems.slice(0, 3).map((item, index) => (
              <li className="text-[#94a3b8] text-xs" key={index}>
                • {item}
              </li>
            ))}
            {service.includedItems.length > 3 && (
              <li className="text-[#94a3b8] text-xs">
                + {service.includedItems.length - 3} {t("more")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
