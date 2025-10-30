"use client";

import { useState } from "react";

export type SavedAddress = {
  id: string;
  label: string;
  is_default: boolean;
  street: string;
  neighborhood?: string;
  city: string;
  postal_code?: string;
  building_access?: string;
  parking_info?: string;
  special_notes?: string;
  created_at: string;
};

type Props = {
  addresses: SavedAddress[];
  onAddressSelect?: (address: SavedAddress) => void;
  onAddressesChange?: (addresses: SavedAddress[]) => void;
  selectedAddressId?: string;
  showManagement?: boolean; // Show add/edit/delete functionality
};

export function SavedAddressesManager({
  addresses: initialAddresses,
  onAddressSelect,
  onAddressesChange,
  selectedAddressId,
  showManagement = true,
}: Props) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddressesUpdate = (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    onAddressesChange?.(newAddresses);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const newAddresses = addresses.filter((addr) => addr.id !== id);

      // If deleting default address and there are others, make first one default
      const deletedAddress = addresses.find((addr) => addr.id === id);
      if (deletedAddress?.is_default && newAddresses.length > 0) {
        newAddresses[0].is_default = true;
      }

      handleAddressesUpdate(newAddresses);
    }
  };

  const handleSave = (address: SavedAddress) => {
    let newAddresses: SavedAddress[];

    if (editingId) {
      // Editing existing
      newAddresses = addresses.map((addr) =>
        addr.id === editingId ? address : addr
      );
    } else {
      // Adding new
      newAddresses = [...addresses, address];
    }

    // If this is set as default, unset others
    if (address.is_default) {
      newAddresses = newAddresses.map((addr) =>
        addr.id === address.id ? addr : { ...addr, is_default: false }
      );
    }

    handleAddressesUpdate(newAddresses);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const editingAddress = editingId
    ? addresses.find((addr) => addr.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={() => onAddressSelect?.(address)}
              onEdit={showManagement ? () => handleEdit(address.id) : undefined}
              onDelete={showManagement ? () => handleDelete(address.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !isAdding && (
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
          <p className="text-base text-[#5d574b]">No saved addresses yet.</p>
          {showManagement && (
            <button
              onClick={handleAddNew}
              className="mt-4 text-base font-semibold text-[#ff5d46] hover:text-[#eb6c65]"
            >
              Add your first address →
            </button>
          )}
        </div>
      )}

      {/* Add New Button */}
      {addresses.length > 0 && !isAdding && !editingId && showManagement && (
        <button
          onClick={handleAddNew}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#ebe5d8] bg-white px-6 py-4 text-base font-semibold text-[#5d574b] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          <span className="text-xl">+</span>
          Add new address
        </button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <AddressForm
          address={editingAddress}
          isDefault={addresses.length === 0} // First address is always default
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  address: SavedAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const addressText = [
    address.street,
    address.neighborhood,
    address.city,
    address.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`
        rounded-2xl border p-6 shadow-sm transition
        ${
          isSelected
            ? "border-[#ff5d46] bg-[#ff5d46]/5 ring-2 ring-[#ff5d46]/20"
            : "border-[#ebe5d8] bg-white hover:shadow-md"
        }
        ${onSelect ? "cursor-pointer" : ""}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getAddressIcon(address.label)}</span>
            <h4 className="text-lg font-semibold text-[#211f1a]">{address.label}</h4>
            {address.is_default && (
              <span className="rounded-full bg-[#ff5d46]/10 px-3 py-1 text-xs font-semibold text-[#ff5d46]">
                Default
              </span>
            )}
          </div>
          <p className="mt-3 text-base text-[#5d574b]">{addressText}</p>
          {address.building_access && (
            <p className="mt-2 text-sm text-[#5d574b]">
              🔑 {address.building_access}
            </p>
          )}
          {address.parking_info && (
            <p className="mt-2 text-sm text-[#5d574b]">
              🅿️ {address.parking_info}
            </p>
          )}
          {address.special_notes && (
            <p className="mt-2 text-sm text-[#5d574b]">
              📝 {address.special_notes}
            </p>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="rounded-full border-2 border-[#ebe5d8] px-4 py-2 text-sm font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="rounded-full border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AddressForm({
  address,
  isDefault,
  onSave,
  onCancel,
}: {
  address?: SavedAddress | null;
  isDefault?: boolean;
  onSave: (address: SavedAddress) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<SavedAddress, "id" | "created_at">>({
    label: address?.label || "",
    is_default: address?.is_default || isDefault || false,
    street: address?.street || "",
    neighborhood: address?.neighborhood || "",
    city: address?.city || "",
    postal_code: address?.postal_code || "",
    building_access: address?.building_access || "",
    parking_info: address?.parking_info || "",
    special_notes: address?.special_notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedAddress: SavedAddress = {
      id: address?.id || crypto.randomUUID(),
      ...formData,
      created_at: address?.created_at || new Date().toISOString(),
    };

    onSave(savedAddress);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#ebe5d8] bg-white p-8 space-y-6 shadow-sm"
    >
      <h4 className="text-xl font-semibold text-[#211f1a]">
        {address ? "Edit Address" : "Add New Address"}
      </h4>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-base font-semibold text-[#211f1a]">
            Label *
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="Home, Office, etc."
            className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-[#211f1a]">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Bogotá"
            className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-base font-semibold text-[#211f1a]">
          Street Address *
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="Calle 123 #45-67"
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-base font-semibold text-[#211f1a]">
            Neighborhood
          </label>
          <input
            type="text"
            value={formData.neighborhood}
            onChange={(e) =>
              setFormData({ ...formData, neighborhood: e.target.value })
            }
            placeholder="Chapinero"
            className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-semibold text-[#211f1a]">
            Postal Code
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) =>
              setFormData({ ...formData, postal_code: e.target.value })
            }
            placeholder="110111"
            className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-base font-semibold text-[#211f1a]">
          Building Access Instructions
        </label>
        <input
          type="text"
          value={formData.building_access}
          onChange={(e) =>
            setFormData({ ...formData, building_access: e.target.value })
          }
          placeholder="Ring apartment 301, gate code 1234"
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
        />
      </div>

      <div>
        <label className="mb-2 block text-base font-semibold text-[#211f1a]">
          Parking Information
        </label>
        <input
          type="text"
          value={formData.parking_info}
          onChange={(e) =>
            setFormData({ ...formData, parking_info: e.target.value })
          }
          placeholder="Visitor parking in basement"
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
        />
      </div>

      <div>
        <label className="mb-2 block text-base font-semibold text-[#211f1a]">
          Special Notes
        </label>
        <textarea
          value={formData.special_notes}
          onChange={(e) =>
            setFormData({ ...formData, special_notes: e.target.value })
          }
          placeholder="Dogs in backyard, use side entrance, etc."
          rows={3}
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-4 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
        />
      </div>

      {!isDefault && (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.is_default}
            onChange={(e) =>
              setFormData({ ...formData, is_default: e.target.checked })
            }
            className="h-5 w-5 rounded border-[#ebe5d8] text-[#ff5d46] focus:ring-[#ff5d46]"
          />
          <span className="text-base text-[#211f1a]">Set as default address</span>
        </label>
      )}

      <div className="flex justify-end gap-3 border-t border-[#ebe5d8] pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border-2 border-[#ebe5d8] px-6 py-3 text-base font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-[#ff5d46] px-6 py-3 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
        >
          {address ? "Save Changes" : "Add Address"}
        </button>
      </div>
    </form>
  );
}

function getAddressIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("home") || lower.includes("casa")) return "🏠";
  if (lower.includes("office") || lower.includes("work") || lower.includes("oficina")) return "🏢";
  if (lower.includes("apartment") || lower.includes("apt")) return "🏢";
  return "📍";
}
