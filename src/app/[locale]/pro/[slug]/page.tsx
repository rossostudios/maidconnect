import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProfessionalProfileView } from "@/components/professionals/professional-profile-view";
import { ShareSection } from "@/components/professionals/social-share-buttons";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { getSession } from "@/lib/auth";
import { getProfessionalProfileBySlug } from "@/lib/services/professionals/profileService";
import { isValidSlug } from "@/lib/utils/slug";

type RouteParams = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfile.meta" });

  if (!isValidSlug(slug)) {
    return { title: t("notFoundTitle") };
  }

  const result = await getProfessionalProfileBySlug(slug);

  if (!result.success) {
    return { title: t("notFoundTitle") };
  }

  const professional = result.data;
  const locationSnippet = professional.location ? ` in ${professional.location}` : "";
  const serviceSnippet = professional.service ? ` for ${professional.service}` : "";
  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/pro/${slug}`;

  return {
    title: `${professional.name} · Casaora`,
    description: t("descriptionTemplate", {
      name: professional.name,
      service: serviceSnippet,
      location: locationSnippet,
    }),
    openGraph: {
      title: `${professional.name} · Casaora`,
      description: t("descriptionTemplate", {
        name: professional.name,
        service: serviceSnippet,
        location: locationSnippet,
      }),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${slug}`,
      siteName: "Casaora",
      type: "profile",
      locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${professional.name} - ${professional.service || "Professional"}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${professional.name} · Casaora`,
      description: t("descriptionTemplate", {
        name: professional.name,
        service: serviceSnippet,
        location: locationSnippet,
      }),
      images: [ogImageUrl],
    },
  };
}

export default async function PublicProfessionalProfileRoute({ params }: RouteParams) {
  const { slug, locale } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  // PARALLEL: Fetch profile and session simultaneously
  const [profileResult, session] = await Promise.all([
    getProfessionalProfileBySlug(slug),
    getSession(),
  ]);

  if (!profileResult.success) {
    notFound();
  }

  const professional = profileResult.data;
  const vanityUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${slug}`;

  return (
    <div className="bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <ProfessionalProfileView
        isPublicView={true}
        locale={locale}
        professional={professional}
        viewer={session.user}
      />

      {/* Social Share Section */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <ShareSection
          professionalName={professional.name}
          service={professional.service ?? undefined}
          url={vanityUrl}
        />
      </div>

      <SiteFooter />
    </div>
  );
}
