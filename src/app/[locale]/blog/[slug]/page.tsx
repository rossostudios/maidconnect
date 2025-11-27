import { ArrowLeft01Icon, Calendar01Icon, Time01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TableOfContents } from "@/components/help/table-of-contents";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { serverClient } from "@/lib/integrations/sanity/client";
import { getOptimizedImageUrl } from "@/lib/integrations/sanity/image";
import { portableTextComponents } from "@/lib/integrations/sanity/PortableText";

type BlogPostData = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content: PortableTextBlock[];
  author: string;
  publishedAt: string;
  readingTime?: number;
  category?: {
    name: string;
    slug: { current: string };
  };
  tags?: string[];
  featuredImage?: {
    asset: SanityImageSource;
    alt?: string;
  };
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Fetch blog post from Sanity - try localized version first, fallback to English
  const post = await serverClient.fetch<{
    title: string;
    excerpt?: string;
    seoMetadata?: {
      metaTitle?: string;
      metaDescription?: string;
    };
  } | null>(
    `coalesce(
      *[_type == "blogPost" && slug.current == $slug && language == $language && isPublished == true][0],
      *[_type == "blogPost" && slug.current == $slug && language == "en" && isPublished == true][0]
    ) {
      title,
      excerpt,
      seoMetadata
    }`,
    { slug, language: locale }
  );

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: post.seoMetadata?.metaTitle || `${post.title} - Casaora Blog`,
    description: post.seoMetadata?.metaDescription || post.excerpt || post.title,
  };
}

async function getBlogPostData(slug: string, locale: string): Promise<BlogPostData | null> {
  // Try to get localized version first, fallback to English if not available
  const post = await serverClient.fetch<BlogPostData | null>(
    `coalesce(
      *[_type == "blogPost" && slug.current == $slug && language == $language && isPublished == true][0],
      *[_type == "blogPost" && slug.current == $slug && language == "en" && isPublished == true][0]
    ) {
      _id,
      title,
      slug,
      excerpt,
      content,
      author,
      publishedAt,
      readingTime,
      "category": category->{name, slug},
      tags,
      featuredImage {
        asset,
        alt
      },
      seoMetadata
    }`,
    { slug, language: locale }
  );

  return post;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getBlogPostData(slug, locale);

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "blog" });

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-neutral-50 dark:bg-background">
        {/* Header */}
        <header className="border-b border-neutral-200 bg-white py-12 md:py-16 dark:border-border dark:bg-card">
          <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
            {/* Back Link */}
            <Link
              className="mb-8 inline-flex items-center gap-2 font-medium text-rausch-600 text-sm transition hover:gap-3 hover:text-rausch-700"
              href={`/${locale}/blog`}
            >
              <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft01Icon} />
              {t("detail.backToBlog")}
            </Link>

            {/* Category Badge */}
            {post.category && (
              <div className="mb-6">
                <span className="inline-block rounded-full border border-rausch-200 bg-rausch-50 px-4 py-1.5 font-medium text-rausch-600 text-sm dark:border-rausch-700 dark:bg-rausch-950/30 dark:text-rausch-400">
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-6 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 leading-tight md:text-5xl lg:text-6xl dark:text-neutral-50">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mb-8 text-lg text-neutral-600 leading-relaxed md:text-xl dark:text-neutral-300">
                {post.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 border-t border-neutral-200 pt-8 dark:border-border">
              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rausch-100 dark:bg-rausch-950/50">
                    <span className="font-semibold text-rausch-600 dark:text-rausch-400">
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-50">{post.author}</p>
                  </div>
                </div>
              )}

              {/* Date */}
              <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <HugeiconsIcon className="h-5 w-5" icon={Calendar01Icon} />
                {formattedDate}
              </span>

              {/* Reading Time */}
              {post.readingTime && (
                <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <HugeiconsIcon className="h-5 w-5" icon={Time01Icon} />
                  {post.readingTime} min read
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_250px]">
              {/* Article Column */}
              <div className="mx-auto w-full max-w-3xl">
                {/* Mobile TOC - Collapsible at top */}
                <div className="mb-8 lg:hidden">
                  <TableOfContents />
                </div>

                <article className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-border dark:bg-card">
                  {/* Featured Image */}
                  {post.featuredImage?.asset && (
                    <div className="overflow-hidden">
                      <Image
                        alt={post.featuredImage.alt || post.title}
                        className="h-auto w-full object-cover"
                        height={600}
                        priority
                        sizes="(max-width: 768px) 100vw, 896px"
                        src={getOptimizedImageUrl(post.featuredImage.asset, { width: 1200 })}
                        width={1200}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-neutral max-w-none px-8 py-12 md:px-12 md:py-16 lg:px-16 dark:prose-invert dark:text-neutral-300">
                    <PortableText components={portableTextComponents} value={post.content} />
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="border-t border-neutral-200 px-8 py-8 md:px-12 lg:px-16 dark:border-border">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            className="rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1.5 font-medium text-neutral-700 text-sm dark:border-border dark:bg-card dark:text-neutral-300"
                            key={tag}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>

                {/* Back to Blog */}
                <div className="mt-12 text-center">
                  <Link
                    className="inline-flex items-center gap-2 font-medium text-rausch-600 transition hover:gap-3 hover:text-rausch-700"
                    href={`/${locale}/blog`}
                  >
                    <HugeiconsIcon className="h-5 w-5" icon={ArrowLeft01Icon} />
                    {t("detail.backToBlog")}
                  </Link>
                </div>
              </div>

              {/* Desktop TOC - Sticky sidebar */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents />
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
