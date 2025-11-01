import { notFound } from "next/navigation";
import { ChangelogEditor } from "@/components/admin/changelog/changelog-editor";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function EditChangelogPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ allowedRoles: ["admin"] });
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch the changelog
  const { data: changelog, error } = await supabase
    .from("changelogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !changelog) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-[#211f1a]">Edit Changelog</h1>
        <p className="mt-2 text-[#5d574b] text-sm">
          Sprint {changelog.sprint_number}: {changelog.title}
        </p>
      </header>

      {/* Editor */}
      <ChangelogEditor changelogId={id} initialData={changelog} mode="edit" />
    </>
  );
}
