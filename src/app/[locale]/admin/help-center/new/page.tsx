import { unstable_noStore } from "next/cache";
import { ArticleForm } from "@/components/admin/help-center/article-form";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function getCategories() {
  const supabase = await createSupabaseServerClient();

  const { data: categories } = await supabase
    .from("help_categories")
    .select("id, slug, name_en, name_es")
    .order("display_order");

  return categories || [];
}

export default async function NewHelpArticlePage() {
  unstable_noStore(); // Opt out of caching for dynamic page
  await requireUser({ allowedRoles: ["admin"] });

  const categories = await getCategories();

  return <ArticleForm categories={categories} />;
}
