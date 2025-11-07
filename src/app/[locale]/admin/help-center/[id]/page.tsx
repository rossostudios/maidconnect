import { unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/help-center/article-form";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type Article = {
  id: string;
  category_id: string;
  slug: string;
  title_en: string;
  title_es: string;
  excerpt_en: string | null;
  excerpt_es: string | null;
  content_en: string;
  content_es: string;
  is_published: boolean;
};

async function getCategories() {
  const supabase = await createSupabaseServerClient();

  const { data: categories } = await supabase
    .from("help_categories")
    .select("id, slug, name_en, name_es")
    .order("display_order");

  return categories || [];
}

async function getArticle(articleId: string): Promise<Article | null> {
  const supabase = await createSupabaseServerClient();

  const { data: article } = await supabase
    .from("help_articles")
    .select(
      "id, category_id, slug, title_en, title_es, excerpt_en, excerpt_es, content_en, content_es, is_published"
    )
    .eq("id", articleId)
    .maybeSingle();

  return article;
}

export default async function EditHelpArticlePage({ params }: { params: Promise<{ id: string }> }) {
  unstable_noStore(); // Opt out of caching for dynamic page
  await requireUser({ allowedRoles: ["admin"] });

  const { id } = await params;
  const [categories, article] = await Promise.all([getCategories(), getArticle(id)]);

  if (!article) {
    notFound();
  }

  return <ArticleForm article={article} categories={categories} />;
}
