import { supabase } from "@/lib/supabase";
import type { UserProfile, ProfileRecord, UpdateProfileParams } from "./types";

/**
 * Transform database record to UserProfile type
 */
function mapProfileRecord(record: ProfileRecord, email: string): UserProfile {
  return {
    id: record.id,
    fullName: record.full_name,
    email,
    phone: record.phone,
    avatarUrl: record.avatar_url,
    role: record.role,
    locale: record.locale,
    city: record.city,
    country: record.country,
    onboardingStatus: record.onboarding_status,
    createdAt: new Date(record.created_at),
  };
}

/**
 * Fetch the current user's profile
 */
export async function fetchProfile(): Promise<UserProfile> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone, avatar_url, role, locale, city, country, onboarding_status, created_at"
    )
    .eq("id", session.user.id)
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRecord(data as ProfileRecord, session.user.email || "");
}

/**
 * Update the current user's profile
 */
export async function updateProfile(params: UpdateProfileParams): Promise<UserProfile> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const updateData: Record<string, unknown> = {};

  if (params.fullName !== undefined) {
    updateData.full_name = params.fullName || null;
  }
  if (params.phone !== undefined) {
    updateData.phone = params.phone || null;
  }
  if (params.city !== undefined) {
    updateData.city = params.city || null;
  }
  if (params.country !== undefined) {
    updateData.country = params.country || null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", session.user.id)
    .select(
      "id, full_name, phone, avatar_url, role, locale, city, country, onboarding_status, created_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProfileRecord(data as ProfileRecord, session.user.email || "");
}

/**
 * Upload a profile photo to Supabase storage and update the profile
 */
export async function uploadProfilePhoto(uri: string): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Convert URI to blob
  const response = await fetch(uri);
  const blob = await response.blob();

  // Generate unique filename
  const fileExt = uri.split(".").pop() || "jpg";
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", session.user.id);

  if (updateError) {
    throw updateError;
  }

  return publicUrl;
}

/**
 * Delete the current user's profile photo
 */
export async function deleteProfilePhoto(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Get current avatar URL to extract file path
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", session.user.id)
    .single();

  if (profile?.avatar_url) {
    // Extract file path from URL
    const urlParts = profile.avatar_url.split("/");
    const filePath = `avatars/${urlParts[urlParts.length - 1]}`;

    // Delete from storage (ignore errors if file doesn't exist)
    await supabase.storage.from("profile-photos").remove([filePath]);
  }

  // Update profile to remove avatar URL
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", session.user.id);

  if (error) {
    throw error;
  }
}
