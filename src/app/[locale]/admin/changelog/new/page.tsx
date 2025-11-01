import { ChangelogEditor } from "@/components/admin/changelog/changelog-editor";
import { requireUser } from "@/lib/auth/session";

export default async function NewChangelogPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-[#211f1a]">Create New Changelog</h1>
        <p className="mt-2 text-[#5d574b] text-sm">
          Create a new sprint update to keep users informed about the latest changes
        </p>
      </header>

      {/* Editor */}
      <ChangelogEditor mode="create" />
    </>
  );
}
