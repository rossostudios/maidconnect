"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

// Validation schema for article data
const ArticleSchema = z.object({
  category_id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  title_en: z.string().min(1).max(200),
  title_es: z.string().min(1).max(200),
  excerpt_en: z.string().max(500).nullable(),
  excerpt_es: z.string().max(500).nullable(),
  content_en: z.string().min(10),
  content_es: z.string().min(10),
  is_published: z.boolean(),
});

type ArticleData = z.infer<typeof ArticleSchema>;

/**
 * Create a new help article
 * @param data - Article data
 * @returns The created article or error
 */
export async function createArticle(data: ArticleData) {
  // Require admin role
  await requireUser({ allowedRoles: ["admin"] });

  // Validate input
  const validated = ArticleSchema.parse(data);

  const supabase = await createSupabaseServerClient();

  // Check if slug already exists
  const { data: existing } = await supabase
    .from("help_articles")
    .select("id")
    .eq("slug", validated.slug)
    .maybeSingle();

  if (existing) {
    throw new Error("An article with this slug already exists");
  }

  // Insert article
  const { data: article, error } = await supabase
    .from("help_articles")
    .insert({
      category_id: validated.category_id,
      slug: validated.slug,
      title_en: validated.title_en,
      title_es: validated.title_es,
      excerpt_en: validated.excerpt_en,
      excerpt_es: validated.excerpt_es,
      content_en: validated.content_en,
      content_es: validated.content_es,
      is_published: validated.is_published,
      view_count: 0,
      helpful_count: 0,
      not_helpful_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create article:", error);
    throw new Error(`Failed to create article: ${error.message}`);
  }

  // Revalidate relevant pages
  revalidatePath("/admin/help-center");
  revalidatePath("/help");
  revalidatePath(`/help/${validated.slug}`);

  return article;
}

/**
 * Update an existing help article
 * @param articleId - Article ID
 * @param data - Article data
 * @returns The updated article or error
 */
export async function updateArticle(articleId: string, data: ArticleData) {
  // Require admin role
  await requireUser({ allowedRoles: ["admin"] });

  // Validate input
  const validated = ArticleSchema.parse(data);

  const supabase = await createSupabaseServerClient();

  // Check if slug already exists (excluding current article)
  const { data: existing } = await supabase
    .from("help_articles")
    .select("id")
    .eq("slug", validated.slug)
    .neq("id", articleId)
    .maybeSingle();

  if (existing) {
    throw new Error("An article with this slug already exists");
  }

  // Update article
  const { data: article, error } = await supabase
    .from("help_articles")
    .update({
      category_id: validated.category_id,
      slug: validated.slug,
      title_en: validated.title_en,
      title_es: validated.title_es,
      excerpt_en: validated.excerpt_en,
      excerpt_es: validated.excerpt_es,
      content_en: validated.content_en,
      content_es: validated.content_es,
      is_published: validated.is_published,
    })
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update article:", error);
    throw new Error(`Failed to update article: ${error.message}`);
  }

  // Revalidate relevant pages
  revalidatePath("/admin/help-center");
  revalidatePath(`/admin/help-center/${articleId}`);
  revalidatePath("/help");
  revalidatePath(`/help/${validated.slug}`);

  return article;
}

/**
 * Delete a help article
 * @param articleId - Article ID
 */
export async function deleteArticle(articleId: string) {
  // Require admin role
  await requireUser({ allowedRoles: ["admin"] });

  const supabase = await createSupabaseServerClient();

  // Delete article (cascade will handle related records)
  const { error } = await supabase.from("help_articles").delete().eq("id", articleId);

  if (error) {
    console.error("Failed to delete article:", error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }

  // Revalidate relevant pages
  revalidatePath("/admin/help-center");
  revalidatePath("/help");

  return { success: true };
}
