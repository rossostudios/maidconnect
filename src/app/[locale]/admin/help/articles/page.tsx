import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleListClient } from "@/components/admin/help/article-list-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function HelpArticlesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  // Fetch all articles (including unpublished)
  const { data: rawArticles } = await supabase
    .from("help_articles")
    .select(
      `
      id,
      slug,
      title_en,
      title_es,
      is_published,
      view_count,
      helpful_count,
      not_helpful_count,
      created_at,
      updated_at,
      category:help_categories!inner(slug, name_en, name_es)
    `
    )
    .order("updated_at", { ascending: false });

  // Map to correct language
  const articles =
    rawArticles?.map((article) => {
      // Supabase returns category as an array due to the join syntax
      const category = Array.isArray(article.category) ? article.category[0] : article.category;

      return {
        id: article.id,
        slug: article.slug,
        title: locale === "es" ? article.title_es : article.title_en,
        is_published: article.is_published,
        view_count: article.view_count,
        helpful_count: article.helpful_count,
        not_helpful_count: article.not_helpful_count,
        created_at: article.created_at,
        updated_at: article.updated_at,
        category: {
          slug: category?.slug ?? "",
          name: locale === "es" ? (category?.name_es ?? "") : (category?.name_en ?? ""),
        },
      };
    }) ?? [];

  return (
    <div className="min-h-screen bg-[#FFEEFF8E8] py-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-[#116611616]">
              {locale === "es" ? "Artículos del Centro de Ayuda" : "Help Center Articles"}
            </h1>
            <p className="mt-2 text-[#AA88AAAAC]">
              {locale === "es"
                ? `${articles.length} artículos en total`
                : `${articles.length} articles total`}
            </p>
          </div>

          <Link
            className="flex items-center gap-2 bg-[#FF4444A22] px-6 py-3 font-semibold text-[#FFEEFF8E8] transition hover:bg-[#FF4444A22]"
            href={`/${locale}/admin/help/articles/new`}
          >
            <HugeiconsIcon className="h-5 w-5" icon={Add01Icon} />
            {locale === "es" ? "Nuevo Artículo" : "New Article"}
          </Link>
        </div>

        {/* Articles Table */}
        <ArticleListClient articles={articles} locale={locale as "en" | "es"} />
      </div>
    </div>
  );
}
