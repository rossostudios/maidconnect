// Booking addons service - handles addon insertion logic

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Insert booking addons into the database
 * Fetches addon details and creates booking_addons records
 */
export async function insertBookingAddons(
  supabase: SupabaseClient,
  bookingId: string,
  addonIds: string[] | null | undefined
): Promise<void> {
  // Early return if no addons
  if (!addonIds || addonIds.length === 0) {
    return;
  }

  // Fetch addon details from database
  const { data: addons } = await supabase
    .from("service_addons")
    .select("id, name, price_cop")
    .in("id", addonIds);

  // Early return if no addons found
  if (!addons || addons.length === 0) {
    return;
  }

  // Map addons to booking_addons format
  const bookingAddons = addons.map((addon) => ({
    booking_id: bookingId,
    addon_id: addon.id,
    addon_name: addon.name,
    addon_price_cop: addon.price_cop,
    quantity: 1,
  }));

  // Insert all booking addons
  await supabase.from("booking_addons").insert(bookingAddons);
}
