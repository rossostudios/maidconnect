import { Languages, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function ConciergeSection() {
  return (
    <section id="concierge" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-5xl space-y-12 text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
              Ready to find your perfect match?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-[#5d574b]">
              Schedule a consultation to discuss your household needs. We'll introduce you to vetted professionals within 48 hours.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button href="/professionals" label="Browse professionals" icon />
            <Button href="#get-started" label="Book a consultation" variant="secondary" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-[#7a6d62]">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Available in 6 major Colombian cities
            </span>
            <span className="inline-flex items-center gap-2">
              <Languages className="h-4 w-4" />
              English, Spanish & Portuguese support
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
