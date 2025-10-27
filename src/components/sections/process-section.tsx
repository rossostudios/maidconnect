import { Container } from "@/components/ui/container";
import { steps } from "@/lib/content";

export function ProcessSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20">
      <Container className="rounded-[40px] border border-[#ece8df] bg-white p-8 shadow-[0_24px_70px_rgba(18,17,15,0.06)] md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_minmax(0,_0.9fr)]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#a49c90]">
                How it works
              </p>
              <h2 className="text-[2.1rem] font-semibold leading-tight text-[#211f1a] sm:text-[2.3rem]">
                A guided journey from intake to ongoing excellence
              </h2>
              <p className="text-base text-[#5d574b]">
                We pair smart technology with human expertise to make sure every match
                feels seamless and long-lasting. Your concierge remains your point of
                contact from the first call onward.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {steps.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-[#e7e1d5] bg-[#fbfafa] p-6 shadow-[0_16px_38px_rgba(18,17,15,0.05)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fd857f]/15 text-sm font-semibold text-[#8a3934]">
                    {item.step}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-[#211f1a]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#5d574b]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-[32px] border border-[#e7e2d9] bg-[#d7d3ce] shadow-[0_22px_55px_rgba(18,17,15,0.08)]">
              <div className="aspect-[5/4] w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#5e594f]">
                  Workflow image placeholder
                </span>
                <p className="max-w-xs text-xs text-[#6d6961]">
                  Swap with a UI or concierge-in-action photo that showcases our guided
                  onboarding.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-[#ebe6db] bg-[#fbfaf9] p-6 text-sm text-[#4b463c] shadow-[0_16px_36px_rgba(18,17,15,0.04)]">
              <p className="font-semibold text-[#211f1a]">What we manage for you</p>
              <ul className="mt-4 space-y-2">
                <li>∙ Structured interviews and trial visit coordination</li>
                <li>∙ Legal compliance, contracts, and household manuals</li>
                <li>∙ Payment reminders, replacements, and performance reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
