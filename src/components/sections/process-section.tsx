import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ProcessSection() {
  const t = await getTranslations("process");

  const stepKeys = ["step1", "step2", "step3", "step4"] as const;

  return (
    <section className="py-16 sm:py-20 lg:py-24" id="how-it-works">
      <Container>
        <div className="mx-auto max-w-6xl space-y-12 text-center">
          <div className="space-y-4">
            <p className="font-semibold text-[#a49c90] text-sm uppercase tracking-[0.32em]">
              {t("badge")}
            </p>
            <h2 className="mx-auto max-w-3xl font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stepKeys.map((key) => (
              <div className="flex flex-col items-center text-center" key={key}>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#8B7355] font-semibold text-white text-xl">
                  {t(`steps.${key}.number`)}
                </span>
                <h3 className="mt-6 font-semibold text-[#211f1a] text-xl">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-3 text-[#5d574b] text-base">{t(`steps.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
