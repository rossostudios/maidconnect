"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  BundleInput,
  CreateBundleResponse,
  DeleteBundleResponse,
  GenerateQuickQuoteResponse,
  GetBundlesResponse,
  QuickQuote,
  ServiceBundle,
  UpdateBundleResponse,
} from "@/types";

/**
 * Create a new service bundle
 */
export async function createBundle(
  profileId: string,
  input: BundleInput
): Promise<CreateBundleResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Calculate totals
    const totalDurationMinutes = input.services.reduce(
      (sum, service) => sum + service.durationMinutes,
      0
    );
    const basePriceCop = input.services.reduce((sum, service) => sum + service.basePriceCop, 0);
    const discountPercentage = input.discountPercentage || 0;
    const finalPriceCop = basePriceCop - (basePriceCop * discountPercentage) / 100;

    const { data, error } = await supabase
      .from("service_bundles")
      .insert({
        profile_id: profileId,
        name: input.name,
        description: input.description || null,
        services: input.services,
        total_duration_minutes: totalDurationMinutes,
        base_price_cop: basePriceCop,
        discount_percentage: discountPercentage,
        final_price_cop: finalPriceCop,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating bundle:", error);
      return { success: false, error: error.message };
    }

    const bundle: ServiceBundle = {
      id: data.id,
      profileId: data.profile_id,
      name: data.name,
      description: data.description,
      services: data.services,
      totalDurationMinutes: data.total_duration_minutes,
      basePriceCop: data.base_price_cop,
      discountPercentage: data.discount_percentage,
      finalPriceCop: data.final_price_cop,
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      success: true,
      bundle,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing service bundle
 */
export async function updateBundle(
  bundleId: string,
  input: Partial<BundleInput>
): Promise<UpdateBundleResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.name) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.services) {
      updateData.services = input.services;
      updateData.total_duration_minutes = input.services.reduce(
        (sum, service) => sum + service.durationMinutes,
        0
      );
      updateData.base_price_cop = input.services.reduce(
        (sum, service) => sum + service.basePriceCop,
        0
      );
    }
    if (input.discountPercentage !== undefined) {
      updateData.discount_percentage = input.discountPercentage;
    }

    const { data, error } = await supabase
      .from("service_bundles")
      .update(updateData)
      .eq("id", bundleId)
      .select()
      .single();

    if (error) {
      console.error("Error updating bundle:", error);
      return { success: false, error: error.message };
    }

    const bundle: ServiceBundle = {
      id: data.id,
      profileId: data.profile_id,
      name: data.name,
      description: data.description,
      services: data.services,
      totalDurationMinutes: data.total_duration_minutes,
      basePriceCop: data.base_price_cop,
      discountPercentage: data.discount_percentage,
      finalPriceCop: data.final_price_cop,
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      success: true,
      bundle,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a service bundle (soft delete by marking inactive)
 */
export async function deleteBundle(bundleId: string): Promise<DeleteBundleResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("service_bundles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", bundleId);

    if (error) {
      console.error("Error deleting bundle:", error);
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
 * Get all bundles for a professional
 */
export async function getBundles(
  profileId: string,
  activeOnly = false
): Promise<GetBundlesResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("service_bundles")
      .select("*")
      .eq("profile_id", profileId)
      .order("usage_count", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting bundles:", error);
      return { success: false, error: error.message };
    }

    const bundles: ServiceBundle[] = data.map((item) => ({
      id: item.id,
      profileId: item.profile_id,
      name: item.name,
      description: item.description,
      services: item.services,
      totalDurationMinutes: item.total_duration_minutes,
      basePriceCop: item.base_price_cop,
      discountPercentage: item.discount_percentage,
      finalPriceCop: item.final_price_cop,
      isActive: item.is_active,
      usageCount: item.usage_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return {
      success: true,
      bundles,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a quick quote from a bundle
 */
export async function generateQuickQuote(
  bundleId: string,
  estimatedStartTime?: string
): Promise<GenerateQuickQuoteResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("service_bundles")
      .select("*")
      .eq("id", bundleId)
      .single();

    if (error) {
      console.error("Error getting bundle:", error);
      return { success: false, error: error.message };
    }

    if (!data.is_active) {
      return { success: false, error: "Bundle is not active" };
    }

    // Calculate estimated end time
    let estimatedEndTime: string | undefined;
    if (estimatedStartTime) {
      const startDate = new Date(estimatedStartTime);
      const endDate = new Date(startDate.getTime() + data.total_duration_minutes * 60 * 1000);
      estimatedEndTime = endDate.toISOString();
    }

    const quote: QuickQuote = {
      bundleId: data.id,
      bundleName: data.name,
      services: data.services,
      totalDurationMinutes: data.total_duration_minutes,
      basePriceCop: data.base_price_cop,
      discountPercentage: data.discount_percentage,
      finalPriceCop: data.final_price_cop,
      estimatedStartTime,
      estimatedEndTime,
    };

    // Increment usage count
    await supabase
      .from("service_bundles")
      .update({ usage_count: data.usage_count + 1 })
      .eq("id", bundleId);

    return {
      success: true,
      quote,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
