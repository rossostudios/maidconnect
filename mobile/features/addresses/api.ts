import { supabase } from "@/lib/supabase";
import type { Address, AddressRecord, CreateAddressParams, UpdateAddressParams } from "./types";

/**
 * Transform database record to Address type
 */
function mapAddressRecord(record: AddressRecord): Address {
  return {
    id: record.id,
    userId: record.user_id,
    label: record.label,
    streetAddress: record.street_address,
    neighborhood: record.neighborhood,
    city: record.city,
    state: record.state,
    postalCode: record.postal_code,
    country: record.country,
    apartmentUnit: record.apartment_unit,
    accessInstructions: record.access_instructions,
    isDefault: record.is_default,
    createdAt: new Date(record.created_at),
  };
}

/**
 * Fetch all addresses for the current user
 */
export async function fetchAddresses(): Promise<Address[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", session.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const records = data as AddressRecord[];
  return records.map(mapAddressRecord);
}

/**
 * Create a new address
 */
export async function createAddress(params: CreateAddressParams): Promise<Address> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // If setting as default, unset other defaults first
  if (params.isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", session.user.id);
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert({
      user_id: session.user.id,
      label: params.label || null,
      street_address: params.streetAddress,
      neighborhood: params.neighborhood || null,
      city: params.city,
      state: params.state || null,
      postal_code: params.postalCode || null,
      country: params.country,
      apartment_unit: params.apartmentUnit || null,
      access_instructions: params.accessInstructions || null,
      is_default: params.isDefault || false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapAddressRecord(data as AddressRecord);
}

/**
 * Update an existing address
 */
export async function updateAddress(params: UpdateAddressParams): Promise<Address> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // If setting as default, unset other defaults first
  if (params.isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", session.user.id)
      .neq("id", params.id);
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .update({
      label: params.label || null,
      street_address: params.streetAddress,
      neighborhood: params.neighborhood || null,
      city: params.city,
      state: params.state || null,
      postal_code: params.postalCode || null,
      country: params.country,
      apartment_unit: params.apartmentUnit || null,
      access_instructions: params.accessInstructions || null,
      is_default: params.isDefault || false,
    })
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapAddressRecord(data as AddressRecord);
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", session.user.id);

  if (error) {
    throw error;
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Unset all defaults
  await supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("user_id", session.user.id);

  // Set new default
  const { error } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", session.user.id);

  if (error) {
    throw error;
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: Address): string {
  const parts: string[] = [];

  if (address.label) {
    parts.push(address.label);
  }

  parts.push(address.streetAddress);

  if (address.apartmentUnit) {
    parts.push(`Unit ${address.apartmentUnit}`);
  }

  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }

  parts.push(address.city);

  if (address.state) {
    parts.push(address.state);
  }

  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  return parts.join(", ");
}

/**
 * Format address for one line (compact)
 */
export function formatAddressCompact(address: Address): string {
  const parts: string[] = [];

  if (address.label) {
    return `${address.label} (${address.streetAddress}, ${address.city})`;
  }

  parts.push(address.streetAddress);
  parts.push(address.city);

  return parts.join(", ");
}
