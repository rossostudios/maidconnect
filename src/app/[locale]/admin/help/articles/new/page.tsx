import { redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/help/article-form";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function NewHelpArticlePage({
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

  // Fetch categories for selection
  const { data: categories } = await supabase
    .from("help_categories")
    .select("id, slug, name_en, name_es")
    .eq("is_active", true)
    .order("display_order");

  // Fetch tags for selection
  const { data: tags } = await supabase
    .from("help_article_tags")
    .select("id, slug, name_en, name_es, color")
    .eq("is_active", true)
    .order("name_en");

  return (
    <div className="min-h-screen bg-[#FFEEFF8E8] py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-[#116611616]">
            {locale === "es" ? "Crear Nuevo Artículo" : "Create New Article"}
          </h1>
          <p className="mt-2 text-[#AA88AAAAC]">
            {locale === "es"
              ? "Escribe un nuevo artículo para el centro de ayuda"
              : "Write a new article for the help center"}
          </p>
        </div>

        <ArticleForm
          categories={categories ?? []}
          locale={locale as "en" | "es"}
          tags={tags ?? []}
        />
      </div>
    </div>
  );
}
