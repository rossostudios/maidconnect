import { ArrowRight01Icon, Location01Icon, TranslateIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

export async function ConciergeSection() {
  const t = await getTranslations("concierge");

  return (
    <section className="bg-neutral-900 py-20 sm:py-24 lg:py-32" id="concierge">
      <Container>
        <div className="mx-auto flex max-w-5xl flex-col gap-16 text-center">
          <div className="flex flex-col gap-7">
            <h2 className="serif-display-lg text-neutral-50">{t("title")}</h2>
            <p className="lead mx-auto max-w-2xl text-neutral-300">{t("subtitle")}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild>
              <Link href="/professionals">
                {t("browseProfessionals")}
                <HugeiconsIcon
                  aria-hidden="true"
                  className="ml-2 h-4 w-4"
                  icon={ArrowRight01Icon}
                />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="#get-started">{t("bookConsultation")}</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-neutral-600 text-sm">
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={Location01Icon} />
              {t("cities")}
            </span>
            <span className="inline-flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={TranslateIcon} />
              {t("languages")}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
