import { Languages, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function ConciergeSection() {
  return (
    <section id="concierge" className="py-12 sm:py-16 lg:py-20">
      <Container className="rounded-[40px] border border-[#ebe6dd] bg-white p-8 shadow-[0_24px_70px_rgba(18,17,15,0.06)] md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(0,_1fr)]">
          <div className="space-y-6">
            <h2 className="text-[2.1rem] font-semibold leading-tight text-[#211f1a] sm:text-[2.3rem]">
              Concierge-led onboarding for newcomers and long-term residents
            </h2>
            <p className="text-base text-[#554f45]">
              Schedule a consultation with a Maidconnect concierge to discuss your
              upcoming move, household needs, or staff transition. We&apos;ll tailor a
              plan and introduce you to the right professionals within 48 hours.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#5a5549]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfafa] px-4 py-2">
                <MapPin className="h-4 w-4" />
                Bogotá · Medellín · Cali · Cartagena · Barranquilla · Bucaramanga
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#fbfafa] px-4 py-2">
                <Languages className="h-4 w-4" />
                English, Spanish & Portuguese support
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-5 rounded-[28px] border border-[#e5dfd4] bg-[#fbfaf9] p-8 shadow-[0_18px_45px_rgba(18,17,15,0.05)]">
            <div className="space-y-3 text-sm text-[#5d574b]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
                Concierge hours
              </p>
              <p className="text-lg font-semibold text-[#211f1a]">
                Monday to Saturday · 8am – 7pm COT
              </p>
              <p>
                Prefer WhatsApp? Message us anytime at{" "}
                <span className="font-semibold text-[#211f1a]">+57 310 555 0192</span>.
              </p>
            </div>
            <Button href="#get-started" label="Book a consultation" icon />
          </div>
        </div>
      </Container>
    </section>
  );
}
