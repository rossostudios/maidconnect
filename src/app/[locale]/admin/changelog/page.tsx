import {
  Add01Icon,
  Bug01Icon,
  Edit01Icon,
  FlashIcon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { unstable_noStore } from "next/cache";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata = {
  title: "Changelog Management | Admin",
  description: "Create, edit, and publish sprint updates",
};

type Changelog = {
  id: string;
  sprint_number: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  published_at: string;
  categories: string[];
  tags: string[];
  visibility: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};

const categoryConfig = {
  features: { icon: MagicWand01Icon, label: "Features", color: "text-purple-600 bg-purple-50" },
  improvements: { icon: FlashIcon, label: "Improvements", color: "text-blue-600 bg-blue-50" },
  fixes: { icon: Bug01Icon, label: "Fixes", color: "text-green-600 bg-green-50" },
  security: { icon: Shield01Icon, label: "Security", color: "text-red-600 bg-red-50" },
  design: { icon: PaintBoardIcon, label: "Design", color: "text-pink-600 bg-pink-50" },
};

const visibilityBadge = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-orange-100 text-orange-700",
};

export default async function AdminChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  unstable_noStore(); // Opt out of caching for dynamic page

  await requireUser({ allowedRoles: ["admin"] });
  const supabase = await createSupabaseServerClient();
  const { status } = await searchParams;

  // Build query based on status filter
  let query = supabase.from("changelogs").select("*").order("created_at", { ascending: false });

  if (status && ["draft", "published", "archived"].includes(status)) {
    query = query.eq("visibility", status);
  }

  const { data: changelogs, error } = await query;

  if (error) {
    console.error("Error fetching changelogs:", error);
  }

  const changelogList = changelogs || [];

  // Count by status
  const counts = {
    all: changelogList.length,
    draft: changelogList.filter((c) => c.visibility === "draft").length,
    published: changelogList.filter((c) => c.visibility === "published").length,
    archived: changelogList.filter((c) => c.visibility === "archived").length,
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-3xl text-[#171717]">Changelog Management</h1>
          <p className="mt-2 text-[#737373] text-sm">
            Create, edit, and publish sprint updates for your users
          </p>
        </div>
        <Link
          className="flex items-center gap-2 rounded-lg bg-[#E63946] px-4 py-2 font-semibold text-sm text-white transition hover:bg-[#D32F40]"
          href="/admin/changelog/new"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
          New Changelog
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-[#E5E5E5] border-b pb-4">
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status
              ? "border border-[#E5E5E5] text-[#737373] hover:border-[#E63946]"
              : "bg-[#E63946] text-white"
          }`}
          href="/admin/changelog"
        >
          All ({counts.all})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "draft"
              ? "bg-[#E63946] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E63946]"
          }`}
          href="/admin/changelog?status=draft"
        >
          Draft ({counts.draft})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "published"
              ? "bg-[#E63946] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E63946]"
          }`}
          href="/admin/changelog?status=published"
        >
          Published ({counts.published})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "archived"
              ? "bg-[#E63946] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E63946]"
          }`}
          href="/admin/changelog?status=archived"
        >
          Archived ({counts.archived})
        </Link>
      </div>

      {/* Changelogs List */}
      {changelogList.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-12 text-center">
          <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-[#A3A3A3]" icon={MagicWand01Icon} />
          <h3 className="mb-2 font-bold text-[#171717] text-xl">No Changelogs Yet</h3>
          <p className="mb-6 text-[#737373]">Create your first changelog to get started</p>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#D32F40]"
            href="/admin/changelog/new"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
            Create Changelog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {changelogList.map((changelog: Changelog) => (
            <article
              className="group rounded-lg border border-[#E5E5E5] bg-white p-6 shadow-sm transition hover:border-[#E63946]"
              key={changelog.id}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Content */}
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#FEE2E2] px-3 py-1 font-semibold text-[#E63946] text-xs">
                      Sprint {changelog.sprint_number}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-medium text-xs capitalize ${visibilityBadge[changelog.visibility]}`}
                    >
                      {changelog.visibility}
                    </span>
                    <span className="text-[#737373] text-xs">
                      {new Date(changelog.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="mb-2 font-bold text-[#171717] text-xl">{changelog.title}</h2>

                  {changelog.summary && (
                    <p className="mb-3 line-clamp-2 text-[#737373] text-sm">{changelog.summary}</p>
                  )}

                  {/* Categories */}
                  {changelog.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {changelog.categories.map((category: string) => {
                        const config = categoryConfig[category as keyof typeof categoryConfig];
                        if (!config) {
                          return null;
                        }

                        const Icon = config.icon;

                        return (
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs ${config.color}`}
                            key={category}
                          >
                            <HugeiconsIcon className="h-3 w-3" icon={Icon} />
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] px-3 py-2 font-medium text-[#737373] text-sm transition hover:border-[#E63946] hover:text-[#E63946]"
                    href={`/changelog/${changelog.slug}`}
                    target="_blank"
                    title="Preview"
                  >
                    <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
                    Preview
                  </Link>
                  <Link
                    className="flex items-center gap-2 rounded-lg bg-[#E63946] px-3 py-2 font-medium text-sm text-white transition hover:bg-[#D32F40]"
                    href={`/admin/changelog/${changelog.id}/edit`}
                  >
                    <HugeiconsIcon className="h-4 w-4" icon={Edit01Icon} />
                    Edit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
