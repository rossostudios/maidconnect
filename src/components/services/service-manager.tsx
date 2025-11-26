"use client";

import {
  Add01Icon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  FilterIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteService, getServices } from "@/app/actions/services";
import { confirm } from "@/lib/toast";
import type { ProfessionalService } from "@/types";
import { ServiceCard } from "./service-card";

type ServiceManagerProps = {
  profileId: string;
};

/**
 * Service Manager Component
 *
 * Main component for managing a professional's service catalog.
 * Displays all services with filtering and CRUD operations.
 */
export function ServiceManager({ profileId }: ServiceManagerProps) {
  const t = useTranslations("components.serviceManager");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState<string | null>(null);

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getServices(profileId, false);
      if (!response.success) {
        setError(response.error);
        return;
      }
      setServices(response.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleDelete = async (serviceId: string) => {
    const confirmed = await confirm(t("confirmDelete"), "Delete Service");
    if (!confirmed) {
      return;
    }

    // Store the service for potential undo
    const deletedService = services.find((s) => s.id === serviceId);

    // Optimistically remove from UI
    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    let isUndone = false;

    // Show toast with undo action
    toast.success("Service deleted", {
      duration: 5000,
      icon: <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />,
      action: {
        label: "Undo",
        onClick: () => {
          isUndone = true;
          // Restore to UI
          if (deletedService) {
            setServices((prev) => [...prev, deletedService]);
          }
        },
      },
    });

    // Wait for toast duration, then actually delete if not undone
    setTimeout(async () => {
      if (!isUndone) {
        const response = await deleteService(serviceId);
        if (!response.success) {
          toast.error(response.error || "Failed to delete service", {
            icon: <HugeiconsIcon className="h-5 w-5" icon={Alert01Icon} />,
          });
          loadServices(); // Reload to restore on error
        }
      }
    }, 5000);
  };

  const handleEdit = (service: ProfessionalService) => {
    // TODO: Open edit modal/form
    console.log("Edit service:", service);
  };

  const filteredServices = services.filter((service) => {
    if (filter === "active") {
      return service.isActive;
    }
    if (filter === "inactive") {
      return !service.isActive;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <HugeiconsIcon className="h-8 w-8 animate-spin text-rausch-500" icon={Loading03Icon} />
          <p className="font-medium text-neutral-900">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-[neutral-500]/30 bg-[neutral-500]/10 p-6">
        <p className="font-semibold text-[neutral-500]">{t("error")}</p>
        <p className="mt-2 text-[neutral-500] text-sm">{error}</p>
        <button
          className="mt-4 bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
          onClick={() => loadServices()}
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl text-[neutral-900]">{t("title")}</h2>
          <p className="text-[neutral-400] text-sm">{t("description")}</p>
        </div>
        <button
          className="flex items-center gap-2 bg-[neutral-500] px-4 py-2 font-medium text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
          {t("createService")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <HugeiconsIcon className="h-5 w-5 text-[neutral-400]" icon={FilterIcon} />
        <button
          className={`px-4 py-2 font-medium text-sm transition ${
            filter === "all"
              ? "bg-[neutral-500] text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-200]"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          {t("all")} ({services.length})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition ${
            filter === "active"
              ? "bg-[neutral-500] text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-200]"
          }`}
          onClick={() => setFilter("active")}
          type="button"
        >
          {t("active")} ({services.filter((s) => s.isActive).length})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition ${
            filter === "inactive"
              ? "bg-[neutral-500] text-[neutral-50]"
              : "bg-[neutral-50] text-[neutral-400] hover:bg-[neutral-200]"
          }`}
          onClick={() => setFilter("inactive")}
          type="button"
        >
          {t("inactive")} ({services.filter((s) => !s.isActive).length})
        </button>
      </div>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              service={service}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-[neutral-200] bg-[neutral-50] p-12 text-center">
          <p className="font-semibold text-[neutral-900]">{t("noServices")}</p>
          <p className="mt-2 text-[neutral-400] text-sm">{t("noServicesDescription")}</p>
          <button
            className="mt-6 bg-[neutral-500] px-6 py-3 font-medium text-[neutral-50] transition hover:bg-[neutral-500]"
            type="button"
          >
            {t("createFirstService")}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-[neutral-50] p-4 text-[neutral-500] text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-[neutral-500]">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
