"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  AddonInput,
  CalculateServicePriceResponse,
  CreateAddonResponse,
  CreatePricingTierResponse,
  CreateServiceResponse,
  DeleteServiceResponse,
  GetServiceCategoriesResponse,
  GetServiceDetailsResponse,
  GetServicesResponse,
  GetServicesSummaryResponse,
  PricingTierInput,
  ProfessionalService,
  ServiceAddon,
  ServiceCategory,
  ServiceInput,
  ServicePriceCalculation,
  ServicePricingTier,
  ServicesSummary,
  ServiceWithDetails,
  UpdateServiceResponse,
} from "@/types";

/**
 * Create a new service
 */
export async function createService(
  profileId: string,
  input: ServiceInput
): Promise<CreateServiceResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("professional_services")
      .insert({
        profile_id: profileId,
        category_id: input.categoryId || null,
        name: input.name,
        description: input.description || null,
        service_type: input.serviceType,
        base_price_cop: input.basePriceCop,
        pricing_unit: input.pricingUnit,
        estimated_duration_minutes: input.estimatedDurationMinutes || null,
        min_duration_minutes: input.minDurationMinutes || null,
        max_duration_minutes: input.maxDurationMinutes || null,
        requires_approval: input.requiresApproval,
        advance_booking_hours: input.advanceBookingHours || 24,
        max_booking_days_ahead: input.maxBookingDaysAhead || 90,
        requirements: input.requirements || [],
        included_items: input.includedItems || [],
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating service:", error);
      return { success: false, error: error.message };
    }

    const service: ProfessionalService = mapDatabaseService(data);
    return { success: true, service };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing service
 */
export async function updateService(
  serviceId: string,
  input: Partial<ServiceInput>
): Promise<UpdateServiceResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.serviceType) updateData.service_type = input.serviceType;
    if (input.basePriceCop !== undefined) updateData.base_price_cop = input.basePriceCop;
    if (input.pricingUnit) updateData.pricing_unit = input.pricingUnit;
    if (input.estimatedDurationMinutes !== undefined)
      updateData.estimated_duration_minutes = input.estimatedDurationMinutes;
    if (input.minDurationMinutes !== undefined)
      updateData.min_duration_minutes = input.minDurationMinutes;
    if (input.maxDurationMinutes !== undefined)
      updateData.max_duration_minutes = input.maxDurationMinutes;
    if (input.requiresApproval !== undefined) updateData.requires_approval = input.requiresApproval;
    if (input.advanceBookingHours !== undefined)
      updateData.advance_booking_hours = input.advanceBookingHours;
    if (input.maxBookingDaysAhead !== undefined)
      updateData.max_booking_days_ahead = input.maxBookingDaysAhead;
    if (input.requirements !== undefined) updateData.requirements = input.requirements;
    if (input.includedItems !== undefined) updateData.included_items = input.includedItems;

    const { data, error } = await supabase
      .from("professional_services")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating service:", error);
      return { success: false, error: error.message };
    }

    const service: ProfessionalService = mapDatabaseService(data);
    return { success: true, service };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete (deactivate) a service
 */
export async function deleteService(serviceId: string): Promise<DeleteServiceResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("professional_services")
      .update({ is_active: false })
      .eq("id", serviceId);

    if (error) {
      console.error("Error deleting service:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all services for a professional
 */
export async function getServices(
  profileId: string,
  activeOnly = false
): Promise<GetServicesResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("professional_services")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching services:", error);
      return { success: false, error: error.message };
    }

    const services: ProfessionalService[] = data.map(mapDatabaseService);
    return { success: true, services };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get service with full details (tiers, addons, category)
 */
export async function getServiceDetails(serviceId: string): Promise<GetServiceDetailsResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get service
    const { data: serviceData, error: serviceError } = await supabase
      .from("professional_services")
      .select("*, service_categories(*)")
      .eq("id", serviceId)
      .single();

    if (serviceError) {
      console.error("Error fetching service:", serviceError);
      return { success: false, error: serviceError.message };
    }

    // Get pricing tiers
    const { data: tiersData } = await supabase
      .from("service_pricing_tiers")
      .select("*")
      .eq("service_id", serviceId)
      .order("tier_level");

    // Get add-ons
    const { data: addonsData } = await supabase
      .from("service_addons")
      .select("*")
      .eq("service_id", serviceId)
      .order("display_order");

    const service: ServiceWithDetails = {
      ...mapDatabaseService(serviceData),
      category: serviceData.service_categories
        ? mapDatabaseCategory(serviceData.service_categories)
        : null,
      pricingTiers: (tiersData || []).map(mapDatabaseTier),
      addons: (addonsData || []).map(mapDatabaseAddon),
    };

    return { success: true, service };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all service categories
 */
export async function getServiceCategories(): Promise<GetServiceCategoriesResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      console.error("Error fetching categories:", error);
      return { success: false, error: error.message };
    }

    const categories: ServiceCategory[] = data.map(mapDatabaseCategory);
    return { success: true, categories };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get services summary for a professional
 */
export async function getServicesSummary(profileId: string): Promise<GetServicesSummaryResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("get_professional_services_summary", {
      professional_profile_id: profileId,
    });

    if (error) {
      console.error("Error fetching services summary:", error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      const defaultSummary: ServicesSummary = {
        totalServices: 0,
        activeServices: 0,
        featuredServices: 0,
        totalBookings: 0,
        averageRating: 0,
      };
      return { success: true, summary: defaultSummary };
    }

    const summary: ServicesSummary = {
      totalServices: data[0].total_services,
      activeServices: data[0].active_services,
      featuredServices: data[0].featured_services,
      totalBookings: data[0].total_bookings,
      averageRating: data[0].average_rating || 0,
    };

    return { success: true, summary };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a pricing tier
 */
export async function createPricingTier(
  serviceId: string,
  input: PricingTierInput
): Promise<CreatePricingTierResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("service_pricing_tiers")
      .insert({
        service_id: serviceId,
        tier_name: input.tierName,
        tier_level: input.tierLevel,
        description: input.description || null,
        price_cop: input.priceCop,
        pricing_adjustment_type: input.pricingAdjustmentType || "fixed",
        pricing_adjustment_value: input.pricingAdjustmentValue || 0,
        features: input.features || [],
        max_area_sqm: input.maxAreaSqm || null,
        max_hours: input.maxHours || null,
        is_default: input.isDefault,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating pricing tier:", error);
      return { success: false, error: error.message };
    }

    const tier: ServicePricingTier = mapDatabaseTier(data);
    return { success: true, tier };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create an add-on
 */
export async function createAddon(
  serviceId: string,
  input: AddonInput
): Promise<CreateAddonResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("service_addons")
      .insert({
        service_id: serviceId,
        name: input.name,
        description: input.description || null,
        price_cop: input.priceCop,
        pricing_type: input.pricingType || "fixed",
        additional_duration_minutes: input.additionalDurationMinutes || 0,
        is_required: input.isRequired,
        max_quantity: input.maxQuantity || 1,
        display_order: input.displayOrder || 0,
        icon: input.icon || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating add-on:", error);
      return { success: false, error: error.message };
    }

    const addon: ServiceAddon = mapDatabaseAddon(data);
    return { success: true, addon };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculate service price with tier and add-ons
 */
export async function calculateServicePrice(
  serviceId: string,
  tierId?: string,
  addonIds?: string[]
): Promise<CalculateServicePriceResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.rpc("calculate_service_price", {
      service_id_param: serviceId,
      tier_id_param: tierId || null,
      addon_ids_param: addonIds || [],
    });

    if (error) {
      console.error("Error calculating service price:", error);
      return { success: false, error: error.message };
    }

    const calculation: ServicePriceCalculation = {
      basePrice: data.basePrice,
      tierPrice: data.tierPrice,
      addonsPrice: data.addonsPrice,
      totalPrice: data.totalPrice,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
    };

    return { success: true, calculation };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Helper Mapping Functions
// ============================================================================

function mapDatabaseService(data: any): ProfessionalService {
  return {
    id: data.id,
    profileId: data.profile_id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    serviceType: data.service_type,
    basePriceCop: data.base_price_cop,
    pricingUnit: data.pricing_unit,
    estimatedDurationMinutes: data.estimated_duration_minutes,
    minDurationMinutes: data.min_duration_minutes,
    maxDurationMinutes: data.max_duration_minutes,
    isActive: data.is_active,
    isFeatured: data.is_featured,
    requiresApproval: data.requires_approval,
    advanceBookingHours: data.advance_booking_hours,
    maxBookingDaysAhead: data.max_booking_days_ahead,
    requirements: data.requirements || [],
    includedItems: data.included_items || [],
    bookingCount: data.booking_count,
    averageRating: Number.parseFloat(data.average_rating),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapDatabaseCategory(data: any): ServiceCategory {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    icon: data.icon,
    parentCategoryId: data.parent_category_id,
    displayOrder: data.display_order,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapDatabaseTier(data: any): ServicePricingTier {
  return {
    id: data.id,
    serviceId: data.service_id,
    tierName: data.tier_name,
    tierLevel: data.tier_level,
    description: data.description,
    priceCop: data.price_cop,
    pricingAdjustmentType: data.pricing_adjustment_type,
    pricingAdjustmentValue: data.pricing_adjustment_value,
    features: data.features || [],
    maxAreaSqm: data.max_area_sqm,
    maxHours: data.max_hours,
    isActive: data.is_active,
    isDefault: data.is_default,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapDatabaseAddon(data: any): ServiceAddon {
  return {
    id: data.id,
    serviceId: data.service_id,
    name: data.name,
    description: data.description,
    priceCop: data.price_cop,
    pricingType: data.pricing_type,
    additionalDurationMinutes: data.additional_duration_minutes,
    isActive: data.is_active,
    isRequired: data.is_required,
    maxQuantity: data.max_quantity,
    displayOrder: data.display_order,
    icon: data.icon,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
