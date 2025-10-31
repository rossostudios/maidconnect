import { requireUser } from "@/lib/auth/session";
import { ChangelogEditor } from "@/components/admin/changelog/changelog-editor";
import Link from "next/link";

export default async function NewChangelogPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 text-[#211f1a]">
      {/* Header */}
      <header className="mb-8">
        <Link
          href="/admin/changelog"
          className="mb-4 inline-block font-medium text-[#5d574b] text-sm transition hover:text-[#ff5d46]"
        >
          ← Back to Changelogs
        </Link>
        <h1 className="font-bold text-3xl">Create New Changelog</h1>
        <p className="mt-2 text-[#5d574b] text-sm">
          Create a new sprint update to keep users informed about the latest changes
        </p>
      </header>

      {/* Editor */}
      <ChangelogEditor mode="create" />
    </section>
  );
}
