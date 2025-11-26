/**
 * REFACTORED VERSION - Professional portfolio management
 * GET/PUT/POST /api/professional/portfolio
 *
 * Supports:
 * - Portfolio images (gallery)
 * - Before/After transformation pairs
 * - Featured work description
 * - Featured image ID
 */

import { z } from "zod";
import { created, ok, withProfessional } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

// ============================================================================
// Types
// ============================================================================

export type PortfolioImage = {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  order: number;
  created_at?: string;
};

export type BeforeAfterPair = {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  beforeThumbnail?: string;
  afterThumbnail?: string;
  caption?: string;
  projectType?: string;
  order: number;
  createdAt: string;
};

export type PortfolioData = {
  images: PortfolioImage[];
  beforeAfterPairs: BeforeAfterPair[];
  featuredImageId?: string;
  featuredWork?: string;
};

// ============================================================================
// Schemas
// ============================================================================

const portfolioImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  caption: z.string().optional(),
  order: z.number(),
});

const beforeAfterPairSchema = z.object({
  id: z.string(),
  beforeUrl: z.string().url(),
  afterUrl: z.string().url(),
  beforeThumbnail: z.string().url().optional(),
  afterThumbnail: z.string().url().optional(),
  caption: z.string().optional(),
  projectType: z.string().optional(),
  order: z.number(),
  createdAt: z.string(),
});

const updatePortfolioSchema = z.object({
  images: z.array(portfolioImageSchema),
  beforeAfterPairs: z.array(beforeAfterPairSchema).optional(),
  featuredWork: z.string().optional(),
  featuredImageId: z.string().optional(),
});

const addImageSchema = z.object({
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().optional(),
});

/**
 * Get professional's portfolio data
 */
export const GET = withProfessional(async ({ user, supabase }) => {
  const { data: profile, error } = await supabase
    .from("professional_profiles")
    .select("portfolio_images, before_after_pairs, featured_work, featured_image_id")
    .eq("profile_id", user.id)
    .single();

  if (error) {
    throw new ValidationError("Failed to fetch portfolio");
  }

  return ok({
    images: (profile?.portfolio_images as PortfolioImage[]) || [],
    beforeAfterPairs: (profile?.before_after_pairs as BeforeAfterPair[]) || [],
    featuredWork: profile?.featured_work || "",
    featuredImageId: profile?.featured_image_id || undefined,
  });
});

/**
 * Update professional's portfolio
 */
export const PUT = withProfessional(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const validatedData = updatePortfolioSchema.parse(body);

  const updateData: {
    portfolio_images: PortfolioImage[];
    before_after_pairs?: BeforeAfterPair[];
    featured_work?: string;
    featured_image_id?: string;
  } = {
    portfolio_images: validatedData.images,
  };

  if (validatedData.beforeAfterPairs !== undefined) {
    updateData.before_after_pairs = validatedData.beforeAfterPairs;
  }

  if (validatedData.featuredWork !== undefined) {
    updateData.featured_work = validatedData.featuredWork;
  }

  if (validatedData.featuredImageId !== undefined) {
    updateData.featured_image_id = validatedData.featuredImageId;
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
    beforeAfterPairs: validatedData.beforeAfterPairs || [],
    featuredWork: validatedData.featuredWork || "",
    featuredImageId: validatedData.featuredImageId,
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
