export type Address = {
  id: string;
  userId: string;
  label: string | null;
  streetAddress: string;
  neighborhood: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  apartmentUnit: string | null;
  accessInstructions: string | null;
  isDefault: boolean;
  createdAt: Date;
};

export type AddressRecord = {
  id: string;
  user_id: string;
  label: string | null;
  street_address: string;
  neighborhood: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  apartment_unit: string | null;
  access_instructions: string | null;
  is_default: boolean;
  created_at: string;
};

export type CreateAddressParams = {
  label?: string;
  streetAddress: string;
  neighborhood?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  apartmentUnit?: string;
  accessInstructions?: string;
  isDefault?: boolean;
};

export type UpdateAddressParams = CreateAddressParams & {
  id: string;
};
