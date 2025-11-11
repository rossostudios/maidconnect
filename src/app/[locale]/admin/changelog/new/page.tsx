import { unstable_noStore } from "next/cache";
import { ChangelogEditor } from "@/components/admin/changelog/changelog-editor";
import { requireUser } from "@/lib/auth/session";

export default async function NewChangelogPage() {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-[#116611616]">Create New Changelog</h1>
        <p className="mt-2 text-[#AA88AAAAC] text-sm">
          Create a new sprint update to keep users informed about the latest changes
        </p>
      </header>

      {/* Editor */}
      <ChangelogEditor mode="create" />
    </>
  );
}
