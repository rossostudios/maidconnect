"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";

/**
 * Validation schema for creating/updating help articles
 */
const HelpArticleSchema = z.object({
  category_id: z.string().uuid(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title_en: z.string().min(1).max(200),
  title_es: z.string().min(1).max(200),
  excerpt_en: z.string().max(500).optional().nullable(),
  excerpt_es: z.string().max(500).optional().nullable(),
  content_en: z.string().min(1),
  content_es: z.string().min(1),
  is_published: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
  tags: z.array(z.string().uuid()).optional(),
});

type HelpArticleInput = z.infer<typeof HelpArticleSchema>;

/**
 * Create a new help article (admin only)
 */
export async function createHelpArticle(input: HelpArticleInput): Promise<{
  success: boolean;
  error?: string;
  articleId?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    // 2. Validate input
    const validated = HelpArticleSchema.parse(input);

    // 3. Check if slug already exists
    const { data: existingArticle } = await supabase
      .from("help_articles")
      .select("id")
      .eq("slug", validated.slug)
      .eq("category_id", validated.category_id)
      .single();

    if (existingArticle) {
      return { success: false, error: "An article with this slug already exists in this category" };
    }

    // 4. Create article
    const { data: article, error: insertError } = await supabase
      .from("help_articles")
      .insert({
        category_id: validated.category_id,
        slug: validated.slug,
        title_en: validated.title_en,
        title_es: validated.title_es,
        excerpt_en: validated.excerpt_en ?? null,
        excerpt_es: validated.excerpt_es ?? null,
        content_en: validated.content_en,
        content_es: validated.content_es,
        is_published: validated.is_published,
        display_order: validated.display_order,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Create Article Error]", insertError);
      return { success: false, error: "Failed to create article" };
    }

    // 5. Add tags if provided
    if (validated.tags && validated.tags.length > 0 && article) {
      const tagRelations = validated.tags.map((tagId) => ({
        article_id: article.id,
        tag_id: tagId,
      }));

      await supabase.from("help_article_tags_relation").insert(tagRelations);
    }

    // 6. Revalidate help center pages
    revalidatePath("/[locale]/help");
    revalidatePath("/[locale]/admin/help");

    return { success: true, articleId: article?.id };
  } catch (error) {
    console.error("[Create Article Error]", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing help article (admin only)
 */
export async function updateHelpArticle(
  articleId: string,
  input: HelpArticleInput
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    // 2. Validate input
    const validated = HelpArticleSchema.parse(input);

    // 3. Check if slug conflicts with another article
    const { data: existingArticle } = await supabase
      .from("help_articles")
      .select("id")
      .eq("slug", validated.slug)
      .eq("category_id", validated.category_id)
      .neq("id", articleId)
      .single();

    if (existingArticle) {
      return {
        success: false,
        error: "Another article with this slug already exists in this category",
      };
    }

    // 4. Update article
    const { error: updateError } = await supabase
      .from("help_articles")
      .update({
        category_id: validated.category_id,
        slug: validated.slug,
        title_en: validated.title_en,
        title_es: validated.title_es,
        excerpt_en: validated.excerpt_en ?? null,
        excerpt_es: validated.excerpt_es ?? null,
        content_en: validated.content_en,
        content_es: validated.content_es,
        is_published: validated.is_published,
        display_order: validated.display_order,
      })
      .eq("id", articleId);

    if (updateError) {
      console.error("[Update Article Error]", updateError);
      return { success: false, error: "Failed to update article" };
    }

    // 5. Update tags
    if (validated.tags !== undefined) {
      // Delete existing tag relations
      await supabase.from("help_article_tags_relation").delete().eq("article_id", articleId);

      // Insert new tag relations
      if (validated.tags.length > 0) {
        const tagRelations = validated.tags.map((tagId) => ({
          article_id: articleId,
          tag_id: tagId,
        }));

        await supabase.from("help_article_tags_relation").insert(tagRelations);
      }
    }

    // 6. Revalidate help center pages
    revalidatePath("/[locale]/help");
    revalidatePath("/[locale]/admin/help");

    return { success: true };
  } catch (error) {
    console.error("[Update Article Error]", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Validation error" };
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a help article (admin only)
 */
export async function deleteHelpArticle(articleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    // 2. Delete article (cascades to tags and feedback)
    const { error: deleteError } = await supabase
      .from("help_articles")
      .delete()
      .eq("id", articleId);

    if (deleteError) {
      console.error("[Delete Article Error]", deleteError);
      return { success: false, error: "Failed to delete article" };
    }

    // 3. Revalidate help center pages
    revalidatePath("/[locale]/help");
    revalidatePath("/[locale]/admin/help");

    return { success: true };
  } catch (error) {
    console.error("[Delete Article Error]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle article published status (admin only)
 */
export async function toggleArticlePublished(
  articleId: string,
  isPublished: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required" };
    }

    // Update published status
    const { error: updateError } = await supabase
      .from("help_articles")
      .update({ is_published: isPublished })
      .eq("id", articleId);

    if (updateError) {
      console.error("[Toggle Published Error]", updateError);
      return { success: false, error: "Failed to update article status" };
    }

    // Revalidate
    revalidatePath("/[locale]/help");
    revalidatePath("/[locale]/admin/help");

    return { success: true };
  } catch (error) {
    console.error("[Toggle Published Error]", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
