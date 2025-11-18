import { BookOpen01Icon, Calendar01Icon, Time01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { serverClient } from "@/lib/integrations/sanity/client";
import { getOptimizedImageUrl } from "@/lib/integrations/sanity/image";

type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  author: string;
  publishedAt: string;
  readingTime?: number;
  categoryName?: string;
  categorySlug?: { current: string };
  tags?: string[];
  featuredImage?: {
    asset: SanityImageSource;
    alt?: string;
  };
};

// Skeleton component
function BlogSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div className="animate-pulse overflow-hidden rounded-lg border border-neutral-200 bg-white" key={i}>
          <div className="h-48 bg-neutral-100" />
          <div className="p-6">
            <div className="mb-3 h-4 w-24 rounded-full bg-neutral-100" />
            <div className="mb-3 h-8 w-full rounded bg-neutral-100" />
            <div className="mb-4 h-20 w-full rounded bg-neutral-100" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 rounded bg-neutral-100" />
              <div className="h-4 w-16 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Server component to fetch blog posts
async function BlogList({ locale }: { locale: string }) {
  // Fetch blog posts from Sanity
  const blogPosts = await serverClient.fetch<BlogPost[]>(
    `*[_type == "blogPost" && language == $language && isPublished == true] | order(publishedAt desc) [0...12] {
      _id,
      title,
      slug,
      excerpt,
      author,
      publishedAt,
      readingTime,
      "categoryName": category->name,
      "categorySlug": category->slug,
      tags,
      featuredImage {
        asset,
        alt
      }
    }`,
    { language: locale }
  );

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-neutral-600" icon={BookOpen01Icon} />
        <h3 className="mb-2 font-bold text-neutral-900 text-xl">No Posts Yet</h3>
        <p className="text-neutral-600">We'll publish our first blog post soon. Stay tuned!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {blogPosts.map((post) => {
        const formattedDate = new Date(post.publishedAt).toLocaleDateString(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <Link
            className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition hover:border-orange-500 hover:shadow-md"
            href={`/${locale}/blog/${post.slug.current}`}
            key={post._id}
          >
            {/* Featured Image */}
            {post.featuredImage?.asset && (
              <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                <Image
                  alt={post.featuredImage.alt || post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  height={300}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={getOptimizedImageUrl(post.featuredImage.asset, { width: 600 })}
                  width={600}
                />
              </div>
            )}

            <div className="p-6">
              {/* Category Badge */}
              {post.categoryName && (
                <div className="mb-3">
                  <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-600 text-sm">
                    {post.categoryName}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="mb-3 font-bold text-neutral-900 text-xl leading-tight transition group-hover:text-orange-600">
                {post.title}
              </h2>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="mb-4 line-clamp-3 text-neutral-700 text-sm leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-neutral-600 text-xs">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
                  {formattedDate}
                </span>
                {post.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon className="h-4 w-4" icon={Time01Icon} />
                    {post.readingTime} min read
                  </span>
                )}
              </div>

              {/* Author */}
              {post.author && (
                <div className="mt-4 border-neutral-200 border-t pt-4">
                  <p className="font-medium text-neutral-900 text-sm">By {post.author}</p>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  // Force dynamic rendering to show freshly published blog posts
  await headers();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10">
              <HugeiconsIcon className="h-8 w-8 text-orange-500" icon={BookOpen01Icon} />
            </div>
            <h1 className="mb-4 font-[family-name:var(--font-geist-sans)] font-bold text-4xl text-neutral-900 leading-tight sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-700 sm:text-xl">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Blog Posts Grid */}
          <Suspense fallback={<BlogSkeleton />}>
            <BlogList locale={locale} />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
