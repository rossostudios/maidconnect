import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ProcessSection() {
  const t = await getTranslations("process");

  const stepKeys = ["step1", "step2", "step3", "step4"] as const;

  return (
    <section className="bg-slate-50 py-16 sm:py-20 lg:py-24" id="how-it-works">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-16 flex flex-col gap-5 text-center">
            <p className="tagline text-slate-500">{t("badge")}</p>
            <h2 className="serif-display-lg text-slate-900">{t("title")}</h2>
          </div>

          {/* Minimal List */}
          <div className="space-y-12">
            {stepKeys.map((key, index) => (
              <div className="group text-center" key={key}>
                {/* Number + Title */}
                <div className="mb-3 flex items-center justify-center gap-3">
                  <span className="font-mono font-semibold text-lg text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <HugeiconsIcon className="h-5 w-5 text-slate-400" icon={ArrowRight01Icon} />
                  <h3 className="serif-headline-md text-slate-900">{t(`steps.${key}.title`)}</h3>
                </div>

                {/* Description */}
                <p className="mx-auto max-w-xl text-base text-slate-600 leading-relaxed">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
