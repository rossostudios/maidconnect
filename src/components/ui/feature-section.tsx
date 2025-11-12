import { type ReactNode } from "react";

type FeatureSectionProps = {
  /** Small tagline text above the heading */
  tagline?: string;
  /** Main section heading */
  heading: string;
  /** Descriptive body text */
  description: string;
  /** Background color - defaults to cream */
  backgroundColor?: string;
  /** Text color - defaults to dark brown */
  textColor?: string;
  /** Optional SVG illustration (positioned bottom right) */
  illustration?: ReactNode;
  /** Optional children content (e.g., feature cards, buttons) */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Content alignment */
  align?: "left" | "center";
  /** Optional ID for anchor navigation */
  id?: string;
};

/**
 * FeatureSection - SavvyCal-inspired section layout
 *
 * Features:
 * - Large, bold typography
 * - Decorative SVG illustration in bottom right
 * - Proper spacing and visual hierarchy
 * - Flexible content slots
 *
 * Usage:
 * ```tsx
 * <FeatureSection
 *   tagline="SCHEDULING MADE SIMPLE"
 *   heading="Team Scheduling"
 *   description="Coordinate with your team..."
 *   illustration={<CarIllustration />}
 * >
 *   <FeatureCards />
 * </FeatureSection>
 * ```
 */
export function FeatureSection({
  tagline,
  heading,
  description,
  backgroundColor = "bg-[#f8fafc]",
  textColor = "#0f172a",
  illustration,
  children,
  className = "",
  align = "left",
  id,
}: FeatureSectionProps) {
  const alignmentClasses =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      id={id}
      style={{ backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 lg:px-8">
        {/* Content Container */}
        <div className={`relative z-10 flex flex-col ${alignmentClasses}`}>
          {/* Tagline */}
          {tagline && (
            <div className="tagline mb-4" style={{ color: "#94a3b8" }}>
              {tagline}
            </div>
          )}

          {/* Heading */}
          <h2 className="serif-display-lg mb-6 max-w-3xl" style={{ color: textColor }}>
            {heading}
          </h2>

          {/* Description */}
          <p className="lead mb-12 max-w-2xl" style={{ color: textColor, opacity: 0.8 }}>
            {description}
          </p>

          {/* Additional content */}
          {children && <div className="w-full">{children}</div>}
        </div>

        {/* SVG Illustration - Bottom Right */}
        {illustration && (
          <div className="pointer-events-none absolute right-0 bottom-0 hidden lg:block">
            <div className="relative h-80 w-80 opacity-90">{illustration}</div>
          </div>
        )}
      </div>
    </section>
  );
}

type FeatureCardProps = {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional "Read more" link */
  href?: string;
  /** Link text */
  linkText?: string;
};

/**
 * FeatureCard - Small card for listing features within a FeatureSection
 */
export function FeatureCard({
  title,
  description,
  icon,
  href,
  linkText = "Learn more",
}: FeatureCardProps) {
  const CardContent = (
    <div className="group flex flex-col items-center gap-3 text-center">
      {/* Icon */}
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="serif-headline-sm text-stone-900">{title}</h3>

      {/* Description */}
      <p className="text-sm text-stone-700 leading-relaxed">{description}</p>

      {/* Link */}
      {href && (
        <div className="mt-2 flex items-center gap-2 font-semibold text-sm text-stone-600 transition-colors group-hover:text-stone-800">
          {linkText}
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        className="block rounded-xl border border-stone-200 bg-white p-6 transition-all hover:border-stone-300 hover:shadow-md"
        href={href}
      >
        {CardContent}
      </a>
    );
  }

  return <div className="rounded-xl border border-stone-200 bg-white p-6">{CardContent}</div>;
}

/**
 * FeatureGrid - Grid container for FeatureCards
 */
export function FeatureGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
