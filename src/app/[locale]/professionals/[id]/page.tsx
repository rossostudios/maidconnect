import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProfessionalProfileView } from "@/components/professionals/professional-profile-view";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { getSession } from "@/lib/auth";
import { getProfessionalProfileById } from "@/lib/services/professionals/profileService";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteParams = {
  params: Promise<{
    id: string;
    locale: string;
  }>;
};

function isValidUuid(value: string) {
  return UUID_REGEX.test(value);
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { id: profileId, locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfile.meta" });

  if (!isValidUuid(profileId)) {
    return { title: t("notFoundTitle") };
  }

  const result = await getProfessionalProfileById(profileId);

  if (!result.success) {
    return { title: t("notFoundTitle") };
  }

  const professional = result.data;
  const locationSnippet = professional.location ? ` in ${professional.location}` : "";
  const serviceSnippet = professional.service ? ` for ${professional.service}` : "";

  return {
    title: `${professional.name} · Casaora`,
    description: t("descriptionTemplate", {
      name: professional.name,
      service: serviceSnippet,
      location: locationSnippet,
    }),
  };
}

export default async function ProfessionalProfileRoute({ params }: RouteParams) {
  const { id: profileId, locale } = await params;

  if (!isValidUuid(profileId)) {
    notFound();
  }

  // PARALLEL: Fetch profile and session simultaneously
  const [profileResult, session] = await Promise.all([
    getProfessionalProfileById(profileId),
    getSession(),
  ]);

  if (!profileResult.success) {
    notFound();
  }

  return (
    <div className="bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <ProfessionalProfileView
        locale={locale}
        professional={profileResult.data}
        viewer={session.user}
      />
      <SiteFooter />
    </div>
  );
}
