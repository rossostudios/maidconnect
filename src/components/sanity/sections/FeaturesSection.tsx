/**
 * Features Section Component
 *
 * Renders features section from Sanity CMS
 */

import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Container } from "@/components/ui/container";

type Feature = {
  icon?: string;
  title: string;
  description?: string;
  link?: string;
};

type FeaturesSectionProps = {
  data: {
    title?: string;
    description?: string;
    features?: Feature[];
    layout?: "grid-3" | "grid-4" | "list";
  };
};

export function FeaturesSection({ data }: FeaturesSectionProps) {
  const { title, description, features, layout = "grid-3" } = data;

  if (!features || features.length === 0) {
    return null;
  }

  const gridClass = layout === "grid-4" ? "lg:grid-cols-4" : "lg:grid-cols-3";
  const layoutClass = layout === "list" ? "grid-cols-1" : `sm:grid-cols-2 ${gridClass}`;

  return (
    <section className="bg-[#f8fafc] py-20 sm:py-24 lg:py-32">
      <Container>
        {(title || description) && (
          <div className="mb-16 text-center">
            {title && <h2 className="serif-display-lg text-[#0f172a]">{title}</h2>}
            {description && (
              <p className="lead mx-auto mt-6 max-w-2xl text-[#0f172a]/70">{description}</p>
            )}
          </div>
        )}

        <div className={`grid gap-8 ${layoutClass}`}>
          {features.map((feature, index) => (
            <div className={layout === "list" ? "border-[#e2e8f0] border-b pb-8" : ""} key={index}>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#64748b]/100/10">
                <HugeiconsIcon className="h-7 w-7 text-[#64748b]" icon={CheckmarkCircle01Icon} />
              </div>
              <h3 className="serif-headline-sm mb-4 text-[#0f172a]">{feature.title}</h3>
              {feature.description && (
                <p className="text-[#0f172a]/70 text-base leading-relaxed">{feature.description}</p>
              )}
              {feature.link && (
                <a
                  className="mt-4 inline-flex items-center font-medium text-[#64748b] hover:text-[#64748b]"
                  href={feature.link}
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
