import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic";

const BUCKET_NAME = "portfolio-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload portfolio image to Supabase Storage
 * POST /api/professional/portfolio/upload
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is a professional
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("profile_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!professionalProfile) {
      return NextResponse.json({ error: "Not a professional" }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return NextResponse.json({ error: "Failed to get public URL" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

/**
 * Delete portfolio image from Supabase Storage
 * DELETE /api/professional/portfolio/upload
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Verify path belongs to this user
    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
