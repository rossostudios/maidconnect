import { Bug, ChevronRight, Palette, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
  target_audience: string[];
  featured_image_url: string | null;
};

const categoryConfig = {
  features: {
    icon: Sparkles,
    label: "Features",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  improvements: {
    icon: Zap,
    label: "Improvements",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  fixes: { icon: Bug, label: "Fixes", color: "text-green-600 bg-green-50 border-green-200" },
  security: { icon: Shield, label: "Security", color: "text-red-600 bg-red-50 border-red-200" },
  design: { icon: Palette, label: "Design", color: "text-pink-600 bg-pink-50 border-pink-200" },
};

// Skeleton component
function ChangelogSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse rounded-[28px] border border-[#ebe5d8] bg-white p-8" key={i}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-6 w-24 rounded-full bg-[#ebe5d8]" />
            <div className="h-4 w-32 rounded bg-[#ebe5d8]" />
          </div>
          <div className="mb-3 h-8 w-3/4 rounded bg-[#ebe5d8]" />
          <div className="mb-4 h-20 w-full rounded bg-[#ebe5d8]" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full bg-[#ebe5d8]" />
            <div className="h-8 w-24 rounded-full bg-[#ebe5d8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component to fetch changelogs
async function ChangelogList() {
  const supabase = await createSupabaseServerClient();

  const { data: changelogs, error } = await supabase
    .from("changelogs")
    .select("*")
    .eq("visibility", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(20);

  if (error || !changelogs) {
    return (
      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-12 text-center">
        <p className="text-[#7a6d62]">No updates available yet. Check back soon!</p>
      </div>
    );
  }

  if (changelogs.length === 0) {
    return (
      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-12 text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#7a6d62]" />
        <h3 className="mb-2 font-bold text-[#211f1a] text-xl">No Updates Yet</h3>
        <p className="text-[#7a6d62]">We'll post our first changelog soon. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {changelogs.map((changelog: Changelog) => {
        const formattedDate = new Date(changelog.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <article
            className="group rounded-[28px] border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:border-[#ff5d46] hover:shadow-md sm:p-8"
            key={changelog.id}
          >
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#ff5d4620] px-3 py-1 font-semibold text-[#ff5d46] text-sm">
                Sprint {changelog.sprint_number}
              </span>
              <span className="text-[#7a6d62] text-sm">{formattedDate}</span>
            </div>

            {/* Title */}
            <h2 className="mb-3 font-bold text-2xl text-[#211f1a] group-hover:text-[#ff5d46] sm:text-3xl">
              {changelog.title}
            </h2>

            {/* Summary */}
            {changelog.summary && (
              <p className="mb-4 text-[#5d574b] text-base leading-relaxed sm:text-lg">
                {changelog.summary}
              </p>
            )}

            {/* Categories */}
            {changelog.categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {changelog.categories.map((category) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  if (!config) return null;

                  const Icon = config.icon;

                  return (
                    <span
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-sm ${config.color}`}
                      key={category}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Featured Image */}
            {changelog.featured_image_url && (
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img
                  alt={changelog.title}
                  className="h-auto w-full object-cover"
                  src={changelog.featured_image_url}
                />
              </div>
            )}

            {/* Content Preview */}
            <div
              className="prose prose-sm sm:prose-base mb-6 line-clamp-4 max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  changelog.content.substring(0, 500) +
                  (changelog.content.length > 500 ? "..." : ""),
              }}
            />

            {/* Read More Link */}
            <Link
              className="inline-flex items-center gap-2 font-semibold text-[#ff5d46] text-base transition hover:gap-3"
              href={`/changelog/${changelog.slug}`}
            >
              Read full update
              <ChevronRight className="h-5 w-5" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export default async function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#fbfaf9] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="mb-4 font-bold text-4xl text-[#211f1a] sm:text-5xl">What's New</h1>
            <p className="text-[#5d574b] text-lg sm:text-xl">
              Stay up to date with the latest features, improvements, and updates to MaidConnect
            </p>
          </div>

          {/* Changelogs List */}
          <Suspense fallback={<ChangelogSkeleton />}>
            <ChangelogList />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
