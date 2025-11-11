"use client";

import {
  Add01Icon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  FilterIcon,
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
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[#64748b] border-t-2 border-b-2" />
          <p className="text-[#94a3b8]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border-2 border-[#64748b]/30 bg-[#64748b]/10 p-6">
        <p className="font-semibold text-[#64748b]">{t("error")}</p>
        <p className="mt-2 text-[#64748b] text-sm">{error}</p>
        <button
          className="mt-4 rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
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
          <h2 className="font-bold text-2xl text-[#0f172a]">{t("title")}</h2>
          <p className="text-[#94a3b8] text-sm">{t("description")}</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
          type="button"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
          {t("createService")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]" icon={FilterIcon} />
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "all"
              ? "bg-[#64748b] text-[#f8fafc]"
              : "bg-[#f8fafc] text-[#94a3b8] hover:bg-[#e2e8f0]"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          {t("all")} ({services.length})
        </button>
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "active"
              ? "bg-[#64748b] text-[#f8fafc]"
              : "bg-[#f8fafc] text-[#94a3b8] hover:bg-[#e2e8f0]"
          }`}
          onClick={() => setFilter("active")}
          type="button"
        >
          {t("active")} ({services.filter((s) => s.isActive).length})
        </button>
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "inactive"
              ? "bg-[#64748b] text-[#f8fafc]"
              : "bg-[#f8fafc] text-[#94a3b8] hover:bg-[#e2e8f0]"
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
        <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-12 text-center">
          <p className="font-semibold text-[#0f172a]">{t("noServices")}</p>
          <p className="mt-2 text-[#94a3b8] text-sm">{t("noServicesDescription")}</p>
          <button
            className="mt-6 rounded-xl bg-[#64748b] px-6 py-3 font-medium text-[#f8fafc] transition hover:bg-[#64748b]"
            type="button"
          >
            {t("createFirstService")}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-xl bg-[#f8fafc] p-4 text-[#64748b] text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-[#64748b]">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
