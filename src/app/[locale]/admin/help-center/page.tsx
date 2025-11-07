import {
  Add01Icon,
  BookOpen01Icon,
  Calendar01Icon,
  CreditCardIcon,
  EyeIcon,
  Rocket01Icon,
  Search01Icon,
  SecurityCheckIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import { ArticleRowActions } from "@/components/admin/help-center/article-row-actions";
import { Link } from "@/i18n/routing";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type HelpArticle = {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  excerpt_en: string | null;
  excerpt_es: string | null;
  is_published: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    slug: string;
    name_en: string;
    name_es: string;
    icon: string;
  };
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

async function getHelpArticles(): Promise<HelpArticle[]> {
  const supabase = await createSupabaseServerClient();

  const { data: rawArticles } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      slug,
      title_en,
      title_es,
      excerpt_en,
      excerpt_es,
      is_published,
      view_count,
      helpful_count,
      not_helpful_count,
      created_at,
      updated_at,
      category:help_categories!inner(
        id,
        slug,
        name_en,
        name_es,
        icon
      )
    `
    )
    .order("updated_at", { ascending: false });

  if (!rawArticles) {
    return [];
  }

  // Type assertion for the dynamic query result
  return rawArticles as unknown as HelpArticle[];
}

async function getCategories() {
  const supabase = await createSupabaseServerClient();

  const { data: categories } = await supabase
    .from("help_categories")
    .select("id, slug, name_en, name_es, icon")
    .order("display_order");

  return categories || [];
}

export default async function HelpCenterAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  unstable_noStore(); // Opt out of caching for dynamic page
  await requireUser({ allowedRoles: ["admin"] });

  const articles = await getHelpArticles();
  const categories = await getCategories();
  const params = await searchParams;

  // Filter articles based on search params
  const filteredArticles = articles.filter((article) => {
    if (params.category && article.category.slug !== params.category) {
      return false;
    }

    if (params.status === "published" && !article.is_published) {
      return false;
    }

    if (params.status === "draft" && article.is_published) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.is_published).length,
    draft: articles.filter((a) => !a.is_published).length,
    views: articles.reduce((sum, a) => sum + a.view_count, 0),
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl text-[#171717]">Help Center Management</h1>
          <p className="text-[#737373]">
            Create and manage help articles for customers and professionals
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D14B39]"
          href="/admin/help-center/new"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
          New Article
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="mb-2 text-[#737373] text-sm">Total Articles</div>
          <div className="font-bold text-3xl text-[#171717]">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="mb-2 text-[#737373] text-sm">Published</div>
          <div className="font-bold text-3xl text-green-600">{stats.published}</div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="mb-2 text-[#737373] text-sm">Drafts</div>
          <div className="font-bold text-3xl text-orange-600">{stats.draft}</div>
        </div>

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
          <div className="mb-2 text-[#737373] text-sm">Total Views</div>
          <div className="font-bold text-3xl text-[#171717]">{stats.views.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#737373] text-sm">Category:</span>
          <div className="flex flex-wrap gap-2">
            <Link
              className={`rounded-lg px-4 py-2 text-sm transition ${
                params.category
                  ? "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
                  : "bg-[#E85D48] text-white"
              }`}
              href="/admin/help-center"
            >
              All
            </Link>

            {categories.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen01Icon;

              return (
                <Link
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                    params.category === category.slug
                      ? "bg-[#E85D48] text-white"
                      : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
                  }`}
                  href={`/admin/help-center?category=${category.slug}`}
                  key={category.id}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Icon} />
                  {category.name_en}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-[#737373] text-sm">Status:</span>
        <Link
          className={`rounded-lg px-4 py-2 text-sm transition ${
            params.status
              ? "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
              : "bg-[#E85D48] text-white"
          }`}
          href={`/admin/help-center${params.category ? `?category=${params.category}` : ""}`}
        >
          All
        </Link>

        <Link
          className={`rounded-lg px-4 py-2 text-sm transition ${
            params.status === "published"
              ? "bg-[#E85D48] text-white"
              : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
          }`}
          href={`/admin/help-center?status=published${params.category ? `&category=${params.category}` : ""}`}
        >
          Published
        </Link>

        <Link
          className={`rounded-lg px-4 py-2 text-sm transition ${
            params.status === "draft"
              ? "bg-[#E85D48] text-white"
              : "border border-[#E5E5E5] bg-white text-[#737373] hover:border-[#E85D48]"
          }`}
          href={`/admin/help-center?status=draft${params.category ? `&category=${params.category}` : ""}`}
        >
          Drafts
        </Link>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-[#E5E5E5] border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#171717] text-sm">
                  Article
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#171717] text-sm">
                  Category
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#171717] text-sm">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-[#171717] text-sm">
                  Engagement
                </th>
                <th className="px-6 py-4 text-left font-semibold text-[#171717] text-sm">
                  Updated
                </th>
                <th className="px-6 py-4 text-right font-semibold text-[#171717] text-sm">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-[#737373]" colSpan={6}>
                    <div className="flex flex-col items-center gap-4">
                      <HugeiconsIcon className="h-12 w-12 text-[#E5E5E5]" icon={Search01Icon} />
                      <div>
                        <p className="font-semibold text-[#171717]">No articles found</p>
                        <p className="text-sm">
                          {params.category || params.status
                            ? "Try adjusting your filters"
                            : "Create your first article to get started"}
                        </p>
                      </div>

                      {!(params.category || params.status) && (
                        <Link
                          className="inline-flex items-center gap-2 rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-white transition hover:bg-[#D14B39]"
                          href="/admin/help-center/new"
                        >
                          <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
                          Create First Article
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => {
                  const Icon = iconMap[article.category.icon] || BookOpen01Icon;
                  const helpfulRate =
                    article.helpful_count + article.not_helpful_count > 0
                      ? Math.round(
                          (article.helpful_count /
                            (article.helpful_count + article.not_helpful_count)) *
                            100
                        )
                      : null;

                  return (
                    <tr className="transition hover:bg-gray-50" key={article.id}>
                      {/* Article */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="mb-1 font-semibold text-[#171717]">
                            {article.title_en}
                          </div>
                          <div className="text-[#737373] text-sm">{article.title_es}</div>

                          {article.excerpt_en && (
                            <div className="mt-2 line-clamp-1 text-[#A3A3A3] text-xs">
                              {article.excerpt_en}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-[#737373] text-sm">
                          <HugeiconsIcon className="h-4 w-4" icon={Icon} />
                          {article.category.name_en}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {article.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700 text-xs">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Engagement */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-[#737373]">
                            <HugeiconsIcon className="h-4 w-4" icon={EyeIcon} />
                            {article.view_count} views
                          </div>

                          {helpfulRate !== null && (
                            <div className="text-[#737373] text-xs">{helpfulRate}% helpful</div>
                          )}
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="px-6 py-4">
                        <div className="text-[#737373] text-sm">
                          {new Date(article.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <ArticleRowActions
                          articleId={article.id}
                          articleSlug={article.slug}
                          articleTitle={article.title_en}
                          categorySlug={article.category.slug}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
