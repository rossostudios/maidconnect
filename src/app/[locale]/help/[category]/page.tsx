import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HelpSearchBar } from "@/components/help/search-bar";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";
import { serverClient } from "@/lib/integrations/sanity/client";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type Article = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;

  // Fetch category from Sanity
  const category = await serverClient.fetch<{
    name: string;
    description?: string;
  } | null>(
    `*[_type == "helpCategory" && slug.current == $slug && language == $language && isActive == true][0] {
      name,
      description
    }`,
    { slug: categorySlug, language: locale }
  );

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} - Help Center`,
    description: category.description || `Learn about ${category.name}`,
  };
}

async function getCategoryWithArticles(categorySlug: string, locale: string) {
  const supabase = createSupabaseAnonClient();

  // Get category from Sanity
  const category = await serverClient.fetch<{
    _id: string;
    name: string;
    description?: string;
    slug: { current: string };
  } | null>(
    `*[_type == "helpCategory" && slug.current == $slug && language == $language && isActive == true][0] {
      _id,
      name,
      description,
      slug
    }`,
    { slug: categorySlug, language: locale }
  );

  if (!category) {
    return null;
  }

  // Get articles for this category from Sanity
  const sanityArticles = await serverClient.fetch<
    Array<{
      _id: string;
      slug: { current: string };
      title: string;
      excerpt?: string;
    }>
  >(
    `*[_type == "helpArticle" && category._ref == $categoryId && language == $language && isPublished == true] | order(publishedAt desc) {
      _id,
      slug,
      title,
      excerpt
    }`,
    { categoryId: category._id, language: locale }
  );

  // Get engagement data from Supabase
  const { data: engagementData } = await supabase
    .from("help_articles")
    .select("slug, view_count, helpful_count, not_helpful_count");

  // Create map for quick lookup
  const engagementMap = new Map(engagementData?.map((e) => [e.slug, e]) || []);

  // Merge Sanity articles with Supabase engagement data
  const articles: Article[] = (sanityArticles || []).map((article) => {
    const engagement = engagementMap.get(article.slug.current) || {
      view_count: 0,
      helpful_count: 0,
      not_helpful_count: 0,
    };

    return {
      _id: article._id,
      slug: article.slug.current,
      title: article.title,
      excerpt: article.excerpt || null,
      view_count: engagement.view_count,
      helpful_count: engagement.helpful_count,
      not_helpful_count: engagement.not_helpful_count,
    };
  });

  return {
    category,
    articles,
  };
}

export default async function HelpCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  // Force dynamic rendering so freshly published articles appear without redeploys
  await headers();

  const { locale, category: categorySlug } = await params;
  const data = await getCategoryWithArticles(categorySlug, locale);

  if (!data) {
    notFound();
  }

  const { category, articles } = data;
  const t = await getTranslations({ locale, namespace: "help" });

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-white to-white">
        {/* Header */}
        <section className="border-neutral-200 border-b bg-neutral-50 py-12">
          <Container>
            <div className="mx-auto max-w-4xl">
              {/* Breadcrumb */}
              <nav className="mb-6 flex items-center gap-2 text-neutral-700 text-sm">
                <Link className="hover:text-orange-600" href={`/${locale}/help`}>
                  {t("breadcrumb.home")}
                </Link>
                <span>/</span>
                <span className="text-neutral-900">{category.name}</span>
              </nav>

              <h1 className="mb-4 font-bold text-3xl text-neutral-900 md:text-4xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-neutral-700">{category.description}</p>
              )}

              {/* Search Bar */}
              <div className="mt-8">
                <HelpSearchBar />
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-12">
          {/* Articles List */}
          {articles.length > 0 ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold text-neutral-900 text-xl">
                  {t("category.articlesCount", { count: articles.length })}
                </h2>
              </div>

              <div className="space-y-4">
                {articles.map((article) => {
                  const helpfulPercentage =
                    article.helpful_count + article.not_helpful_count > 0
                      ? Math.round(
                          (article.helpful_count /
                            (article.helpful_count + article.not_helpful_count)) *
                            100
                        )
                      : null;

                  return (
                    <Link
                      className="group block border border-neutral-200 bg-neutral-50 p-6 transition hover:border-orange-600 hover:shadow-md"
                      href={`/${locale}/help/${categorySlug}/${article.slug}`}
                      key={article._id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 font-semibold text-lg text-neutral-900 group-hover:text-orange-600">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="mb-3 text-neutral-700 text-sm">{article.excerpt}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-neutral-700 text-xs">
                            <span>
                              {article.view_count}{" "}
                              {article.view_count === 1 ? t("category.view") : t("category.views")}
                            </span>

                            {helpfulPercentage !== null && (
                              <span className="flex items-center gap-1">
                                <span
                                  className={
                                    helpfulPercentage >= 70 ? "text-orange-600" : "text-neutral-700"
                                  }
                                >
                                  {helpfulPercentage}% {t("category.helpful")}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center bg-white text-neutral-700 transition group-hover:bg-orange-500/10 group-hover:text-orange-600">
                            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl border border-neutral-200 bg-neutral-50 p-12 text-center">
              <HugeiconsIcon
                className="mx-auto mb-4 h-12 w-12 text-neutral-700"
                icon={BookOpen01Icon}
              />
              <h3 className="mb-2 font-semibold text-lg text-neutral-900">
                {t("category.noArticles.title")}
              </h3>
              <p className="mb-6 text-neutral-700">{t("category.noArticles.description")}</p>
              <Link
                className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                href={`/${locale}/help`}
              >
                {t("category.noArticles.button")}
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </Link>
            </div>
          )}

          {/* Back to Categories */}
          <div className="mx-auto mt-12 max-w-4xl text-center">
            <Link
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
              href={`/${locale}/help`}
            >
              <HugeiconsIcon className="h-4 w-4 rotate-180" icon={ArrowRight01Icon} />
              {t("category.backToHelp")}
            </Link>
          </div>
        </Container>
      </div>
      <SiteFooter />
    </>
  );
}
