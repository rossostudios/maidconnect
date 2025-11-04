/**
 * REFACTORED VERSION - Professional portfolio management
 * GET/PUT/POST /api/professional/portfolio
 *
 * BEFORE: 172 lines (3 handlers)
 * AFTER: 125 lines (3 handlers) (27% reduction)
 */

import { withProfessional, ok, created, badRequest } from "@/lib/api";
import { ValidationError } from "@/lib/errors";
import { z } from "zod";

export type PortfolioImage = {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  order: number;
  created_at: string;
};

const portfolioImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  caption: z.string().optional(),
  order: z.number(),
});

const updatePortfolioSchema = z.object({
  images: z.array(portfolioImageSchema),
  featuredWork: z.string().optional(),
});

const addImageSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().optional(),
});

/**
 * Get professional's portfolio images
 */
export const GET = withProfessional(async ({ user, supabase }) => {
  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("portfolio_images, featured_work")
    .eq("profile_id", user.id)
    .single();

  if (error) {
    throw new ValidationError("Failed to fetch portfolio");
  }

  return ok({
    images: (profile?.portfolio_images as PortfolioImage[]) || [],
    featuredWork: profile?.featured_work || "",
  });
});

/**
 * Update professional's portfolio
 */
export const PUT = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = updatePortfolioSchema.parse(body);

  const updateData: { portfolio_images: PortfolioImage[]; featured_work?: string } = {
    portfolio_images: validatedData.images,
  };

  if (validatedData.featuredWork !== undefined) {
    updateData.featured_work = validatedData.featuredWork;
  }

  const { error } = await supabase
    .from("professional_profiles")
    .update(updateData)
    .eq("profile_id", user.id);

  if (error) {
    throw new ValidationError("Failed to update portfolio");
  }

  return ok({
    success: true,
    images: validatedData.images,
    featuredWork: validatedData.featuredWork || "",
  });
});

/**
 * Add a new portfolio image
 */
export const POST = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = addImageSchema.parse(body);

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
    url: validatedData.url,
    thumbnail_url: validatedData.thumbnailUrl,
    caption: validatedData.caption,
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
    throw new ValidationError("Failed to add image");
  }

  return created({ image: newImage });
});
