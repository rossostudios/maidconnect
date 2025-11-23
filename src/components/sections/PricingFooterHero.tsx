"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export function PricingFooterHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f2e9]">
      <div className="absolute inset-0">
        <Image
          alt="Casaora pricing hero"
          className="object-cover"
          fill
          priority
          src="/pricing.png"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#f7f2e9]/50 to-[#f7f2e9]" />
      </div>

      <Container className="relative z-10 mx-auto flex min-h-[400px] max-w-screen-xl flex-col items-center justify-center py-16 text-center text-white sm:min-h-[520px] sm:py-20">
        <div className="flex flex-col gap-3 sm:gap-4">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-4xl leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
            <span className="block">Simple, transparent pricing.</span>
            <span className="block">No hidden costs.</span>
          </h2>
          <p className="font-medium text-lg sm:text-xl">
            We charge a clear service fee for our technology and vetting, ensuring your professional
            keeps 100% of their hourly rate.
          </p>
          <p className="-mt-1 text-base text-white/85 sm:text-lg">
            One simple 15% service fee. Book instantly, pay securely, and know exactly what
            you&apos;re paying for.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link href="/pricing">
            <Button className="rounded-full bg-orange-500 px-6 py-3 text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600">
              View pricing
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              className="rounded-full border border-white/80 bg-transparent px-6 py-3 text-white hover:bg-white/10"
              variant="outline"
            >
              Talk to us
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
