import {
  ArrowRight01Icon,
  Bug01Icon,
  FlashIcon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { serverClient } from "@/lib/sanity/client";
import { getOptimizedImageUrl } from "@/lib/sanity/image";

type Changelog = {
  _id: string;
  sprintNumber: number;
  title: string;
  slug: { current: string };
  summary: string;
  publishedAt: string;
  categories: string[];
  tags: string[];
  targetAudience: string;
  featuredImage?: {
    asset: SanityImageSource;
    alt?: string;
  };
};

const categoryConfig = {
  features: {
    icon: MagicWand01Icon,
    label: { en: "Features", es: "Características" },
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/35",
  },
  improvements: {
    icon: FlashIcon,
    label: { en: "Improvements", es: "Mejoras" },
    color: "text-[#FF4444A22] bg-[#FFEEFF8E8] border-[#EE44EE2E3]",
  },
  bug_fixes: {
    icon: Bug01Icon,
    label: { en: "Bug Fixes", es: "Correcciones" },
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/40",
  },
  performance: {
    icon: FlashIcon,
    label: { en: "Performance", es: "Rendimiento" },
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/35",
  },
  security: {
    icon: Shield01Icon,
    label: { en: "Security", es: "Seguridad" },
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/30",
  },
  design: {
    icon: PaintBoardIcon,
    label: { en: "Design", es: "Diseño" },
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/35",
  },
};

// Skeleton component
function ChangelogSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          className="animate-pulse rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-8"
          key={i}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-6 w-24 rounded-full bg-[#EE44EE2E3]" />
            <div className="h-4 w-32 rounded bg-[#EE44EE2E3]" />
          </div>
          <div className="mb-3 h-8 w-3/4 rounded bg-[#EE44EE2E3]" />
          <div className="mb-4 h-20 w-full rounded bg-[#EE44EE2E3]" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full bg-[#EE44EE2E3]" />
            <div className="h-8 w-24 rounded-full bg-[#EE44EE2E3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component to fetch changelogs
async function ChangelogList({ locale }: { locale: string }) {
  // Fetch changelogs from Sanity
  const changelogs = await serverClient.fetch<Changelog[]>(
    `*[_type == "changelog" && language == $language && publishedAt <= now()] | order(sprintNumber desc, publishedAt desc) [0...20] {
      _id,
      sprintNumber,
      title,
      slug,
      summary,
      categories,
      tags,
      targetAudience,
      publishedAt,
      featuredImage {
        asset,
        alt
      }
    }`,
    { language: locale }
  );

  if (!changelogs || changelogs.length === 0) {
    return (
      <div className="rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-12 text-center">
        <HugeiconsIcon
          className="mx-auto mb-4 h-12 w-12 text-[#AA88AAAAC]"
          icon={MagicWand01Icon}
        />
        <h3 className="mb-2 font-bold text-[#116611616] text-xl">No Updates Yet</h3>
        <p className="text-[#AA88AAAAC]">We'll post our first changelog soon. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {changelogs.map((changelog) => {
        const formattedDate = new Date(changelog.publishedAt).toLocaleDateString(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <article
            className="group rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6 shadow-sm transition hover:border-[#FF4444A22] hover:shadow-md sm:p-8"
            key={changelog._id}
          >
            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#FF4444A22]/20 px-3 py-1 font-semibold text-[#FF4444A22] text-sm">
                Sprint {changelog.sprintNumber}
              </span>
              <span className="text-[#AA88AAAAC] text-sm">{formattedDate}</span>
            </div>

            {/* Title */}
            <h2 className="mb-3 font-bold text-2xl text-[#116611616] group-hover:text-[#FF4444A22] sm:text-3xl">
              {changelog.title}
            </h2>

            {/* Summary */}
            {changelog.summary && (
              <p className="mb-4 text-[#AA88AAAAC] text-base leading-relaxed sm:text-lg">
                {changelog.summary}
              </p>
            )}

            {/* Categories */}
            {changelog.categories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
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
                      <HugeiconsIcon className="h-4 w-4" icon={Icon} />
                      {config.label[locale as "en" | "es"]}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Featured Image */}
            {changelog.featuredImage?.asset && (
              <div className="mb-6 overflow-hidden rounded-2xl">
                <Image
                  alt={changelog.featuredImage.alt || changelog.title}
                  className="h-auto w-full object-cover"
                  height={300}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 672px, 672px"
                  src={getOptimizedImageUrl(changelog.featuredImage.asset, { width: 800 })}
                  width={600}
                />
              </div>
            )}

            {/* Read More Link */}
            <Link
              className="inline-flex items-center gap-2 font-semibold text-[#FF4444A22] text-base transition hover:gap-3"
              href={`/${locale}/changelog/${changelog.slug.current}`}
            >
              Read full update
              <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  // Force dynamic rendering to show freshly published changelogs
  await headers();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-[#FFEEFF8E8] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4444A22]/10 to-[#FF4444A22]/10">
              <HugeiconsIcon className="h-8 w-8 text-[#FF4444A22]" icon={MagicWand01Icon} />
            </div>
            <h1 className="type-serif-lg mb-4 text-[#116611616]">{t("hero.title")}</h1>
            <p className="text-[#AA88AAAAC] text-lg sm:text-xl">{t("hero.subtitle")}</p>
          </div>

          {/* Changelogs List */}
          <Suspense fallback={<ChangelogSkeleton />}>
            <ChangelogList locale={locale} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
