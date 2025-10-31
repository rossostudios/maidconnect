import Link from "next/link";
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
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 text-[#211f1a]">
      {/* Header */}
      <header className="mb-8">
        <Link
          className="mb-4 inline-block font-medium text-[#5d574b] text-sm transition hover:text-[#ff5d46]"
          href="/admin/changelog"
        >
          ← Back to Changelogs
        </Link>
        <h1 className="font-bold text-3xl">Edit Changelog</h1>
        <p className="mt-2 text-[#5d574b] text-sm">
          Sprint {changelog.sprint_number}: {changelog.title}
        </p>
      </header>

      {/* Editor */}
      <ChangelogEditor changelogId={id} initialData={changelog} mode="edit" />
    </section>
  );
}
