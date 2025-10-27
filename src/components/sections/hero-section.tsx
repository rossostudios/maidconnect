import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { featureHighlights, stats } from "@/lib/content";

export function HeroSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container className="grid gap-12 rounded-[44px] border border-[#ece9e3] bg-white p-8 shadow-[0_28px_72px_rgba(22,20,18,0.08)] md:p-12 lg:grid-cols-[1.1fr_minmax(0,_1fr)]">
        <div className="space-y-10 lg:space-y-12">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-3 rounded-full bg-[#fbfafa] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#fd857f]">
              Trusted domestic staffing · Colombia
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#211f1a] sm:text-[2.9rem]">
              Settle into Colombia with home professionals who feel like an extension
              of your family.
            </h1>
            <p className="max-w-xl text-lg text-[#5d574b]">
              Maidconnect pairs foreigners with vetted housekeepers, caregivers, and
              lifestyle support across Colombia. We keep every detail handled—from
              screening to onboarding—so you can focus on living well.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="#services" label="Explore services" icon />
            <Button href="#testimonials" label="Hear from clients" variant="secondary" />
            <Button href="/professionals" label="View professionals" variant="ghost" icon />
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e5dfd5] bg-[#fbfafa] p-6 shadow-[0_18px_40px_rgba(18,17,15,0.05)]"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a49d90]">
                  {stat.label}
                </dt>
                <dd className="mt-3 text-3xl font-semibold text-[#211f1a]">
                  {stat.value}
                </dd>
                <p className="mt-2 text-sm text-[#5d574b]">{stat.detail}</p>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-6">
          <div className="group relative overflow-hidden rounded-[36px] border border-[#e8e4dc] bg-[#d9d4ce] shadow-[0_24px_55px_rgba(15,15,15,0.08)]">
            <div className="aspect-[4/3] w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.35),_transparent)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#5f594d]">
                Hero image placeholder
              </span>
              <p className="max-w-xs text-xs text-[#6d685c]">
                Replace with lifestyle photography featuring a trusted home professional
                supporting an expat family.
              </p>
            </div>
            <span className="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#5c564b]">
              Drop photo here
            </span>
          </div>
          <div className="grid gap-4">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-3xl border border-[#ebe5d8] bg-[#fbfaf9] p-5 transition hover:border-[#fd857f]/40 sm:flex-row sm:items-start sm:gap-4"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feature.tone} text-[#2c2922]`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#211f1a]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#5d574b]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
