import { Location01Icon, TranslateIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function ConciergeSection() {
  const t = await getTranslations("concierge");

  return (
    <section className="bg-stone-900 py-20 sm:py-24 lg:py-32" id="concierge">
      <Container>
        <div className="mx-auto flex max-w-5xl flex-col gap-16 text-center">
          <div className="flex flex-col gap-7">
            <h2 className="serif-display-lg text-white">{t("title")}</h2>
            <p className="lead mx-auto max-w-2xl text-white/80">{t("subtitle")}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/professionals" icon label={t("browseProfessionals")} />
            <Button href="#get-started" label={t("bookConsultation")} variant="secondary" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-stone-400">
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-orange-500" icon={Location01Icon} />
              {t("cities")}
            </span>
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-orange-500" icon={TranslateIcon} />
              {t("languages")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
