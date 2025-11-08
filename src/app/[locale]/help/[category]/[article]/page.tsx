import { notFound } from "next/navigation";
import { ArticleViewer } from "@/components/help/article-viewer";
import { TableOfContents } from "@/components/help/table-of-contents";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Container } from "@/components/ui/container";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type ArticleTag = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  color: string;
};

type ArticleData = {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  content: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  category: {
    slug: string;
    name: string;
  };
  tags?: ArticleTag[];
};

type RelatedArticle = {
  id: string;
  category_slug: string;
  slug: string;
  title: string;
  excerpt: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; article: string }>;
}) {
  const { locale, category, article: articleSlug } = await params;
  const supabase = createSupabaseAnonClient();

  // First get the category_id from the category slug
  const { data: categoryData } = await supabase
    .from("help_categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (!categoryData) {
    return {
      title: "Article Not Found",
    };
  }

  const { data: article } = await supabase
    .from("help_articles")
    .select("title_en, title_es, excerpt_en, excerpt_es")
    .eq("slug", articleSlug)
    .eq("category_id", categoryData.id)
    .eq("is_published", true)
    .single();

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const title = locale === "es" ? article.title_es : article.title_en;
  const excerpt = locale === "es" ? article.excerpt_es : article.excerpt_en;

  return {
    title: `${title} - Help Center`,
    description: excerpt || title,
  };
}

async function getArticleData(
  categorySlug: string,
  articleSlug: string,
  locale: string
): Promise<{ article: ArticleData; relatedArticles: RelatedArticle[] } | null> {
  const supabase = createSupabaseAnonClient();

  // Get article with category - fetch both language columns
  const { data: rawArticle, error } = await supabase
    .from("help_articles")
    .select(
      "id, category_id, slug, title_en, title_es, content_en, content_es, view_count, helpful_count, not_helpful_count, created_at, updated_at, category:help_categories!inner(slug, name_en, name_es)"
    )
    .eq("slug", articleSlug)
    .eq("help_categories.slug", categorySlug)
    .eq("is_published", true)
    .single();

  if (error || !rawArticle) {
    return null;
  }

  // Map to correct language
  const article = {
    id: rawArticle.id,
    category_id: rawArticle.category_id,
    slug: rawArticle.slug,
    title: locale === "es" ? rawArticle.title_es : rawArticle.title_en,
    content: locale === "es" ? rawArticle.content_es : rawArticle.content_en,
    view_count: rawArticle.view_count,
    helpful_count: rawArticle.helpful_count,
    not_helpful_count: rawArticle.not_helpful_count,
    created_at: rawArticle.created_at,
    updated_at: rawArticle.updated_at,
    category: {
      slug: rawArticle.category.slug,
      name: locale === "es" ? rawArticle.category.name_es : rawArticle.category.name_en,
    },
  };

  // Increment view count (fire and forget, ignore errors)
  // biome-ignore lint/complexity/noVoid: Fire-and-forget pattern for analytics
  void supabase.rpc("increment_article_view_count", {
    article_id: article.id,
  });

  // Get article tags
  const { data: rawTagsData } = await supabase
    .from("help_article_tags_relation")
    .select(
      "tag:help_article_tags!help_article_tags_relation_tag_id_fkey(id, slug, name_en, name_es, color)"
    )
    .eq("article_id", article.id);

  // Type assertion for tags query result
  const tagsData = rawTagsData as unknown as Array<{
    tag: ArticleTag;
  }> | null;

  const tags = tagsData?.map((rel) => rel.tag) || [];

  // Get related articles - fetch both language columns
  const { data: rawRelatedArticlesData } = await supabase
    .from("help_article_relations")
    .select(
      "related_article:help_articles!help_article_relations_related_article_id_fkey(id, slug, title_en, title_es, excerpt_en, excerpt_es, category:help_categories!inner(slug))"
    )
    .eq("article_id", article.id)
    .limit(4);

  const relatedArticles: RelatedArticle[] =
    rawRelatedArticlesData?.map((rel: any) => ({
      id: rel.related_article.id,
      category_slug: rel.related_article.category.slug,
      slug: rel.related_article.slug,
      title: locale === "es" ? rel.related_article.title_es : rel.related_article.title_en,
      excerpt: locale === "es" ? rel.related_article.excerpt_es : rel.related_article.excerpt_en,
    })) || [];

  // If no explicit relations, get articles from same category
  if (relatedArticles.length === 0) {
    const { data: rawSameCategoryArticles } = await supabase
      .from("help_articles")
      .select("id, slug, title_en, title_es, excerpt_en, excerpt_es, view_count")
      .eq("category_id", article.category_id)
      .eq("is_published", true)
      .neq("id", article.id)
      .order("view_count", { ascending: false })
      .limit(4);

    if (rawSameCategoryArticles) {
      relatedArticles.push(
        ...rawSameCategoryArticles.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: locale === "es" ? a.title_es : a.title_en,
          excerpt: locale === "es" ? a.excerpt_es : a.excerpt_en,
          category_slug: categorySlug,
        }))
      );
    }
  }

  return {
    article: {
      ...article,
      tags,
    },
    relatedArticles,
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; article: string }>;
}) {
  const { locale, category, article: articleSlug } = await params;
  const data = await getArticleData(category, articleSlug, locale);

  if (!data) {
    notFound();
  }

  const { article, relatedArticles } = data;

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-white py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_250px]">
            <div>
              <ArticleViewer
                article={article}
                categoryName={article.category.name}
                categorySlug={article.category.slug}
                relatedArticles={relatedArticles}
              />
            </div>
            <aside className="hidden lg:block">
              <TableOfContents />
            </aside>
          </div>
        </Container>
      </div>
      <SiteFooter />
    </>
  );
}
