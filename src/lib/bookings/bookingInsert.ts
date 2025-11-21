// Booking insert builder - Extract booking insert object creation logic
//
// MULTI-COUNTRY SUPPORT:
// - serviceAddressCountry should ALWAYS be explicitly set by callers
// - CO fallback exists only for backward compatibility with legacy data
// - New code should derive country from professional's country_code field

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
  // Log warning if country not explicitly set (helps catch missing country in new code)
  if (!input.serviceAddressCountry) {
    console.warn(
      "[BookingInsert] serviceAddressCountry not set, using CO fallback. " +
        "New bookings should explicitly set country from professional's country_code."
    );
  }

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
