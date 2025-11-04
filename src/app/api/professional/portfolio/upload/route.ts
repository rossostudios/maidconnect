/**
 * REFACTORED VERSION - Portfolio image upload to Supabase Storage
 * POST/DELETE /api/professional/portfolio/upload
 *
 * BEFORE: 128 lines (2 handlers)
 * AFTER: 101 lines (2 handlers) (21% reduction)
 */

import { withProfessional, ok, badRequest, forbidden, requireProfessionalProfile } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const BUCKET_NAME = "portfolio-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload portfolio image to Supabase Storage
 */
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Verify professional profile exists
  await requireProfessionalProfile(supabase, user.id);

  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw badRequest("No file provided");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw badRequest("File must be an image");
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw badRequest("File size must be less than 5MB");
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    throw new ValidationError("Failed to upload image to storage");
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new ValidationError("Failed to get public URL");
  }

  return ok({
    success: true,
    url: urlData.publicUrl,
    path: fileName,
  });
});

/**
 * Delete portfolio image from Supabase Storage
 */
export const DELETE = withProfessional(async ({ user, supabase }, request: Request) => {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    throw badRequest("Path is required");
  }

  // Verify path belongs to this user
  if (!path.startsWith(`${user.id}/`)) {
    throw forbidden("Unauthorized to delete this image");
  }

  // Delete from storage
  const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (deleteError) {
    throw new ValidationError("Failed to delete image");
  }

  return ok({ success: true });
});
