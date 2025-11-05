"use client";

import { Clock01Icon, Delete02Icon, Edit02Icon, StarIcon } from "hugeicons-react";
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
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <div
      className={`group rounded-[24px] border-2 p-6 shadow-sm transition ${
        service.isActive ? "border-[#e5e7eb] bg-white" : "border-[#f3f4f6] bg-[#f9fafb] opacity-60"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)] text-lg">{service.name}</h3>
            {service.isFeatured && (
              <span className="rounded-full bg-[var(--red)] px-2 py-1 font-medium text-white text-xs">
                {t("featured")}
              </span>
            )}
            {!service.isActive && (
              <span className="rounded-full bg-[#9ca3af] px-2 py-1 font-medium text-white text-xs">
                {t("inactive")}
              </span>
            )}
          </div>
          <p className="mt-1 text-[#6b7280] text-sm">{t(`serviceType.${service.serviceType}`)}</p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                className="rounded-lg border-2 border-[#e5e7eb] bg-white p-2 transition hover:bg-[#f9fafb]"
                onClick={() => onEdit(service)}
                type="button"
              >
                <Edit02Icon className="h-4 w-4 text-[var(--foreground)]" />
              </button>
            )}
            {onDelete && (
              <button
                className="rounded-lg border-2 border-red-200 bg-white p-2 transition hover:bg-red-50"
                onClick={() => onDelete(service.id)}
                type="button"
              >
                <Delete02Icon className="h-4 w-4 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {service.description && (
        <p className="mb-4 line-clamp-2 text-[#6b7280] text-sm">{service.description}</p>
      )}

      {/* Pricing & Duration */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-2xl text-[var(--red)]">
            {formatPrice(service.basePriceCop)}
          </span>
          <span className="text-[#9ca3af] text-sm">
            / {t(`pricingUnit.${service.pricingUnit}`)}
          </span>
        </div>

        {service.estimatedDurationMinutes && (
          <div className="flex items-center gap-1 text-[#6b7280] text-sm">
            <Clock01Icon className="h-4 w-4" />
            <span>{formatDuration(service.estimatedDurationMinutes)}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 border-[#e5e7eb] border-t pt-4">
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-[var(--foreground)] text-sm">
            {service.averageRating > 0 ? service.averageRating.toFixed(1) : "N/A"}
          </span>
        </div>
        <span className="text-[#9ca3af] text-xs">•</span>
        <span className="text-[#6b7280] text-sm">
          {service.bookingCount} {t("bookings")}
        </span>
        {service.requiresApproval && (
          <>
            <span className="text-[#9ca3af] text-xs">•</span>
            <span className="text-[#6b7280] text-sm">{t("requiresApproval")}</span>
          </>
        )}
      </div>

      {/* Included Items */}
      {service.includedItems.length > 0 && (
        <div className="mt-4 rounded-xl bg-[#f9fafb] p-3">
          <p className="mb-2 font-medium text-[var(--foreground)] text-xs">{t("included")}:</p>
          <ul className="space-y-1">
            {service.includedItems.slice(0, 3).map((item, index) => (
              <li className="text-[#6b7280] text-xs" key={index}>
                • {item}
              </li>
            ))}
            {service.includedItems.length > 3 && (
              <li className="text-[#9ca3af] text-xs">
                + {service.includedItems.length - 3} {t("more")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
