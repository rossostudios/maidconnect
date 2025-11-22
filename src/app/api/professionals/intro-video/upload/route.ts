import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const MAX_DURATION = 60; // 60 seconds
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user } = await getSession();
    if (!user || user.role !== "professional") {
      return NextResponse.json(
        { error: "Unauthorized - Professional access required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const durationStr = formData.get("duration") as string | null;

    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (!durationStr) {
      return NextResponse.json({ error: "No duration provided" }, { status: 400 });
    }

    const duration = Number.parseFloat(durationStr);

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(videoFile.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration > MAX_DURATION) {
      return NextResponse.json(
        { error: `Video too long. Maximum duration: ${MAX_DURATION} seconds` },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Generate unique filename
    const fileExtension = videoFile.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    // Upload video to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("intro-videos")
      .upload(fileName, videoFile, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload video to storage" }, { status: 500 });
    }

    // Generate thumbnail (using first frame - this would need a separate service in production)
    // For now, we'll set thumbnailPath to null and generate it later
    const thumbnailPath = null;

    // Update professional_profiles table
    const { error: dbError } = await supabase
      .from("professional_profiles")
      .update({
        intro_video_path: uploadData.path,
        intro_video_status: "pending_review",
        intro_video_duration_seconds: Math.round(duration),
        intro_video_thumbnail_path: thumbnailPath,
        intro_video_uploaded_at: new Date().toISOString(),
        intro_video_reviewed_at: null,
        intro_video_reviewed_by: null,
        intro_video_rejection_reason: null,
      })
      .eq("profile_id", user.id);

    if (dbError) {
      console.error("Database update error:", dbError);

      // Cleanup: Delete uploaded file
      await supabase.storage.from("intro-videos").remove([uploadData.path]);

      return NextResponse.json(
        { error: "Failed to update profile with video information" },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      videoPath: uploadData.path,
      thumbnailPath,
      status: "pending_review",
    });
  } catch (error) {
    console.error("Intro video upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
