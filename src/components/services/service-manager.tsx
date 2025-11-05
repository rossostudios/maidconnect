"use client";

import { Add01Icon, FilterIcon } from "hugeicons-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { deleteService, getServices } from "@/app/actions/services";
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
  }, [profileId]);

  const handleDelete = async (serviceId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    const response = await deleteService(serviceId);
    if (response.success) {
      loadServices(); // Reload services
    } else {
      alert(response.error);
    }
  };

  const handleEdit = (service: ProfessionalService) => {
    // TODO: Open edit modal/form
    console.log("Edit service:", service);
  };

  const filteredServices = services.filter((service) => {
    if (filter === "active") return service.isActive;
    if (filter === "inactive") return !service.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[var(--red)] border-t-2 border-b-2" />
          <p className="text-[#6b7280]">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border-2 border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-900">{t("error")}</p>
        <p className="mt-2 text-red-700 text-sm">{error}</p>
        <button
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 font-medium text-sm text-white transition hover:bg-red-700"
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
          <h2 className="font-bold text-2xl text-[var(--foreground)]">{t("title")}</h2>
          <p className="text-[#6b7280] text-sm">{t("description")}</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333]"
          type="button"
        >
          <Add01Icon className="h-4 w-4" />
          {t("createService")}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <FilterIcon className="h-5 w-5 text-[#6b7280]" />
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "all"
              ? "bg-[var(--red)] text-white"
              : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          {t("all")} ({services.length})
        </button>
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "active"
              ? "bg-[var(--red)] text-white"
              : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
          }`}
          onClick={() => setFilter("active")}
          type="button"
        >
          {t("active")} ({services.filter((s) => s.isActive).length})
        </button>
        <button
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            filter === "inactive"
              ? "bg-[var(--red)] text-white"
              : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
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
        <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-12 text-center">
          <p className="font-semibold text-[var(--foreground)]">{t("noServices")}</p>
          <p className="mt-2 text-[#6b7280] text-sm">{t("noServicesDescription")}</p>
          <button
            className="mt-6 rounded-xl bg-[var(--red)] px-6 py-3 font-medium text-white transition hover:bg-[#cc3333]"
            type="button"
          >
            {t("createFirstService")}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-xl bg-blue-50 p-4 text-blue-900 text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-blue-800">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
