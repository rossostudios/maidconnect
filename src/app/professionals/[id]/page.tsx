import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProfessionalProfileView } from "@/components/professionals/professional-profile-view";
import { professionalProfiles, professionals, professionalsById } from "@/lib/content";

type RouteParams = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return professionals.map((professional) => ({ id: professional.id }));
}

export function generateMetadata({ params }: RouteParams): Metadata {
  const professional = professionalsById[params.id];

  if (!professional) {
    return {
      title: "Professional not found · Maidconnect",
    };
  }

  return {
    title: `${professional.name} · Maidconnect`,
    description: `View ${professional.name}'s verified Maidconnect profile including services, rates, and availability in ${professional.location}.`,
  };
}

export default function ProfessionalProfileRoute({ params }: RouteParams) {
  const professional = professionalsById[params.id];

  if (!professional) {
    notFound();
  }

  const profile = professionalProfiles[professional.id];

  if (!profile) {
    notFound();
  }

  return <ProfessionalProfileView professional={professional} profile={profile} />;
}
