"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { confirm } from "@/lib/toast";

export type ServiceAddon = {
  id: string;
  professional_id: string;
  name: string;
  description?: string;
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

  const handleToggleActive = (id: string) => {
    const newAddons = addons.map((addon) =>
      addon.id === id ? { ...addon, is_active: !addon.is_active } : addon
    );
    handleAddonsUpdate(newAddons);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(t("deleteConfirm"), "Delete Service Addon");
    if (confirmed) {
      const newAddons = addons.filter((addon) => addon.id !== id);
      handleAddonsUpdate(newAddons);
    }
  };

  const handleSave = (addon: ServiceAddon) => {
    let newAddons: ServiceAddon[];

    if (editingId) {
      // Editing existing
      newAddons = addons.map((a) => (a.id === editingId ? addon : a));
    } else {
      // Adding new
      newAddons = [...addons, addon];
    }

    handleAddonsUpdate(newAddons);
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
          <h4 className="font-semibold text-gray-900 text-sm">
            {t("activeAddons", { count: activeAddons.length })}
          </h4>
          {activeAddons.map((addon) => (
            <AddonCard
              addon={addon}
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
          <h4 className="font-semibold text-[#7a6d62] text-sm">
            {t("inactiveAddons", { count: inactiveAddons.length })}
          </h4>
          {inactiveAddons.map((addon) => (
            <AddonCard
              addon={addon}
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
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-8 text-center">
          <p className="text-[#7a6d62] text-sm">{t("emptyState")}</p>
          <button
            className="mt-3 font-semibold text-[#E85D48] text-sm hover:text-red-700"
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
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#e5dfd4] border-dashed bg-white/90 px-4 py-3 font-semibold text-[#7a6d62] text-sm transition hover:border-[#E85D48] hover:text-[#E85D48]"
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
}: {
  addon: ServiceAddon;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
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
      className={`rounded-lg border p-4 transition ${
        addon.is_active ? "border-[#e5dfd4] bg-white" : "border-[#ebe5d8] bg-gray-50 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">{addon.name}</h4>
            {!addon.is_active && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 font-semibold text-gray-600 text-xs">
                {t("inactive")}
              </span>
            )}
          </div>
          {addon.description && <p className="mt-1 text-[#7a6d62] text-sm">{addon.description}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[#7a6d62] text-xs">
            <span className="font-semibold text-[#E85D48]">{priceFormatted}</span>
            <span>⏱️ {durationFormatted}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="rounded-md px-2 py-1 font-medium text-[#7a6d62] text-xs transition hover:bg-[#f0ece5] hover:text-[#E85D48]"
            onClick={onEdit}
            type="button"
          >
            {t("actions.edit")}
          </button>
          <button
            className="rounded-md px-2 py-1 font-medium text-[#7a6d62] text-xs transition hover:bg-[#f0ece5] hover:text-[#E85D48]"
            onClick={onToggleActive}
            type="button"
          >
            {addon.is_active ? t("actions.deactivate") : t("actions.activate")}
          </button>
          <button
            className="rounded-md px-2 py-1 font-medium text-[#E85D48] text-xs transition hover:bg-[#E85D48]/10"
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
      className="space-y-4 rounded-lg border border-[#f0ece5] bg-white p-4"
      onSubmit={handleSubmit}
    >
      <h4 className="font-semibold text-gray-900">
        {addon ? t("form.editTitle") : t("form.createTitle")}
      </h4>

      <div>
        <label className="mb-1 block font-medium text-gray-900 text-sm" htmlFor="addon-name">
          {t("form.fields.name.label")}
        </label>
        <input
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
          id="addon-name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("form.fields.name.placeholder")}
          required
          type="text"
          value={formData.name}
        />
      </div>

      <div>
        <label className="mb-1 block font-medium text-gray-900 text-sm" htmlFor="addon-description">
          {t("form.fields.description.label")}
        </label>
        <textarea
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
          id="addon-description"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t("form.fields.description.placeholder")}
          rows={2}
          value={formData.description}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium text-gray-900 text-sm" htmlFor="addon-price">
            {t("form.fields.price.label")}
          </label>
          <input
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
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
          <label className="mb-1 block font-medium text-gray-900 text-sm" htmlFor="addon-duration">
            {t("form.fields.extraTime.label")}
          </label>
          <input
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
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
          <p className="mt-1 text-[#7a6d62] text-xs">{t("form.fields.extraTime.helper")}</p>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          checked={formData.is_active}
          className="rounded"
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          type="checkbox"
        />
        <span className="text-gray-900 text-sm">{t("form.fields.active.label")}</span>
      </label>

      <div className="flex justify-end gap-3">
        <button
          className="rounded-md border border-[#e5dfd4] px-4 py-2 font-semibold text-[#7a6d62] text-sm transition hover:border-[#E85D48] hover:text-[#E85D48]"
          onClick={onCancel}
          type="button"
        >
          {t("form.cancel")}
        </button>
        <button
          className="rounded-md bg-[#E85D48] px-4 py-2 font-semibold text-sm text-white transition hover:bg-[#D64A36]"
          type="submit"
        >
          {addon ? t("form.saveChanges") : t("form.createAddon")}
        </button>
      </div>
    </form>
  );
}
