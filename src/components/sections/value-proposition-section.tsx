import { CheckCircle2, Search, Users } from "lucide-react";
import { Container } from "@/components/ui/container";

export function ValuePropositionSection() {
  return (
    <section className="bg-[#faf8f3] py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="font-semibold text-[#a49c90] text-sm uppercase tracking-[0.32em]">
              The Casaora Difference
            </p>
            <h2 className="mx-auto max-w-3xl font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              Pre-Curated Excellence. Your Choice.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-card)]">
                <CheckCircle2 className="h-8 w-8 text-[#8B7355]" />
              </div>
              <h3 className="font-semibold text-2xl text-[#211f1a]">Pre-Vetted</h3>
              <p className="text-[#5d574b] text-base">
                Every professional you see has already passed our rigorous screening. Background
                checks, skill assessments, and personal interviews—completed before they reach you.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-card)]">
                <Search className="h-8 w-8 text-[#8B7355]" />
              </div>
              <h3 className="font-semibold text-2xl text-[#211f1a]">Browse with Confidence</h3>
              <p className="text-[#5d574b] text-base">
                Search by language, availability, experience, or specialty. Filter by what matters
                to you—knowing everyone meets our exceptional standards.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[var(--shadow-card)]">
                <Users className="h-8 w-8 text-[#8B7355]" />
              </div>
              <h3 className="font-semibold text-2xl text-[#211f1a]">Choose Your Match</h3>
              <p className="text-[#5d574b] text-base">
                Review profiles, watch video introductions, compare experience. You choose who's
                right for your home and your family.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
