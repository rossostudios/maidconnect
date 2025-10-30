import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-[25px] py-20 sm:py-24 lg:py-32">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 left-[25px] right-[25px] h-full w-[calc(100%-50px)] rounded-3xl object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 left-[25px] right-[25px] w-[calc(100%-50px)] rounded-3xl bg-black/60" />

      {/* Content */}
      <Container className="relative z-10 text-center">
        <div className="mx-auto max-w-5xl space-y-8">
          <span className="inline-flex items-center gap-3 rounded-full bg-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.32em] text-white backdrop-blur-sm">
            Trusted Domestic Staffing · Colombia
          </span>

          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Home professionals who feel like family
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-white/90 sm:text-2xl">
            Connect with vetted housekeepers and caregivers across Colombia. Fully screened, onboarded, and ready to support your lifestyle.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button href="/professionals" label="Find a professional" icon />
            <Button
              href="#how-it-works"
              label="How it works"
              variant="secondary"
              className="border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
