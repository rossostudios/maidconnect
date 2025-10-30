import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export type PortfolioImage = {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  order: number;
  created_at: string;
};

/**
 * Get professional's portfolio images
 * GET /api/professional/portfolio
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { data: profile, error } = await supabase
      .from("professional_profiles")
      .select("portfolio_images, featured_work")
      .eq("profile_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch portfolio:", error);
      return NextResponse.json(
        { error: "Failed to fetch portfolio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: (profile?.portfolio_images as PortfolioImage[]) || [],
      featuredWork: profile?.featured_work || "",
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

/**
 * Update professional's portfolio
 * PUT /api/professional/portfolio
 *
 * Body: {
 *   images: PortfolioImage[],
 *   featuredWork?: string
 * }
 */
export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { images, featuredWork } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: "images must be an array" },
        { status: 400 }
      );
    }

    // Validate image structure
    for (const img of images) {
      if (!img.id || !img.url || typeof img.order !== "number") {
        return NextResponse.json(
          { error: "Invalid image structure" },
          { status: 400 }
        );
      }
    }

    const updateData: { portfolio_images: PortfolioImage[]; featured_work?: string } = {
      portfolio_images: images,
    };

    if (featuredWork !== undefined) {
      updateData.featured_work = featuredWork;
    }

    const { error } = await supabase
      .from("professional_profiles")
      .update(updateData)
      .eq("profile_id", user.id);

    if (error) {
      console.error("Failed to update portfolio:", error);
      return NextResponse.json(
        { error: "Failed to update portfolio" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images,
      featuredWork: featuredWork || "",
    });
  } catch (error) {
    console.error("Update portfolio API error:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio" },
      { status: 500 }
    );
  }
}

/**
 * Add a new portfolio image
 * POST /api/professional/portfolio
 *
 * Body: {
 *   url: string,
 *   thumbnailUrl?: string,
 *   caption?: string
 * }
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { url, thumbnailUrl, caption } = body;

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Get current portfolio
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("portfolio_images")
      .eq("profile_id", user.id)
      .single();

    const currentImages = (profile?.portfolio_images as PortfolioImage[]) || [];

    // Create new image
    const newImage: PortfolioImage = {
      id: crypto.randomUUID(),
      url,
      thumbnail_url: thumbnailUrl,
      caption,
      order: currentImages.length,
      created_at: new Date().toISOString(),
    };

    const updatedImages = [...currentImages, newImage];

    // Save updated portfolio
    const { error } = await supabase
      .from("professional_profiles")
      .update({ portfolio_images: updatedImages })
      .eq("profile_id", user.id);

    if (error) {
      console.error("Failed to add portfolio image:", error);
      return NextResponse.json(
        { error: "Failed to add image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: newImage }, { status: 201 });
  } catch (error) {
    console.error("Add portfolio image API error:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}
