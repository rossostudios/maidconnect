import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Calendar01Icon,
  CreditCardIcon,
  Rocket01Icon,
  SecurityCheckIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HelpSearchBar } from "@/components/help/search-bar";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Container } from "@/components/ui/container";
import { serverClient } from "@/lib/integrations/sanity/client";
import {
  HELP_ARTICLES_BY_CATEGORY_QUERY,
  HELP_CATEGORIES_QUERY,
} from "@/lib/integrations/sanity/queries";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type Category = {
  _id: string;
  slug: { current: string };
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  article_count: number;
};

type PopularArticle = {
  _id: string;
  category_slug: string;
  slug: string;
  title: string;
  excerpt: string | null;
  view_count: number;
};

// Icon mapping
const iconMap: Record<string, typeof BookOpen01Icon> = {
  "book-open": BookOpen01Icon,
  calendar: Calendar01Icon,
  "credit-card": CreditCardIcon,
  "shield-check": SecurityCheckIcon,
  wrench: Wrench01Icon,
  rocket: Rocket01Icon,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

async function getCategories(locale: string): Promise<Category[]> {
  // Fetch categories from Sanity
  const categories = await serverClient.fetch<
    Array<{
      _id: string;
      slug: { current: string };
      name: string;
      description?: string;
      icon?: string;
      displayOrder: number;
    }>
  >(HELP_CATEGORIES_QUERY, { language: locale });

  if (!categories) {
    return [];
  }

  // Get article counts for each category from Sanity
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const articles = await serverClient.fetch<Array<{ _id: string }>>(
        HELP_ARTICLES_BY_CATEGORY_QUERY,
        {
          categoryId: category._id,
          language: locale,
        }
      );

      return {
        ...category,
        article_count: articles?.length || 0,
      };
    })
  );

  return categoriesWithCounts;
}

async function getPopularArticles(locale: string): Promise<PopularArticle[]> {
  const supabase = createSupabaseAnonClient();

  // Fetch all published articles from Sanity for this language
  const sanityArticles = await serverClient.fetch<
    Array<{
      _id: string;
      slug: { current: string };
      title: string;
      excerpt?: string;
      category: {
        slug: { current: string };
      };
    }>
  >(
    `*[_type == "helpArticle" && language == $language && isPublished == true] {
      _id,
      slug,
      title,
      excerpt,
      "category": category->{
        slug
      }
    }`,
    { language: locale }
  );

  if (!sanityArticles || sanityArticles.length === 0) {
    return [];
  }

  // Get view counts from Supabase (engagement data stays in Supabase)
  const { data: viewCounts } = await supabase
    .from("help_articles")
    .select("id, slug, view_count")
    .order("view_count", { ascending: false });

  // Create a map of slug -> view_count for quick lookup
  const viewCountMap = new Map(viewCounts?.map((vc) => [vc.slug, vc.view_count]) || []);

  // Merge Sanity articles with Supabase view counts
  const articlesWithViews = sanityArticles
    .map((article) => ({
      _id: article._id,
      slug: article.slug.current,
      title: article.title,
      excerpt: article.excerpt || null,
      view_count: viewCountMap.get(article.slug.current) || 0,
      category_slug: article.category.slug.current,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6);

  return articlesWithViews;
}

export default async function HelpCenterPage({
  params,
  searchParams: _searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  // Force dynamic rendering to avoid prerendering issues with Math.random() in Supabase client
  await headers();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "help" });
  const categories = await getCategories(locale);
  const popularArticles = await getPopularArticles(locale);

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-gradient-to-b from-white to-white dark:from-background dark:to-background">
        {/* Hero Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 py-16 dark:border-border dark:bg-background">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="type-serif-lg mb-4 text-neutral-900 dark:text-neutral-50">{t("hero.title")}</h1>
              <p className="mb-8 text-lg text-neutral-500 md:text-xl dark:text-neutral-400">{t("hero.subtitle")}</p>

              {/* Search Bar */}
              <HelpSearchBar autoFocus className="mx-auto max-w-2xl" />
            </div>
          </Container>
        </section>

        <Container className="py-16">
          {/* Categories Grid */}
          <section className="mb-16">
            <h2 className="mb-8 text-center font-bold text-2xl text-neutral-900 md:text-3xl dark:text-neutral-50">
              {t("categories.title")}
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = iconMap[category.icon || "book-open"] || BookOpen01Icon;

                return (
                  <Link
                    className="group rounded-lg border border-neutral-200 bg-neutral-50 p-6 shadow-sm transition hover:border-rausch-500 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-rausch-400"
                    href={`/${locale}/help/${category.slug.current}`}
                    key={category._id}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rausch-500/10 text-rausch-500 transition group-hover:bg-rausch-500 group-hover:text-white dark:bg-rausch-500/20">
                        <HugeiconsIcon className="h-6 w-6" icon={Icon} />
                      </div>
                      <span className="rounded-full bg-neutral-200/30 px-3 py-1 text-neutral-500 text-sm group-hover:bg-rausch-500/10 group-hover:text-rausch-500 dark:bg-muted/50 dark:text-neutral-400">
                        {category.article_count}{" "}
                        {category.article_count === 1
                          ? t("categories.article")
                          : t("categories.articles")}
                      </span>
                    </div>

                    <h3 className="mb-2 font-semibold text-lg text-neutral-900 group-hover:text-rausch-500 dark:text-neutral-50">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-neutral-500 text-sm dark:text-neutral-400">{category.description}</p>
                    )}

                    <div className="mt-4 flex items-center text-rausch-500 text-sm">
                      <span>{t("categories.browse")}</span>
                      <HugeiconsIcon
                        className="ml-1 h-4 w-4 transition group-hover:translate-x-1"
                        icon={ArrowRight01Icon}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <section>
              <h2 className="mb-8 text-center font-bold text-2xl text-neutral-900 md:text-3xl dark:text-neutral-50">
                {t("popular.title")}
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {popularArticles.map((article) => (
                  <Link
                    className="group rounded-lg border border-neutral-200 bg-neutral-50 p-5 transition hover:border-rausch-500 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-rausch-400"
                    href={`/${locale}/help/${article.category_slug}/${article.slug}`}
                    key={article._id}
                  >
                    <h3 className="mb-2 font-semibold text-neutral-900 group-hover:text-rausch-500 dark:text-neutral-50">
                      {article.title}
                    </h3>

                    {article.excerpt && (
                      <p className="mb-3 line-clamp-2 text-neutral-500 text-sm dark:text-neutral-400">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-neutral-500 text-xs dark:text-neutral-400">
                      <span>
                        {article.view_count}{" "}
                        {article.view_count === 1 ? t("popular.view") : t("popular.views")}
                      </span>
                      <HugeiconsIcon
                        className="h-4 w-4 text-rausch-500 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                        icon={ArrowRight01Icon}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Contact CTA */}
          <section className="mt-16 rounded-lg border border-neutral-200 bg-gradient-to-br from-white to-white p-8 text-center md:p-12 dark:border-border dark:from-card dark:to-card">
            <h2 className="mb-4 font-bold text-2xl text-neutral-900 dark:text-neutral-50">{t("contact.title")}</h2>
            <p className="mb-6 text-lg text-neutral-700 dark:text-neutral-300">{t("contact.description")}</p>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-rausch-500 px-8 py-3 font-semibold text-white transition hover:bg-rausch-600"
              href={`/${locale}/contact`}
            >
              {t("contact.button")}
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
          </section>
        </Container>
      </div>
      <SiteFooter />
    </>
  );
}
