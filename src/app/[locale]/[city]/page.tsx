import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { Metadata } from "next";
import { unstable_cache, unstable_noStore } from "next/cache";
import { notFound } from "next/navigation";
import { CityHeroSection } from "@/components/city/hero-section";
import { LocalProfessionals } from "@/components/city/local-professionals";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { serverClient } from "@/lib/integrations/sanity/client";
import { portableTextComponents } from "@/lib/integrations/sanity/PortableText";
import { createSupabaseAnonClient } from "@/lib/supabase/server-client";

/**
 * City Landing Pages - Dynamic Route
 *
 * SEO-optimized landing pages for each Colombian city where Casaora operates.
 * Following 2025 local SEO best practices:
 *
 * - Dynamic meta tags with city name
 * - LocalBusiness Schema markup
 * - H1 optimization (city + primary keyword)
 * - Location-specific content from Sanity CMS
 * - Professional data from Supabase
 * - Mobile-friendly responsive design
 *
 * URL Structure: /en/bogota, /es/medellin, etc.
 *
 * Hybrid Architecture:
 * - Content (hero, SEO text, services) → Sanity
 * - Professional listings, ratings → Supabase
 */

type CityPageData = {
  _id: string;
  name: string;
  slug: { current: string };
  coordinates?: {
    lat: number;
    lng: number;
  };
  heroTitle: string;
  heroSubtitle: string;
  heroDescription?: string;
  heroImage?: {
    asset: SanityImageSource;
    alt?: string;
  };
  seoContent?: PortableTextBlock[];
  services?: string[];
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
};

type Params = Promise<{ city: string; locale: string }>;

/**
 * Fetch city page data from Sanity
 */
async function getCityData(citySlug: string, locale: string): Promise<CityPageData | null> {
  const cityPage = await serverClient.fetch<CityPageData | null>(
    `*[_type == "cityPage" && slug.current == $slug && language == $language && isPublished == true][0] {
      _id,
      name,
      slug,
      coordinates,
      heroTitle,
      heroSubtitle,
      heroDescription,
      heroImage {
        asset,
        alt
      },
      seoContent,
      services,
      seoMetadata {
        title,
        description,
        keywords
      }
    }`,
    { slug: citySlug, language: locale }
  );

  return cityPage;
}

/**
 * Cached function to fetch professionals by city
 * Caches results for 1 hour to improve build performance and reduce database load
 */
const getCityProfessionals = unstable_cache(
  async (cityName: string) => {
    const supabase = createSupabaseAnonClient();

    const { data: professionals, error } = await supabase
      .from("profiles")
      .select(
        `
        profile_id,
        full_name,
        city,
        bio,
        hourly_rate_cop,
        profile_image_url,
        is_verified,
        average_rating,
        total_reviews,
        professional_services!inner (
          services (
            name
          )
        )
      `
      )
      .ilike("city", `%${cityName}%`)
      .eq("is_verified", true)
      .order("average_rating", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Error fetching professionals:", error);
      return [];
    }

    // Transform data
    return (
      professionals?.map((pro) => ({
        ...pro,
        services:
          // @ts-expect-error - Supabase typing for nested relations
          pro.professional_services?.map((ps) => ({ name: ps.services.name })) || [],
      })) || []
    );
  },
  ["city-professionals"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["professionals"],
  }
);

/**
 * Generate static params for pre-rendering city pages at build time
 * Fetches published city pages from Sanity
 */
export async function generateStaticParams() {
  const locales = ["en", "es"];
  const params: Array<{ city: string; locale: string }> = [];

  for (const locale of locales) {
    // Fetch all published city pages for this locale
    const cities = await serverClient.fetch<Array<{ slug: { current: string } }>>(
      `*[_type == "cityPage" && language == $language && isPublished == true] {
        slug
      }`,
      { language: locale }
    );

    for (const city of cities || []) {
      params.push({ city: city.slug.current, locale });
    }
  }

  return params;
}

/**
 * Generate metadata for SEO using Sanity data
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: citySlug, locale } = await params;
  const cityData = await getCityData(citySlug, locale);

  if (!cityData) {
    return {
      title: "City Not Found",
    };
  }

  const title = cityData.seoMetadata?.title || cityData.heroTitle || cityData.name;
  const description =
    cityData.seoMetadata?.description ||
    cityData.heroSubtitle ||
    `Find trusted cleaning professionals in ${cityData.name}`;

  return {
    title,
    description,
    keywords: cityData.seoMetadata?.keywords,
    alternates: {
      canonical: `/${locale}/${citySlug}`,
      languages: {
        en: `/en/${citySlug}`,
        es: `/es/${citySlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/${citySlug}`,
      siteName: "Casaora",
      locale: locale === "es" ? "es_CO" : "en_US",
      type: "website",
    },
  };
}

export default async function CityLandingPage({ params }: { params: Params }) {
  // Opt out of caching for this page since it uses dynamic features
  unstable_noStore();

  // Check if feature is enabled
  if (!isFeatureEnabled("city_landing_pages")) {
    notFound();
  }

  const { city: citySlug, locale } = await params;

  // Fetch city data from Sanity
  const cityData = await getCityData(citySlug, locale);

  if (!cityData) {
    notFound();
  }

  // Fetch professionals serving this city (cached) from Supabase
  const transformedProfessionals = await getCityProfessionals(cityData.name);

  // Calculate stats from Supabase data
  const stats = {
    professionalCount: transformedProfessionals.length,
    averageRating:
      transformedProfessionals.reduce((acc, pro) => acc + (pro.average_rating || 0), 0) /
        (transformedProfessionals.length || 1) || 4.8,
    totalReviews: transformedProfessionals.reduce((acc, pro) => acc + (pro.total_reviews || 0), 0),
  };

  // LocalBusiness Schema markup for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Home Cleaning Services",
    provider: {
      "@type": "Organization",
      name: "Casaora",
      url: `https://casaora.co/${locale}/${citySlug}`,
    },
    areaServed: {
      "@type": "City",
      name: cityData.name,
      ...(cityData.coordinates && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: cityData.coordinates.lat,
          longitude: cityData.coordinates.lng,
        },
      }),
    },
    hasOfferCatalog: cityData.services
      ? {
          "@type": "OfferCatalog",
          name: "Cleaning Services",
          itemListElement: cityData.services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service,
            },
          })),
        }
      : undefined,
    aggregateRating:
      stats.totalReviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: stats.averageRating.toFixed(1),
            reviewCount: stats.totalReviews,
          }
        : undefined,
  };

  return (
    <>
      {/* Schema Markup - Safe: JSON-LD schema markup with server-generated data only */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        type="application/ld+json"
      />

      {/* Hero Section - Content from Sanity */}
      <CityHeroSection cityName={cityData.name} citySlug={citySlug} locale={locale} stats={stats} />

      {/* Local Professionals Section - Data from Supabase */}
      <LocalProfessionals cityName={cityData.name} professionals={transformedProfessionals} />

      {/* SEO Content Section - Rich content from Sanity */}
      {cityData.seoContent && cityData.seoContent.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="prose prose-lg mx-auto">
              <PortableText components={portableTextComponents} value={cityData.seoContent} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
