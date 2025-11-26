"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { confirm } from "@/lib/toast";

export type ServiceAddon = {
  id: string;
  professional_id: string;
  name: string;
  description?: string | null;
  price_cop: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  addons: ServiceAddon[];
  onAddonsChange?: (addons: ServiceAddon[]) => void;
  professionalId: string;
};

export function ServiceAddonsManager({
  addons: initialAddons,
  onAddonsChange,
  professionalId,
}: Props) {
  const t = useTranslations("dashboard.pro.serviceAddons");
  const [addons, setAddons] = useState<ServiceAddon[]>(initialAddons);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    setAddons(initialAddons);
  }, [initialAddons]);

  const handleAddonsUpdate = (newAddons: ServiceAddon[]) => {
    setAddons(newAddons);
    onAddonsChange?.(newAddons);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsAdding(false);
  };

  const persistAddon = async (
    payload: Omit<ServiceAddon, "id" | "created_at" | "updated_at" | "professional_id"> & {
      id?: string;
    }
  ): Promise<ServiceAddon | null> => {
    try {
      setSubmittingId(payload.id ?? "new");

      // Update existing
      if (payload.id) {
        const response = await fetch(`/api/professional/addons/${payload.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            price_cop: payload.price_cop,
            duration_minutes: payload.duration_minutes,
            is_active: payload.is_active,
          }),
        });

        const body = await response.json();
        if (!response.ok) {
          throw new Error(body?.error || "Failed to update add-on");
        }
        return body.addon as ServiceAddon;
      }

      // Create new
      const response = await fetch("/api/professional/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          price_cop: payload.price_cop,
          duration_minutes: payload.duration_minutes,
          is_active: payload.is_active,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Failed to create add-on");
      }
      return body.addon as ServiceAddon;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast.error(message);
      return null;
    } finally {
      setSubmittingId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    const target = addons.find((addon) => addon.id === id);
    if (!target) {
      return;
    }

    const updated = await persistAddon({
      id,
      name: target.name,
      description: target.description || undefined,
      price_cop: target.price_cop,
      duration_minutes: target.duration_minutes,
      is_active: !target.is_active,
    });

    if (updated) {
      handleAddonsUpdate(addons.map((addon) => (addon.id === id ? updated : addon)));
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(t("deleteConfirm"), "Delete Service Addon");
    if (!confirmed) {
      return;
    }

    try {
      setSubmittingId(id);
      const response = await fetch(`/api/professional/addons/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete add-on");
      }
      handleAddonsUpdate(addons.filter((addon) => addon.id !== id));
      toast.success(t("deleted"));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSave = async (addon: ServiceAddon) => {
    const result = await persistAddon({
      id: editingId ?? addon.id,
      name: addon.name,
      description: addon.description,
      price_cop: addon.price_cop,
      duration_minutes: addon.duration_minutes,
      is_active: addon.is_active,
    });

    if (result) {
      const exists = addons.some((a) => a.id === result.id);
      const newAddons = exists
        ? addons.map((a) => (a.id === result.id ? result : a))
        : [...addons, result];
      handleAddonsUpdate(newAddons);
      toast.success(editingId ? t("updated") : t("created"));
    }

    setIsAdding(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const editingAddon = editingId ? addons.find((addon) => addon.id === editingId) : null;

  const activeAddons = addons.filter((a) => a.is_active);
  const inactiveAddons = addons.filter((a) => !a.is_active);

  return (
    <div className="space-y-4">
      {/* Active Add-ons */}
      {activeAddons.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-[neutral-900] text-sm">
            {t("activeAddons", { count: activeAddons.length })}
          </h4>
          {activeAddons.map((addon) => (
            <AddonCard
              addon={addon}
              isLoading={submittingId === addon.id}
              key={addon.id}
              onDelete={() => handleDelete(addon.id)}
              onEdit={() => handleEdit(addon.id)}
              onToggleActive={() => handleToggleActive(addon.id)}
            />
          ))}
        </div>
      )}

      {/* Inactive Add-ons */}
      {inactiveAddons.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-[neutral-400] text-sm">
            {t("inactiveAddons", { count: inactiveAddons.length })}
          </h4>
          {inactiveAddons.map((addon) => (
            <AddonCard
              addon={addon}
              isLoading={submittingId === addon.id}
              key={addon.id}
              onDelete={() => handleDelete(addon.id)}
              onEdit={() => handleEdit(addon.id)}
              onToggleActive={() => handleToggleActive(addon.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {addons.length === 0 && !isAdding && (
        <div className="border border-[neutral-200] bg-[neutral-50]/90 p-8 text-center">
          <p className="text-[neutral-400] text-sm">{t("emptyState")}</p>
          <button
            className="mt-3 font-semibold text-[neutral-500] text-sm hover:text-[neutral-500]"
            onClick={handleAddNew}
            type="button"
          >
            {t("createFirst")}
          </button>
        </div>
      )}

      {/* Add New Button */}
      {addons.length > 0 && !isAdding && !editingId && (
        <button
          className="flex w-full items-center justify-center gap-2 border-2 border-[neutral-200] border-dashed bg-[neutral-50]/90 px-4 py-3 font-semibold text-[neutral-400] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={handleAddNew}
          type="button"
        >
          <span className="text-lg">+</span>
          {t("addNew")}
        </button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <AddonForm
          addon={editingAddon}
          onCancel={handleCancel}
          onSave={handleSave}
          professionalId={professionalId}
        />
      )}
    </div>
  );
}

function AddonCard({
  addon,
  onEdit,
  onToggleActive,
  onDelete,
  isLoading,
}: {
  addon: ServiceAddon;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.pro.serviceAddons");
  const priceFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(addon.price_cop);

  const durationFormatted =
    addon.duration_minutes > 0
      ? addon.duration_minutes === 60
        ? t("duration.hour")
        : t("duration.minutes", { minutes: addon.duration_minutes })
      : t("duration.noExtra");

  return (
    <div
      className={`border p-4 transition ${
        addon.is_active
          ? "border-[neutral-200] bg-[neutral-50]"
          : "border-[neutral-200] bg-[neutral-50] opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[neutral-900]">{addon.name}</h4>
            {!addon.is_active && (
              <span className="bg-[neutral-200] px-2 py-0.5 font-semibold text-[neutral-400] text-xs">
                {t("inactive")}
              </span>
            )}
          </div>
          {addon.description && (
            <p className="mt-1 text-[neutral-400] text-sm">{addon.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[neutral-400] text-xs">
            <span className="font-semibold text-[neutral-500]">{priceFormatted}</span>
            <span>⏱️ {durationFormatted}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="px-2 py-1 font-medium text-[neutral-400] text-xs transition hover:bg-[neutral-200] hover:text-[neutral-500]"
            disabled={isLoading}
            onClick={onEdit}
            type="button"
          >
            {t("actions.edit")}
          </button>
          <button
            className="px-2 py-1 font-medium text-[neutral-400] text-xs transition hover:bg-[neutral-200] hover:text-[neutral-500]"
            disabled={isLoading}
            onClick={onToggleActive}
            type="button"
          >
            {addon.is_active ? t("actions.deactivate") : t("actions.activate")}
          </button>
          <button
            className="px-2 py-1 font-medium text-[neutral-500] text-xs transition hover:bg-[neutral-500]/10"
            disabled={isLoading}
            onClick={onDelete}
            type="button"
          >
            {t("actions.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddonForm({
  addon,
  professionalId,
  onSave,
  onCancel,
}: {
  addon?: ServiceAddon | null;
  professionalId: string;
  onSave: (addon: ServiceAddon) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("dashboard.pro.serviceAddons");
  const [formData, setFormData] = useState<Omit<ServiceAddon, "id" | "created_at" | "updated_at">>({
    professional_id: addon?.professional_id || professionalId,
    name: addon?.name || "",
    description: addon?.description || "",
    price_cop: addon?.price_cop || 0,
    duration_minutes: addon?.duration_minutes || 0,
    is_active: addon?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedAddon: ServiceAddon = {
      id: addon?.id || crypto.randomUUID(),
      ...formData,
      created_at: addon?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(savedAddon);
  };

  return (
    <form
      className="space-y-4 border border-[neutral-200] bg-[neutral-50] p-4"
      onSubmit={handleSubmit}
    >
      <h4 className="font-semibold text-[neutral-900]">
        {addon ? t("form.editTitle") : t("form.createTitle")}
      </h4>

      <div>
        <label className="mb-1 block font-medium text-[neutral-900] text-sm" htmlFor="addon-name">
          {t("form.fields.name.label")}
        </label>
        <input
          className="w-full border border-[neutral-200] px-3 py-2 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="addon-name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("form.fields.name.placeholder")}
          required
          type="text"
          value={formData.name}
        />
      </div>

      <div>
        <label
          className="mb-1 block font-medium text-[neutral-900] text-sm"
          htmlFor="addon-description"
        >
          {t("form.fields.description.label")}
        </label>
        <textarea
          className="w-full border border-[neutral-200] px-3 py-2 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="addon-description"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t("form.fields.description.placeholder")}
          rows={2}
          value={formData.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="mb-1 block font-medium text-[neutral-900] text-sm"
            htmlFor="addon-price"
          >
            {t("form.fields.price.label")}
          </label>
          <input
            className="w-full border border-[neutral-200] px-3 py-2 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="addon-price"
            min="0"
            onChange={(e) =>
              setFormData({ ...formData, price_cop: Number.parseInt(e.target.value, 10) })
            }
            placeholder={t("form.fields.price.placeholder")}
            required
            step="1000"
            type="number"
            value={formData.price_cop}
          />
        </div>

        <div>
          <label
            className="mb-1 block font-medium text-[neutral-900] text-sm"
            htmlFor="addon-duration"
          >
            {t("form.fields.extraTime.label")}
          </label>
          <input
            className="w-full border border-[neutral-200] px-3 py-2 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="addon-duration"
            min="0"
            onChange={(e) =>
              setFormData({
                ...formData,
                duration_minutes: Number.parseInt(e.target.value, 10),
              })
            }
            placeholder={t("form.fields.extraTime.placeholder")}
            step="15"
            type="number"
            value={formData.duration_minutes}
          />
          <p className="mt-1 text-[neutral-400] text-xs">{t("form.fields.extraTime.helper")}</p>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          checked={formData.is_active}
          className="rounded"
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          type="checkbox"
        />
        <span className="text-[neutral-900] text-sm">{t("form.fields.active.label")}</span>
      </label>

      <div className="flex justify-end gap-3">
        <button
          className="border border-[neutral-200] px-4 py-2 font-semibold text-[neutral-400] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={onCancel}
          type="button"
        >
          {t("form.cancel")}
        </button>
        <button
          className="bg-[neutral-500] px-4 py-2 font-semibold text-[neutral-50] text-sm transition hover:bg-[neutral-500]"
          type="submit"
        >
          {addon ? t("form.saveChanges") : t("form.createAddon")}
        </button>
      </div>
    </form>
  );
}
