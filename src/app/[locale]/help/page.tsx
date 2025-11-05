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
import { Container } from "@/components/ui/container";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  icon: string;
  article_count: number;
};

type PopularArticle = {
  id: string;
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

async function getCategories(_locale: string): Promise<Category[]> {
  const supabase = createSupabaseAnonClient();

  const { data: categories } = await supabase
    .from("help_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (!categories) {
    return [];
  }

  // Get article counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from("help_articles")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_published", true);

      return {
        ...category,
        article_count: count || 0,
      };
    })
  );

  return categoriesWithCounts;
}

async function getPopularArticles(locale: string): Promise<PopularArticle[]> {
  const supabase = createSupabaseAnonClient();

  const { data: rawArticles } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      slug,
      ${locale === "es" ? "title_es as title" : "title_en as title"},
      ${locale === "es" ? "excerpt_es as excerpt" : "excerpt_en as excerpt"},
      view_count,
      category:help_categories!inner(slug)
    `
    )
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(6);

  if (!rawArticles) {
    return [];
  }

  // Type assertion for the dynamic query result
  const articles = rawArticles as unknown as Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    view_count: number;
    category: { slug: string };
  }>;

  return articles.map((article) => ({
    ...article,
    category_slug: article.category.slug,
  })) as PopularArticle[];
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="border-gray-200 border-b bg-white py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="type-serif-lg mb-4 text-[var(--foreground)]">{t("hero.title")}</h1>
            <p className="mb-8 text-gray-600 text-lg md:text-xl">{t("hero.subtitle")}</p>

            {/* Search Bar */}
            <HelpSearchBar autoFocus className="mx-auto max-w-2xl" />
          </div>
        </Container>
      </section>

      <Container className="py-16">
        {/* Categories Grid */}
        <section className="mb-16">
          <h2 className="mb-8 text-center font-bold text-2xl text-gray-900 md:text-3xl">
            {t("categories.title")}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen01Icon;
              const name = locale === "es" ? category.name_es : category.name_en;
              const description =
                locale === "es" ? category.description_es : category.description_en;

              return (
                <Link
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[var(--red)] hover:shadow-md"
                  href={`/${locale}/help/${category.slug}`}
                  key={category.id}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]/10 text-[var(--red)] transition group-hover:bg-[var(--red)] group-hover:text-white">
                      <HugeiconsIcon className="h-6 w-6" icon={Icon} />
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 text-sm group-hover:bg-[var(--red)]/10 group-hover:text-[var(--red)]">
                      {category.article_count}{" "}
                      {category.article_count === 1
                        ? t("categories.article")
                        : t("categories.articles")}
                    </span>
                  </div>

                  <h3 className="mb-2 font-semibold text-gray-900 text-lg group-hover:text-[var(--red)]">
                    {name}
                  </h3>

                  {description && <p className="text-gray-600 text-sm">{description}</p>}

                  <div className="mt-4 flex items-center text-[var(--red)] text-sm">
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
            <h2 className="mb-8 text-center font-bold text-2xl text-gray-900 md:text-3xl">
              {t("popular.title")}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {popularArticles.map((article) => (
                <Link
                  className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-[var(--red)] hover:shadow-md"
                  href={`/${locale}/help/${article.category_slug}/${article.slug}`}
                  key={article.id}
                >
                  <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-[var(--red)]">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="mb-3 line-clamp-2 text-gray-600 text-sm">{article.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between text-gray-500 text-xs">
                    <span>
                      {article.view_count}{" "}
                      {article.view_count === 1 ? t("popular.view") : t("popular.views")}
                    </span>
                    <HugeiconsIcon
                      className="h-4 w-4 text-[var(--red)] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                      icon={ArrowRight01Icon}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="mt-16 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center md:p-12">
          <h2 className="mb-4 font-bold text-2xl text-gray-900">{t("contact.title")}</h2>
          <p className="mb-6 text-gray-600 text-lg">{t("contact.description")}</p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--red)] px-8 py-3 font-semibold text-white transition hover:bg-[var(--red)]"
            href={`/${locale}/contact`}
          >
            {t("contact.button")}
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </Link>
        </section>
      </Container>
    </div>
  );
}
