import { notFound } from "next/navigation";
import { ArticleViewer } from "@/components/help/article-viewer";
import { Container } from "@/components/ui/container";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

interface ArticleData {
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
}

interface RelatedArticle {
  id: string;
  category_slug: string;
  slug: string;
  title: string;
  excerpt: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; article: string }>;
}) {
  const { locale, category, article: articleSlug } = await params;
  const supabase = createSupabaseAnonClient();

  const { data: article } = await supabase
    .from("help_articles")
    .select(
      `
      ${locale === "es" ? "title_es as title" : "title_en as title"},
      ${locale === "es" ? "excerpt_es as excerpt" : "excerpt_en as excerpt"},
      help_categories!inner(slug)
    `
    )
    .eq("slug", articleSlug)
    .eq("help_categories.slug", category)
    .eq("is_published", true)
    .single();

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} - Help Center`,
    description: article.excerpt || article.title,
  };
}

async function getArticleData(
  categorySlug: string,
  articleSlug: string,
  locale: string
): Promise<{ article: ArticleData; relatedArticles: RelatedArticle[] } | null> {
  const supabase = createSupabaseAnonClient();

  // Get article with category
  const { data: article, error } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      category_id,
      slug,
      ${locale === "es" ? "title_es as title" : "title_en as title"},
      ${locale === "es" ? "content_es as content" : "content_en as content"},
      view_count,
      helpful_count,
      not_helpful_count,
      created_at,
      updated_at,
      category:help_categories!inner(
        slug,
        ${locale === "es" ? "name_es as name" : "name_en as name"}
      )
    `
    )
    .eq("slug", articleSlug)
    .eq("help_categories.slug", categorySlug)
    .eq("is_published", true)
    .single();

  if (error || !article) {
    return null;
  }

  // Increment view count (fire and forget)
  void supabase.rpc("increment_article_view_count", {
    article_id: article.id,
  });

  // Get related articles
  const { data: relatedArticlesData } = await supabase
    .from("help_article_relations")
    .select(
      `
      related_article:help_articles!help_article_relations_related_article_id_fkey(
        id,
        slug,
        ${locale === "es" ? "title_es as title" : "title_en as title"},
        ${locale === "es" ? "excerpt_es as excerpt" : "excerpt_en as excerpt"},
        category:help_categories!inner(slug)
      )
    `
    )
    .eq("article_id", article.id)
    .limit(4);

  const relatedArticles =
    relatedArticlesData?.map((rel) => {
      const relatedArticle = rel.related_article as unknown as {
        id: string;
        slug: string;
        title: string;
        excerpt: string | null;
        category: { slug: string };
      };

      return {
        id: relatedArticle.id,
        category_slug: relatedArticle.category.slug,
        slug: relatedArticle.slug,
        title: relatedArticle.title,
        excerpt: relatedArticle.excerpt,
      };
    }) || [];

  // If no explicit relations, get articles from same category
  if (relatedArticles.length === 0) {
    const { data: sameCategoryArticles } = await supabase
      .from("help_articles")
      .select(
        `
        id,
        slug,
        ${locale === "es" ? "title_es as title" : "title_en as title"},
        ${locale === "es" ? "excerpt_es as excerpt" : "excerpt_en as excerpt"},
        view_count
      `
      )
      .eq("category_id", article.category_id)
      .eq("is_published", true)
      .neq("id", article.id)
      .order("view_count", { ascending: false })
      .limit(4);

    if (sameCategoryArticles) {
      relatedArticles.push(
        ...sameCategoryArticles.map((a) => ({
          ...a,
          category_slug: categorySlug,
        }))
      );
    }
  }

  return {
    article: {
      ...article,
      category: {
        slug: (article.category as unknown as { slug: string }).slug,
        name: (article.category as unknown as { name: string }).name,
      },
    } as ArticleData,
    relatedArticles,
  };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; article: string }>;
}) {
  const { locale, category, article } = await params;
  const data = await getArticleData(category, article, locale);

  if (!data) {
    notFound();
  }

  const { article, relatedArticles } = data;

  return (
    <div className="min-h-screen bg-white py-12">
      <Container>
        <ArticleViewer
          article={article}
          categoryName={article.category.name}
          categorySlug={article.category.slug}
          relatedArticles={relatedArticles}
        />
      </Container>
    </div>
  );
}
