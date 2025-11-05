import { Location01Icon, TranslateIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export async function ConciergeSection() {
  const t = await getTranslations("concierge");

  return (
    <section className="py-20 sm:py-24 lg:py-28" id="concierge">
      <Container>
        <div className="mx-auto max-w-5xl space-y-16 text-center">
          <div className="space-y-7">
            <h2 className="type-serif-lg text-[var(--foreground)]">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-[var(--muted-foreground)] text-xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Button href="/professionals" icon label={t("browseProfessionals")} />
            <Button href="#get-started" label={t("bookConsultation")} variant="secondary" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-10 text-[var(--muted-foreground)] text-sm">
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
              {t("cities")}
            </span>
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-4 w-4" icon={TranslateIcon} />
              {t("languages")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
