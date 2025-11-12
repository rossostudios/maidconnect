import type { PortableTextBlock } from "@portabletext/types";
import { notFound } from "next/navigation";
import { ArticleViewer } from "@/components/help/article-viewer";
import { TableOfContents } from "@/components/help/table-of-contents";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";
import { serverClient } from "@/lib/sanity/client";
import { createSupabaseAnonClient, createSupabaseServerClient } from "@/lib/supabase/server-client";

type ArticleTag = {
  _id: string;
  slug: string;
  name: string;
  color: string;
};

type ArticleData = {
  _id: string;
  slug: string;
  title: string;
  content: PortableTextBlock[];
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  category: {
    _id: string;
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
  const { locale, category: categorySlug, article: articleSlug } = await params;

  // Fetch article from Sanity
  const article = await serverClient.fetch<{
    title: string;
    excerpt?: string;
  } | null>(
    `*[_type == "helpArticle" && slug.current == $slug && language == $language && isPublished == true && category->slug.current == $categorySlug][0] {
      title,
      excerpt
    }`,
    { slug: articleSlug, language: locale, categorySlug }
  );

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

  // Fetch article from Sanity
  const sanityArticle = await serverClient.fetch<{
    _id: string;
    slug: { current: string };
    title: string;
    content: PortableTextBlock[];
    publishedAt: string;
    _updatedAt: string;
    category: {
      _id: string;
      slug: { current: string };
      name: string;
    };
    tags?: Array<{
      _id: string;
      slug: { current: string };
      name: string;
      color?: string;
    }>;
    relatedArticles?: Array<{
      _id: string;
      slug: { current: string };
      title: string;
      excerpt?: string;
      category: {
        slug: { current: string };
      };
    }>;
  } | null>(
    `*[_type == "helpArticle" && slug.current == $slug && language == $language && isPublished == true && category->slug.current == $categorySlug][0] {
      _id,
      _updatedAt,
      slug,
      title,
      content,
      publishedAt,
      "category": category->{
        _id,
        slug,
        name
      },
      "tags": tags[]-> {
        _id,
        slug,
        name,
        color
      },
      "relatedArticles": relatedArticles[]-> {
        _id,
        slug,
        title,
        excerpt,
        "category": category->{
          slug
        }
      }
    }`,
    { slug: articleSlug, language: locale, categorySlug }
  );

  if (!sanityArticle) {
    return null;
  }

  // Get engagement data from Supabase
  const { data: engagementData } = await supabase
    .from("help_articles")
    .select("slug, view_count, helpful_count, not_helpful_count")
    .eq("slug", articleSlug)
    .maybeSingle();

  const engagement = engagementData || {
    view_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
  };

  // Increment view count (fire and forget, ignore errors)
  if (engagementData) {
    // biome-ignore lint/complexity/noVoid: Fire-and-forget pattern for analytics
    void supabase.rpc("increment_article_view_count", {
      article_id: engagementData.slug,
    });
  }

  // Map tags to expected format
  const tags: ArticleTag[] = (sanityArticle.tags || []).map((tag) => ({
    _id: tag._id,
    slug: tag.slug.current,
    name: tag.name,
    color: tag.color || "#FF4444A22",
  }));

  // Prepare article data
  const article: ArticleData = {
    _id: sanityArticle._id,
    slug: sanityArticle.slug.current,
    title: sanityArticle.title,
    content: sanityArticle.content,
    view_count: engagement.view_count,
    helpful_count: engagement.helpful_count,
    not_helpful_count: engagement.not_helpful_count,
    created_at: sanityArticle.publishedAt || sanityArticle._updatedAt,
    updated_at: sanityArticle._updatedAt,
    category: {
      _id: sanityArticle.category._id,
      slug: sanityArticle.category.slug.current,
      name: sanityArticle.category.name,
    },
    tags,
  };

  // Map related articles
  let relatedArticles: RelatedArticle[] = (sanityArticle.relatedArticles || []).map((rel) => ({
    id: rel._id,
    slug: rel.slug.current,
    title: rel.title,
    excerpt: rel.excerpt || null,
    category_slug: rel.category.slug.current,
  }));

  // If no explicit relations, get articles from same category
  if (relatedArticles.length === 0) {
    const sameCategoryArticles = await serverClient.fetch<
      Array<{
        _id: string;
        slug: { current: string };
        title: string;
        excerpt?: string;
      }>
    >(
      `*[_type == "helpArticle" && category._ref == $categoryId && language == $language && isPublished == true && _id != $currentArticleId] | order(_updatedAt desc) [0...4] {
        _id,
        slug,
        title,
        excerpt
      }`,
      {
        categoryId: sanityArticle.category._id,
        language: locale,
        currentArticleId: sanityArticle._id,
      }
    );

    relatedArticles = sameCategoryArticles.map((a) => ({
      id: a._id,
      slug: a.slug.current,
      title: a.title,
      excerpt: a.excerpt || null,
      category_slug: categorySlug,
    }));
  }

  return {
    article,
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

  // Check if user is admin (use authenticated server client)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-[#FFEEFF8E8] py-12">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_250px]">
            <div className="mx-auto w-full max-w-4xl">
              {/* Mobile TOC - Collapsible at top (W3C G64) */}
              <div className="mb-8 lg:hidden">
                <TableOfContents />
              </div>

              <ArticleViewer
                article={article}
                articleId={article._id}
                categoryName={article.category.name}
                categorySlug={article.category.slug}
                isAdmin={isAdmin}
                relatedArticles={relatedArticles}
              />
            </div>

            {/* Desktop TOC - Sticky sidebar */}
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
