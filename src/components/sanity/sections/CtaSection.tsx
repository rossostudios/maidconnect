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
    red: "bg-[#64748b]/100",
    gray: "bg-[#0f172a]",
    white: "bg-[#f8fafc]",
  }[backgroundColor];

  const textClass = backgroundColor === "white" ? "text-[#0f172a]" : "text-[#f8fafc]";

  return (
    <section className={`${bgClass} py-20 sm:py-24 lg:py-32`}>
      <Container className="max-w-4xl">
        <div className="text-center">
          {title && <h2 className={`serif-display-lg ${textClass}`}>{title}</h2>}

          {description && (
            <p
              className={`lead mt-6 ${backgroundColor === "white" ? "text-[#0f172a]/70" : "text-[#f8fafc]/90"}`}
            >
              {description}
            </p>
          )}

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            {primaryCtaText && primaryCtaLink && (
              <Link
                className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-base transition ${
                  backgroundColor === "white"
                    ? "bg-[#64748b]/100 text-[#f8fafc] hover:bg-[#64748b]"
                    : "bg-[#f8fafc] text-[#0f172a] hover:bg-[#e2e8f0]"
                }`}
                href={primaryCtaLink}
              >
                {primaryCtaText}
                <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
              </Link>
            )}

            {secondaryCtaText && secondaryCtaLink && (
              <Link
                className={`inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-4 font-semibold text-base transition ${
                  backgroundColor === "white"
                    ? "border-[#64748b] text-[#64748b] hover:bg-[#64748b]/100 hover:text-[#f8fafc]"
                    : "border-[#f8fafc] text-[#f8fafc] hover:bg-[#f8fafc]/10"
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
