"use client";

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { confirm } from "@/lib/toast";

type Translator = ReturnType<typeof useTranslations>;

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
  const t = useTranslations("dashboard.customer.addressManager");
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

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(t("deleteConfirmation"), "Delete Address");
    if (confirmed) {
      // Store old addresses for undo
      const oldAddresses = addresses;
      const deletedAddress = addresses.find((addr) => addr.id === id);
      const newAddresses = addresses.filter((addr) => addr.id !== id);

      // If deleting default address and there are others, make first one default
      if (deletedAddress?.is_default && newAddresses.length > 0 && newAddresses[0]) {
        newAddresses[0].is_default = true;
      }

      // Update addresses
      handleAddressesUpdate(newAddresses);

      // Show toast with undo
      toast.success(`${deletedAddress?.label || "Address"} deleted`, {
        duration: 5000,
        icon: <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />,
        action: {
          label: "Undo",
          onClick: () => {
            handleAddressesUpdate(oldAddresses);
          },
        },
      });
    }
  };

  const handleSave = (address: SavedAddress) => {
    let newAddresses: SavedAddress[];

    if (editingId) {
      // Editing existing
      newAddresses = addresses.map((addr) => (addr.id === editingId ? address : addr));
      toast.success("Address updated successfully", {
        icon: <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />,
      });
    } else {
      // Adding new
      newAddresses = [...addresses, address];
      toast.success("Address added successfully", {
        icon: <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />,
      });
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

  const editingAddress = editingId ? addresses.find((addr) => addr.id === editingId) : null;

  return (
    <div className="space-y-6">
      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              address={address}
              isSelected={selectedAddressId === address.id}
              key={address.id}
              onDelete={showManagement ? () => handleDelete(address.id) : undefined}
              onEdit={showManagement ? () => handleEdit(address.id) : undefined}
              onSelect={() => onAddressSelect?.(address)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !isAdding && (
        <div className="border border-[neutral-200] bg-[neutral-50] p-12 text-center">
          <p className="text-[neutral-400] text-base">{t("emptyState.message")}</p>
          {showManagement && (
            <button
              className="mt-4 font-semibold text-[neutral-500] text-base hover:text-[neutral-500]"
              onClick={handleAddNew}
              type="button"
            >
              {t("emptyState.addFirstButton")} →
            </button>
          )}
        </div>
      )}

      {/* Add New Button */}
      {addresses.length > 0 && !isAdding && !editingId && showManagement && (
        <button
          className="flex w-full items-center justify-center gap-2 border-2 border-[neutral-200] border-dashed bg-[neutral-50] px-6 py-4 font-semibold text-[neutral-400] text-base transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={handleAddNew}
          type="button"
        >
          <span className="text-xl">+</span>
          {t("addNewButton")}
        </button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <AddressForm
          address={editingAddress}
          isDefault={addresses.length === 0} // First address is always default
          onCancel={handleCancel}
          onSave={handleSave}
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
  const t = useTranslations("dashboard.customer.addressManager");
  const addressText = [address.street, address.neighborhood, address.city, address.postal_code]
    .filter(Boolean)
    .join(", ");

  const baseClasses = ` border p-6 shadow-sm transition ${
    isSelected
      ? "border-[neutral-500] bg-[neutral-500]/5 ring-2 ring-[neutral-500]/20"
      : "border-[neutral-200] bg-[neutral-50] hover:shadow-md"
  }`;

  const content = (
    <AddressCardBody
      address={address}
      addressText={addressText}
      onDelete={onDelete}
      onEdit={onEdit}
      preventParentClick={Boolean(onSelect)}
      t={t}
    />
  );

  if (onSelect) {
    return (
      <button
        className={`${baseClasses} w-full cursor-pointer text-left`}
        onClick={onSelect}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

type AddressCardBodyProps = {
  address: SavedAddress;
  addressText: string;
  onEdit?: () => void;
  onDelete?: () => void;
  preventParentClick: boolean;
  t: Translator;
};

function AddressCardBody({
  address,
  addressText,
  onEdit,
  onDelete,
  preventParentClick,
  t,
}: AddressCardBodyProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <AddressHeader address={address} t={t} />
        <p className="mt-3 text-[neutral-400] text-base">{addressText}</p>
        <AddressOptionalDetails address={address} t={t} />
      </div>
      <AddressCardActions
        onDelete={onDelete}
        onEdit={onEdit}
        preventParentClick={preventParentClick}
        t={t}
      />
    </div>
  );
}

function AddressHeader({ address, t }: { address: SavedAddress; t: Translator }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{getAddressIcon(address.label)}</span>
      <h4 className="font-semibold text-[neutral-900] text-lg">{address.label}</h4>
      {address.is_default && (
        <span className="bg-[neutral-500]/10 px-3 py-1 font-semibold text-[neutral-500] text-xs">
          {t("addressCard.defaultBadge")}
        </span>
      )}
    </div>
  );
}

function AddressOptionalDetails({ address, t }: { address: SavedAddress; t: Translator }) {
  const detailConfigs = [
    {
      icon: "🔑",
      label: t("addressCard.buildingAccess"),
      value: address.building_access,
    },
    {
      icon: "🅿️",
      label: t("addressCard.parkingInfo"),
      value: address.parking_info,
    },
    {
      icon: "📝",
      label: t("addressCard.specialNotes"),
      value: address.special_notes,
    },
  ];

  const details = detailConfigs
    .filter((detail) => Boolean(detail.value))
    .map((detail) => ({
      icon: detail.icon,
      label: detail.label,
      value: detail.value as string,
    }));

  if (details.length === 0) {
    return null;
  }

  return (
    <>
      {details.map((detail) => (
        <p className="mt-2 text-[neutral-400] text-sm" key={detail.label}>
          {detail.icon} <span className="font-semibold">{detail.label}:</span> {detail.value}
        </p>
      ))}
    </>
  );
}

type AddressCardActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  preventParentClick: boolean;
  t: Translator;
};

function AddressCardActions({ onEdit, onDelete, preventParentClick, t }: AddressCardActionsProps) {
  if (!(onEdit || onDelete)) {
    return null;
  }

  const wrapHandler = (handler?: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
    if (preventParentClick) {
      event.stopPropagation();
    }
    handler?.();
  };

  return (
    <div className="flex gap-2">
      {onEdit && (
        <button
          className="border-2 border-[neutral-200] px-4 py-2 font-semibold text-[neutral-900] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={wrapHandler(onEdit)}
          type="button"
        >
          {t("addressCard.editButton")}
        </button>
      )}
      {onDelete && (
        <button
          className="border-2 border-[neutral-500]/30 px-4 py-2 font-semibold text-[neutral-500] text-sm transition hover:bg-[neutral-500]/10"
          onClick={wrapHandler(onDelete)}
          type="button"
        >
          {t("addressCard.deleteButton")}
        </button>
      )}
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
  const t = useTranslations("dashboard.customer.addressManager");
  const [formData, setFormData] = useState<Omit<SavedAddress, "id" | "created_at">>({
    label: address?.label || "",
    is_default: address?.is_default ?? isDefault ?? false,
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
      className="space-y-6 border border-[neutral-200] bg-[neutral-50] p-8 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h4 className="font-semibold text-[neutral-900] text-xl">
        {address ? t("form.editTitle") : t("form.addTitle")}
      </h4>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="address-label"
          >
            {t("form.labelField")} *
          </label>
          <input
            className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="address-label"
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder={t("form.labelPlaceholder")}
            required
            type="text"
            value={formData.label}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="address-city"
          >
            {t("form.cityField")} *
          </label>
          <input
            className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="address-city"
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder={t("form.cityPlaceholder")}
            required
            type="text"
            value={formData.city}
          />
        </div>
      </div>

      <div>
        <label
          className="mb-2 block font-semibold text-[neutral-900] text-base"
          htmlFor="address-street"
        >
          {t("form.streetField")} *
        </label>
        <input
          className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="address-street"
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder={t("form.streetPlaceholder")}
          required
          type="text"
          value={formData.street}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="address-neighborhood"
          >
            {t("form.neighborhoodField")}
          </label>
          <input
            className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="address-neighborhood"
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder={t("form.neighborhoodPlaceholder")}
            type="text"
            value={formData.neighborhood}
          />
        </div>

        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-base"
            htmlFor="address-postal-code"
          >
            {t("form.postalCodeField")}
          </label>
          <input
            className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="address-postal-code"
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder={t("form.postalCodePlaceholder")}
            type="text"
            value={formData.postal_code}
          />
        </div>
      </div>

      <div>
        <label
          className="mb-2 block font-semibold text-[neutral-900] text-base"
          htmlFor="address-building-access"
        >
          {t("form.buildingAccessField")}
        </label>
        <input
          className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="address-building-access"
          onChange={(e) => setFormData({ ...formData, building_access: e.target.value })}
          placeholder={t("form.buildingAccessPlaceholder")}
          type="text"
          value={formData.building_access}
        />
      </div>

      <div>
        <label
          className="mb-2 block font-semibold text-[neutral-900] text-base"
          htmlFor="address-parking-info"
        >
          {t("form.parkingInfoField")}
        </label>
        <input
          className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="address-parking-info"
          onChange={(e) => setFormData({ ...formData, parking_info: e.target.value })}
          placeholder={t("form.parkingInfoPlaceholder")}
          type="text"
          value={formData.parking_info}
        />
      </div>

      <div>
        <label
          className="mb-2 block font-semibold text-[neutral-900] text-base"
          htmlFor="address-special-notes"
        >
          {t("form.specialNotesField")}
        </label>
        <textarea
          className="w-full border border-[neutral-200] px-4 py-4 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
          id="address-special-notes"
          onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
          placeholder={t("form.specialNotesPlaceholder")}
          rows={3}
          value={formData.special_notes}
        />
      </div>

      {!isDefault && (
        <label className="flex items-center gap-3">
          <input
            checked={formData.is_default}
            className="h-5 w-5 rounded border-[neutral-200] text-[neutral-500] focus:ring-[neutral-500]"
            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
            type="checkbox"
          />
          <span className="text-[neutral-900] text-base">{t("form.setDefaultCheckbox")}</span>
        </label>
      )}

      <div className="flex justify-end gap-3 border-[neutral-200] border-t pt-6">
        <button
          className="border-2 border-[neutral-200] px-6 py-3 font-semibold text-[neutral-900] text-base transition hover:border-[neutral-500] hover:text-[neutral-500]"
          onClick={onCancel}
          type="button"
        >
          {t("form.cancelButton")}
        </button>
        <button
          className="bg-[neutral-500] px-6 py-3 font-semibold text-[neutral-50] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[neutral-500]"
          type="submit"
        >
          {address ? t("form.saveButton") : t("form.addButton")}
        </button>
      </div>
    </form>
  );
}

function getAddressIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("home") || lower.includes("casa")) {
    return "🏠";
  }
  if (lower.includes("office") || lower.includes("work") || lower.includes("oficina")) {
    return "🏢";
  }
  if (lower.includes("apartment") || lower.includes("apt")) {
    return "🏢";
  }
  return "📍";
}
