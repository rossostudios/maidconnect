/**
 * Section Renderer
 *
 * Dynamically renders page sections from Sanity CMS
 */

import type { ReactNode } from "react";
import { CtaSection } from "./sections/CtaSection";
import { FaqSection } from "./sections/FaqSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HeroSection } from "./sections/HeroSection";
import { StatsSection } from "./sections/StatsSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

export type Section = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

type SectionRendererProps = {
  sections?: Section[];
};

/**
 * Renders an array of Sanity sections
 */
export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <SectionComponent key={section._key} section={section} />
      ))}
    </>
  );
}

/**
 * Renders a single section based on its type
 */
function SectionComponent({ section }: { section: Section }): ReactNode {
  switch (section._type) {
    case "heroSection":
      return <HeroSection data={section as any} />;
    case "featuresSection":
      return <FeaturesSection data={section as any} />;
    case "statsSection":
      return <StatsSection data={section as any} />;
    case "testimonialsSection":
      return <TestimonialsSection data={section as any} />;
    case "ctaSection":
      return <CtaSection data={section as any} />;
    case "faqSection":
      return <FaqSection data={section as any} />;
    default:
      console.warn(`Unknown section type: ${section._type}`);
      return null;
  }
}
