import { notFound } from "next/navigation";
import { ArticleViewer } from "@/components/help/article-viewer";
import { Container } from "@/components/ui/container";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

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

  // Type assertion for the dynamic query result
  const typedArticle = article as unknown as { title: string; excerpt: string | null };

  return {
    title: `${typedArticle.title} - Help Center`,
    description: typedArticle.excerpt || typedArticle.title,
  };
}

async function getArticleData(
  categorySlug: string,
  articleSlug: string,
  locale: string
): Promise<{ article: ArticleData; relatedArticles: RelatedArticle[] } | null> {
  const supabase = createSupabaseAnonClient();

  // Get article with category
  const { data: rawArticle, error } = await supabase
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

  if (error || !rawArticle) {
    return null;
  }

  // Type assertion for the dynamic query result
  const article = rawArticle as unknown as Omit<ArticleData, "category"> & {
    category: { slug: string; name: string };
  };

  // Increment view count (fire and forget)
  supabase
    .rpc("increment_article_view_count", {
      article_id: article.id,
    })
    .catch(() => {
      // Silently ignore errors
    });

  // Get related articles
  const { data: rawRelatedArticlesData } = await supabase
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

  // Type assertion for the related articles query result
  const relatedArticlesData = rawRelatedArticlesData as unknown as Array<{
    related_article: {
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      category: { slug: string };
    };
  }> | null;

  const relatedArticles =
    relatedArticlesData?.map((rel) => ({
      id: rel.related_article.id,
      category_slug: rel.related_article.category.slug,
      slug: rel.related_article.slug,
      title: rel.related_article.title,
      excerpt: rel.related_article.excerpt,
    })) || [];

  // If no explicit relations, get articles from same category
  if (relatedArticles.length === 0) {
    const { data: rawSameCategoryArticles } = await supabase
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

    // Type assertion for the dynamic query result
    const sameCategoryArticles = rawSameCategoryArticles as unknown as Array<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
    }> | null;

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
  const { locale, category, article: articleSlug } = await params;
  const data = await getArticleData(category, articleSlug, locale);

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
