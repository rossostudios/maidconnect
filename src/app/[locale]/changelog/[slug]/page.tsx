import { ArrowLeft, Bug, Palette, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function ChangelogDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch changelog by slug
  const { data: changelog, error } = await supabase
    .from("changelogs")
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "published")
    .single();

  if (error || !changelog) {
    notFound();
  }

  const formattedDate = new Date(changelog.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#fbfaf9] px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl">
          {/* Back Link */}
          <Link
            className="mb-8 inline-flex items-center gap-2 font-medium text-[#7a6d62] text-base transition hover:text-[#ff5d46]"
            href="/changelog"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all updates
          </Link>

          {/* Header */}
          <div className="mb-8 rounded-[28px] border border-[#ebe5d8] bg-white p-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#ff5d4620] px-3 py-1 font-semibold text-[#ff5d46] text-sm">
                Sprint {changelog.sprint_number}
              </span>
              <span className="text-[#7a6d62] text-sm">{formattedDate}</span>
            </div>

            <h1 className="mb-4 font-bold text-3xl text-[#211f1a] sm:text-4xl lg:text-5xl">
              {changelog.title}
            </h1>

            {changelog.summary && (
              <p className="mb-6 text-[#5d574b] text-lg leading-relaxed sm:text-xl">
                {changelog.summary}
              </p>
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
          </div>

          {/* Featured Image */}
          {changelog.featured_image_url && (
            <div className="mb-8 overflow-hidden rounded-[28px]">
              <img
                alt={changelog.title}
                className="h-auto w-full object-cover"
                src={changelog.featured_image_url}
              />
            </div>
          )}

          {/* Content */}
          <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: changelog.content }}
            />
          </div>

          {/* Tags */}
          {changelog.tags && changelog.tags.length > 0 && (
            <div className="mt-8 rounded-[28px] border border-[#ebe5d8] bg-white p-6">
              <h3 className="mb-3 font-semibold text-[#211f1a] text-base">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {changelog.tags.map((tag: string) => (
                  <span
                    className="rounded-full border border-[#ebe5d8] bg-[#fbfaf9] px-3 py-1 text-[#5d574b] text-sm"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Top */}
          <div className="mt-12 text-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
              href="/changelog"
            >
              <ArrowLeft className="h-4 w-4" />
              View all updates
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
