import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { HelpSearchBar } from "@/components/help/search-bar";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Container } from "@/components/ui/container";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type Article = {
  id: string;
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
  const supabase = createSupabaseAnonClient();

  const { data: category } = await supabase
    .from("help_categories")
    .select("name_en, name_es, description_en, description_es")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  const name = locale === "es" ? category.name_es : category.name_en;
  const description = locale === "es" ? category.description_es : category.description_en;

  return {
    title: `${name} - Help Center`,
    description: description || `Learn about ${name}`,
  };
}

async function getCategoryWithArticles(categorySlug: string, locale: string) {
  const supabase = createSupabaseAnonClient();

  // Get category
  const { data: category, error: categoryError } = await supabase
    .from("help_categories")
    .select("*")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (categoryError || !category) {
    return null;
  }

  // Get articles for this category
  const { data: rawArticles } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      slug,
      ${locale === "es" ? "title_es as title" : "title_en as title"},
      ${locale === "es" ? "excerpt_es as excerpt" : "excerpt_en as excerpt"},
      view_count,
      helpful_count,
      not_helpful_count
    `
    )
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("display_order")
    .order("created_at", { ascending: false });

  // Type assertion for the dynamic query result
  const articles = (rawArticles || []) as unknown as Article[];

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
  const { locale, category: categorySlug } = await params;
  const data = await getCategoryWithArticles(categorySlug, locale);

  if (!data) {
    notFound();
  }

  const { category, articles } = data;
  const t = await getTranslations({ locale, namespace: "help" });

  const categoryName = locale === "es" ? category.name_es : category.name_en;
  const categoryDescription = locale === "es" ? category.description_es : category.description_en;

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <section className="border-gray-200 border-b bg-white py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-gray-600 text-sm">
              <Link className="hover:text-[var(--red)]" href={`/${locale}/help`}>
                {t("breadcrumb.home")}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{categoryName}</span>
            </nav>

            <h1 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">{categoryName}</h1>
            {categoryDescription && <p className="text-gray-600 text-lg">{categoryDescription}</p>}

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
              <h2 className="font-semibold text-gray-900 text-xl">
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
                    className="group block rounded-lg border border-gray-200 bg-white p-6 transition hover:border-[var(--red)] hover:shadow-md"
                    href={`/${locale}/help/${categorySlug}/${article.slug}`}
                    key={article.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-gray-900 text-lg group-hover:text-[var(--red)]">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="mb-3 text-gray-600 text-sm">{article.excerpt}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-xs">
                          <span>
                            {article.view_count}{" "}
                            {article.view_count === 1 ? t("category.view") : t("category.views")}
                          </span>

                          {helpfulPercentage !== null && (
                            <span className="flex items-center gap-1">
                              <span
                                className={
                                  helpfulPercentage >= 70 ? "text-green-600" : "text-gray-500"
                                }
                              >
                                {helpfulPercentage}% {t("category.helpful")}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition group-hover:bg-[var(--red)]/10 group-hover:text-[var(--red)]">
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
          <div className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-12 text-center">
            <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" icon={BookOpen01Icon} />
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              {t("category.noArticles.title")}
            </h3>
            <p className="mb-6 text-gray-600">{t("category.noArticles.description")}</p>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--red)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--red)]"
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
            className="inline-flex items-center gap-2 text-[var(--red)] hover:underline"
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
