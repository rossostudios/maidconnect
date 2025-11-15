import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type TwoColumnFeatureProps = {
  tagline?: string;
  heading: string;
  description: string;
  image: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  backgroundColor?: "white" | "cream";
  children?: ReactNode;
  className?: string;
};

export function TwoColumnFeature({
  tagline,
  heading,
  description,
  image,
  imageAlt = "",
  imagePosition = "right",
  backgroundColor = "white",
  children,
  className,
}: TwoColumnFeatureProps) {
  const bgColor = backgroundColor === "cream" ? "bg-[neutral-50]" : "bg-[neutral-50]";

  const contentOrder = imagePosition === "left" ? "lg:order-2" : "lg:order-1";
  const imageOrder = imagePosition === "left" ? "lg:order-1" : "lg:order-2";

  return (
    <section className={cn("py-20 sm:py-24 lg:py-32", bgColor, className)}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Content Column */}
          <div className={cn("space-y-6", contentOrder)}>
            {tagline && <p className="tagline text-[neutral-400]">{tagline}</p>}

            <h2 className="serif-display-lg text-[neutral-900]">{heading}</h2>

            <p className="lead text-[neutral-900]/70">{description}</p>

            {children && <div className="pt-4">{children}</div>}
          </div>

          {/* Image Column */}
          <div className={cn("relative aspect-[4/3] overflow-hidden", imageOrder)}>
            <Image
              alt={imageAlt}
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={image}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
