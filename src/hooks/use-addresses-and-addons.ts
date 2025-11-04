import { useEffect, useState } from "react";
import type { SavedAddress } from "@/components/addresses/saved-addresses-manager";
import type { ServiceAddon } from "@/components/service-addons/service-addons-manager";

type UseAddressesAndAddonsProps = {
  professionalId: string;
  initialAddresses?: SavedAddress[];
  initialAddons?: ServiceAddon[];
};

export function useAddressesAndAddons({
  professionalId,
  initialAddresses = [],
  initialAddons = [],
}: UseAddressesAndAddonsProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [addons, setAddons] = useState<ServiceAddon[]>(initialAddons);

  // Load saved addresses on mount
  useEffect(() => {
    if (initialAddresses.length === 0) {
      fetch("/api/customer/addresses")
        .then((res) => res.json())
        .then((data) => setAddresses(data.addresses || []))
        .catch(console.error);
    }
  }, [initialAddresses]);

  // Load available add-ons on mount
  useEffect(() => {
    if (initialAddons.length === 0) {
      fetch(`/api/professionals/${professionalId}/addons`)
        .then((res) => res.json())
        .then((data) => setAddons(data.addons || []))
        .catch(console.error);
    }
  }, [professionalId, initialAddons]);

  const handleAddressesChange = async (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses);
    try {
      await fetch("/api/customer/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: newAddresses }),
      });
    } catch (_err) {
      // Silent fail - non-critical
    }
  };

  return {
    addresses,
    addons,
    handleAddressesChange,
  };
}
