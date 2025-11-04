import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";

export async function ProcessSection() {
  const t = await getTranslations("process");

  const stepKeys = ["step1", "step2", "step3", "step4"] as const;

  return (
    <section className="py-20 sm:py-24 lg:py-28" id="how-it-works">
      <Container>
        <div className="mx-auto max-w-6xl space-y-16 text-center">
          <div className="space-y-5">
            <p className="tagline">{t("badge")}</p>
            <h2 className="type-serif-lg mx-auto max-w-3xl text-[var(--foreground)]">
              {t("title")}
            </h2>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stepKeys.map((key) => (
              <div className="flex flex-col items-center text-center" key={key}>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--red)] font-semibold text-white text-xl">
                  {t(`steps.${key}.number`)}
                </span>
                <h3 className="type-serif-sm mt-6 text-[var(--foreground)]">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-3 text-[var(--muted-foreground)] text-base">
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
