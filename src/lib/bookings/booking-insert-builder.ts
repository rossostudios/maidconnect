// Booking insert builder - Extract booking insert object creation logic

import type { CreateBookingInput } from "@/types";

export type BookingInsertData = {
  customer_id: string;
  professional_id: string;
  service_id: string;
  pricing_tier_id: string | null;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  service_address_id: string | null;
  service_address_line1: string | null;
  service_address_line2: string | null;
  service_address_city: string | null;
  service_address_postal_code: string | null;
  service_address_country: string;
  location_lat: number | null;
  location_lng: number | null;
  base_price_cop: number;
  tier_price_cop: number;
  addons_price_cop: number;
  total_price_cop: number;
  customer_notes: string | null;
  special_requirements: string[];
};

export type PricingData = {
  basePrice: number;
  tierPrice: number;
  addonsPrice: number;
  totalPrice: number;
};

/**
 * Build booking insert data object from input and calculated pricing
 * Reduces complexity by extracting field mapping logic
 */
export function buildBookingInsertData(
  customerId: string,
  input: CreateBookingInput,
  pricing: PricingData
): BookingInsertData {
  return {
    customer_id: customerId,
    professional_id: input.professionalId,
    service_id: input.serviceId,
    pricing_tier_id: input.pricingTierId || null,
    scheduled_date: input.scheduledDate,
    scheduled_start_time: input.scheduledStartTime,
    scheduled_end_time: input.scheduledEndTime,
    service_address_id: input.serviceAddressId || null,
    service_address_line1: input.serviceAddressLine1 || null,
    service_address_line2: input.serviceAddressLine2 || null,
    service_address_city: input.serviceAddressCity || null,
    service_address_postal_code: input.servicePostalCode || null,
    service_address_country: input.serviceAddressCountry || "CO",
    location_lat: input.locationLat || null,
    location_lng: input.locationLng || null,
    base_price_cop: pricing.basePrice,
    tier_price_cop: pricing.tierPrice,
    addons_price_cop: pricing.addonsPrice,
    total_price_cop: pricing.totalPrice,
    customer_notes: input.customerNotes || null,
    special_requirements: input.specialRequirements || [],
  };
}
