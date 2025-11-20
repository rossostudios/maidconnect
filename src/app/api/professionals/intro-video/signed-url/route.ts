import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const { videoPath } = await request.json();

    if (!videoPath || typeof videoPath !== "string") {
      return NextResponse.json({ error: "Video path is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Generate signed URL for private video access
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("intro-videos")
      .createSignedUrl(videoPath, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error generating signed URL:", signedUrlError);
      return NextResponse.json({ error: "Failed to generate video URL" }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    });
  } catch (error) {
    console.error("Signed URL generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
