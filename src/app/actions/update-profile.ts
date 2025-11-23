"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ProfileUpdateData = {
  fullName?: string | null;
  phone?: string | null;
  city?: string | null;
};

export async function updateProfileAction(
  data: ProfileUpdateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser({ allowedRoles: ["customer", "professional"] });
    const supabase = await createSupabaseServerClient();

    // Build update object with only defined fields
    const updateData: Record<string, string | null> = {};

    if (data.fullName !== undefined) {
      updateData.full_name = data.fullName;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.city !== undefined) {
      updateData.city = data.city;
    }

    // Only update if there's data to update
    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);

    if (error) {
      console.error("[updateProfileAction] Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }

    // Revalidate the settings page
    revalidatePath("/dashboard/customer/settings");

    return { success: true };
  } catch (error) {
    console.error("[updateProfileAction] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
