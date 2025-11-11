/**
 * Dynamic Pages Route
 *
 * Renders custom pages from Sanity CMS
 * Matches URLs: /pages/example, /pages/nested/example
 */

import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { DraftModeIndicator } from "@/components/sanity/draft-mode-indicator";
import { SectionRenderer } from "@/components/sanity/section-renderer";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { sanityFetch } from "@/lib/sanity/live";
import { pageBySlugQuery } from "@/lib/sanity/queries/pages";

type PageProps = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

type SanityPage = {
  _id: string;
  title: string;
  slug: { current: string };
  pageType: string;
  sections?: Array<{
    _type: string;
    _key: string;
    [key: string]: unknown;
  }>;
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: {
      asset?: {
        url: string;
      };
    };
    noIndex?: boolean;
    noFollow?: boolean;
  };
  publishedAt: string;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugPath = slug?.join("/") || "home";

  const { data: page } = await sanityFetch<SanityPage>({
    query: pageBySlugQuery,
    params: { slug: slugPath, language: locale },
    tags: ["page", `page:${slugPath}`],
  });

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const seo = page.seoMetadata;

  return {
    title: seo?.metaTitle || page.title,
    description: seo?.metaDescription,
    openGraph: {
      title: seo?.metaTitle || page.title,
      description: seo?.metaDescription,
      images: seo?.ogImage?.asset?.url ? [seo.ogImage.asset.url] : [],
      type: "website",
    },
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const slugPath = slug?.join("/") || "home";
  const isDraftMode = (await draftMode()).isEnabled;

  const { data: page } = await sanityFetch<SanityPage>({
    query: pageBySlugQuery,
    params: { slug: slugPath, language: locale },
    tags: ["page", `page:${slugPath}`],
  });

  if (!page) {
    notFound();
  }

  return (
    <>
      {isDraftMode && <DraftModeIndicator />}
      <SiteHeader />
      <main className="flex min-h-screen flex-col bg-[#FFEEFF8E8]">
        <SectionRenderer sections={page.sections} />
      </main>
      <SiteFooter />
    </>
  );
}
