/**
 * CTA Section Component
 *
 * Renders call-to-action section from Sanity CMS
 */

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

type CtaSectionProps = {
  data: {
    title?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundColor?: "red" | "gray" | "white";
  };
};

export function CtaSection({ data }: CtaSectionProps) {
  const {
    title,
    description,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    backgroundColor = "red",
  } = data;

  const bgClass = {
    red: "bg-[neutral-500]/100",
    gray: "bg-[neutral-900]",
    white: "bg-[neutral-50]",
  }[backgroundColor];

  const textClass = backgroundColor === "white" ? "text-[neutral-900]" : "text-[neutral-50]";

  return (
    <section className={`${bgClass} py-20 sm:py-24 lg:py-32`}>
      <Container className="max-w-4xl">
        <div className="text-center">
          {title && <h2 className={`serif-display-lg ${textClass}`}>{title}</h2>}

          {description && (
            <p
              className={`lead mt-6 ${backgroundColor === "white" ? "text-[neutral-900]/70" : "text-[neutral-50]/90"}`}
            >
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            {primaryCtaText && primaryCtaLink && (
              <Link
                className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-base transition ${
                  backgroundColor === "white"
                    ? "bg-[neutral-500]/100 text-[neutral-50] hover:bg-[neutral-500]"
                    : "bg-[neutral-50] text-[neutral-900] hover:bg-[neutral-200]"
                }`}
                href={primaryCtaLink}
              >
                {primaryCtaText}
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </Link>
            )}

            {secondaryCtaText && secondaryCtaLink && (
              <Link
                className={`inline-flex items-center justify-center gap-2 border-2 px-8 py-4 font-semibold text-base transition ${
                  backgroundColor === "white"
                    ? "border-[neutral-500] text-[neutral-500] hover:bg-[neutral-500]/100 hover:text-[neutral-50]"
                    : "border-[neutral-50] text-[neutral-50] hover:bg-[neutral-50]/10"
                }`}
                href={secondaryCtaLink}
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
