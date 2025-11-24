import {
  ArrowLeft01Icon,
  Bug01Icon,
  Calendar01Icon,
  FlashIcon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { serverClient } from "@/lib/integrations/sanity/client";
import { getOptimizedImageUrl } from "@/lib/integrations/sanity/image";
import { portableTextComponents } from "@/lib/integrations/sanity/PortableText";

type ChangelogData = {
  _id: string;
  sprintNumber: number;
  title: string;
  slug: { current: string };
  summary: string;
  content: PortableTextBlock[];
  publishedAt: string;
  categories: string[];
  tags: string[];
  targetAudience: string;
  featuredImage?: {
    asset: SanityImageSource;
    alt?: string;
  };
  impactMetrics?: {
    metric: string;
    value: string;
    description?: string;
  }[];
};

const categoryConfig = {
  features: {
    icon: MagicWand01Icon,
    label: { en: "Features", es: "Características" },
    color: "text-orange-500 bg-orange-500/10 border-orange-500/35",
  },
  improvements: {
    icon: FlashIcon,
    label: { en: "Improvements", es: "Mejoras" },
    color: "text-orange-500 bg-neutral-50 border-neutral-200",
  },
  bug_fixes: {
    icon: Bug01Icon,
    label: { en: "Bug Fixes", es: "Correcciones" },
    color: "text-orange-500 bg-orange-500/10 border-orange-500/40",
  },
  performance: {
    icon: FlashIcon,
    label: { en: "Performance", es: "Rendimiento" },
    color: "text-orange-500 bg-orange-500/10 border-orange-500/35",
  },
  security: {
    icon: Shield01Icon,
    label: { en: "Security", es: "Seguridad" },
    color: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  },
  design: {
    icon: PaintBoardIcon,
    label: { en: "Design", es: "Diseño" },
    color: "text-orange-500 bg-orange-500/10 border-orange-500/35",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Fetch changelog from Sanity
  const changelog = await serverClient.fetch<{
    title: string;
    summary?: string;
  } | null>(
    `*[_type == "changelog" && slug.current == $slug && language == $language && publishedAt <= now()][0] {
      title,
      summary
    }`,
    { slug, language: locale }
  );

  if (!changelog) {
    return {
      title: "Changelog Not Found",
    };
  }

  return {
    title: `${changelog.title} - Changelog`,
    description: changelog.summary || changelog.title,
  };
}

async function getChangelogData(slug: string, locale: string): Promise<ChangelogData | null> {
  const changelog = await serverClient.fetch<ChangelogData | null>(
    `*[_type == "changelog" && slug.current == $slug && language == $language && publishedAt <= now()][0] {
      _id,
      sprintNumber,
      title,
      slug,
      summary,
      content,
      publishedAt,
      categories,
      tags,
      targetAudience,
      featuredImage {
        asset,
        alt
      },
      impactMetrics[] {
        metric,
        value,
        description
      }
    }`,
    { slug, language: locale }
  );

  return changelog;
}

export default async function ChangelogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const changelog = await getChangelogData(slug, locale);

  if (!changelog) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "changelog" });

  const formattedDate = new Date(changelog.publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="border-neutral-200 border-b bg-neutral-50 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Back Link */}
            <Link
              className="mb-6 inline-flex items-center gap-2 text-orange-500 text-sm transition hover:gap-3"
              href={`/${locale}/changelog`}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              {t("detail.backToChangelog")}
            </Link>

            {/* Sprint Badge and Date */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="bg-orange-500/20 px-3 py-1 font-semibold text-orange-500 text-sm">
                Sprint {changelog.sprintNumber}
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500 text-sm">
                <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
                {formattedDate}
              </span>
            </div>

            {/* Title */}
            <h1 className="type-serif-lg mb-4 text-neutral-900">{changelog.title}</h1>

            {/* Summary */}
            {changelog.summary && (
              <p className="text-lg text-neutral-500 leading-relaxed">{changelog.summary}</p>
            )}

            {/* Categories */}
            {changelog.categories.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {changelog.categories.map((category: string) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  if (!config) {
                    return null;
                  }

                  const Icon = config.icon;

                  return (
                    <span
                      className={`flex items-center gap-1.5 border px-3 py-1.5 font-medium text-sm ${config.color}`}
                      key={category}
                    >
                      <HugeiconsIcon className="h-4 w-4" icon={Icon} />
                      {config.label[locale as "en" | "es"]}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="border border-neutral-200 bg-neutral-50 p-6 shadow-sm sm:p-8">
              {/* Featured Image */}
              {changelog.featuredImage?.asset && (
                <div className="mb-8 overflow-hidden">
                  <Image
                    alt={changelog.featuredImage.alt || changelog.title}
                    className="h-auto w-full object-cover"
                    height={600}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 896px, 896px"
                    src={getOptimizedImageUrl(changelog.featuredImage.asset, { width: 1200 })}
                    width={1200}
                  />
                </div>
              )}

              {/* Impact Metrics */}
              {changelog.impactMetrics && changelog.impactMetrics.length > 0 && (
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  {changelog.impactMetrics.map((metric, index) => (
                    <div
                      className="border border-neutral-200 bg-gradient-to-br from-white to-white p-4 text-center"
                      key={index}
                    >
                      <div className="mb-1 font-bold text-2xl text-orange-500">{metric.value}</div>
                      <div className="font-medium text-neutral-900 text-sm">{metric.metric}</div>
                      {metric.description && (
                        <div className="mt-1 text-neutral-500 text-xs">{metric.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <PortableText components={portableTextComponents} value={changelog.content} />
              </div>

              {/* Tags */}
              {changelog.tags.length > 0 && (
                <div className="mt-8 border-neutral-200 border-t pt-6">
                  <div className="flex flex-wrap gap-2">
                    {changelog.tags.map((tag) => (
                      <span
                        className="bg-neutral-200/30 px-3 py-1 text-neutral-500 text-sm"
                        key={tag}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Changelog */}
            <div className="mt-8 text-center">
              <Link
                className="inline-flex items-center gap-2 text-orange-500"
                href={`/${locale}/changelog`}
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
                {t("detail.backToChangelog")}
              </Link>
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
