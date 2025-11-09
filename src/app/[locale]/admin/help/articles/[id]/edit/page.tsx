import { notFound, redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/help/article-form";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function EditHelpArticlePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const supabase = await createSupabaseServerClient();

  // Verify admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect(`/${locale}/dashboard/customer`);
  }

  // Fetch article data
  const { data: article, error } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      category_id,
      slug,
      title_en,
      title_es,
      excerpt_en,
      excerpt_es,
      content_en,
      content_es,
      is_published,
      display_order
    `
    )
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  // Fetch article tags
  const { data: rawTagsData } = await supabase
    .from("help_article_tags_relation")
    .select(
      "tag:help_article_tags!help_article_tags_relation_tag_id_fkey(id, slug, name_en, name_es, color)"
    )
    .eq("article_id", id);

  // Type assertion for tags query result
  const tagsData = rawTagsData as unknown as Array<{
    tag: {
      id: string;
      slug: string;
      name_en: string;
      name_es: string;
      color: string;
    };
  }> | null;

  const articleTags = tagsData?.map((rel) => rel.tag) || [];

  console.log("[EditArticlePage] Article tags loaded:", {
    rawTagsData,
    articleTags,
    articleId: id,
  });

  // Fetch categories for selection
  const { data: categories } = await supabase
    .from("help_categories")
    .select("id, slug, name_en, name_es")
    .eq("is_active", true)
    .order("display_order");

  // Fetch all tags for selection
  const { data: allTags } = await supabase
    .from("help_article_tags")
    .select("id, slug, name_en, name_es, color")
    .eq("is_active", true)
    .order("name_en");

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <ArticleForm
          categories={categories ?? []}
          initialData={{
            ...article,
            tags: articleTags,
          }}
          locale={locale as "en" | "es"}
          tags={allTags ?? []}
        />
      </div>
    </div>
  );
}
