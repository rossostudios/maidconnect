"use client";

import { useState } from "react";

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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
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

  const editingAddon = editingId
    ? addons.find((addon) => addon.id === editingId)
    : null;

  const activeAddons = addons.filter((a) => a.is_active);
  const inactiveAddons = addons.filter((a) => !a.is_active);

  return (
    <div className="space-y-4">
      {/* Active Add-ons */}
      {activeAddons.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#211f1a]">
            Active Add-ons ({activeAddons.length})
          </h4>
          {activeAddons.map((addon) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              onEdit={() => handleEdit(addon.id)}
              onToggleActive={() => handleToggleActive(addon.id)}
              onDelete={() => handleDelete(addon.id)}
            />
          ))}
        </div>
      )}

      {/* Inactive Add-ons */}
      {inactiveAddons.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-[#7a6d62]">
            Inactive Add-ons ({inactiveAddons.length})
          </h4>
          {inactiveAddons.map((addon) => (
            <AddonCard
              key={addon.id}
              addon={addon}
              onEdit={() => handleEdit(addon.id)}
              onToggleActive={() => handleToggleActive(addon.id)}
              onDelete={() => handleDelete(addon.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {addons.length === 0 && !isAdding && (
        <div className="rounded-lg border border-[#f0ece5] bg-white/90 p-8 text-center">
          <p className="text-sm text-[#7a6d62]">
            No add-ons yet. Create your first add-on to offer extra services to
            customers.
          </p>
          <button
            onClick={handleAddNew}
            className="mt-3 text-sm font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
          >
            Create your first add-on →
          </button>
        </div>
      )}

      {/* Add New Button */}
      {addons.length > 0 && !isAdding && !editingId && (
        <button
          onClick={handleAddNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e5dfd4] bg-white/90 px-4 py-3 text-sm font-semibold text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          <span className="text-lg">+</span>
          Add new service add-on
        </button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <AddonForm
          addon={editingAddon}
          professionalId={professionalId}
          onSave={handleSave}
          onCancel={handleCancel}
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
  const priceFormatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(addon.price_cop);

  const durationFormatted =
    addon.duration_minutes > 0
      ? addon.duration_minutes === 60
        ? "1 hour"
        : `${addon.duration_minutes} minutes`
      : "No extra time";

  return (
    <div
      className={`rounded-lg border p-4 transition ${
        addon.is_active
          ? "border-[#e5dfd4] bg-white"
          : "border-[#ebe5d8] bg-gray-50 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[#211f1a]">{addon.name}</h4>
            {!addon.is_active && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                Inactive
              </span>
            )}
          </div>
          {addon.description && (
            <p className="mt-1 text-sm text-[#7a6d62]">{addon.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7a6d62]">
            <span className="font-semibold text-[#ff5d46]">
              {priceFormatted}
            </span>
            <span>⏱️ {durationFormatted}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-md px-2 py-1 text-xs font-medium text-[#7a6d62] transition hover:bg-[#f0ece5] hover:text-[#ff5d46]"
          >
            Edit
          </button>
          <button
            onClick={onToggleActive}
            className="rounded-md px-2 py-1 text-xs font-medium text-[#7a6d62] transition hover:bg-[#f0ece5] hover:text-[#ff5d46]"
          >
            {addon.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={onDelete}
            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
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
  const [formData, setFormData] = useState<
    Omit<ServiceAddon, "id" | "created_at" | "updated_at">
  >({
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
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-[#f0ece5] bg-white p-4"
    >
      <h4 className="font-semibold text-[#211f1a]">
        {addon ? "Edit Add-on" : "Create New Add-on"}
      </h4>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#211f1a]">
          Service Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Deep cleaning, Window washing, Inside fridge"
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[#211f1a]">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe what this add-on includes..."
          rows={2}
          className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#211f1a]">
            Price (COP) *
          </label>
          <input
            type="number"
            value={formData.price_cop}
            onChange={(e) =>
              setFormData({ ...formData, price_cop: parseInt(e.target.value) })
            }
            placeholder="50000"
            min="0"
            step="1000"
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#211f1a]">
            Extra Time (minutes)
          </label>
          <input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                duration_minutes: parseInt(e.target.value),
              })
            }
            placeholder="0"
            min="0"
            step="15"
            className="w-full rounded-md border border-[#e5dfd4] px-3 py-2 text-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d46]/20"
          />
          <p className="mt-1 text-xs text-[#7a6d62]">
            Set to 0 if this doesn't add extra time
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.target.checked })
          }
          className="rounded"
        />
        <span className="text-sm text-[#211f1a]">
          Active (customers can see and book this add-on)
        </span>
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#e5dfd4] px-4 py-2 text-sm font-semibold text-[#7a6d62] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-[#ff5d46] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#eb6c65]"
        >
          {addon ? "Save Changes" : "Create Add-on"}
        </button>
      </div>
    </form>
  );
}
